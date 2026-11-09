from datetime import UTC, timedelta
from typing import Any

import pytest
from engine_factories import (
    KYIV,
    NEW_YORK,
    at,
    id_factory,
    make_task,
    runtime,
    stage_dict,
    task_dict,
)

from custom_components.housetide.engine.machine import (
    advance,
    initial_runtime,
    reconcile,
    rollover,
    skip,
    undo,
)
from custom_components.housetide.engine.models import (
    DailySchedule,
    IntervalSchedule,
    Task,
    ValidationError,
    WeeklySchedule,
    schedule_from_dict,
)
from custom_components.housetide.engine.schedule import dose_slot, first_due, next_due
from custom_components.housetide.engine.stats import summary
from custom_components.housetide.engine.views import task_status, task_view

DAILY = {"type": "daily", "time": "23:59", "anytime": True}
WEEKLY = {"type": "weekly", "weekdays": [0, 2], "time": "21:00", "anytime": True}
INTERVAL = {
    "type": "interval",
    "every_days": 3,
    "time": "22:00",
    "anchor": "completion",
    "anytime": True,
}
D = at("2026-06-10T23:59:00+03:00")
NEXT = at("2026-06-11T23:59:00+03:00")
AFTER_NEXT = at("2026-06-12T23:59:00+03:00")
BEFORE = at("2026-06-09T23:59:00+03:00")


def anytime_task(**overrides: Any) -> Task:
    values: dict[str, Any] = {"schedule": DAILY, "grace_hours": 4, "on_missed": "skip"}
    return make_task(**values | overrides)


def state(**overrides: Any) -> Any:
    return runtime(**{"due_at": D, "next_due_at": NEXT, "stage_entered_at": BEFORE} | overrides)


class TestModel:
    @pytest.mark.parametrize(
        ("payload", "kind"),
        [(DAILY, DailySchedule), (WEEKLY, WeeklySchedule), (INTERVAL, IntervalSchedule)],
    )
    def test_round_trip(self, payload: dict[str, Any], kind: type) -> None:
        schedule = schedule_from_dict(payload)
        assert isinstance(schedule, kind)
        assert schedule.anytime is True
        assert schedule.to_dict() == payload

    @pytest.mark.parametrize(
        "payload",
        [
            {"type": "daily", "time": "08:00"},
            {"type": "weekly", "weekdays": [1], "time": "08:00"},
            {"type": "interval", "every_days": 2, "time": "08:00", "anchor": "schedule"},
        ],
    )
    def test_false_is_omitted(self, payload: dict[str, Any]) -> None:
        assert schedule_from_dict(payload).to_dict() == payload
        assert schedule_from_dict(payload | {"anytime": False}).to_dict() == payload

    @pytest.mark.parametrize(
        "payload",
        [
            {"type": "daily", "anytime": True},
            {"type": "daily", "anytime": True, "time": None},
            {"type": "weekly", "weekdays": [1], "anytime": True},
            {"type": "interval", "every_days": 2, "anchor": "schedule", "anytime": True},
        ],
    )
    def test_deadline_defaults_to_end_of_day(self, payload: dict[str, Any]) -> None:
        assert schedule_from_dict(payload).time == "23:59"

    @pytest.mark.parametrize(
        "payload",
        [
            {"type": "daily", "time": "08:00", "anytime": "yes"},
            {"type": "daily", "time": "08:00", "anytime": 1},
            {"type": "daily", "time": "08:00", "anytime": None},
            {"type": "daily", "time": "25:00", "anytime": True},
            {"type": "daily", "anytime": False},
            {"type": "daily"},
            {"type": "once", "due": "2026-06-10T08:00:00+03:00", "anytime": True},
            {"type": "once", "due": "2026-06-10T08:00:00+03:00", "anytime": False},
        ],
    )
    def test_invalid(self, payload: dict[str, Any]) -> None:
        with pytest.raises(ValidationError):
            schedule_from_dict(payload)

    def test_task_round_trip_keeps_the_flag(self) -> None:
        task = anytime_task()
        assert Task.from_dict(task.to_dict()) == task
        assert task.to_dict()["schedule"] == DAILY
        assert "anytime" not in make_task().to_dict()["schedule"]


class TestStatus:
    @pytest.mark.parametrize(
        ("now", "expected"),
        [
            ("2026-06-10T10:00:00+03:00", "upcoming"),
            ("2026-06-10T19:58:59+03:00", "upcoming"),
            ("2026-06-10T19:59:00+03:00", "due"),
            ("2026-06-10T23:58:59+03:00", "due"),
            ("2026-06-10T23:59:00+03:00", "due"),
            ("2026-06-10T23:59:01+03:00", "overdue"),
            ("2026-06-12T12:00:00+03:00", "overdue"),
        ],
    )
    def test_window(self, now: str, expected: str) -> None:
        assert task_status(anytime_task(on_missed="carry"), state(), at(now)) == expected

    def test_zero_grace_is_due_only_at_the_deadline(self) -> None:
        task = anytime_task(grace_hours=0, on_missed="carry")
        assert task_status(task, state(), D - timedelta(seconds=1)) == "upcoming"
        assert task_status(task, state(), D) == "due"
        assert task_status(task, state(), D + timedelta(seconds=1)) == "overdue"

    def test_counts_as_today_only_on_its_day(self) -> None:
        view = task_view(anytime_task(), state(), at("2026-06-10T00:30:00+03:00"), KYIV)
        assert (view["status"], view["is_today"], view["anytime"]) == ("upcoming", True, True)
        earlier = task_view(anytime_task(), state(), at("2026-06-09T23:30:00+03:00"), KYIV)
        assert (earlier["status"], earlier["is_today"]) == ("upcoming", False)

    @pytest.mark.parametrize("grace", [24, 48])
    def test_the_window_never_starts_before_the_deadline_day(self, grace: int) -> None:
        task = anytime_task(grace_hours=grace)
        current = state(
            last_completed_at=at("2026-06-09T10:00:00+03:00"),
            clean_until=at("2026-06-09T22:00:00+03:00"),
        )
        finished = task_view(task, current, at("2026-06-09T10:01:00+03:00"), KYIV)
        assert (finished["status"], finished["is_today"]) == ("clean", False)
        assert finished["scene"]["stink"] == 0
        evening = task_view(task, current, at("2026-06-09T23:59:00+03:00"), KYIV)
        assert (evening["status"], evening["is_today"]) == ("upcoming", False)
        midnight = task_view(task, current, at("2026-06-10T00:00:00+03:00"), KYIV)
        assert (midnight["status"], midnight["is_today"]) == ("due", True)
        assert midnight["scene"]["stink"] == 0
        noon = task_view(task, current, at("2026-06-10T11:59:30+03:00"), KYIV)
        assert noon["scene"]["stink"] == pytest.approx(0.5, abs=0.001)

    def test_a_deadline_at_midnight_has_no_window(self) -> None:
        due = at("2026-06-10T00:00:00+03:00")
        task = anytime_task(schedule=DAILY | {"time": "00:00"})
        current = state(due_at=due)
        view = task_view(task, current, due - timedelta(minutes=1), KYIV)
        assert (view["status"], view["is_today"], view["scene"]["stink"]) == ("upcoming", False, 0)
        assert task_view(task, current, due, KYIV)["scene"]["stink"] == 1

    def test_status_uses_the_given_zone(self) -> None:
        task = anytime_task(grace_hours=24)
        now = at("2026-06-09T23:30:00+03:00").astimezone(UTC)
        assert task_status(task, state(), now, KYIV) == "upcoming"

    def test_clean_before_the_window(self) -> None:
        current = state(clean_until=at("2026-06-10T08:00:00+03:00"))
        assert task_status(anytime_task(), current, at("2026-06-10T07:00:00+03:00")) == "clean"

    def test_the_window_is_absolute_hours_across_dst(self) -> None:
        task = anytime_task(grace_hours=4, on_missed="carry")
        due = at("2026-03-29T06:30:00+03:00")
        current = state(due_at=due)
        assert task_status(task, current, at("2026-03-29T01:29:00+02:00"), KYIV) == "upcoming"
        assert task_status(task, current, at("2026-03-29T01:30:00+02:00"), KYIV) == "due"

    def test_timed_view_is_flagged_false(self) -> None:
        assert task_view(make_task(), state(), D, KYIV)["anytime"] is False


class TestRollover:
    def test_skip_is_missed_at_the_deadline(self) -> None:
        moved = rollover(anytime_task(), state(), D + timedelta(seconds=1), KYIV, id_factory())
        assert [event.type for event in moved.events] == ["missed"]
        assert moved.events[0].ts == D
        assert moved.events[0].source == "schedule"
        assert moved.runtime.due_at == NEXT
        assert moved.runtime.next_due_at == AFTER_NEXT
        assert moved.runtime.stage_entered_at == D
        assert moved.runtime.occurrence_id != "occ"

    def test_exactly_at_the_deadline_nothing_happens(self) -> None:
        moved = rollover(anytime_task(), state(), D, KYIV, id_factory())
        assert moved.events == ()
        assert moved.runtime == state()

    def test_catches_up_every_deadline(self) -> None:
        moved = rollover(
            anytime_task(), state(), AFTER_NEXT + timedelta(hours=1), KYIV, id_factory()
        )
        assert [event.ts for event in moved.events] == [D, NEXT, AFTER_NEXT]
        assert moved.runtime.due_at == AFTER_NEXT + timedelta(days=1)

    def test_records_the_slot_of_the_missed_deadline(self) -> None:
        task = anytime_task()
        moved = rollover(task, state(), D + timedelta(hours=1), KYIV, id_factory())
        cycle, slot = dose_slot(task.schedule, D, KYIV)
        assert moved.runtime.pack is not None
        assert moved.runtime.pack.cycle == cycle
        assert moved.runtime.pack.missed == (slot,)

    def test_carry_stays_overdue(self) -> None:
        task = anytime_task(on_missed="carry")
        later = AFTER_NEXT + timedelta(days=3)
        assert rollover(task, state(), later, KYIV, id_factory()).events == ()
        assert task_status(task, state(), later) == "overdue"

    def test_started_occurrence_is_not_rolled_over(self) -> None:
        task = anytime_task(stages=[stage_dict("a"), stage_dict("b", role="running")])
        current = state(stage_index=1, started_at=D - timedelta(hours=8))
        moved = rollover(task, current, NEXT, KYIV, id_factory())
        assert moved.events == ()

    @pytest.mark.parametrize(
        ("zone", "due", "following"),
        [
            pytest.param(
                KYIV,
                "2026-03-29T04:30:00+03:00",
                "2026-03-30T03:30:00+03:00",
                id="kyiv-gap-day",
            ),
            pytest.param(
                NEW_YORK,
                "2026-11-01T01:30:00-04:00",
                "2026-11-02T01:30:00-05:00",
                id="ny-repeated-first-pass",
            ),
        ],
    )
    def test_across_dst(self, zone: Any, due: str, following: str) -> None:
        local = "03:30" if zone == KYIV else "01:30"
        task = anytime_task(schedule=DAILY | {"time": local})
        start = initial_runtime(task, at(due) - timedelta(hours=1), zone, id_factory())
        assert start.due_at == at(due)
        assert start.next_due_at == at(following)
        moved = rollover(task, start, at(due) + timedelta(minutes=1), zone, id_factory())
        assert moved.events[0].ts == at(due)
        assert moved.runtime.due_at == at(following)


class TestNextOccurrence:
    def test_completing_at_noon_moves_to_the_next_day(self) -> None:
        moved = advance(anytime_task(), state(), at("2026-06-10T12:00:00+03:00"), KYIV)
        assert moved.runtime.due_at == NEXT
        assert moved.runtime.next_due_at == AFTER_NEXT

    def test_skipping_at_noon_moves_to_the_next_day(self) -> None:
        moved = skip(anytime_task(), state(), at("2026-06-10T12:00:00+03:00"), KYIV)
        assert moved.runtime.due_at == NEXT

    @pytest.mark.parametrize("anchor", ["completion", "schedule"])
    def test_interval_one_day_does_not_return(self, anchor: str) -> None:
        schedule = INTERVAL | {"every_days": 1, "time": "23:59", "anchor": anchor}
        moved = advance(
            anytime_task(schedule=schedule), state(), at("2026-06-10T12:00:00+03:00"), KYIV
        )
        assert moved.runtime.due_at == NEXT

    def test_interval_counts_from_the_completion_day(self) -> None:
        current = state(due_at=at("2026-06-10T22:00:00+03:00"))
        moved = advance(
            anytime_task(schedule=INTERVAL), current, at("2026-06-10T12:00:00+03:00"), KYIV
        )
        assert moved.runtime.due_at == at("2026-06-13T22:00:00+03:00")

    def test_weekly_goes_to_the_next_scheduled_weekday(self) -> None:
        monday = at("2026-06-08T21:00:00+03:00")
        moved = advance(
            anytime_task(schedule=WEEKLY),
            state(due_at=monday),
            at("2026-06-08T09:00:00+03:00"),
            KYIV,
        )
        assert moved.runtime.due_at == at("2026-06-10T21:00:00+03:00")

    def test_carried_occurrence_done_next_day_does_not_ask_again_that_day(self) -> None:
        task = anytime_task(on_missed="carry")
        moved = advance(task, state(), at("2026-06-11T10:00:00+03:00"), KYIV)
        assert moved.runtime.due_at == AFTER_NEXT

    def test_edit_after_completing_does_not_bring_the_day_back(self) -> None:
        task = anytime_task()
        done = advance(task, state(), at("2026-06-10T12:00:00+03:00"), KYIV).runtime
        edited = make_task(**task.to_dict() | {"schedule": DAILY | {"time": "22:00"}})
        result = reconcile(task, edited, done, at("2026-06-10T12:05:00+03:00"), KYIV)
        assert result.due_at == at("2026-06-11T22:00:00+03:00")

    def test_re_enabling_after_completing_does_not_bring_the_day_back(self) -> None:
        task = anytime_task()
        done = advance(task, state(), at("2026-06-10T12:00:00+03:00"), KYIV).runtime
        off = make_task(**task.to_dict() | {"enabled": False})
        result = reconcile(off, task, done, at("2026-06-10T13:00:00+03:00"), KYIV)
        assert result.due_at == NEXT

    def test_created_during_the_day_is_due_the_same_day(self) -> None:
        start = initial_runtime(anytime_task(), at("2026-06-10T15:00:00+03:00"), KYIV, id_factory())
        assert start.due_at == D
        assert start.next_due_at == NEXT

    @pytest.mark.parametrize(
        ("schedule", "created", "expected"),
        [
            (
                {"type": "daily", "time": "12:00", "anytime": True},
                "2026-06-10T15:00:00+03:00",
                "2026-06-11T12:00:00+03:00",
            ),
            (
                INTERVAL | {"every_days": 7, "time": "12:00"},
                "2026-06-10T15:00:00+03:00",
                "2026-06-11T12:00:00+03:00",
            ),
            (
                INTERVAL | {"every_days": 7, "time": "12:00", "anchor": "schedule"},
                "2026-06-10T15:00:00+03:00",
                "2026-06-11T12:00:00+03:00",
            ),
            (
                {"type": "weekly", "weekdays": [2], "time": "12:00", "anytime": True},
                "2026-06-10T15:00:00+03:00",
                "2026-06-17T12:00:00+03:00",
            ),
        ],
    )
    def test_created_after_the_deadline_starts_next(
        self, schedule: dict[str, Any], created: str, expected: str
    ) -> None:
        task = anytime_task(schedule=schedule)
        assert initial_runtime(task, at(created), KYIV, id_factory()).due_at == at(expected)

    def test_interval_rhythm_continues_after_a_late_first_occurrence(self) -> None:
        task = anytime_task(schedule=INTERVAL)
        start = initial_runtime(task, at("2026-06-10T23:00:00+03:00"), KYIV, id_factory())
        assert start.due_at == at("2026-06-11T22:00:00+03:00")
        assert start.next_due_at == at("2026-06-14T22:00:00+03:00")

    def test_timed_interval_still_waits_a_whole_interval(self) -> None:
        schedule = {"type": "interval", "every_days": 7, "time": "12:00", "anchor": "completion"}
        due = initial_runtime(
            make_task(schedule=schedule), at("2026-06-10T15:00:00+03:00"), KYIV, id_factory()
        ).due_at
        assert due == at("2026-06-17T12:00:00+03:00")

    def test_next_due_ignores_the_completion_day_only_when_anytime(self) -> None:
        now = at("2026-06-10T12:00:00+03:00")
        timed = DailySchedule("23:59")
        assert next_due(timed, now, KYIV, now) == D
        assert next_due(DailySchedule("23:59", True), now, KYIV, now) == NEXT
        assert first_due(DailySchedule("23:59", True), now, KYIV, now) == NEXT

    @pytest.mark.parametrize(
        ("completed", "expected"),
        [
            pytest.param(
                "2026-03-28T12:00:00+02:00", "2026-03-29T23:59:00+03:00", id="spring-forward"
            ),
            pytest.param("2026-10-24T12:00:00+03:00", "2026-10-25T23:59:00+02:00", id="fall-back"),
        ],
    )
    def test_completion_across_dst(self, completed: str, expected: str) -> None:
        moment = at(completed)
        deadline = moment.replace(hour=23, minute=59)
        moved = advance(anytime_task(), state(due_at=deadline), moment, KYIV)
        assert moved.runtime.due_at == at(expected)

    def test_undo_restores_the_day(self) -> None:
        task = anytime_task()
        done = advance(task, state(), at("2026-06-10T12:00:00+03:00"), KYIV)
        restored = undo(task, done.runtime, at("2026-06-10T12:01:00+03:00"))
        assert restored.runtime.due_at == D
        assert restored.runtime.last_completed_at is None

    def test_pack_uses_the_deadline_date(self) -> None:
        schedule = {"type": "daily", "time": "00:30", "anytime": True}
        task = anytime_task(schedule=schedule)
        due = at("2026-06-11T00:30:00+03:00")
        moved = advance(task, state(due_at=due), at("2026-06-10T23:50:00+03:00"), KYIV)
        cycle, slot = dose_slot(task.schedule, due, KYIV)
        assert slot == 3
        assert moved.runtime.pack is not None
        assert (moved.runtime.pack.cycle, moved.runtime.pack.taken) == (cycle, (3,))

    @pytest.mark.parametrize(
        ("moment", "expected"),
        [
            (D, True),
            (D - timedelta(hours=10), True),
            (D + timedelta(seconds=1), False),
        ],
    )
    def test_on_time(self, moment: Any, expected: bool) -> None:
        task = anytime_task(on_missed="carry", grace_hours=24)
        moved = advance(task, state(), moment, KYIV, new_id=id_factory())
        assert moved.events[0].type == "completed"
        assert moved.events[0].on_time is expected

    def test_triggers_are_kept_on_the_stage(self) -> None:
        trigger = {"entity_id": "sensor.a", "above": 1.0, "for_seconds": 0}
        task = Task.from_dict(
            task_dict(schedule=DAILY, stages=[stage_dict("a", complete_when=trigger)])
        )
        view = task_view(task, state(), at("2026-06-10T12:00:00+03:00"), KYIV)
        assert view["automated"] is True
        moved = advance(task, state(), at("2026-06-10T12:00:00+03:00"), KYIV, source="trigger")
        assert moved.events[0].source == "trigger"
        assert moved.runtime.due_at == NEXT


class TestScene:
    def scene(self, task: Task, current: Any, now: str, zone: Any = KYIV) -> dict[str, Any]:
        return task_view(task, current, at(now), zone)["scene"]

    @pytest.mark.parametrize(
        ("now", "expected"),
        [
            ("2026-06-10T00:00:00+03:00", 0.0),
            ("2026-06-10T11:59:30+03:00", 0.5),
            ("2026-06-10T23:59:00+03:00", 1.0),
        ],
    )
    def test_fill_on_the_deadline_day(self, now: str, expected: float) -> None:
        fill = self.scene(anytime_task(), state(), now)["fill"]
        assert fill == pytest.approx(expected, abs=0.001)

    def test_fill_does_not_collapse_at_midnight(self) -> None:
        current = state(last_completed_at=at("2026-06-03T23:59:00+03:00"))
        before = self.scene(anytime_task(), current, "2026-06-09T23:50:00+03:00")["fill"]
        after = self.scene(anytime_task(), current, "2026-06-10T00:01:00+03:00")["fill"]
        assert 0.8 < before < after

    def test_fill_counts_from_midnight_when_started_today(self) -> None:
        current = state(last_completed_at=None, stage_entered_at=at("2026-06-10T11:00:00+03:00"))
        fill = self.scene(anytime_task(), current, "2026-06-10T11:59:30+03:00")["fill"]
        assert fill == pytest.approx(0.5, abs=0.001)

    def test_fill_on_earlier_days_uses_the_general_formula(self) -> None:
        start = D - timedelta(days=4)
        current = state(last_completed_at=start)
        fill = self.scene(anytime_task(), current, "2026-06-08T23:59:00+03:00")["fill"]
        assert fill == 0.5

    def test_fill_stays_full_while_overdue(self) -> None:
        task = anytime_task(on_missed="carry")
        assert self.scene(task, state(), "2026-06-12T08:00:00+03:00")["fill"] == 1

    @pytest.mark.parametrize(
        ("due", "now", "elapsed", "length"),
        [
            pytest.param(
                "2026-03-29T23:59:00+03:00",
                "2026-03-29T12:00:00+03:00",
                11,
                22 + 59 / 60,
                id="spring-day-is-short",
            ),
            pytest.param(
                "2026-10-25T23:59:00+02:00",
                "2026-10-25T12:00:00+02:00",
                13,
                24 + 59 / 60,
                id="fall-day-is-long",
            ),
        ],
    )
    def test_fill_across_dst(self, due: str, now: str, elapsed: float, length: float) -> None:
        current = state(due_at=at(due), stage_entered_at=at(now))
        fill = self.scene(anytime_task(), current, now)["fill"]
        assert fill == pytest.approx(elapsed / length, abs=0.001)

    def test_deadline_at_midnight(self) -> None:
        schedule = {"type": "daily", "time": "00:00", "anytime": True}
        due = at("2026-06-10T00:00:00+03:00")
        task = anytime_task(schedule=schedule, on_missed="carry")
        assert self.scene(task, state(due_at=due), "2026-06-10T00:00:00+03:00")["fill"] == 1

    @pytest.mark.parametrize(
        ("now", "expected"),
        [
            ("2026-06-10T12:00:00+03:00", 0.0),
            ("2026-06-10T19:59:00+03:00", 0.0),
            ("2026-06-10T21:59:00+03:00", 0.5),
            ("2026-06-10T22:59:00+03:00", 0.75),
            ("2026-06-10T23:59:00+03:00", 1.0),
            ("2026-06-11T08:00:00+03:00", 1.0),
        ],
    )
    def test_stink(self, now: str, expected: float) -> None:
        task = anytime_task(on_missed="carry")
        assert self.scene(task, state(), now)["stink"] == expected

    def test_stink_zero_grace(self) -> None:
        task = anytime_task(on_missed="carry", grace_hours=0)
        assert self.scene(task, state(), "2026-06-10T23:58:00+03:00")["stink"] == 0
        assert self.scene(task, state(), "2026-06-10T23:59:00+03:00")["stink"] == 1

    def test_stale_stage_keeps_its_rule(self) -> None:
        task = anytime_task(
            on_missed="carry",
            stages=[stage_dict("a"), stage_dict("b", role="waiting", stale_after_minutes=60)],
        )
        entered = at("2026-06-10T22:00:00+03:00")
        current = state(stage_index=1, stage_entered_at=entered, started_at=entered)
        assert self.scene(task, current, "2026-06-10T23:30:00+03:00")["stink"] == 0.5

    def test_upcoming_scene_accumulates(self) -> None:
        scene = self.scene(anytime_task(), state(), "2026-06-10T10:00:00+03:00")
        assert scene["state"] == "accumulating"


def test_undo_after_the_deadline_keeps_the_later_miss_in_stats() -> None:
    task = anytime_task()
    new_id = id_factory()
    finished = advance(task, state(), at("2026-06-10T23:50:00+03:00"), KYIV, new_id=new_id)
    restored = undo(task, finished.runtime, at("2026-06-11T00:05:00+03:00"), new_id=new_id)
    missed = rollover(task, restored.runtime, at("2026-06-11T00:06:00+03:00"), KYIV, new_id=new_id)
    events = [*finished.events, *restored.events, *missed.events]
    assert [e.type for e in events] == ["completed", "undone", "missed"]
    assert missed.events[0].ts == D
    result = summary(events, at("2026-06-11T01:00:00+03:00"), 3, KYIV)
    assert (result["completed"], result["missed"], result["current_streak"]) == (0, 1, 0)
