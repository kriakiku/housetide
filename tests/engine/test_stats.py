from typing import Any

import pytest
from engine_factories import KYIV, NEW_YORK, at, event

from custom_components.housetide.engine.models import HistoryEvent
from custom_components.housetide.engine.stats import summary

NOW = at("2026-06-10T12:00:00+03:00")


def run(items: list[HistoryEvent], days: int = 7) -> dict[str, Any]:
    return summary(items, NOW, days, KYIV)


def day(number: int, kind: str = "completed", **overrides: Any) -> HistoryEvent:
    return event(kind, f"2026-06-{number:02d}T09:00:00+03:00", **overrides)


def test_empty() -> None:
    result = run([], days=3)
    assert result == {
        "current_streak": 0,
        "best_streak": 0,
        "completed": 0,
        "skipped": 0,
        "missed": 0,
        "on_time_rate": None,
        "per_day": [
            {"date": "2026-06-08", "completed": 0, "skipped": 0, "missed": 0},
            {"date": "2026-06-09", "completed": 0, "skipped": 0, "missed": 0},
            {"date": "2026-06-10", "completed": 0, "skipped": 0, "missed": 0},
        ],
    }


@pytest.mark.parametrize(
    ("sequence", "current", "best"),
    [
        pytest.param(["completed"], 1, 1, id="one"),
        pytest.param(["completed"] * 5, 5, 5, id="all"),
        pytest.param(["completed", "skipped", "completed", "completed"], 2, 2, id="after-skip"),
        pytest.param(["completed", "completed", "completed", "missed"], 0, 3, id="ends-missed"),
        pytest.param(["completed", "completed", "missed", "completed"], 1, 2, id="best-earlier"),
        pytest.param(["skipped", "missed"], 0, 0, id="none"),
    ],
)
def test_streaks(sequence: list[str], current: int, best: int) -> None:
    result = run([day(index + 1, kind) for index, kind in enumerate(sequence)])
    assert (result["current_streak"], result["best_streak"]) == (current, best)


def test_events_are_sorted_by_time() -> None:
    result = run([day(3), day(1, "missed"), day(2)])
    assert (result["current_streak"], result["best_streak"]) == (2, 2)


def test_streak_extends_beyond_the_window() -> None:
    result = run([day(number) for number in range(1, 11)], days=2)
    assert (result["current_streak"], result["best_streak"]) == (10, 10)
    assert result["completed"] == 2


def test_non_outcome_events_do_not_affect_streak() -> None:
    items = [day(1), day(2, "started"), day(2, "advanced"), day(3, "created"), day(4, "deleted")]
    assert run(items)["current_streak"] == 1


def test_undone_completion_is_removed() -> None:
    items = [
        day(8, occurrence="a"),
        event("completed", "2026-06-09T09:00:00+03:00", "b", on_time=True),
        event("undone", "2026-06-09T09:01:00+03:00", "b"),
    ]
    result = run(items)
    assert result["completed"] == 1
    assert result["current_streak"] == 1
    assert result["per_day"][-2]["completed"] == 0


def test_undone_then_completed_counts_once() -> None:
    items = [
        event("completed", "2026-06-09T09:00:00+03:00", "b"),
        event("undone", "2026-06-09T09:01:00+03:00", "b"),
        event("completed", "2026-06-09T09:02:00+03:00", "b"),
    ]
    result = run(items)
    assert result["completed"] == 1
    assert result["current_streak"] == 1


def test_undone_skip_restores_streak() -> None:
    items = [
        day(7),
        event("skipped", "2026-06-09T09:00:00+03:00", "b"),
        event("undone", "2026-06-09T09:01:00+03:00", "b"),
    ]
    result = run(items)
    assert (result["current_streak"], result["skipped"]) == (1, 0)


def test_undone_advance_does_not_touch_other_occurrences() -> None:
    items = [day(7), event("undone", "2026-06-09T09:01:00+03:00", "other")]
    assert run(items)["current_streak"] == 1


def test_counts_and_on_time_rate() -> None:
    items = [
        day(5, on_time=True),
        day(6, on_time=False),
        day(7, on_time=True),
        day(8, on_time=None),
        day(9, "skipped"),
        day(10, "missed"),
    ]
    result = run(items)
    assert (result["completed"], result["skipped"], result["missed"]) == (4, 1, 1)
    assert result["on_time_rate"] == pytest.approx(2 / 3)


def test_on_time_rate_outside_window_ignored() -> None:
    assert run([day(1, on_time=False), day(10, on_time=True)], days=2)["on_time_rate"] == 1.0


def test_per_day_buckets_in_local_time() -> None:
    items = [
        event("completed", "2026-06-09T20:59:59+00:00"),
        event("completed", "2026-06-09T21:00:00+00:00"),
        event("missed", "2026-06-10T08:00:00+03:00"),
    ]
    result = run(items, days=2)
    assert result["per_day"] == [
        {"date": "2026-06-09", "completed": 1, "skipped": 0, "missed": 0},
        {"date": "2026-06-10", "completed": 1, "skipped": 0, "missed": 1},
    ]


def test_per_day_across_dst_has_one_entry_per_date() -> None:
    now = at("2026-11-03T12:00:00-05:00")
    items = [
        event("completed", "2026-11-01T03:59:00+00:00"),
        event("completed", "2026-11-01T04:00:00+00:00"),
        event("completed", "2026-11-02T04:59:00+00:00"),
        event("completed", "2026-11-02T05:00:00+00:00"),
    ]
    result = summary(items, now, 4, NEW_YORK)
    assert [item["date"] for item in result["per_day"]] == [
        "2026-10-31",
        "2026-11-01",
        "2026-11-02",
        "2026-11-03",
    ]
    assert [item["completed"] for item in result["per_day"]] == [1, 2, 1, 0]


def test_window_boundary_and_future_events() -> None:
    items = [
        event("completed", "2026-06-03T23:59:59+03:00"),
        event("completed", "2026-06-04T00:00:00+03:00"),
        event("completed", "2026-06-10T12:00:01+03:00"),
    ]
    result = run(items)
    assert result["completed"] == 1
    assert result["per_day"][0]["completed"] == 1
    assert result["best_streak"] == 2


@pytest.mark.parametrize("days", [0, -1])
def test_invalid_days(days: int) -> None:
    with pytest.raises(ValueError, match="at least 1"):
        run([], days=days)


def test_missing_occurrence_id_is_counted_individually() -> None:
    items = [
        HistoryEvent(
            id=f"e{number}",
            ts=at(f"2026-06-0{number}T09:00:00+03:00"),
            task_id="t",
            task_title="Task",
            type="completed",
            source="manual",
        )
        for number in (1, 2)
    ]
    assert run(items)["current_streak"] == 2
