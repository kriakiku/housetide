import logging
from collections import deque
from collections.abc import Callable, Mapping
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any, cast
from uuid import uuid4
from zoneinfo import ZoneInfo

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import (
    CALLBACK_TYPE,
    Event,
    EventStateChangedData,
    HassJob,
    HomeAssistant,
    callback,
)
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import (
    async_track_point_in_utc_time,
    async_track_state_change_event,
    async_track_time_interval,
)
from homeassistant.helpers.start import async_at_started
from homeassistant.util import dt as dt_util
from homeassistant.util.hass_dict import HassKey

from .const import (
    BUS_EVENTS,
    DOMAIN,
    EVENT_POMODORO_PHASE,
    EVENT_TASK_DUE,
    HISTORY_CAP,
    PRUNE_INTERVAL,
    SIGNAL_UPDATED,
    TICK_INTERVAL,
)
from .engine import machine, pomodoro, stats, templates, views
from .engine.machine import Transition
from .engine.models import (
    MAX_DAYS,
    EventSource,
    HistoryEvent,
    IntervalSchedule,
    OnceSchedule,
    PomodoroState,
    Runtime,
    Settings,
    Task,
    Trigger,
    ValidationError,
    as_utc,
)
from .engine.triggers import TriggerHold
from .store import HousetideStorage

_LOGGER = logging.getLogger(__name__)

DATA_MANAGER: HassKey[HousetideManager] = HassKey(DOMAIN)

type HousetideConfigEntry = ConfigEntry[HousetideManager]
type HoldTarget = tuple[str, Trigger]


def _validated(data: Mapping[str, Any]) -> Task:
    task = Task.from_dict(data)
    numbers = {
        "task.grace_hours": (task.grace_hours, MAX_DAYS * 24),
        "task.clean_for_minutes": (task.clean_for_minutes, MAX_DAYS * 1440),
    }
    if isinstance(task.schedule, IntervalSchedule):
        numbers["task.schedule.every_days"] = (task.schedule.every_days, MAX_DAYS)
    for index, stage in enumerate(task.stages):
        if stage.stale_after_minutes is not None:
            numbers[f"task.stages[{index}].stale_after_minutes"] = (
                stage.stale_after_minutes,
                MAX_DAYS * 1440,
            )
        if stage.complete_when is not None:
            numbers[f"task.stages[{index}].complete_when.for_seconds"] = (
                stage.complete_when.for_seconds,
                MAX_DAYS * 86400,
            )
    for path, (value, limit) in numbers.items():
        if value > limit:
            raise ValidationError(f"{path}: must be at most {limit}")
    if isinstance(task.schedule, OnceSchedule) and not 1970 <= task.schedule.due.year <= 2200:
        raise ValidationError("task.schedule.due: must be between 1970 and 2200")
    return task


class TaskNotFoundError(LookupError):
    def __init__(self, task_id: str) -> None:
        super().__init__(f"unknown task: {task_id}")
        self.task_id = task_id


def get_manager(hass: HomeAssistant) -> HousetideManager | None:
    return hass.data.get(DATA_MANAGER)


def view_fingerprint(view: Mapping[str, Any]) -> dict[str, Any]:
    scene = view["scene"]
    return {
        **view,
        "overdue_seconds": None,
        "scene": {**scene, "fill": round(scene["fill"], 2), "stink": round(scene["stink"], 2)},
    }


@dataclass(slots=True, eq=False)
class ActiveHold:
    target: HoldTarget
    hold: TriggerHold
    cancel: CALLBACK_TYPE | None = None
    armed_for: datetime | None = None

    def disarm(self) -> None:
        if self.cancel is not None:
            self.cancel()
            self.cancel = None
        self.armed_for = None


class HousetideManager:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self.tasks: dict[str, Task] = {}
        self.runtimes: dict[str, Runtime] = {}
        self.settings = Settings()
        self.pomodoro = PomodoroState()
        self._storage = HousetideStorage(hass)
        self._events: list[HistoryEvent] = []
        self._announced: dict[str, str] = {}
        self._holds: dict[str, ActiveHold] = {}
        self._fired: deque[tuple[str, HoldTarget]] = deque()
        self._bus: deque[tuple[str, dict[str, Any]]] = deque()
        self._watched: frozenset[str] = frozenset()
        self._unwatch: CALLBACK_TYPE | None = None
        self._stop_tick: CALLBACK_TYPE | None = None
        self._stop_started: CALLBACK_TYPE | None = None
        self._started = False
        self._dirty = False
        self._printed: dict[str, dict[str, Any]] = {}
        self._pruned_at: datetime | None = None
        self._pomodoro_timer: CALLBACK_TYPE | None = None
        self._pomodoro_armed_for: datetime | None = None

    @property
    def _zone(self) -> ZoneInfo:
        return cast(ZoneInfo, dt_util.get_default_time_zone())

    async def async_load(self) -> None:
        stored, history = await self._storage.async_load()
        now = dt_util.utcnow()
        settings = self._parsed(Settings.from_dict, stored.get("settings") or {}, "settings")
        self.settings = settings or Settings()
        runtimes: dict[str, Runtime] = {}
        for raw in stored.get("runtimes", []):
            if (runtime := self._parsed(Runtime.from_dict, raw, "runtime")) is not None:
                runtimes[runtime.task_id] = runtime
        for raw in stored.get("tasks", []):
            if (task := self._parsed(Task.from_dict, raw, "task")) is None:
                continue
            self.tasks[task.id] = task
            self.runtimes[task.id] = runtimes.get(task.id) or machine.initial_runtime(
                task, now, self._zone
            )
        self._announced = {
            task_id: occurrence
            for task_id, occurrence in (stored.get("announced") or {}).items()
            if task_id in self.tasks
        }
        for raw in history.get("events", []):
            if (event := self._parsed(HistoryEvent.from_dict, raw, "history event")) is not None:
                self._events.append(event)
        self._events.sort(key=lambda event: event.ts)
        self._prune(now)
        raw_pomodoro = stored.get("pomodoro")
        if raw_pomodoro is not None:
            self.pomodoro = (
                self._parsed(PomodoroState.from_dict, raw_pomodoro, "pomodoro") or PomodoroState()
            )
        self._expire_pomodoro(now)

    @staticmethod
    def _parsed[T](parse: Callable[[Any], T], raw: Any, label: str) -> T | None:
        try:
            return parse(raw)
        except ValueError as err:
            _LOGGER.error("Ignoring invalid stored %s: %s", label, err)
            return None

    @callback
    def async_start(self) -> None:
        now = dt_util.utcnow()
        self._sync_holds(now)
        self._arm_pomodoro()
        self._stop_tick = async_track_time_interval(
            self.hass, self._on_tick, TICK_INTERVAL, cancel_on_shutdown=True
        )
        self._stop_started = async_at_started(self.hass, self._on_started)
        self._dirty = True
        self._on_tick(now)

    @callback
    def _on_started(self, _hass: HomeAssistant) -> None:
        self._started = True
        self._drain_bus()

    async def async_stop(self) -> None:
        if self._stop_started is not None:
            self._stop_started()
            self._stop_started = None
        if self._stop_tick is not None:
            self._stop_tick()
            self._stop_tick = None
        self._disarm_pomodoro()
        for active in self._holds.values():
            active.disarm()
        self._holds.clear()
        self._fired.clear()
        self._sync_listener()
        await self._storage.async_flush(self._tasks_data(), self._history_data())

    async def async_remove_storage(self) -> None:
        await self._storage.async_remove()

    def view(self, task_id: str) -> dict[str, Any]:
        task = self._require(task_id)
        return views.task_view(task, self.runtimes[task_id], dt_util.utcnow(), self._zone)

    def all_views(self) -> list[dict[str, Any]]:
        now = dt_util.utcnow()
        zone = self._zone
        return [
            views.task_view(task, self.runtimes[task_id], now, zone)
            for task_id, task in self.tasks.items()
        ]

    def payload(self) -> dict[str, Any]:
        return {
            "tasks": [task.to_dict() for task in self.tasks.values()],
            "views": self.all_views(),
            "settings": self.settings.to_dict(),
            "pomodoro": self.pomodoro.to_dict(),
            "now": dt_util.utcnow().isoformat(),
        }

    def history(
        self,
        task_id: str | None = None,
        limit: int = 100,
        before: datetime | None = None,
    ) -> list[dict[str, Any]]:
        found: list[dict[str, Any]] = []
        boundary = None if before is None else as_utc(before)
        oldest: datetime | None = None
        for event in reversed(self._events):
            if task_id is not None and event.task_id != task_id:
                continue
            if boundary is not None and event.ts >= boundary:
                continue
            if len(found) >= limit and event.ts != oldest:
                break
            found.append(event.to_dict())
            oldest = event.ts
        return found

    def stats(self, task_id: str | None = None, days: int = 90) -> dict[str, Any]:
        events = (e for e in self._events if task_id is None or e.task_id == task_id)
        return stats.summary(events, dt_util.utcnow(), days, self._zone)

    def templates(self) -> dict[str, dict[str, Any]]:
        return templates.templates(dt_util.utcnow(), self._zone)

    @callback
    def async_advance(
        self, task_id: str, source: EventSource = "manual", user_id: str | None = None
    ) -> None:
        now = dt_util.utcnow()
        self._step(self._require(task_id), machine.advance, source, user_id, now)
        self._settle(now)

    @callback
    def async_skip(
        self, task_id: str, source: EventSource = "manual", user_id: str | None = None
    ) -> None:
        now = dt_util.utcnow()
        self._step(self._require(task_id), machine.skip, source, user_id, now)
        self._settle(now)

    @callback
    def async_undo(
        self, task_id: str, source: EventSource = "manual", user_id: str | None = None
    ) -> None:
        task = self._require(task_id)
        now = dt_util.utcnow()
        transition = machine.undo(task, self.runtimes[task_id], now, source, user_id)
        self._commit(task, transition)
        if views.task_status(task, transition.runtime, now, self._zone) in ("due", "overdue"):
            self._announced[task_id] = transition.runtime.occurrence_id
        self._install_hold(task, now, latched=True)
        self._sync_listener()
        self._settle(now)

    @callback
    def async_create_task(self, data: Mapping[str, Any], user_id: str | None = None) -> Task:
        values = dict(data)
        if values.get("id") is None:
            values["id"] = uuid4().hex
        task = _validated(values)
        if task.id in self.tasks:
            raise ValidationError(f"task.id: {task.id!r} already exists")
        now = dt_util.utcnow()
        runtime = machine.initial_runtime(task, now, self._zone)
        self.tasks[task.id] = task
        self.runtimes[task.id] = runtime
        self._record((machine.created_event(task, runtime, now, "manual", user_id),))
        self._sync_holds(now)
        self._save_tasks()
        self._dirty = True
        self._settle(now)
        return task

    @callback
    def async_update_task(self, data: Mapping[str, Any]) -> Task:
        task = _validated(data)
        old = self._require(task.id)
        now = dt_util.utcnow()
        self.runtimes[task.id] = machine.reconcile(
            old, task, self.runtimes[task.id], now, self._zone
        )
        self.tasks[task.id] = task
        self._sync_holds(now)
        self._save_tasks()
        self._dirty = True
        self._settle(now)
        return task

    @callback
    def async_delete_task(self, task_id: str, user_id: str | None = None) -> None:
        task = self._require(task_id)
        now = dt_util.utcnow()
        self._record((machine.deleted_event(task, self.runtimes[task_id], now, "manual", user_id),))
        del self.tasks[task_id]
        del self.runtimes[task_id]
        self._announced.pop(task_id, None)
        self._sync_holds(now)
        self._save_tasks()
        self._dirty = True
        self._settle(now)

    @callback
    def async_update_settings(self, data: Mapping[str, Any]) -> Settings:
        self.settings = Settings.from_dict({**self.settings.to_dict(), **data})
        now = dt_util.utcnow()
        self._prune(now)
        self._save_tasks()
        self._save_history()
        self._dirty = True
        self._settle(now)
        return self.settings

    @callback
    def async_pomodoro(self, action: str) -> PomodoroState:
        now = dt_util.utcnow()
        self._expire_pomodoro(now)
        try:
            before = self.pomodoro
            after = pomodoro.ACTIONS[action](before, self.settings, now, self._zone)
            self._apply_pomodoro(before, after, announce=after.phase != before.phase)
        finally:
            self._arm_pomodoro()
            self._settle(now)
        return self.pomodoro

    def _expire_pomodoro(self, now: datetime) -> None:
        before = self.pomodoro
        expiry = pomodoro.expire(before, self.settings, now, self._zone)
        self._apply_pomodoro(before, expiry.state, announce=expiry.steps > 0)

    def _apply_pomodoro(
        self, before: PomodoroState, after: PomodoroState, *, announce: bool
    ) -> None:
        if after == before:
            return
        self.pomodoro = after
        self._save_tasks()
        self._dirty = True
        if announce:
            self._bus.append(
                (
                    EVENT_POMODORO_PHASE,
                    {
                        "from": before.phase,
                        "to": after.phase,
                        "round": after.round,
                        "rounds_today": after.rounds_today,
                    },
                )
            )

    def _disarm_pomodoro(self) -> None:
        if self._pomodoro_timer is not None:
            self._pomodoro_timer()
            self._pomodoro_timer = None
        self._pomodoro_armed_for = None

    def _arm_pomodoro(self) -> None:
        ends_at = self.pomodoro.ends_at
        if ends_at == self._pomodoro_armed_for:
            return
        self._disarm_pomodoro()
        if ends_at is None:
            return
        self._pomodoro_armed_for = ends_at
        self._pomodoro_timer = async_track_point_in_utc_time(
            self.hass, HassJob(self._on_pomodoro_end, cancel_on_shutdown=True), ends_at
        )

    @callback
    def _on_pomodoro_end(self, moment: datetime) -> None:
        self._pomodoro_timer = None
        self._pomodoro_armed_for = None
        now = max(as_utc(moment), dt_util.utcnow())
        self._expire_pomodoro(now)
        self._arm_pomodoro()
        self._settle(now)

    def _require(self, task_id: str) -> Task:
        task = self.tasks.get(task_id)
        if task is None:
            raise TaskNotFoundError(task_id)
        return task

    def _step(
        self,
        task: Task,
        action: Callable[..., Transition],
        source: EventSource,
        user_id: str | None,
        now: datetime,
    ) -> None:
        before = self.runtimes[task.id]
        transition = action(task, before, now, self._zone, source, user_id)
        self._commit(task, transition)
        chained = source == "trigger" and transition.runtime.stage_index > before.stage_index
        self._install_hold(task, now, latched=not chained)
        self._sync_listener()

    def _commit(self, task: Task, transition: Transition) -> None:
        self.runtimes[task.id] = transition.runtime
        self._record(transition.events)
        self._save_tasks()
        self._dirty = True

    def _record(self, events: tuple[HistoryEvent, ...]) -> None:
        if not events:
            return
        latest = self._events[-1].ts if self._events else None
        self._events.extend(events)
        if latest is not None and any(event.ts < latest for event in events):
            self._events.sort(key=lambda event: event.ts)
        if len(self._events) > HISTORY_CAP:
            del self._events[: len(self._events) - HISTORY_CAP]
        self._save_history()
        for event in events:
            if (name := BUS_EVENTS.get(event.type)) is not None:
                self._fire(name, event.task_id, event.task_title, event.stage_id, event.source)

    def _fire(
        self, name: str, task_id: str, title: str, stage_id: str | None, source: EventSource
    ) -> None:
        self._bus.append(
            (name, {"task_id": task_id, "title": title, "stage_id": stage_id, "source": source})
        )

    def _prune(self, now: datetime) -> None:
        self._pruned_at = now
        cutoff = now - timedelta(days=self.settings.history_retention_days)
        kept = [event for event in self._events if event.ts >= cutoff][-HISTORY_CAP:]
        if len(kept) != len(self._events):
            self._events = kept
            self._save_history()

    def _save_tasks(self) -> None:
        self._storage.delay_save_tasks(self._tasks_data)

    def _save_history(self) -> None:
        self._storage.delay_save_history(self._history_data)

    def _tasks_data(self) -> dict[str, Any]:
        return {
            "tasks": [task.to_dict() for task in self.tasks.values()],
            "runtimes": [runtime.to_dict() for runtime in self.runtimes.values()],
            "settings": self.settings.to_dict(),
            "pomodoro": self.pomodoro.to_dict(),
            "announced": dict(self._announced),
        }

    def _history_data(self) -> dict[str, Any]:
        return {"events": [event.to_dict() for event in self._events]}

    def _target(self, task: Task) -> HoldTarget | None:
        runtime = self.runtimes[task.id]
        if not machine.can_advance(task, runtime):
            return None
        stage = machine.current_stage(task, runtime)
        trigger = stage.complete_when
        if trigger is None or not trigger.entity_id:
            return None
        return stage.id, trigger

    def _install_hold(self, task: Task, now: datetime, *, latched: bool) -> None:
        if (previous := self._holds.pop(task.id, None)) is not None:
            previous.disarm()
        target = self._target(task)
        if target is None:
            return
        trigger = target[1]
        active = ActiveHold(target, TriggerHold(trigger, latched=latched))
        self._holds[task.id] = active
        state = self.hass.states.get(trigger.entity_id)
        self._feed(task.id, active, None if state is None else state.state, now)

    def _sync_holds(self, now: datetime) -> None:
        for task_id in self._holds.keys() - self.tasks.keys():
            self._holds.pop(task_id).disarm()
        for task in self.tasks.values():
            active = self._holds.get(task.id)
            if active is None or active.target != self._target(task):
                self._install_hold(task, now, latched=False)
        self._sync_listener()

    def _sync_listener(self) -> None:
        wanted = frozenset(active.target[1].entity_id for active in self._holds.values())
        if wanted == self._watched:
            return
        if self._unwatch is not None:
            self._unwatch()
            self._unwatch = None
        self._watched = wanted
        if wanted:
            self._unwatch = async_track_state_change_event(
                self.hass, sorted(wanted), self._on_state
            )

    def _feed(self, task_id: str, active: ActiveHold, value: Any, now: datetime) -> None:
        if active.hold.feed(value, now):
            active.disarm()
            self._fired.append((task_id, active.target))
        else:
            self._arm(task_id, active)

    def _arm(self, task_id: str, active: ActiveHold) -> None:
        deadline = active.hold.deadline
        if deadline == active.armed_for:
            return
        active.disarm()
        if deadline is None:
            return

        @callback
        def expired(moment: datetime) -> None:
            active.cancel = None
            self._on_deadline(task_id, active, moment)

        active.armed_for = deadline
        active.cancel = async_track_point_in_utc_time(
            self.hass, HassJob(expired, cancel_on_shutdown=True), deadline
        )

    @callback
    def _on_state(self, event: Event[EventStateChangedData]) -> None:
        entity_id = event.data["entity_id"]
        new_state = event.data["new_state"]
        value = None if new_state is None else new_state.state
        now = dt_util.utcnow()
        for task_id, active in list(self._holds.items()):
            if active.target[1].entity_id == entity_id:
                self._feed(task_id, active, value, now)
        self._settle(now)

    @callback
    def _on_deadline(self, task_id: str, active: ActiveHold, moment: datetime) -> None:
        if self._holds.get(task_id) is not active:
            return
        now = max(as_utc(moment), dt_util.utcnow())
        if active.hold.check(now):
            self._fired.append((task_id, active.target))
        self._settle(now)

    @callback
    def _on_tick(self, _moment: datetime) -> None:
        now = dt_util.utcnow()
        for task in list(self.tasks.values()):
            transition = machine.rollover(task, self.runtimes[task.id], now, self._zone)
            if transition.events:
                self._commit(task, transition)
        for task_id, active in self._holds.items():
            if active.hold.check(now):
                self._fired.append((task_id, active.target))
        if self._pruned_at is None or now - self._pruned_at >= PRUNE_INTERVAL:
            self._prune(now)
        before = self.pomodoro
        self._apply_pomodoro(before, pomodoro.roll_day(before, now, self._zone), announce=False)
        self._settle(now, tick=True)

    def _settle(self, now: datetime, *, tick: bool = False) -> None:
        while self._fired:
            task_id, target = self._fired.popleft()
            active = self._holds.get(task_id)
            if active is not None and active.target == target:
                self._step(self.tasks[task_id], machine.advance, "trigger", None, now)
        self._announce_due(now)
        self._push(now, tick)
        self._drain_bus()

    def _drain_bus(self) -> None:
        while self._started and self._bus:
            self.hass.bus.async_fire(*self._bus.popleft())

    def _push(self, now: datetime, tick: bool) -> None:
        if not (self._dirty or tick):
            return
        printed = {
            task_id: view_fingerprint(
                views.task_view(task, self.runtimes[task_id], now, self._zone)
            )
            for task_id, task in self.tasks.items()
        }
        if not self._dirty and printed == self._printed:
            return
        self._dirty = False
        self._printed = printed
        async_dispatcher_send(self.hass, SIGNAL_UPDATED)

    def _announce_due(self, now: datetime) -> None:
        for task in self.tasks.values():
            runtime = self.runtimes[task.id]
            if views.task_status(task, runtime, now, self._zone) not in ("due", "overdue"):
                continue
            if self._announced.get(task.id) == runtime.occurrence_id:
                continue
            self._announced[task.id] = runtime.occurrence_id
            self._save_tasks()
            self._dirty = True
            stage = machine.current_stage(task, runtime)
            self._fire(EVENT_TASK_DUE, task.id, task.title, stage.id, "schedule")
