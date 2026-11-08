from collections.abc import Callable
from dataclasses import dataclass, replace
from datetime import datetime, timedelta
from uuid import uuid4
from zoneinfo import ZoneInfo

from .models import (
    EventSource,
    EventType,
    HistoryEvent,
    IntervalSchedule,
    OnceSchedule,
    Pack,
    Runtime,
    Stage,
    Task,
    as_utc,
)
from .schedule import dose_slot, first_due, next_due, on_schedule, slot_rhythm

NewId = Callable[[], str]


class MachineError(ValueError):
    pass


def default_new_id() -> str:
    return uuid4().hex


@dataclass(frozen=True, slots=True)
class Transition:
    runtime: Runtime
    events: tuple[HistoryEvent, ...] = ()


def current_stage(task: Task, runtime: Runtime) -> Stage:
    return task.stages[min(runtime.stage_index, len(task.stages) - 1)]


def is_started(runtime: Runtime) -> bool:
    return runtime.stage_index > 0 or runtime.started_at is not None


def is_finished(task: Task, runtime: Runtime) -> bool:
    return (
        isinstance(task.schedule, OnceSchedule)
        and runtime.due_at is None
        and not is_started(runtime)
    )


def can_advance(task: Task, runtime: Runtime) -> bool:
    return task.enabled and not is_finished(task, runtime)


def can_skip(task: Task, runtime: Runtime) -> bool:
    return task.enabled and not is_finished(task, runtime)


def initial_runtime(
    task: Task, now: datetime, zone: ZoneInfo, new_id: NewId = default_new_id
) -> Runtime:
    now = as_utc(now)
    due = first_due(task.schedule, now, zone)
    return Runtime(
        task_id=task.id,
        occurrence_id=new_id(),
        due_at=due,
        stage_entered_at=now,
        next_due_at=_following(task, due, zone, None),
    )


def advance(
    task: Task,
    runtime: Runtime,
    now: datetime,
    zone: ZoneInfo,
    source: EventSource = "manual",
    user_id: str | None = None,
    new_id: NewId = default_new_id,
) -> Transition:
    if not can_advance(task, runtime):
        raise MachineError(f"task {task.id} cannot be advanced")
    now = as_utc(now)
    if runtime.stage_index >= len(task.stages) - 1:
        return _complete(task, runtime, now, zone, source, user_id, new_id)
    stage = current_stage(task, runtime)
    following = task.stages[runtime.stage_index + 1]
    events: list[HistoryEvent] = []
    if not is_started(runtime):
        events.append(_event(task, runtime, now, "started", stage, source, user_id, new_id=new_id))
    events.append(_event(task, runtime, now, "advanced", following, source, user_id, new_id=new_id))
    updated = replace(
        runtime,
        stage_index=runtime.stage_index + 1,
        stage_entered_at=now,
        started_at=runtime.started_at or now,
        undo=replace(runtime, undo=None),
    )
    return Transition(updated, tuple(events))


def skip(
    task: Task,
    runtime: Runtime,
    now: datetime,
    zone: ZoneInfo,
    source: EventSource = "manual",
    user_id: str | None = None,
    new_id: NewId = default_new_id,
) -> Transition:
    if not can_skip(task, runtime):
        raise MachineError(f"task {task.id} cannot be skipped")
    now = as_utc(now)
    event = _event(
        task, runtime, now, "skipped", current_stage(task, runtime), source, user_id, new_id=new_id
    )
    due = _next_occurrence(task, runtime, now, zone, completed=False)
    updated = replace(
        runtime,
        occurrence_id=new_id(),
        due_at=due,
        stage_index=0,
        stage_entered_at=now,
        started_at=None,
        next_due_at=_following(task, due, zone, runtime.last_completed_at),
        pack=_recorded(task, runtime, zone, taken=False),
        undo=replace(runtime, undo=None),
    )
    return Transition(updated, (event,))


def undo(
    task: Task,
    runtime: Runtime,
    now: datetime,
    source: EventSource = "manual",
    user_id: str | None = None,
    new_id: NewId = default_new_id,
) -> Transition:
    if runtime.undo is None:
        raise MachineError(f"task {task.id} has nothing to undo")
    now = as_utc(now)
    restored = replace(runtime.undo, undo=None)
    event = _event(
        task, restored, now, "undone", current_stage(task, restored), source, user_id, new_id=new_id
    )
    return Transition(restored, (event,))


def rollover(
    task: Task,
    runtime: Runtime,
    now: datetime,
    zone: ZoneInfo,
    new_id: NewId = default_new_id,
) -> Transition:
    now = as_utc(now)
    if not task.enabled or task.on_missed != "skip" or is_started(runtime):
        return Transition(runtime)
    events: list[HistoryEvent] = []
    current = runtime
    stage = task.stages[0]
    while current.due_at is not None and current.next_due_at is not None:
        moment = current.next_due_at
        if now < moment:
            break
        events.append(
            _event(task, current, moment, "missed", stage, "schedule", None, new_id=new_id)
        )
        current = replace(
            current,
            occurrence_id=new_id(),
            due_at=moment,
            stage_entered_at=moment,
            next_due_at=_following(task, moment, zone, current.last_completed_at),
            pack=_recorded(task, current, zone, taken=False),
            undo=None,
        )
    return Transition(current, tuple(events))


def reconcile(
    old: Task,
    new: Task,
    runtime: Runtime,
    now: datetime,
    zone: ZoneInfo,
    new_id: NewId = default_new_id,
) -> Runtime:
    now = as_utc(now)
    stages_changed = old.stages != new.stages
    schedule_changed = old.schedule != new.schedule
    re_enabled = new.enabled and not old.enabled
    finished = is_finished(old, runtime)
    if not (stages_changed or schedule_changed or re_enabled):
        return runtime
    updated = runtime
    if stages_changed:
        stage_id = current_stage(old, runtime).id
        index = next((i for i, stage in enumerate(new.stages) if stage.id == stage_id), None)
        if index is None:
            updated = replace(
                updated,
                stage_index=min(runtime.stage_index, len(new.stages) - 1),
                stage_entered_at=now,
            )
        elif is_started(runtime):
            updated = replace(updated, stage_index=index)
    if slot_rhythm(old.schedule) != slot_rhythm(new.schedule):
        updated = replace(updated, pack=None)
    if schedule_changed or (re_enabled and not finished):
        if is_started(updated):
            if updated.due_at is not None:
                updated = replace(
                    updated,
                    next_due_at=_following(new, updated.due_at, zone, updated.last_completed_at),
                )
        else:
            due = first_due(new.schedule, now, zone, updated.last_completed_at)
            updated = replace(
                updated,
                occurrence_id=new_id(),
                due_at=due,
                stage_entered_at=now,
                next_due_at=_following(new, due, zone, updated.last_completed_at),
            )
    return replace(updated, undo=None)


def created_event(
    task: Task,
    runtime: Runtime,
    now: datetime,
    source: EventSource = "manual",
    user_id: str | None = None,
    new_id: NewId = default_new_id,
) -> HistoryEvent:
    return _event(
        task,
        runtime,
        as_utc(now),
        "created",
        current_stage(task, runtime),
        source,
        user_id,
        new_id=new_id,
    )


def deleted_event(
    task: Task,
    runtime: Runtime,
    now: datetime,
    source: EventSource = "manual",
    user_id: str | None = None,
    new_id: NewId = default_new_id,
) -> HistoryEvent:
    return _event(
        task,
        runtime,
        as_utc(now),
        "deleted",
        current_stage(task, runtime),
        source,
        user_id,
        new_id=new_id,
    )


def _complete(
    task: Task,
    runtime: Runtime,
    now: datetime,
    zone: ZoneInfo,
    source: EventSource,
    user_id: str | None,
    new_id: NewId,
) -> Transition:
    on_time = None
    if runtime.due_at is not None:
        on_time = now <= runtime.due_at + timedelta(hours=task.grace_hours)
    event = _event(
        task,
        runtime,
        now,
        "completed",
        current_stage(task, runtime),
        source,
        user_id,
        on_time=on_time,
        new_id=new_id,
    )
    due = _next_occurrence(task, runtime, now, zone, completed=True)
    updated = replace(
        runtime,
        occurrence_id=new_id(),
        due_at=due,
        stage_index=0,
        stage_entered_at=now,
        started_at=None,
        last_completed_at=now,
        next_due_at=_following(task, due, zone, now),
        clean_until=now + timedelta(minutes=task.clean_for_minutes),
        pack=_recorded(task, runtime, zone, taken=True),
        undo=replace(runtime, undo=None),
    )
    return Transition(updated, (event,))


def _recorded(task: Task, runtime: Runtime, zone: ZoneInfo, *, taken: bool) -> Pack | None:
    if runtime.due_at is None or not on_schedule(task.schedule, runtime.due_at, zone):
        return runtime.pack
    cycle, slot = dose_slot(task.schedule, runtime.due_at, zone)
    pack = runtime.pack if runtime.pack is not None and runtime.pack.cycle == cycle else Pack(cycle)
    kept_taken = {*pack.taken} - {slot}
    kept_missed = {*pack.missed} - {slot}
    (kept_taken if taken else kept_missed).add(slot)
    return Pack(cycle, tuple(sorted(kept_taken)), tuple(sorted(kept_missed)))


def _next_occurrence(
    task: Task, runtime: Runtime, now: datetime, zone: ZoneInfo, *, completed: bool
) -> datetime | None:
    schedule = task.schedule
    if completed and isinstance(schedule, IntervalSchedule) and schedule.anchor == "completion":
        return next_due(schedule, now, zone, now, runtime.due_at)
    after = now if runtime.due_at is None else max(now, runtime.due_at)
    last_completed = now if completed else runtime.last_completed_at
    return next_due(schedule, after, zone, last_completed, runtime.due_at)


def _following(
    task: Task, due: datetime | None, zone: ZoneInfo, last_completed: datetime | None
) -> datetime | None:
    if due is None:
        return None
    return next_due(task.schedule, due, zone, last_completed, due)


def _event(
    task: Task,
    runtime: Runtime,
    moment: datetime,
    kind: EventType,
    stage: Stage,
    source: EventSource,
    user_id: str | None,
    *,
    on_time: bool | None = None,
    new_id: NewId,
) -> HistoryEvent:
    return HistoryEvent(
        id=new_id(),
        ts=moment,
        task_id=task.id,
        task_title=task.title,
        occurrence_id=runtime.occurrence_id,
        type=kind,
        stage_id=stage.id,
        stage_title=stage.title,
        source=source,
        user_id=user_id,
        on_time=on_time,
    )
