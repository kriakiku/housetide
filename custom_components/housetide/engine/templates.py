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
        "teeth": _task(
            "Brush your teeth",
            "mdi:toothbrush",
            "teeth",
            {"type": "daily", "time": "21:00"},
            "skip",
            [_stage("brush", "Brush", "todo", "Brushed")],
        ),
        "bed": _task(
            "Change the sheets",
            "mdi:bed-outline",
            "bed",
            {"type": "interval", "every_days": 14, "time": "10:00", "anchor": "completion"},
            "carry",
            [_stage("change_sheets", "Change the sheets", "todo", "Changed")],
        ),
        "dishes": _task(
            "Do the dishes",
            "mdi:silverware-clean",
            "dishes",
            {"type": "daily", "time": "20:00"},
            "carry",
            [_stage("wash_up", "Wash up", "todo", "Washed")],
        ),
        "trash": _task(
            "Take out the trash",
            "mdi:trash-can-outline",
            "trash",
            {"type": "interval", "every_days": 3, "time": "19:00", "anchor": "completion"},
            "carry",
            [_stage("take_out", "Take it out", "todo", "Taken out")],
        ),
        "vacuum": _task(
            "Vacuum",
            "mdi:vacuum-outline",
            "vacuum",
            {"type": "interval", "every_days": 7, "time": "11:00", "anchor": "completion"},
            "carry",
            [_stage("vacuum_floor", "Vacuum the floor", "todo", "Vacuumed")],
        ),
        "pet": _task(
            "Feed the cat",
            "mdi:cat",
            "pet",
            {"type": "daily", "time": "08:00"},
            "skip",
            [_stage("feed", "Feed", "todo", "Fed")],
        ),
        "bathroom": _task(
            "Clean the bathroom",
            "mdi:shower",
            "bathroom",
            {"type": "interval", "every_days": 7, "time": "11:00", "anchor": "completion"},
            "carry",
            [_stage("scrub", "Scrub it", "todo", "Cleaned")],
        ),
        "fridge": _task(
            "Tidy the fridge",
            "mdi:fridge-outline",
            "fridge",
            {"type": "interval", "every_days": 30, "time": "11:00", "anchor": "completion"},
            "carry",
            [_stage("tidy", "Clear it out", "todo", "Tidied")],
        ),
        "window": _task(
            "Wash the windows",
            "mdi:window-closed-variant",
            "window",
            {"type": "interval", "every_days": 90, "time": "11:00", "anchor": "completion"},
            "carry",
            [_stage("wipe_glass", "Wash the glass", "todo", "Washed")],
        ),
        "water": _task(
            "Drink some water",
            "mdi:cup-water",
            "water",
            {"type": "daily", "time": "11:00"},
            "skip",
            [_stage("drink", "Drink", "todo", "Drank")],
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
