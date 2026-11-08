from dataclasses import replace
from datetime import date, datetime, time, timedelta
from typing import Any
from zoneinfo import ZoneInfo

import pytest
from engine_factories import KYIV, LORD_HOWE, NEW_YORK, at, chain_task, id_factory, make_task

from custom_components.housetide.engine.machine import (
    advance,
    initial_runtime,
    reconcile,
    rollover,
    skip,
    undo,
)
from custom_components.housetide.engine.models import (
    Pack,
    Runtime,
    Task,
    ValidationError,
    schedule_from_dict,
)
from custom_components.housetide.engine.schedule import dose_slot, resolve_local
from custom_components.housetide.engine.views import task_view

DAILY = {"type": "daily", "time": "08:00"}
MONDAYS = {"type": "weekly", "weekdays": [0], "time": "08:00"}
TF, TK, MS, CR = "full", "taken", "missed", "current"


def pills(schedule: dict[str, Any] | None = None, **overrides: Any) -> Task:
    return make_task(scene="pills", schedule=schedule or DAILY, on_missed="skip", **overrides)


def start(task: Task, moment: str) -> Runtime:
    return initial_runtime(task, at(moment), KYIV, id_factory())


def slots(task: Task, runtime: Runtime, moment: str) -> list[str]:
    return task_view(task, runtime, at(moment), KYIV)["scene"]["slots"]


def row(cells: str) -> list[str]:
    return [{"f": TF, "t": TK, "m": MS, "c": CR}[cell] for cell in cells]


@pytest.mark.parametrize(
    ("schedule", "due", "zone", "expected"),
    [
        (DAILY, "2000-01-03T08:00:00+00:00", KYIV, (0, 0)),
        (DAILY, "2026-11-02T08:00:00+02:00", KYIV, (1400, 0)),
        (DAILY, "2026-11-04T08:00:00+02:00", KYIV, (1400, 2)),
        (DAILY, "2026-11-08T08:00:00+02:00", KYIV, (1400, 6)),
        (DAILY, "2026-11-09T08:00:00+02:00", KYIV, (1401, 0)),
        (DAILY, "2026-11-08T22:30:00+00:00", KYIV, (1401, 0)),
        (DAILY, "2026-11-08T21:59:00+00:00", KYIV, (1400, 6)),
        (DAILY, "2000-01-02T08:00:00+00:00", KYIV, (-1, 6)),
        (DAILY, "2026-11-01T05:30:00+00:00", NEW_YORK, (1399, 6)),
        (DAILY, "2026-11-01T06:30:00+00:00", NEW_YORK, (1399, 6)),
        (DAILY, "2026-11-02T04:30:00+00:00", NEW_YORK, (1399, 6)),
        (DAILY, "2026-11-02T05:30:00+00:00", NEW_YORK, (1400, 0)),
        (DAILY, "2026-10-04T13:45:00+00:00", LORD_HOWE, (1396, 0)),
        (MONDAYS, "2000-01-03T08:00:00+02:00", KYIV, (0, 0)),
        (MONDAYS, "2000-01-10T08:00:00+02:00", KYIV, (0, 1)),
        (MONDAYS, "2000-02-14T08:00:00+02:00", KYIV, (0, 6)),
        (MONDAYS, "2000-02-21T08:00:00+02:00", KYIV, (1, 0)),
        (MONDAYS, "2026-11-02T08:00:00+02:00", KYIV, (200, 0)),
        (MONDAYS, "2026-11-23T08:00:00+02:00", KYIV, (200, 3)),
        (
            {"type": "weekly", "weekdays": [4, 0, 2], "time": "08:00"},
            "2000-01-07T08:00:00+02:00",
            KYIV,
            (0, 2),
        ),
        (
            {"type": "weekly", "weekdays": [0, 2, 4], "time": "08:00"},
            "2000-01-17T08:00:00+02:00",
            KYIV,
            (0, 6),
        ),
        (
            {"type": "weekly", "weekdays": [0, 2, 4], "time": "08:00"},
            "2000-01-19T08:00:00+02:00",
            KYIV,
            (1, 0),
        ),
        (
            {"type": "weekly", "weekdays": [0, 3], "time": "08:00"},
            "2026-11-05T08:00:00+02:00",
            KYIV,
            (400, 1),
        ),
        (
            {"type": "weekly", "weekdays": [0, 3], "time": "08:00"},
            "2026-11-04T08:00:00+02:00",
            KYIV,
            (400, 1),
        ),
        (
            {"type": "interval", "every_days": 3, "time": "08:00", "anchor": "schedule"},
            "2000-01-05T08:00:00+02:00",
            KYIV,
            (0, 0),
        ),
        (
            {"type": "interval", "every_days": 3, "time": "08:00", "anchor": "schedule"},
            "2000-01-06T08:00:00+02:00",
            KYIV,
            (0, 1),
        ),
        (
            {"type": "interval", "every_days": 3, "time": "08:00", "anchor": "completion"},
            "2000-01-24T08:00:00+02:00",
            KYIV,
            (1, 0),
        ),
        (
            {"type": "once", "due": "2026-11-06T08:00:00+02:00"},
            "2026-11-06T08:00:00+02:00",
            KYIV,
            (0, 0),
        ),
    ],
)
def test_dose_slot(
    schedule: dict[str, Any], due: str, zone: ZoneInfo, expected: tuple[int, int]
) -> None:
    assert dose_slot(schedule_from_dict(schedule), at(due), zone) == expected


def test_nonexistent_local_time_keeps_its_day() -> None:
    due = resolve_local(date(2026, 3, 8), time(2, 30), NEW_YORK)
    assert dose_slot(schedule_from_dict(DAILY), due, NEW_YORK)[1] == 6


def test_daily_pack_fills_through_the_week() -> None:
    task = pills()
    ids = id_factory()
    state = initial_runtime(task, at("2026-11-02T06:00:00+02:00"), KYIV, ids)
    assert slots(task, state, "2026-11-02T06:00:00+02:00") == row("cffffff")
    state = advance(task, state, at("2026-11-02T08:10:00+02:00"), KYIV, new_id=ids).runtime
    assert state.pack == Pack(1400, (0,), ())
    assert slots(task, state, "2026-11-02T08:11:00+02:00") == row("tffffff")
    assert slots(task, state, "2026-11-02T20:11:00+02:00") == row("tcfffff")
    state = advance(task, state, at("2026-11-03T08:10:00+02:00"), KYIV, new_id=ids).runtime
    assert state.pack == Pack(1400, (0, 1), ())
    assert slots(task, state, "2026-11-03T09:00:00+02:00") == row("ttfffff")


def test_week_boundary_refills_the_pack() -> None:
    task = pills()
    ids = id_factory()
    state = initial_runtime(task, at("2026-11-08T06:00:00+02:00"), KYIV, ids)
    assert state.due_at == at("2026-11-08T08:00:00+02:00")
    filled = Pack(1400, (0, 1, 2, 3, 4, 5), ())
    state = advance(
        task,
        replace(state, pack=filled),
        at("2026-11-08T08:10:00+02:00"),
        KYIV,
        new_id=ids,
    ).runtime
    assert slots(task, state, "2026-11-08T09:00:00+02:00") == row("ttttttt")
    assert slots(task, state, "2026-11-08T20:30:00+02:00") == row("cffffff")
    assert state.pack == Pack(1400, (0, 1, 2, 3, 4, 5, 6), ())
    state = advance(task, state, at("2026-11-09T08:10:00+02:00"), KYIV, new_id=ids).runtime
    assert state.pack == Pack(1401, (0,), ())


def test_weekly_pack_lasts_seven_weeks_and_the_slot_moves() -> None:
    task = pills(MONDAYS)
    ids = id_factory()
    state = initial_runtime(task, at("2026-11-02T06:00:00+02:00"), KYIV, ids)
    for week in range(7):
        moment = at("2026-11-02T08:10:00+02:00") + timedelta(weeks=week)
        before = (moment + timedelta(hours=-3)).isoformat()
        assert slots(task, state, before).index(CR) == week
        assert slots(task, state, before).count(TK) == week
        state = advance(task, state, moment, KYIV, new_id=ids).runtime
        assert state.pack == Pack(200, tuple(range(week + 1)), ())
    assert slots(task, state, "2026-12-14T09:00:00+02:00") == row("ttttttt")
    assert slots(task, state, "2026-12-15T09:00:00+02:00") == row("cffffff")
    state = advance(task, state, at("2026-12-21T08:10:00+02:00"), KYIV, new_id=ids).runtime
    assert state.pack == Pack(201, (0,), ())


def test_new_weekly_task_starts_mid_pack() -> None:
    task = pills(MONDAYS)
    state = start(task, "2026-11-20T12:00:00+02:00")
    assert state.due_at == at("2026-11-23T08:00:00+02:00")
    assert slots(task, state, "2026-11-20T12:00:00+02:00") == row("fffcfff")


def test_weekly_with_several_weekdays_uses_one_cell_each() -> None:
    task = pills({"type": "weekly", "weekdays": [0, 3], "time": "08:00"})
    ids = id_factory()
    state = initial_runtime(task, at("2026-11-02T06:00:00+02:00"), KYIV, ids)
    assert slots(task, state, "2026-11-02T06:00:00+02:00") == row("cffffff")
    state = advance(task, state, at("2026-11-02T08:10:00+02:00"), KYIV, new_id=ids).runtime
    assert slots(task, state, "2026-11-02T21:00:00+02:00") == row("tcfffff")
    state = advance(task, state, at("2026-11-05T08:10:00+02:00"), KYIV, new_id=ids).runtime
    assert state.pack == Pack(400, (0, 1), ())
    assert slots(task, state, "2026-11-05T21:00:00+02:00") == row("ttcffff")


def test_interval_slot_counts_periods() -> None:
    task = pills({"type": "interval", "every_days": 2, "time": "08:00", "anchor": "schedule"})
    ids = id_factory()
    state = initial_runtime(task, at("2026-11-02T09:00:00+02:00"), KYIV, ids)
    first = dose_slot(task.schedule, state.due_at, KYIV)
    state = skip(task, state, at("2026-11-02T10:00:00+02:00"), KYIV, new_id=ids).runtime
    second = dose_slot(task.schedule, state.due_at, KYIV)
    assert (second[0] * 7 + second[1]) - (first[0] * 7 + first[1]) == 1


def test_interval_early_completion_can_land_on_the_taken_slot() -> None:
    task = pills({"type": "interval", "every_days": 3, "time": "08:00", "anchor": "completion"})
    ids = id_factory()
    state = initial_runtime(task, at("2026-11-02T09:00:00+02:00"), KYIV, ids)
    assert state.due_at == at("2026-11-05T08:00:00+02:00")
    done = advance(task, state, at("2026-11-02T10:00:00+02:00"), KYIV, new_id=ids).runtime
    assert done.due_at == at("2026-11-05T08:00:00+02:00")
    assert done.pack == Pack(466, (5,), ())
    assert slots(task, done, "2026-11-02T11:00:00+02:00") == row("ffffftf")
    assert slots(task, done, "2026-11-02T23:00:00+02:00") == row("fffffcf")


def test_early_completion_uses_the_slot_of_the_completed_occurrence() -> None:
    task = pills()
    ids = id_factory()
    state = initial_runtime(task, at("2026-11-02T06:00:00+02:00"), KYIV, ids)
    state = advance(task, state, at("2026-11-02T08:10:00+02:00"), KYIV, new_id=ids).runtime
    state = advance(task, state, at("2026-11-02T21:00:00+02:00"), KYIV, new_id=ids).runtime
    assert state.pack == Pack(1400, (0, 1), ())
    assert state.due_at == at("2026-11-04T08:00:00+02:00")


def test_skip_records_missed() -> None:
    task = pills()
    ids = id_factory()
    state = initial_runtime(task, at("2026-11-02T06:00:00+02:00"), KYIV, ids)
    state = skip(task, state, at("2026-11-02T08:10:00+02:00"), KYIV, new_id=ids).runtime
    assert state.pack == Pack(1400, (), (0,))
    assert slots(task, state, "2026-11-02T09:00:00+02:00") == row("mcfffff")


def test_skip_over_a_stale_pack_starts_fresh() -> None:
    task = pills()
    ids = id_factory()
    state = initial_runtime(task, at("2026-11-09T06:00:00+02:00"), KYIV, ids)
    stale = replace(state, pack=Pack(1400, (5,), (6,)))
    assert slots(task, stale, "2026-11-09T06:00:00+02:00") == row("cffffff")
    state = skip(task, stale, at("2026-11-09T08:10:00+02:00"), KYIV, new_id=ids).runtime
    assert state.pack == Pack(1401, (), (0,))


def test_rollover_records_every_missed_occurrence() -> None:
    task = pills()
    ids = id_factory()
    state = initial_runtime(task, at("2026-11-02T06:00:00+02:00"), KYIV, ids)
    state = rollover(task, state, at("2026-11-04T08:05:00+02:00"), KYIV, ids).runtime
    assert state.pack == Pack(1400, (), (0, 1))
    assert slots(task, state, "2026-11-04T08:06:00+02:00") == row("mmcffff")


def test_rollover_across_the_week_keeps_only_the_new_pack() -> None:
    task = pills()
    ids = id_factory()
    state = initial_runtime(task, at("2026-11-08T06:00:00+02:00"), KYIV, ids)
    state = rollover(task, state, at("2026-11-10T08:05:00+02:00"), KYIV, ids).runtime
    assert state.pack == Pack(1401, (), (0,))
    assert slots(task, state, "2026-11-10T08:06:00+02:00") == row("mcfffff")


def test_unrecorded_days_stay_full() -> None:
    task = pills()
    state = start(task, "2026-11-05T06:00:00+02:00")
    assert slots(task, state, "2026-11-05T06:00:00+02:00") == row("fffcfff")


def test_carried_occurrence_keeps_its_slot_until_done() -> None:
    task = make_task(scene="pills", schedule=DAILY, on_missed="carry")
    ids = id_factory()
    state = initial_runtime(task, at("2026-11-08T06:00:00+02:00"), KYIV, ids)
    assert rollover(task, state, at("2026-11-11T09:00:00+02:00"), KYIV, ids).runtime == state
    assert slots(task, state, "2026-11-11T09:00:00+02:00") == row("ffffffc")
    state = advance(task, state, at("2026-11-11T09:00:00+02:00"), KYIV, new_id=ids).runtime
    assert state.pack == Pack(1400, (6,), ())
    assert slots(task, state, "2026-11-11T09:30:00+02:00") == row("fffffft")
    assert state.due_at == at("2026-11-12T08:00:00+02:00")
    assert slots(task, state, "2026-11-11T22:00:00+02:00") == row("fffcfff")


def test_undo_restores_the_previous_pack() -> None:
    task = pills()
    ids = id_factory()
    state = initial_runtime(task, at("2026-11-02T06:00:00+02:00"), KYIV, ids)
    state = advance(task, state, at("2026-11-02T08:10:00+02:00"), KYIV, new_id=ids).runtime
    before = state.pack
    done = advance(task, state, at("2026-11-03T08:10:00+02:00"), KYIV, new_id=ids).runtime
    assert done.pack != before
    restored = undo(task, done, at("2026-11-03T08:20:00+02:00"), new_id=ids).runtime
    assert restored.pack == before
    assert slots(task, restored, "2026-11-03T08:20:00+02:00") == row("tcfffff")


def test_undo_of_a_week_boundary_brings_the_old_pack_back() -> None:
    task = pills()
    ids = id_factory()
    state = initial_runtime(task, at("2026-11-09T06:00:00+02:00"), KYIV, ids)
    seeded = replace(state, pack=Pack(1400, (1, 2), (3,)))
    skipped = skip(task, seeded, at("2026-11-09T08:10:00+02:00"), KYIV, new_id=ids).runtime
    assert skipped.pack == Pack(1401, (), (0,))
    assert undo(task, skipped, at("2026-11-09T08:11:00+02:00"), new_id=ids).runtime.pack == Pack(
        1400, (1, 2), (3,)
    )


def test_taking_a_missed_slot_clears_the_miss() -> None:
    task = pills({"type": "interval", "every_days": 7, "time": "08:00", "anchor": "schedule"})
    ids = id_factory()
    state = initial_runtime(task, at("2026-11-02T06:00:00+02:00"), KYIV, ids)
    cycle, slot = dose_slot(task.schedule, state.due_at, KYIV)
    seeded = replace(state, pack=Pack(cycle, (), (slot,)))
    done = advance(task, seeded, at("2026-11-03T08:10:00+02:00"), KYIV, new_id=ids).runtime
    assert done.pack == Pack(cycle, (slot,), ())


def test_multi_stage_occurrence_stays_current_until_finished() -> None:
    task = chain_task(scene="pills", schedule=DAILY, on_missed="skip")
    ids = id_factory()
    state = initial_runtime(task, at("2026-11-04T06:00:00+02:00"), KYIV, ids)
    state = advance(task, state, at("2026-11-04T08:10:00+02:00"), KYIV, new_id=ids).runtime
    assert state.pack is None
    assert slots(task, state, "2026-11-04T08:11:00+02:00") == row("ffcffff")


@pytest.mark.parametrize(
    ("act", "expected"),
    [(advance, "tffffff"), (skip, "mffffff")],
)
def test_finished_one_off(act: Any, expected: str) -> None:
    task = pills({"type": "once", "due": "2026-11-06T08:00:00+02:00"})
    ids = id_factory()
    state = initial_runtime(task, at("2026-11-02T06:00:00+02:00"), KYIV, ids)
    assert slots(task, state, "2026-11-02T06:00:00+02:00") == row("cffffff")
    state = act(task, state, at("2026-11-06T08:10:00+02:00"), KYIV, new_id=ids).runtime
    assert state.due_at is None
    assert state.pack == (Pack(0, (0,), ()) if act is advance else Pack(0, (), (0,)))
    assert slots(task, state, "2026-11-20T08:00:00+02:00") == row(expected)


def test_disabled_task_still_shows_its_pack() -> None:
    task = pills(enabled=False)
    state = start(task, "2026-11-05T06:00:00+02:00")
    assert slots(task, state, "2026-11-05T06:00:00+02:00") == row("fffcfff")


@pytest.mark.parametrize("scene", ["generic", "laundry", "plant"])
def test_other_scenes_have_no_slots(scene: str) -> None:
    task = make_task(scene=scene)
    state = start(task, "2026-11-05T06:00:00+02:00")
    assert "slots" not in task_view(task, state, at("2026-11-05T06:00:00+02:00"), KYIV)["scene"]


def test_slots_are_computed_without_an_explicit_zone() -> None:
    task = pills()
    state = start(task, "2026-11-05T06:00:00+02:00")
    moment: datetime = at("2026-11-05T06:00:00+02:00").astimezone(KYIV)
    assert task_view(task, state, moment)["scene"]["slots"] == row("fffcfff")


def old_runtime(**overrides: Any) -> dict[str, Any]:
    return {
        "task_id": "t",
        "occurrence_id": "occ",
        "due_at": "2026-11-05T06:00:00+00:00",
        "stage_index": 0,
        "stage_entered_at": None,
        "started_at": None,
        "last_completed_at": None,
        "next_due_at": None,
        "clean_until": None,
        "undo": None,
    } | overrides


def test_old_runtimes_load_without_a_pack() -> None:
    loaded = Runtime.from_dict(old_runtime(undo=old_runtime()))
    assert loaded.pack is None
    assert loaded.undo is not None
    assert loaded.undo.pack is None
    task = pills()
    assert slots(task, loaded, "2026-11-05T01:00:00+02:00") == row("fffcfff")


def test_completion_on_an_old_runtime_starts_a_pack() -> None:
    task = pills()
    loaded = Runtime.from_dict(old_runtime())
    done = advance(task, loaded, at("2026-11-05T08:30:00+02:00"), KYIV, new_id=id_factory())
    assert done.runtime.pack == Pack(1400, (3,), ())


def test_pack_round_trips_with_undo() -> None:
    inner = Runtime(task_id="t", occurrence_id="a", pack=Pack(3, (1,), ()))
    outer = Runtime(task_id="t", occurrence_id="b", pack=Pack(4, (0,), (2,)), undo=inner)
    data = outer.to_dict()
    assert data["pack"] == {"cycle": 4, "taken": [0], "missed": [2]}
    assert Runtime.from_dict(data) == outer


def test_pack_may_have_a_negative_cycle() -> None:
    assert Pack.from_dict({"cycle": -1, "taken": [6], "missed": []}) == Pack(-1, (6,), ())


@pytest.mark.parametrize(
    "pack",
    [
        {"cycle": "1", "taken": [], "missed": []},
        {"cycle": 1, "taken": [7], "missed": []},
        {"cycle": 1, "taken": [], "missed": [-1]},
        {"cycle": 1, "taken": [True], "missed": []},
        {"cycle": 1, "taken": "0", "missed": []},
        {"cycle": 1, "taken": [], "missed": [], "extra": 1},
    ],
)
def test_bad_pack_is_rejected(pack: dict[str, Any]) -> None:
    with pytest.raises(ValidationError):
        Runtime.from_dict(old_runtime(pack=pack))


def test_changing_the_slot_rhythm_clears_the_pack() -> None:
    old = pills()
    new = pills(MONDAYS)
    state = Runtime(task_id="t", occurrence_id="occ", pack=Pack(1400, (0,), ()))
    updated = reconcile(old, new, state, at("2026-11-05T06:00:00+02:00"), KYIV, id_factory())
    assert updated.pack is None


def test_changing_only_the_time_keeps_the_pack() -> None:
    old = pills()
    new = pills({"type": "daily", "time": "09:00"})
    state = Runtime(task_id="t", occurrence_id="occ", pack=Pack(1400, (0,), ()))
    updated = reconcile(old, new, state, at("2026-11-05T06:00:00+02:00"), KYIV, id_factory())
    assert updated.pack == Pack(1400, (0,), ())


@pytest.mark.parametrize(
    "act",
    [
        lambda task, state, now: advance(task, advance(task, state, now, KYIV).runtime, now, KYIV),
        lambda task, state, now: skip(task, state, now, KYIV),
    ],
)
def test_occurrence_on_a_removed_weekday_does_not_take_a_cell(act: Any) -> None:
    old = chain_task(scene="pills", schedule={"type": "weekly", "weekdays": [2], "time": "08:00"})
    new = chain_task(
        scene="pills", schedule={"type": "weekly", "weekdays": [0, 3], "time": "08:00"}
    )
    state = initial_runtime(old, at("2026-11-03T09:00:00+02:00"), KYIV, id_factory())
    state = advance(old, state, at("2026-11-04T09:00:00+02:00"), KYIV).runtime
    state = reconcile(old, new, state, at("2026-11-04T09:01:00+02:00"), KYIV, id_factory())
    assert state.due_at == at("2026-11-04T08:00:00+02:00")
    assert slots(new, state, "2026-11-04T09:02:00+02:00") == row("fcfffff")

    state = act(new, state, at("2026-11-04T09:03:00+02:00")).runtime
    assert state.pack is None
    assert state.due_at == at("2026-11-05T08:00:00+02:00")
    assert slots(new, state, "2026-11-05T09:00:00+02:00") == row("fcfffff")

    moment = at("2026-11-05T09:00:00+02:00")
    for _ in new.stages:
        state = advance(new, state, moment, KYIV).runtime
    assert state.pack == Pack(400, (1,), ())
