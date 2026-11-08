from datetime import datetime, time, timedelta
from typing import Any
from zoneinfo import ZoneInfo

from .models import as_utc, format_instant
from .schedule import local_date, resolve_local


def _stage(
    stage_id: str,
    title: str,
    role: str,
    action: str,
    complete_when: dict[str, Any] | None = None,
    stale_after_minutes: int | None = None,
) -> dict[str, Any]:
    return {
        "id": stage_id,
        "title": title,
        "action": action,
        "role": role,
        "complete_when": complete_when,
        "stale_after_minutes": stale_after_minutes,
    }


def _power(*, above: float | None = None, below: float | None = None, hold: int) -> dict[str, Any]:
    return {"entity_id": "", "above": above, "below": below, "state": None, "for_seconds": hold}


def _task(
    title: str,
    icon: str,
    scene: str,
    schedule: dict[str, Any],
    on_missed: str,
    stages: list[dict[str, Any]],
) -> dict[str, Any]:
    return {
        "title": title,
        "icon": icon,
        "color": None,
        "notes": None,
        "assignee": None,
        "enabled": True,
        "schedule": schedule,
        "on_missed": on_missed,
        "scene": scene,
        "stages": stages,
        "clean_for_minutes": 720,
        "grace_hours": 24,
    }


def templates(now: datetime, zone: ZoneInfo) -> dict[str, dict[str, Any]]:
    tomorrow = local_date(as_utc(now), zone) + timedelta(days=1)
    due = format_instant(resolve_local(tomorrow, time(9, 0), zone).astimezone(zone))
    return {
        "laundry": _task(
            "Laundry",
            "mdi:washing-machine",
            "laundry",
            {"type": "interval", "every_days": 7, "time": "10:00", "anchor": "completion"},
            "carry",
            [
                _stage("load", "Collect/load", "todo", "Loaded", _power(above=10, hold=60)),
                _stage("wash", "Washing", "running", "Finished", _power(below=5, hold=300)),
                _stage("hang", "Hang it up", "waiting", "Hung up", stale_after_minutes=180),
            ],
        ),
        "pills": _task(
            "Pills",
            "mdi:pill",
            "pills",
            {"type": "daily", "time": "08:00"},
            "skip",
            [_stage("take", "Take pills", "todo", "Taken")],
        ),
        "plant": _task(
            "Water the plants",
            "mdi:sprout",
            "plant",
            {"type": "interval", "every_days": 7, "time": "10:00", "anchor": "completion"},
            "carry",
            [_stage("water", "Water", "todo", "Watered")],
        ),
        "one_off": _task(
            "One-off task",
            "mdi:checkbox-marked-circle-outline",
            "generic",
            {"type": "once", "due": due},
            "carry",
            [_stage("do", "Do it", "todo", "Done")],
        ),
    }
