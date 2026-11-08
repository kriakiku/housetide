from datetime import datetime, timedelta
from typing import Any, Literal
from zoneinfo import ZoneInfo

from .machine import can_advance, can_skip, current_stage, is_finished, is_started
from .models import Runtime, Stage, Task, as_utc, format_instant
from .schedule import start_of_next_day

Status = Literal["upcoming", "due", "overdue", "in_progress", "clean", "done", "disabled"]
SceneState = Literal["resting", "accumulating", "due", "running", "waiting", "clean"]


def _clamp(value: float) -> float:
    return round(min(1.0, max(0.0, value)), 4)


def task_status(task: Task, runtime: Runtime, now: datetime) -> Status:
    now = as_utc(now)
    if not task.enabled:
        return "disabled"
    if is_finished(task, runtime):
        return "done"
    if is_started(runtime):
        return "in_progress"
    due = runtime.due_at
    if due is not None and now >= due:
        past_grace = now > due + timedelta(hours=task.grace_hours)
        past_next = runtime.next_due_at is not None and now >= runtime.next_due_at
        return "overdue" if past_grace or past_next else "due"
    if runtime.clean_until is not None and now < runtime.clean_until:
        return "clean"
    return "upcoming"


def is_today(status: Status, runtime: Runtime, now: datetime, zone: ZoneInfo) -> bool:
    if status in ("in_progress", "overdue", "due"):
        return True
    if status in ("disabled", "done") or runtime.due_at is None:
        return False
    return runtime.due_at < start_of_next_day(as_utc(now), zone)


def scene_fill(runtime: Runtime, now: datetime) -> float:
    due = runtime.due_at
    if due is None:
        return 0.0
    start = runtime.last_completed_at or runtime.stage_entered_at
    if start is None or due <= start:
        return 1.0 if now >= due else 0.0
    return _clamp((now - start) / (due - start))


def scene_stink(task: Task, runtime: Runtime, stage: Stage, status: Status, now: datetime) -> float:
    if status not in ("due", "overdue", "in_progress"):
        return 0.0
    if stage.stale_after_minutes is not None:
        return _stale_stink(runtime, stage.stale_after_minutes, now)
    due = runtime.due_at
    if due is None or now <= due:
        return 0.0
    if task.grace_hours == 0:
        return 1.0
    return _clamp((now - due) / timedelta(hours=task.grace_hours))


def _stale_stink(runtime: Runtime, minutes: int, now: datetime) -> float:
    entered = runtime.stage_entered_at
    if not is_started(runtime) and runtime.due_at is not None:
        entered = runtime.due_at if entered is None else max(entered, runtime.due_at)
    if entered is None:
        return 0.0
    threshold = timedelta(minutes=minutes)
    return _clamp((now - entered - threshold) / threshold)


def scene_state(status: Status, stage: Stage, fill: float, completed: bool) -> SceneState:
    match status:
        case "clean":
            return "clean"
        case "done":
            return "clean" if completed else "resting"
        case "due" | "overdue":
            return "due"
        case "in_progress":
            return "due" if stage.role == "todo" else stage.role
        case "upcoming":
            return "accumulating" if fill > 0 else "resting"
    return "resting"


def task_view(
    task: Task, runtime: Runtime, now: datetime, zone: ZoneInfo | None = None
) -> dict[str, Any]:
    tz: Any = zone if zone is not None else now.tzinfo
    now = as_utc(now)
    stage = current_stage(task, runtime)
    status = task_status(task, runtime, now)
    due = runtime.due_at
    overdue_seconds = 0
    if due is not None and status != "disabled" and now > due:
        overdue_seconds = int((now - due).total_seconds())
    fill = 0.0 if status == "disabled" else scene_fill(runtime, now)
    state = scene_state(status, stage, fill, runtime.last_completed_at is not None)
    progress = 1.0 if state == "clean" else _clamp(runtime.stage_index / len(task.stages))
    return {
        "task_id": task.id,
        "title": task.title,
        "icon": task.icon,
        "color": task.color,
        "status": status,
        "stage_index": runtime.stage_index,
        "stage_count": len(task.stages),
        "stage_id": stage.id,
        "stage_title": stage.title,
        "action": stage.action,
        "role": stage.role,
        "due_at": format_instant(due),
        "next_due_at": format_instant(runtime.next_due_at),
        "started_at": format_instant(runtime.started_at),
        "last_completed_at": format_instant(runtime.last_completed_at),
        "is_today": is_today(status, runtime, now, tz),
        "overdue_seconds": overdue_seconds,
        "can_advance": can_advance(task, runtime),
        "can_skip": can_skip(task, runtime),
        "can_undo": runtime.undo is not None,
        "automated": stage.complete_when is not None and bool(stage.complete_when.entity_id),
        "scene": {
            "name": task.scene,
            "state": state,
            "fill": fill,
            "stink": scene_stink(task, runtime, stage, status, now),
            "progress": progress,
        },
    }
