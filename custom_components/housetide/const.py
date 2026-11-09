from datetime import timedelta
from typing import Final

from homeassistant.const import Platform

DOMAIN: Final = "housetide"
PLATFORMS: Final = [Platform.SENSOR, Platform.BINARY_SENSOR, Platform.TODO]

STORAGE_KEY_TASKS: Final = "housetide.tasks"
STORAGE_KEY_HISTORY: Final = "housetide.history"
STORAGE_VERSION: Final = 1
STORAGE_MINOR_VERSION: Final = 1
TASKS_SAVE_DELAY: Final = 5
HISTORY_SAVE_DELAY: Final = 15
HISTORY_CAP: Final = 20000

TICK_INTERVAL: Final = timedelta(seconds=30)
PRUNE_INTERVAL: Final = timedelta(hours=6)

PANEL_URL_PATH: Final = "housetide"
PANEL_ELEMENT: Final = "housetide-panel"
PANEL_TITLE: Final = "Housetide"
PANEL_ICON: Final = "mdi:waves"
STATIC_URL: Final = "/housetide_static"
BUNDLE_URL: Final = f"{STATIC_URL}/housetide.js"

EVENT_TASK_DUE: Final = "housetide_task_due"
EVENT_TASK_ADVANCED: Final = "housetide_task_advanced"
EVENT_TASK_COMPLETED: Final = "housetide_task_completed"
EVENT_TASK_SKIPPED: Final = "housetide_task_skipped"
EVENT_TASK_MISSED: Final = "housetide_task_missed"
EVENT_POMODORO_PHASE: Final = "housetide_pomodoro_phase"

BUS_EVENTS: Final = {
    "advanced": EVENT_TASK_ADVANCED,
    "completed": EVENT_TASK_COMPLETED,
    "skipped": EVENT_TASK_SKIPPED,
    "missed": EVENT_TASK_MISSED,
}

SIGNAL_UPDATED: Final = "housetide_updated"

STATUSES: Final = ["upcoming", "due", "overdue", "in_progress", "clean", "done", "disabled"]
POMODORO_PHASES: Final = ["idle", "focus", "short_break", "long_break"]
