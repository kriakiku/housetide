from datetime import datetime
from itertools import count
from typing import Any
from zoneinfo import ZoneInfo

from custom_components.housetide.engine.models import HistoryEvent, Runtime, Task

KYIV = ZoneInfo("Europe/Kyiv")
NEW_YORK = ZoneInfo("America/New_York")
LORD_HOWE = ZoneInfo("Australia/Lord_Howe")


def at(value: str) -> datetime:
    return datetime.fromisoformat(value)


def id_factory():
    counter = count(1)
    return lambda: f"id-{next(counter)}"


def stage_dict(stage_id: str = "s0", **overrides: Any) -> dict[str, Any]:
    return {"id": stage_id, "title": stage_id.upper(), "role": "todo"} | overrides


def task_dict(**overrides: Any) -> dict[str, Any]:
    return {
        "id": "t",
        "title": "Task",
        "schedule": {"type": "daily", "time": "08:00"},
        "on_missed": "carry",
        "scene": "generic",
        "stages": [stage_dict()],
    } | overrides


def make_task(**overrides: Any) -> Task:
    return Task.from_dict(task_dict(**overrides))


def chain_task(**overrides: Any) -> Task:
    return make_task(
        stages=[stage_dict("a"), stage_dict("b", role="running"), stage_dict("c", role="waiting")],
        **overrides,
    )


def runtime(**overrides: Any) -> Runtime:
    values: dict[str, Any] = {"task_id": "t", "occurrence_id": "occ"} | overrides
    return Runtime(**values)


def event(kind: str, ts: str, occurrence: str | None = None, **overrides: Any) -> HistoryEvent:
    return HistoryEvent(
        id=f"{kind}-{ts}-{occurrence}",
        ts=at(ts),
        task_id="t",
        task_title="Task",
        type=kind,
        source="manual",
        occurrence_id=occurrence if occurrence is not None else ts,
        **overrides,
    )
