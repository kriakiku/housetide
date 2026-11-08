from dataclasses import replace
from typing import Any

import pytest
from engine_factories import KYIV, at, chain_task, id_factory, make_task, stage_dict

from custom_components.housetide.engine.machine import (
    MachineError,
    advance,
    can_advance,
    can_skip,
    created_event,
    deleted_event,
    initial_runtime,
    reconcile,
    rollover,
    skip,
    undo,
)
from custom_components.housetide.engine.models import Runtime, Task
from custom_components.housetide.engine.views import task_status

DAILY = {"type": "daily", "time": "08:00"}
WEEKLY = {"type": "weekly", "weekdays": [2], "time": "08:00"}
EVERY_7_COMPLETION = {"type": "interval", "every_days": 7, "time": "10:00", "anchor": "completion"}
EVERY_7_SCHEDULE = {"type": "interval", "every_days": 7, "time": "10:00", "anchor": "schedule"}
ONCE = {"type": "once", "due": "2026-06-10T08:00:00+03:00"}
D = at("2026-06-10T08:00:00+03:00")
NEXT = at("2026-06-11T08:00:00+03:00")


def fresh(task: Task, now: str = "2026-06-10T07:00:00+03:00") -> Runtime:
    return initial_runtime(task, at(now), KYIV, id_factory())


def kinds(transition: Any) -> list[str]:
    return [event.type for event in transition.events]


@pytest.mark.parametrize(
    ("schedule", "now", "due", "following"),
    [
        pytest.param(DAILY, "2026-06-10T07:00:00+03:00", D, NEXT, id="daily"),
        pytest.param(
            WEEKLY,
            "2026-06-10T07:00:00+03:00",
            D,
            at("2026-06-17T08:00:00+03:00"),
            id="weekly",
        ),
        pytest.param(
            EVERY_7_COMPLETION,
            "2026-06-10T11:00:00+03:00",
            at("2026-06-17T10:00:00+03:00"),
            at("2026-06-24T10:00:00+03:00"),
            id="interval-completion",
        ),
        pytest.param(
            EVERY_7_SCHEDULE,
            "2026-06-10T09:00:00+03:00",
            at("2026-06-10T10:00:00+03:00"),
            at("2026-06-17T10:00:00+03:00"),
            id="interval-schedule",
        ),
        pytest.param(ONCE, "2026-06-20T07:00:00+03:00", D, None, id="once-past"),
    ],
)
def test_initial_runtime(schedule: dict[str, Any], now: str, due: Any, following: Any) -> None:
    result = fresh(make_task(schedule=schedule), now)
    assert (result.due_at, result.next_due_at) == (due, following)
    assert result.stage_index == 0
    assert result.stage_entered_at == at(now)
    assert result.started_at is None
    assert result.undo is None


def test_chain_events_and_fields() -> None:
    task = chain_task()
    ids = id_factory()
    start = fresh(task)
    first = advance(task, start, at("2026-06-10T08:10:00+03:00"), KYIV, new_id=ids)
    assert kinds(first) == ["started", "advanced"]
    assert first.events[0].stage_id == "a"
    assert first.events[1].stage_id == "b"
    assert first.events[1].stage_title == "B"
    assert first.events[0].occurrence_id == start.occurrence_id
    assert first.runtime.stage_index == 1
    assert first.runtime.started_at == at("2026-06-10T08:10:00+03:00")
    assert first.runtime.stage_entered_at == at("2026-06-10T08:10:00+03:00")
    assert first.runtime.occurrence_id == start.occurrence_id
    assert first.runtime.due_at == D

    second = advance(
        task,
        first.runtime,
        at("2026-06-10T09:00:00+03:00"),
        KYIV,
        source="trigger",
        new_id=ids,
    )
    assert kinds(second) == ["advanced"]
    assert second.events[0].source == "trigger"
    assert second.runtime.started_at == at("2026-06-10T08:10:00+03:00")
    assert second.runtime.stage_entered_at == at("2026-06-10T09:00:00+03:00")

    done = advance(
        task,
        second.runtime,
        at("2026-06-10T10:00:00+03:00"),
        KYIV,
        user_id="user",
        new_id=ids,
    )
    assert kinds(done) == ["completed"]
    assert done.events[0].stage_id == "c"
    assert done.events[0].user_id == "user"
    assert done.events[0].on_time is True
    assert done.events[0].occurrence_id == start.occurrence_id
    assert done.runtime.occurrence_id != start.occurrence_id
    assert done.runtime.stage_index == 0
    assert done.runtime.started_at is None
    assert done.runtime.last_completed_at == at("2026-06-10T10:00:00+03:00")
    assert done.runtime.clean_until == at("2026-06-10T22:00:00+03:00")
    assert done.runtime.due_at == NEXT
    assert done.runtime.next_due_at == at("2026-06-12T08:00:00+03:00")


def test_single_stage_logs_only_completed() -> None:
    task = make_task()
    assert kinds(advance(task, fresh(task), D, KYIV)) == ["completed"]


@pytest.mark.parametrize(
    ("completed", "grace", "expected"),
    [
        pytest.param("2026-06-10T07:00:00+03:00", 24, True, id="early"),
        pytest.param("2026-06-10T08:00:00+03:00", 24, True, id="at-due"),
        pytest.param("2026-06-11T08:00:00+03:00", 24, True, id="at-grace-edge"),
        pytest.param("2026-06-11T08:00:01+03:00", 24, False, id="after-grace"),
        pytest.param("2026-06-10T08:00:00+03:00", 0, True, id="zero-grace-on-due"),
        pytest.param("2026-06-10T08:00:01+03:00", 0, False, id="zero-grace-late"),
    ],
)
def test_on_time(completed: str, grace: int, expected: bool) -> None:
    task = make_task(grace_hours=grace)
    result = advance(task, fresh(task), at(completed), KYIV)
    assert result.events[0].on_time is expected


@pytest.mark.parametrize(
    ("schedule", "created", "completed", "expected_due"),
    [
        pytest.param(
            DAILY,
            "2026-06-10T07:00:00+03:00",
            "2026-06-10T07:30:00+03:00",
            "2026-06-11T08:00:00+03:00",
            id="daily-early-moves-past-its-own-due",
        ),
        pytest.param(
            DAILY,
            "2026-06-10T07:00:00+03:00",
            "2026-06-10T09:00:00+03:00",
            "2026-06-11T08:00:00+03:00",
            id="daily-after-due",
        ),
        pytest.param(
            DAILY,
            "2026-06-10T07:00:00+03:00",
            "2026-06-12T07:00:00+03:00",
            "2026-06-12T08:00:00+03:00",
            id="daily-very-late-next-is-today",
        ),
        pytest.param(
            WEEKLY,
            "2026-06-10T07:00:00+03:00",
            "2026-06-10T07:30:00+03:00",
            "2026-06-17T08:00:00+03:00",
            id="weekly-early",
        ),
        pytest.param(
            EVERY_7_COMPLETION,
            "2026-06-10T11:00:00+03:00",
            "2026-06-13T20:00:00+03:00",
            "2026-06-20T10:00:00+03:00",
            id="completion-anchor-counts-from-early-completion",
        ),
        pytest.param(
            EVERY_7_COMPLETION,
            "2026-06-10T11:00:00+03:00",
            "2026-06-20T20:00:00+03:00",
            "2026-06-27T10:00:00+03:00",
            id="completion-anchor-counts-from-late-completion",
        ),
        pytest.param(
            EVERY_7_SCHEDULE,
            "2026-06-10T09:00:00+03:00",
            "2026-06-08T09:00:00+03:00",
            "2026-06-17T10:00:00+03:00",
            id="schedule-anchor-early",
        ),
        pytest.param(
            EVERY_7_SCHEDULE,
            "2026-06-10T09:00:00+03:00",
            "2026-06-12T09:00:00+03:00",
            "2026-06-17T10:00:00+03:00",
            id="schedule-anchor-late-keeps-rhythm",
        ),
        pytest.param(
            EVERY_7_SCHEDULE,
            "2026-06-10T09:00:00+03:00",
            "2026-06-20T09:00:00+03:00",
            "2026-06-24T10:00:00+03:00",
            id="schedule-anchor-skips-past-now",
        ),
    ],
)
def test_next_occurrence_after_completion(
    schedule: dict[str, Any], created: str, completed: str, expected_due: str
) -> None:
    task = make_task(schedule=schedule)
    result = advance(task, fresh(task, created), at(completed), KYIV)
    assert result.runtime.due_at == at(expected_due)
    assert result.runtime.next_due_at is not None
    assert result.runtime.next_due_at > result.runtime.due_at


def test_one_off_completion() -> None:
    task = make_task(schedule=ONCE)
    start = fresh(task)
    result = advance(task, start, at("2026-06-10T09:00:00+03:00"), KYIV)
    assert kinds(result) == ["completed"]
    assert result.events[0].on_time is True
    assert result.runtime.due_at is None
    assert result.runtime.next_due_at is None
    assert result.runtime.last_completed_at == at("2026-06-10T09:00:00+03:00")
    assert result.runtime.clean_until is not None
    assert task_status(task, result.runtime, at("2026-06-10T09:00:01+03:00")) == "done"
    assert not can_advance(task, result.runtime)
    assert not can_skip(task, result.runtime)
    with pytest.raises(MachineError):
        advance(task, result.runtime, at("2026-06-10T09:01:00+03:00"), KYIV)
    with pytest.raises(MachineError):
        skip(task, result.runtime, at("2026-06-10T09:01:00+03:00"), KYIV)


def test_one_off_early_completion_is_finished() -> None:
    task = make_task(schedule=ONCE)
    result = advance(
        task, fresh(task, "2026-06-09T07:00:00+03:00"), at("2026-06-09T09:00:00+03:00"), KYIV
    )
    assert result.runtime.due_at is None
    assert task_status(task, result.runtime, at("2026-06-09T09:00:01+03:00")) == "done"


def test_one_off_skip_is_finished_without_completion() -> None:
    task = make_task(schedule=ONCE)
    result = skip(task, fresh(task), at("2026-06-10T09:00:00+03:00"), KYIV)
    assert kinds(result) == ["skipped"]
    assert result.runtime.due_at is None
    assert result.runtime.last_completed_at is None
    assert result.runtime.clean_until is None
    assert task_status(task, result.runtime, at("2026-06-10T09:00:01+03:00")) == "done"


@pytest.mark.parametrize(
    ("schedule", "created", "skip_at", "expected"),
    [
        pytest.param(
            DAILY, "2026-06-10T07:00:00+03:00", "2026-06-10T09:00:00+03:00", NEXT, id="after-due"
        ),
        pytest.param(
            DAILY, "2026-06-10T07:00:00+03:00", "2026-06-10T07:30:00+03:00", NEXT, id="before-due"
        ),
        pytest.param(
            EVERY_7_COMPLETION,
            "2026-06-10T11:00:00+03:00",
            "2026-06-17T11:00:00+03:00",
            at("2026-06-24T10:00:00+03:00"),
            id="interval-completion-from-due",
        ),
        pytest.param(
            EVERY_7_SCHEDULE,
            "2026-06-10T09:00:00+03:00",
            "2026-06-20T09:00:00+03:00",
            at("2026-06-24T10:00:00+03:00"),
            id="interval-schedule-past-now",
        ),
    ],
)
def test_skip(schedule: dict[str, Any], created: str, skip_at: str, expected: Any) -> None:
    task = make_task(schedule=schedule)
    start = fresh(task, created)
    result = skip(task, start, at(skip_at), KYIV, source="service", user_id="u")
    assert kinds(result) == ["skipped"]
    assert result.events[0].on_time is None
    assert result.events[0].source == "service"
    assert result.events[0].user_id == "u"
    assert result.runtime.due_at == expected
    assert result.runtime.last_completed_at is None
    assert result.runtime.occurrence_id != start.occurrence_id


def test_skip_in_progress_resets_to_first_stage() -> None:
    task = chain_task()
    moved = advance(task, fresh(task), D, KYIV).runtime
    result = skip(task, moved, at("2026-06-10T09:00:00+03:00"), KYIV)
    assert result.runtime.stage_index == 0
    assert result.runtime.started_at is None
    assert result.events[0].stage_id == "b"


@pytest.mark.parametrize(
    ("on_missed", "now", "stage_index", "started_at", "enabled", "expected_kinds"),
    [
        pytest.param("skip", "2026-06-11T07:59:59+03:00", 0, None, True, [], id="before-next"),
        pytest.param("skip", "2026-06-11T08:00:00+03:00", 0, None, True, ["missed"], id="at-next"),
        pytest.param("skip", "2026-06-11T08:00:30+03:00", 0, None, True, ["missed"], id="after"),
        pytest.param("carry", "2026-06-11T08:00:00+03:00", 0, None, True, [], id="carry"),
        pytest.param("carry", "2026-06-20T08:00:00+03:00", 0, None, True, [], id="carry-long"),
        pytest.param("skip", "2026-06-11T08:00:00+03:00", 1, D, True, [], id="stage-1"),
        pytest.param("skip", "2026-06-20T08:00:00+03:00", 2, D, True, [], id="stage-2"),
        pytest.param("skip", "2026-06-11T08:00:00+03:00", 0, D, True, [], id="started-stage-0"),
        pytest.param("carry", "2026-06-20T08:00:00+03:00", 1, D, True, [], id="carry-stage-1"),
        pytest.param("skip", "2026-06-11T08:00:00+03:00", 0, None, False, [], id="disabled"),
    ],
)
def test_rollover_rules(
    on_missed: str,
    now: str,
    stage_index: int,
    started_at: Any,
    enabled: bool,
    expected_kinds: list[str],
) -> None:
    task = chain_task(on_missed=on_missed, enabled=enabled)
    start = replace(fresh(task), stage_index=stage_index, started_at=started_at)
    result = rollover(task, start, at(now), KYIV)
    assert kinds(result) == expected_kinds
    if not expected_kinds:
        assert result.runtime == start


def test_rollover_moves_to_next_occurrence() -> None:
    task = make_task(on_missed="skip")
    previous_undo = replace(fresh(task), occurrence_id="older")
    start = replace(fresh(task), occurrence_id="current", undo=previous_undo)
    result = rollover(task, start, at("2026-06-11T08:00:10+03:00"), KYIV, id_factory())
    assert result.events[0].source == "schedule"
    assert result.events[0].occurrence_id == "current"
    assert result.events[0].on_time is None
    assert result.events[0].ts == NEXT
    assert result.runtime.due_at == NEXT
    assert result.runtime.next_due_at == at("2026-06-12T08:00:00+03:00")
    assert result.runtime.occurrence_id != "current"
    assert result.runtime.undo is None


def test_rollover_catches_up_every_missed_occurrence() -> None:
    task = make_task(on_missed="skip")
    result = rollover(task, fresh(task), at("2026-06-13T09:00:00+03:00"), KYIV, id_factory())
    assert [event.ts for event in result.events] == [
        at("2026-06-11T08:00:00+03:00"),
        at("2026-06-12T08:00:00+03:00"),
        at("2026-06-13T08:00:00+03:00"),
    ]
    assert len({event.occurrence_id for event in result.events}) == 3
    assert result.runtime.due_at == at("2026-06-13T08:00:00+03:00")
    assert result.runtime.next_due_at == at("2026-06-14T08:00:00+03:00")
    again = rollover(task, result.runtime, at("2026-06-13T09:00:30+03:00"), KYIV)
    assert again.events == ()


def test_one_off_never_rolls_over() -> None:
    task = make_task(schedule=ONCE, on_missed="skip")
    assert rollover(task, fresh(task), at("2027-01-01T00:00:00+02:00"), KYIV).events == ()


def test_rollover_across_interval_keeps_rhythm() -> None:
    task = make_task(schedule=EVERY_7_COMPLETION, on_missed="skip")
    start = fresh(task, "2026-06-10T11:00:00+03:00")
    result = rollover(task, start, at("2026-06-24T10:00:00+03:00"), KYIV, id_factory())
    assert kinds(result) == ["missed"]
    assert result.runtime.due_at == at("2026-06-24T10:00:00+03:00")
    assert result.runtime.next_due_at == at("2026-07-01T10:00:00+03:00")


def test_rollover_near_dst_uses_wall_clock() -> None:
    task = make_task(on_missed="skip", schedule={"type": "daily", "time": "03:30"})
    start = initial_runtime(task, at("2026-03-27T12:00:00+02:00"), KYIV, id_factory())
    result = rollover(task, start, at("2026-03-30T03:30:00+03:00"), KYIV, id_factory())
    assert [event.ts for event in result.events] == [
        at("2026-03-29T01:30:00+00:00"),
        at("2026-03-30T00:30:00+00:00"),
    ]


@pytest.mark.parametrize(
    ("label", "now_offset"),
    [
        pytest.param("upcoming", "2026-06-10T07:30:00+03:00", id="upcoming"),
        pytest.param("clean", "2026-06-11T09:00:00+03:00", id="clean"),
    ],
)
def test_early_start(label: str, now_offset: str) -> None:
    task = chain_task(
        schedule=EVERY_7_COMPLETION if label == "clean" else DAILY,
    )
    start = fresh(task, "2026-06-10T07:00:00+03:00")
    if label == "clean":
        for moment in (
            "2026-06-10T08:00:00+03:00",
            "2026-06-10T08:10:00+03:00",
            "2026-06-11T08:00:00+03:00",
        ):
            start = advance(task, start, at(moment), KYIV).runtime
    now = at(now_offset)
    assert task_status(task, start, now) == label
    due_before = start.due_at
    moved = advance(task, start, now, KYIV, source="trigger")
    assert kinds(moved) == ["started", "advanced"]
    assert task_status(task, moved.runtime, now) == "in_progress"
    assert moved.runtime.due_at == due_before
    assert moved.runtime.started_at == now
    assert rollover(task, moved.runtime, at("2027-01-01T00:00:00+02:00"), KYIV).events == ()


def test_early_start_computes_next_due_after_completion() -> None:
    task = chain_task(schedule=EVERY_7_COMPLETION)
    start = fresh(task, "2026-06-10T11:00:00+03:00")
    current = start
    for moment in (
        "2026-06-13T09:00:00+03:00",
        "2026-06-13T10:00:00+03:00",
        "2026-06-13T11:00:00+03:00",
    ):
        current = advance(task, current, at(moment), KYIV).runtime
    assert current.last_completed_at == at("2026-06-13T11:00:00+03:00")
    assert current.due_at == at("2026-06-20T10:00:00+03:00")


@pytest.mark.parametrize("action", ["advance", "complete", "skip"])
def test_undo_restores_previous_runtime_once(action: str) -> None:
    task = make_task() if action == "complete" else chain_task()
    start = fresh(task)
    transition = skip(task, start, D, KYIV) if action == "skip" else advance(task, start, D, KYIV)
    assert transition.runtime.undo == start
    restored = undo(task, transition.runtime, at("2026-06-10T08:05:00+03:00"), user_id="u")
    assert kinds(restored) == ["undone"]
    assert restored.runtime == start
    assert restored.runtime.undo is None
    assert restored.events[0].user_id == "u"
    assert restored.events[0].occurrence_id == start.occurrence_id
    with pytest.raises(MachineError, match="nothing to undo"):
        undo(task, restored.runtime, at("2026-06-10T08:06:00+03:00"))


def test_undo_keeps_single_level() -> None:
    task = chain_task()
    first = advance(task, fresh(task), D, KYIV).runtime
    second = advance(task, first, at("2026-06-10T09:00:00+03:00"), KYIV).runtime
    assert second.undo is not None
    assert second.undo.stage_index == 1
    assert second.undo.undo is None
    restored = undo(task, second, at("2026-06-10T09:01:00+03:00")).runtime
    assert restored.stage_index == 1
    assert restored.undo is None


def test_undo_of_one_off_completion_reopens_it() -> None:
    task = make_task(schedule=ONCE)
    start = fresh(task)
    finished = advance(task, start, D, KYIV).runtime
    assert undo(task, finished, D).runtime == start


def test_disabled_task_rejects_transitions() -> None:
    task = make_task(enabled=False)
    start = fresh(task)
    with pytest.raises(MachineError):
        advance(task, start, D, KYIV)
    with pytest.raises(MachineError):
        skip(task, start, D, KYIV)


def test_naive_now_rejected() -> None:
    task = make_task()
    with pytest.raises(ValueError, match="timezone-aware"):
        advance(task, fresh(task), at("2026-06-10T08:00:00"), KYIV)


def test_created_and_deleted_events() -> None:
    task = make_task()
    start = fresh(task)
    created = created_event(task, start, D, user_id="u")
    deleted = deleted_event(task, start, D, source="service")
    assert (created.type, created.user_id, created.stage_id) == ("created", "u", "s0")
    assert (deleted.type, deleted.source) == ("deleted", "service")


def test_reconcile_unchanged_keeps_undo() -> None:
    task = make_task()
    current = replace(fresh(task), undo=fresh(task))
    assert reconcile(task, task, current, D, KYIV) == current


def test_reconcile_title_change_keeps_runtime() -> None:
    task = make_task()
    other = make_task(title="Other")
    current = replace(fresh(task), undo=fresh(task))
    assert reconcile(task, other, current, D, KYIV) == current


def test_reconcile_schedule_change_recomputes_unstarted() -> None:
    task = make_task()
    other = make_task(schedule={"type": "daily", "time": "20:00"})
    current = replace(fresh(task), occurrence_id="before", undo=fresh(task))
    result = reconcile(task, other, current, D, KYIV, id_factory())
    assert result.due_at == at("2026-06-10T20:00:00+03:00")
    assert result.next_due_at == at("2026-06-11T20:00:00+03:00")
    assert result.occurrence_id != current.occurrence_id
    assert result.undo is None


def test_reconcile_schedule_change_keeps_started_occurrence() -> None:
    task = chain_task()
    other = chain_task(schedule={"type": "daily", "time": "20:00"})
    moved = advance(task, fresh(task), D, KYIV).runtime
    result = reconcile(task, other, moved, at("2026-06-10T09:00:00+03:00"), KYIV)
    assert result.due_at == D
    assert result.occurrence_id == moved.occurrence_id
    assert result.stage_index == 1
    assert result.undo is None


@pytest.mark.parametrize(
    ("stages", "index", "entered_changes"),
    [
        pytest.param([stage_dict("x"), stage_dict("a"), stage_dict("b")], 2, False, id="moved"),
        pytest.param([stage_dict("x")], 0, True, id="removed-clamps"),
        pytest.param([stage_dict("a"), stage_dict("y")], 1, True, id="replaced"),
    ],
)
def test_reconcile_stage_changes(
    stages: list[dict[str, Any]], index: int, entered_changes: bool
) -> None:
    task = chain_task()
    other = make_task(stages=stages)
    moved = advance(task, fresh(task), D, KYIV).runtime
    later = at("2026-06-10T09:00:00+03:00")
    result = reconcile(task, other, moved, later, KYIV)
    assert result.stage_index == index
    assert (result.stage_entered_at == later) is entered_changes


def test_reconcile_reenable_recomputes_stale_due() -> None:
    disabled = make_task(enabled=False)
    enabled = make_task()
    current = fresh(disabled)
    result = reconcile(disabled, enabled, current, at("2026-06-20T07:00:00+03:00"), KYIV)
    assert result.due_at == at("2026-06-20T08:00:00+03:00")


def test_reconcile_reenable_does_not_reopen_finished_one_off() -> None:
    enabled = make_task(schedule=ONCE)
    finished = advance(enabled, fresh(enabled), D, KYIV).runtime
    disabled = replace(enabled, enabled=False)
    result = reconcile(disabled, enabled, finished, at("2026-06-20T07:00:00+03:00"), KYIV)
    assert result.due_at is None


def test_reconcile_new_due_reopens_finished_one_off() -> None:
    enabled = make_task(schedule=ONCE)
    finished = advance(enabled, fresh(enabled), D, KYIV).runtime
    other = make_task(schedule={"type": "once", "due": "2026-06-20T08:00:00+03:00"})
    result = reconcile(enabled, other, finished, at("2026-06-11T07:00:00+03:00"), KYIV)
    assert result.due_at == at("2026-06-20T08:00:00+03:00")


@pytest.mark.parametrize(
    "stages",
    [
        pytest.param([stage_dict("x"), stage_dict("a"), stage_dict("b")], id="inserted"),
        pytest.param([stage_dict("b"), stage_dict("a")], id="swapped"),
    ],
)
def test_reconcile_keeps_unstarted_occurrence_on_first_stage(stages: list[dict[str, Any]]) -> None:
    task = chain_task()
    other = make_task(stages=stages)
    result = reconcile(task, other, fresh(task), D, KYIV)
    assert result.stage_index == 0
    assert result.started_at is None
    assert task_status(other, result, D) == "due"


def test_reconcile_stage_edit_does_not_revive_finished_one_off() -> None:
    task = make_task(schedule=ONCE)
    finished = advance(task, fresh(task), D, KYIV).runtime
    other = make_task(schedule=ONCE, stages=[stage_dict("x"), stage_dict()])
    result = reconcile(task, other, finished, NEXT, KYIV)
    assert result.stage_index == 0
    assert task_status(other, result, NEXT) == "done"
    assert not can_advance(other, result)
