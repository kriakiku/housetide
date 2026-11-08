import ast
from pathlib import Path
from typing import Any

import pytest
from engine_factories import at, runtime, stage_dict, task_dict

from custom_components.housetide.engine.models import (
    DailySchedule,
    HistoryEvent,
    IntervalSchedule,
    OnceSchedule,
    Runtime,
    Settings,
    Task,
    Trigger,
    ValidationError,
    WeeklySchedule,
    as_utc,
    schedule_from_dict,
)


@pytest.mark.parametrize(
    ("data", "expected"),
    [
        ({"type": "daily", "time": "08:00"}, DailySchedule("08:00")),
        ({"type": "daily", "time": "23:59"}, DailySchedule("23:59")),
        ({"type": "weekly", "weekdays": [6, 0], "time": "00:00"}, WeeklySchedule((0, 6), "00:00")),
        (
            {"type": "interval", "every_days": 3, "time": "10:30", "anchor": "schedule"},
            IntervalSchedule(3, "10:30", "schedule"),
        ),
        (
            {"type": "once", "due": "2026-06-10T08:00:00+03:00"},
            OnceSchedule(at("2026-06-10T08:00:00+03:00")),
        ),
        ({"type": "once", "due": "2026-06-10T05:00:00Z"}, OnceSchedule(at("2026-06-10T05:00:00Z"))),
    ],
)
def test_valid_schedules(data: dict[str, Any], expected: Any) -> None:
    schedule = schedule_from_dict(data)
    assert schedule == expected
    assert schedule_from_dict(schedule.to_dict()) == expected


@pytest.mark.parametrize(
    ("data", "message"),
    [
        ("daily", "must be an object"),
        ({"type": "monthly"}, "schedule.type: must be one of"),
        ({"type": "daily"}, "schedule.time: is required"),
        ({"type": "daily", "time": "8:00"}, "HH:MM"),
        ({"type": "daily", "time": "24:00"}, "HH:MM"),
        ({"type": "daily", "time": "12:60"}, "HH:MM"),
        ({"type": "daily", "time": "12:00:00"}, "HH:MM"),
        ({"type": "daily", "time": 800}, "HH:MM"),
        ({"type": "daily", "time": "08:00", "weekdays": [1]}, "unknown field(s): weekdays"),
        ({"type": "weekly", "weekdays": [], "time": "08:00"}, "non-empty"),
        ({"type": "weekly", "weekdays": [7], "time": "08:00"}, "0 (Monday)"),
        ({"type": "weekly", "weekdays": [-1], "time": "08:00"}, "0 (Monday)"),
        ({"type": "weekly", "weekdays": [True], "time": "08:00"}, "0 (Monday)"),
        ({"type": "weekly", "weekdays": [1, 1], "time": "08:00"}, "duplicates"),
        (
            {"type": "interval", "every_days": 0, "time": "08:00", "anchor": "schedule"},
            "at least 1",
        ),
        ({"type": "interval", "every_days": True, "time": "08:00", "anchor": "x"}, "integer"),
        ({"type": "interval", "every_days": 1.5, "time": "08:00", "anchor": "x"}, "integer"),
        ({"type": "interval", "every_days": 1, "time": "08:00", "anchor": "x"}, "anchor"),
        ({"type": "once"}, "schedule.due: is required"),
        ({"type": "once", "due": "2026-06-10T08:00:00"}, "UTC offset"),
        ({"type": "once", "due": "tomorrow"}, "not a valid ISO 8601"),
        ({"type": "once", "due": 123}, "ISO 8601 string"),
    ],
)
def test_invalid_schedules(data: Any, message: str) -> None:
    with pytest.raises(ValidationError) as caught:
        schedule_from_dict(data)
    assert message in str(caught.value)


@pytest.mark.parametrize(
    "data",
    [
        {"entity_id": "sensor.power", "above": 10, "for_seconds": 60},
        {"entity_id": "sensor.power", "above": 0, "for_seconds": 0},
        {"entity_id": "sensor.power", "below": -1.5, "for_seconds": 1},
        {"entity_id": "binary_sensor.door", "state": "on"},
        {"entity_id": "", "above": 10, "for_seconds": 60},
    ],
)
def test_valid_triggers(data: dict[str, Any]) -> None:
    trigger = Trigger.from_dict(data)
    assert Trigger.from_dict(trigger.to_dict()) == trigger


@pytest.mark.parametrize(
    ("data", "message"),
    [
        ({"entity_id": "sensor.p"}, "exactly one of"),
        ({"entity_id": "sensor.p", "above": None, "below": None, "state": None}, "exactly one of"),
        ({"entity_id": "sensor.p", "above": 1, "below": 2}, "exactly one of"),
        ({"entity_id": "sensor.p", "above": 1, "state": "on"}, "exactly one of"),
        ({"entity_id": "sensor.p", "below": 1, "state": "on"}, "exactly one of"),
        ({"above": 1}, "trigger.entity_id: is required"),
        ({"entity_id": 7, "above": 1}, "trigger.entity_id: must be a string"),
        ({"entity_id": "not an entity", "above": 1}, "valid entity id"),
        ({"entity_id": "sensor.p", "above": "ten"}, "finite number"),
        ({"entity_id": "sensor.p", "above": True}, "finite number"),
        ({"entity_id": "sensor.p", "below": float("nan")}, "finite number"),
        ({"entity_id": "sensor.p", "below": float("inf")}, "finite number"),
        ({"entity_id": "sensor.p", "state": ""}, "must not be empty"),
        ({"entity_id": "sensor.p", "state": "unavailable"}, "can never match"),
        ({"entity_id": "sensor.p", "state": "unknown"}, "can never match"),
        ({"entity_id": "sensor.p", "above": 1, "for_seconds": -1}, "at least 0"),
        ({"entity_id": "sensor.p", "above": 1, "for_seconds": 1.5}, "integer"),
        ({"entity_id": "sensor.p", "above": 1, "hold": 5}, "unknown field(s): hold"),
    ],
)
def test_invalid_triggers(data: dict[str, Any], message: str) -> None:
    with pytest.raises(ValidationError) as caught:
        Trigger.from_dict(data)
    assert message in str(caught.value)


def test_task_defaults_and_round_trip() -> None:
    task = Task.from_dict(task_dict())
    assert task.enabled is True
    assert (task.clean_for_minutes, task.grace_hours) == (720, 24)
    assert (task.icon, task.color, task.notes, task.assignee) == (None, None, None, None)
    assert Task.from_dict(task.to_dict()) == task
    assert set(task.to_dict()) == {
        "id",
        "title",
        "icon",
        "color",
        "notes",
        "assignee",
        "enabled",
        "schedule",
        "on_missed",
        "scene",
        "stages",
        "clean_for_minutes",
        "grace_hours",
    }
    assert set(task.to_dict()["stages"][0]) == {
        "id",
        "title",
        "action",
        "role",
        "complete_when",
        "stale_after_minutes",
    }


@pytest.mark.parametrize(
    ("overrides", "message"),
    [
        ({"id": ""}, "task.id: must not be empty"),
        ({"id": 5}, "task.id: must be a string"),
        ({"title": "   "}, "task.title: must not be empty"),
        ({"enabled": "yes"}, "task.enabled: must be true or false"),
        ({"on_missed": "later"}, "task.on_missed: must be one of carry, skip"),
        ({"scene": "dishes"}, "task.scene: must be one of"),
        ({"stages": []}, "task.stages: must contain at least one stage"),
        ({"stages": "nope"}, "task.stages: must contain at least one stage"),
        ({"stages": [stage_dict("a"), stage_dict("a")]}, "task.stages[1].id: duplicate stage id"),
        ({"stages": [stage_dict(role="idle")]}, "task.stages[0].role"),
        ({"stages": [stage_dict(stale_after_minutes=0)]}, "stale_after_minutes: must be at least"),
        (
            {"stages": [stage_dict(complete_when={"entity_id": "sensor.p"})]},
            "task.stages[0].complete_when: exactly one of",
        ),
        ({"clean_for_minutes": -1}, "task.clean_for_minutes: must be at least 0"),
        ({"grace_hours": "1"}, "task.grace_hours: must be an integer"),
        ({"schedule": {"type": "daily", "time": "99:00"}}, "task.schedule.time"),
        ({"extra": 1}, "task: unknown field(s): extra"),
    ],
)
def test_invalid_tasks(overrides: dict[str, Any], message: str) -> None:
    with pytest.raises(ValidationError) as caught:
        Task.from_dict(task_dict(**overrides))
    assert message in str(caught.value)


@pytest.mark.parametrize("missing", ["id", "title", "schedule", "on_missed", "scene", "stages"])
def test_task_required_fields(missing: str) -> None:
    data = task_dict()
    del data[missing]
    with pytest.raises(ValidationError, match=rf"task\.{missing}: is required"):
        Task.from_dict(data)


def test_runtime_round_trip_keeps_one_undo_level() -> None:
    nested = runtime(stage_index=1, due_at=at("2026-06-10T05:00:00+00:00"))
    outer = runtime(stage_index=2, undo=nested)
    data = outer.to_dict()
    data["undo"]["undo"] = runtime().to_dict()
    restored = Runtime.from_dict(data)
    assert restored.undo == nested
    assert restored.undo is not None
    assert restored.undo.undo is None


def test_runtime_normalizes_to_utc() -> None:
    restored = Runtime.from_dict(runtime(due_at=at("2026-06-10T08:00:00+03:00")).to_dict())
    assert restored.due_at is not None
    assert restored.due_at.utcoffset().total_seconds() == 0
    assert restored.due_at == at("2026-06-10T05:00:00+00:00")


@pytest.mark.parametrize(
    ("data", "message"),
    [
        ({"occurrence_id": "o", "stage_index": 0}, "runtime.task_id: is required"),
        ({"task_id": "t", "occurrence_id": "o", "stage_index": -1}, "at least 0"),
        ({"task_id": "t", "occurrence_id": "o", "stage_index": 0, "due_at": "x"}, "ISO 8601"),
        ({"task_id": "t", "occurrence_id": "o", "stage_index": 0, "bad": 1}, "unknown field"),
    ],
)
def test_invalid_runtime(data: dict[str, Any], message: str) -> None:
    with pytest.raises(ValidationError) as caught:
        Runtime.from_dict(data)
    assert message in str(caught.value)


def test_history_event_round_trip_and_validation() -> None:
    data = {
        "id": "e",
        "ts": "2026-06-10T08:00:00+03:00",
        "task_id": "t",
        "task_title": "Task",
        "occurrence_id": "o",
        "type": "completed",
        "stage_id": "s",
        "stage_title": "S",
        "source": "trigger",
        "user_id": None,
        "on_time": True,
    }
    assert HistoryEvent.from_dict(HistoryEvent.from_dict(data).to_dict()) == HistoryEvent.from_dict(
        data
    )
    with pytest.raises(ValidationError, match=r"event\.type"):
        HistoryEvent.from_dict(data | {"type": "nope"})
    with pytest.raises(ValidationError, match=r"event\.source"):
        HistoryEvent.from_dict(data | {"source": "nope"})
    with pytest.raises(ValidationError, match=r"event\.on_time"):
        HistoryEvent.from_dict(data | {"on_time": "yes"})


def test_settings() -> None:
    assert Settings.from_dict({}).history_retention_days == 365
    assert Settings.from_dict({"history_retention_days": 30}).to_dict() == {
        "history_retention_days": 30
    }
    with pytest.raises(ValidationError, match="at least 1"):
        Settings.from_dict({"history_retention_days": 0})


def test_as_utc_rejects_naive() -> None:
    with pytest.raises(ValueError, match="timezone-aware"):
        as_utc(at("2026-06-10T08:00:00"))


ENGINE_FILES = sorted(
    (Path(__file__).resolve().parents[2] / "custom_components/housetide/engine").glob("*.py")
)


@pytest.mark.parametrize("path", ENGINE_FILES, ids=lambda path: path.name)
def test_engine_is_pure(path: Path) -> None:
    tree = ast.parse(path.read_text())
    imported: set[str] = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            imported.update(alias.name.split(".")[0] for alias in node.names)
        elif isinstance(node, ast.ImportFrom) and node.level == 0:
            imported.add((node.module or "").split(".")[0])
        elif isinstance(node, ast.Attribute):
            assert node.attr not in {"now", "utcnow", "today"}, f"wall clock in {path.name}"
    assert "homeassistant" not in imported
    assert "time" not in imported
