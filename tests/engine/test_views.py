from datetime import timedelta
from typing import Any

import pytest
from engine_factories import KYIV, at, chain_task, id_factory, make_task, runtime, stage_dict

from custom_components.housetide.engine.machine import advance, initial_runtime
from custom_components.housetide.engine.views import task_status, task_view

D = at("2026-06-10T08:00:00+03:00")
COMPLETED = at("2026-06-03T08:00:00+03:00")
ONCE = {"type": "once", "due": "2026-06-10T08:00:00+03:00"}
VIEW_KEYS = {
    "task_id",
    "title",
    "icon",
    "color",
    "status",
    "stage_index",
    "stage_count",
    "stage_id",
    "stage_title",
    "action",
    "role",
    "due_at",
    "next_due_at",
    "started_at",
    "last_completed_at",
    "is_today",
    "overdue_seconds",
    "can_advance",
    "can_skip",
    "can_undo",
    "automated",
    "anytime",
    "scene",
}


def base(**overrides: Any) -> Any:
    return runtime(**{"due_at": D, "stage_entered_at": COMPLETED} | overrides)


@pytest.mark.parametrize(
    ("task_overrides", "runtime_overrides", "now", "status", "state"),
    [
        pytest.param(
            {}, {}, "2026-06-10T07:59:59+03:00", "upcoming", "accumulating", id="upcoming"
        ),
        pytest.param(
            {},
            {"stage_entered_at": at("2026-06-10T07:00:00+03:00")},
            "2026-06-10T07:00:00+03:00",
            "upcoming",
            "resting",
            id="upcoming-empty",
        ),
        pytest.param({}, {}, "2026-06-10T08:00:00+03:00", "due", "due", id="due-at-moment"),
        pytest.param({}, {}, "2026-06-11T08:00:00+03:00", "due", "due", id="due-at-grace-edge"),
        pytest.param({}, {}, "2026-06-11T08:00:01+03:00", "overdue", "due", id="overdue"),
        pytest.param(
            {"grace_hours": 0}, {}, "2026-06-10T08:00:01+03:00", "overdue", "due", id="no-grace"
        ),
        pytest.param(
            {},
            {"clean_until": at("2026-06-10T07:30:00+03:00")},
            "2026-06-10T07:00:00+03:00",
            "clean",
            "clean",
            id="clean",
        ),
        pytest.param(
            {},
            {"clean_until": at("2026-06-10T07:30:00+03:00")},
            "2026-06-10T07:30:00+03:00",
            "upcoming",
            "accumulating",
            id="clean-expired",
        ),
        pytest.param(
            {},
            {"clean_until": at("2026-06-10T09:00:00+03:00")},
            "2026-06-10T08:30:00+03:00",
            "due",
            "due",
            id="due-beats-clean",
        ),
        pytest.param(
            {"enabled": False},
            {},
            "2026-06-12T00:00:00+03:00",
            "disabled",
            "resting",
            id="disabled",
        ),
        pytest.param(
            {"schedule": ONCE},
            {"due_at": None, "last_completed_at": COMPLETED},
            "2026-06-12T00:00:00+03:00",
            "done",
            "clean",
            id="done-completed",
        ),
        pytest.param(
            {"schedule": ONCE},
            {"due_at": None},
            "2026-06-12T00:00:00+03:00",
            "done",
            "resting",
            id="done-skipped",
        ),
        pytest.param(
            {"enabled": False, "schedule": ONCE},
            {"due_at": None},
            "2026-06-12T00:00:00+03:00",
            "disabled",
            "resting",
            id="disabled-beats-done",
        ),
    ],
)
def test_status_and_state(
    task_overrides: dict[str, Any],
    runtime_overrides: dict[str, Any],
    now: str,
    status: str,
    state: str,
) -> None:
    view = task_view(make_task(**task_overrides), base(**runtime_overrides), at(now), KYIV)
    assert view["status"] == status
    assert view["scene"]["state"] == state


@pytest.mark.parametrize(
    ("index", "started", "now", "status", "state", "role"),
    [
        pytest.param(0, None, "2026-06-10T08:30:00+03:00", "due", "due", "todo", id="first-due"),
        pytest.param(
            1, D, "2026-06-10T08:30:00+03:00", "in_progress", "running", "running", id="running"
        ),
        pytest.param(
            2, D, "2026-06-10T08:30:00+03:00", "in_progress", "waiting", "waiting", id="waiting"
        ),
        pytest.param(
            1, D, "2026-06-09T08:30:00+03:00", "in_progress", "running", "running", id="early"
        ),
        pytest.param(
            0, D, "2026-06-10T07:00:00+03:00", "in_progress", "due", "todo", id="started-first"
        ),
    ],
)
def test_in_progress_states(
    index: int, started: Any, now: str, status: str, state: str, role: str
) -> None:
    view = task_view(chain_task(), base(stage_index=index, started_at=started), at(now), KYIV)
    assert (view["status"], view["scene"]["state"], view["role"]) == (status, state, role)


def test_in_progress_todo_stage_shows_due() -> None:
    task = make_task(stages=[stage_dict("a"), stage_dict("b")])
    view = task_view(task, base(stage_index=1, started_at=D), D, KYIV)
    assert view["scene"]["state"] == "due"


def test_view_shape_and_fields() -> None:
    task = make_task(
        icon="mdi:pill",
        color="#fff",
        stages=[
            stage_dict(
                "a",
                action="Go",
                complete_when={"entity_id": "sensor.p", "above": 1, "for_seconds": 0},
            ),
            stage_dict("b"),
        ],
    )
    current = base(undo=base(), next_due_at=at("2026-06-11T08:00:00+03:00"))
    view = task_view(task, current, at("2026-06-10T09:00:00+03:00"), KYIV)
    assert set(view) == VIEW_KEYS
    assert set(view["scene"]) == {"name", "state", "fill", "stink", "progress"}
    assert view["icon"] == "mdi:pill"
    assert view["color"] == "#fff"
    assert view["stage_count"] == 2
    assert view["stage_id"] == "a"
    assert view["stage_title"] == "A"
    assert view["action"] == "Go"
    assert view["automated"] is True
    assert view["can_undo"] is True
    assert view["can_advance"] is True
    assert view["can_skip"] is True
    assert view["overdue_seconds"] == 3600
    assert at(view["due_at"]) == D


@pytest.mark.parametrize(
    ("complete_when", "expected"),
    [
        (None, False),
        ({"entity_id": "", "above": 1, "for_seconds": 0}, False),
        ({"entity_id": "sensor.p", "above": 1, "for_seconds": 0}, True),
    ],
)
def test_automated(complete_when: Any, expected: bool) -> None:
    task = make_task(stages=[stage_dict(complete_when=complete_when)])
    assert task_view(task, base(), D, KYIV)["automated"] is expected


@pytest.mark.parametrize(
    ("task_overrides", "runtime_overrides", "advance_ok", "skip_ok", "undo_ok"),
    [
        ({}, {}, True, True, False),
        ({"enabled": False}, {}, False, False, False),
        ({"schedule": ONCE}, {"due_at": None}, False, False, False),
        ({"schedule": ONCE}, {"due_at": None, "undo": runtime()}, False, False, True),
    ],
)
def test_capability_flags(
    task_overrides: dict[str, Any],
    runtime_overrides: dict[str, Any],
    advance_ok: bool,
    skip_ok: bool,
    undo_ok: bool,
) -> None:
    view = task_view(make_task(**task_overrides), base(**runtime_overrides), D, KYIV)
    assert (view["can_advance"], view["can_skip"], view["can_undo"]) == (
        advance_ok,
        skip_ok,
        undo_ok,
    )


@pytest.mark.parametrize(
    ("overrides", "now", "expected"),
    [
        pytest.param(
            {"last_completed_at": COMPLETED}, "2026-06-03T08:00:00+03:00", 0.0, id="start"
        ),
        pytest.param({"last_completed_at": COMPLETED}, "2026-06-06T20:00:00+03:00", 0.5, id="half"),
        pytest.param({"last_completed_at": COMPLETED}, "2026-06-10T08:00:00+03:00", 1.0, id="due"),
        pytest.param(
            {"last_completed_at": COMPLETED}, "2026-06-20T08:00:00+03:00", 1.0, id="clamp"
        ),
        pytest.param(
            {"stage_entered_at": at("2026-06-08T08:00:00+03:00")},
            "2026-06-09T08:00:00+03:00",
            0.5,
            id="falls-back-to-creation",
        ),
        pytest.param(
            {"stage_entered_at": None}, "2026-06-09T08:00:00+03:00", 0.0, id="no-start-before"
        ),
        pytest.param(
            {"stage_entered_at": None}, "2026-06-11T08:00:00+03:00", 1.0, id="no-start-after"
        ),
        pytest.param({"due_at": None}, "2026-06-09T08:00:00+03:00", 0.0, id="no-due"),
    ],
)
def test_fill(overrides: dict[str, Any], now: str, expected: float) -> None:
    assert task_view(make_task(), base(**overrides), at(now), KYIV)["scene"]["fill"] == expected


@pytest.mark.parametrize(
    ("grace", "now", "expected"),
    [
        pytest.param(24, "2026-06-09T08:00:00+03:00", 0.0, id="before-due"),
        pytest.param(24, "2026-06-10T08:00:00+03:00", 0.0, id="at-due"),
        pytest.param(24, "2026-06-10T20:00:00+03:00", 0.5, id="half-grace"),
        pytest.param(24, "2026-06-11T08:00:00+03:00", 1.0, id="grace-end"),
        pytest.param(24, "2026-06-15T08:00:00+03:00", 1.0, id="clamp"),
        pytest.param(0, "2026-06-10T08:00:00+03:00", 0.0, id="no-grace-at-due"),
        pytest.param(0, "2026-06-10T08:00:01+03:00", 1.0, id="no-grace-after"),
    ],
)
def test_stink_from_grace(grace: int, now: str, expected: float) -> None:
    task = make_task(grace_hours=grace)
    assert task_view(task, base(), at(now), KYIV)["scene"]["stink"] == expected


@pytest.mark.parametrize(
    ("minutes", "expected"),
    [
        pytest.param(0, 0.0, id="fresh"),
        pytest.param(179, 0.0, id="before-threshold"),
        pytest.param(180, 0.0, id="at-threshold"),
        pytest.param(270, 0.5, id="between"),
        pytest.param(360, 1.0, id="twice"),
        pytest.param(1000, 1.0, id="clamp"),
    ],
)
def test_stale_stage_stink(minutes: int, expected: float) -> None:
    task = make_task(
        stages=[stage_dict("a"), stage_dict("hang", role="waiting", stale_after_minutes=180)]
    )
    entered = at("2026-06-20T08:00:00+03:00")
    current = base(stage_index=1, started_at=D, stage_entered_at=entered)
    view = task_view(task, current, entered + timedelta(minutes=minutes), KYIV)
    assert view["scene"]["stink"] == expected
    assert view["scene"]["state"] == "waiting"


def test_stale_on_first_stage_counts_from_due() -> None:
    task = make_task(stages=[stage_dict("a", stale_after_minutes=60)])
    current = base(stage_entered_at=at("2026-06-01T08:00:00+03:00"))
    assert task_view(task, current, at("2026-06-10T07:00:00+03:00"), KYIV)["scene"]["stink"] == 0.0
    assert task_view(task, current, at("2026-06-10T09:00:00+03:00"), KYIV)["scene"]["stink"] == 0.0
    assert task_view(task, current, at("2026-06-10T09:30:00+03:00"), KYIV)["scene"]["stink"] == 0.5


def test_stink_is_zero_when_clean_or_finished() -> None:
    clean = base(
        clean_until=at("2026-06-10T07:30:00+03:00"), due_at=at("2026-06-10T08:00:00+03:00")
    )
    view = task_view(make_task(), clean, at("2026-06-10T07:00:00+03:00"), KYIV)
    assert view["scene"]["stink"] == 0.0
    disabled = task_view(make_task(enabled=False), base(), at("2026-06-15T07:00:00+03:00"), KYIV)
    assert (disabled["scene"]["stink"], disabled["scene"]["fill"]) == (0.0, 0.0)
    assert disabled["overdue_seconds"] == 0


@pytest.mark.parametrize(
    ("task_overrides", "overrides", "now", "expected"),
    [
        pytest.param({}, {}, "2026-06-10T07:00:00+03:00", 0.0, id="stage-0"),
        pytest.param(
            {},
            {"stage_index": 1, "started_at": D},
            "2026-06-10T07:00:00+03:00",
            1 / 3,
            id="stage-1",
        ),
        pytest.param(
            {},
            {"stage_index": 2, "started_at": D},
            "2026-06-10T07:00:00+03:00",
            2 / 3,
            id="stage-2",
        ),
        pytest.param(
            {},
            {"clean_until": at("2026-06-10T07:30:00+03:00")},
            "2026-06-10T07:00:00+03:00",
            1.0,
            id="clean",
        ),
        pytest.param(
            {"schedule": ONCE},
            {"due_at": None, "last_completed_at": COMPLETED},
            "2026-06-10T07:00:00+03:00",
            1.0,
            id="done",
        ),
    ],
)
def test_progress(
    task_overrides: dict[str, Any], overrides: dict[str, Any], now: str, expected: float
) -> None:
    view = task_view(chain_task(**task_overrides), base(**overrides), at(now), KYIV)
    assert view["scene"]["progress"] == pytest.approx(expected, abs=1e-3)


@pytest.mark.parametrize(
    ("due", "now", "expected"),
    [
        pytest.param(
            "2026-06-10T23:59:59+03:00", "2026-06-10T00:00:00+03:00", True, id="last-second"
        ),
        pytest.param(
            "2026-06-11T00:00:00+03:00", "2026-06-10T23:59:59+03:00", False, id="next-midnight"
        ),
        pytest.param("2026-06-11T00:00:00+03:00", "2026-06-11T00:00:00+03:00", True, id="due-now"),
        pytest.param(
            "2026-06-11T00:30:00+03:00", "2026-06-11T00:00:01+03:00", True, id="just-after-midnight"
        ),
        pytest.param("2026-06-12T08:00:00+03:00", "2026-06-10T08:00:00+03:00", False, id="future"),
        pytest.param(
            "2026-06-10T20:59:59+00:00", "2026-06-10T07:00:00+03:00", True, id="utc-input"
        ),
        pytest.param(
            "2026-06-10T21:00:00+00:00", "2026-06-10T07:00:00+03:00", False, id="utc-midnight"
        ),
    ],
)
def test_today_near_midnight(due: str, now: str, expected: bool) -> None:
    view = task_view(make_task(), base(due_at=at(due), last_completed_at=COMPLETED), at(now), KYIV)
    assert view["is_today"] is expected


def test_today_uses_given_zone_for_utc_now() -> None:
    due = at("2026-06-10T22:00:00+00:00")
    now = at("2026-06-10T21:30:00+00:00")
    current = base(due_at=due, last_completed_at=COMPLETED)
    assert task_view(make_task(), current, now, KYIV)["is_today"] is True
    assert task_view(make_task(), current, now)["is_today"] is True
    assert task_view(make_task(), current, now.astimezone(KYIV))["is_today"] is True


@pytest.mark.parametrize(
    ("task_overrides", "overrides", "now", "expected"),
    [
        pytest.param(
            {},
            {"stage_index": 1, "started_at": D},
            "2026-06-01T00:00:00+03:00",
            True,
            id="in-progress-future-due",
        ),
        pytest.param({}, {}, "2026-06-20T00:00:00+03:00", True, id="overdue"),
        pytest.param({"enabled": False}, {}, "2026-06-10T07:00:00+03:00", False, id="disabled"),
        pytest.param(
            {"schedule": ONCE}, {"due_at": None}, "2026-06-10T07:00:00+03:00", False, id="done"
        ),
        pytest.param(
            {},
            {
                "due_at": at("2026-06-15T08:00:00+03:00"),
                "clean_until": at("2026-06-10T20:00:00+03:00"),
            },
            "2026-06-10T07:00:00+03:00",
            False,
            id="clean-future",
        ),
    ],
)
def test_today_by_status(
    task_overrides: dict[str, Any], overrides: dict[str, Any], now: str, expected: bool
) -> None:
    view = task_view(chain_task(**task_overrides), base(**overrides), at(now), KYIV)
    assert view["is_today"] is expected


def test_full_laundry_journey() -> None:
    task = make_task(
        scene="laundry",
        schedule={"type": "interval", "every_days": 7, "time": "10:00", "anchor": "completion"},
        stages=[
            stage_dict("load"),
            stage_dict("wash", role="running"),
            stage_dict("hang", role="waiting", stale_after_minutes=180),
        ],
    )
    ids = id_factory()
    current = initial_runtime(task, at("2026-06-01T12:00:00+03:00"), KYIV, ids)
    assert task_status(task, current, at("2026-06-04T12:00:00+03:00")) == "upcoming"
    current = advance(task, current, at("2026-06-08T12:00:00+03:00"), KYIV, new_id=ids).runtime
    view = task_view(task, current, at("2026-06-08T12:30:00+03:00"), KYIV)
    assert view["scene"]["state"] == "running"
    current = advance(task, current, at("2026-06-08T14:00:00+03:00"), KYIV, new_id=ids).runtime
    view = task_view(task, current, at("2026-06-08T17:30:00+03:00"), KYIV)
    assert view["scene"]["state"] == "waiting"
    assert view["scene"]["stink"] == pytest.approx(1 / 6, abs=1e-3)
    current = advance(task, current, at("2026-06-08T18:00:00+03:00"), KYIV, new_id=ids).runtime
    view = task_view(task, current, at("2026-06-08T18:01:00+03:00"), KYIV)
    assert (view["status"], view["scene"]["state"]) == ("clean", "clean")
    assert at(view["due_at"]) == at("2026-06-15T10:00:00+03:00")
    assert task_status(task, current, at("2026-06-10T00:00:00+03:00")) == "upcoming"


def test_a_carried_task_is_overdue_once_the_next_occurrence_arrives() -> None:
    task = make_task(grace_hours=720, on_missed="carry")
    next_due = D + timedelta(days=7)
    state = base(next_due_at=next_due)
    assert task_status(task, state, next_due - timedelta(seconds=1)) == "due"
    assert task_status(task, state, next_due) == "overdue"


def test_scene_has_no_look_unless_set() -> None:
    assert "look" not in task_view(make_task(), runtime(), D, KYIV)["scene"]
    assert "look" not in task_view(make_task(look={}), runtime(), D, KYIV)["scene"]


def test_scene_carries_the_look() -> None:
    look = {"accent": "#123456", "variant": None}
    assert task_view(make_task(look=look), runtime(), D, KYIV)["scene"]["look"] == look
