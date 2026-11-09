import math
import re
from collections.abc import Mapping
from dataclasses import dataclass
from datetime import UTC, date, datetime
from typing import Any, Literal, NoReturn, get_args

OnMissed = Literal["carry", "skip"]
SceneName = Literal[
    "generic",
    "pills",
    "laundry",
    "plant",
    "teeth",
    "bed",
    "dishes",
    "trash",
    "vacuum",
    "pet",
    "bathroom",
    "fridge",
    "window",
    "water",
    "cooler",
    "gym",
    "pool",
    "ev",
    "fuel",
    "study",
    "language",
    "coding",
    "slides",
    "book",
    "filter",
    "bills",
    "yoga",
    "run",
    "groceries",
    "cooking",
    "call",
    "journal",
    "lawn",
    "music",
    "backup",
    "carwash",
    "owl",
    "mop",
    "dust",
    "iron",
    "wardrobe",
    "smoke",
    "aircon",
    "mail",
    "recycle",
    "dogwalk",
    "litter",
    "aquarium",
    "garden",
    "pressure",
    "doctor",
    "sleep",
    "skincare",
    "haircut",
    "eyes",
    "tyres",
    "service",
    "inbox",
    "taxes",
    "gift",
    "suitcase",
    "tomato",
]
Role = Literal["todo", "running", "waiting"]
Anchor = Literal["completion", "schedule"]
EventType = Literal[
    "started", "advanced", "completed", "skipped", "missed", "undone", "created", "deleted"
]
EventSource = Literal["manual", "trigger", "service", "schedule", "todo"]
PomodoroPhase = Literal["idle", "focus", "short_break", "long_break"]
PomodoroNext = Literal["focus", "short_break", "long_break"]

DEFAULT_CLEAN_FOR_MINUTES = 720
DEFAULT_GRACE_HOURS = 24
DEFAULT_DEADLINE = "23:59"
DEFAULT_HISTORY_RETENTION_DAYS = 365
DEFAULT_FOCUS_MINUTES = 25
DEFAULT_SHORT_BREAK_MINUTES = 5
DEFAULT_LONG_BREAK_MINUTES = 15
DEFAULT_ROUNDS_UNTIL_LONG_BREAK = 4
MAX_POMODORO_MINUTES = 1440
MAX_POMODORO_ROUNDS = 12
MAX_DAYS = 36500
MAX_VARIANT_LENGTH = 32
PACK_SIZE = 7
INDETERMINATE_STATES = frozenset({"unknown", "unavailable"})

_TIME_RE = re.compile(r"(?:[01]\d|2[0-3]):[0-5]\d")
_ENTITY_RE = re.compile(r"[a-z0-9_]+\.[a-z0-9_]+")
_ACCENT_RE = re.compile(r"#[0-9a-fA-F]{6}")


class ValidationError(ValueError):
    pass


def _fail(path: str, message: str) -> NoReturn:
    raise ValidationError(f"{path}: {message}")


def _mapping(value: Any, path: str, allowed: frozenset[str]) -> Mapping[str, Any]:
    if not isinstance(value, Mapping):
        _fail(path, "must be an object")
    unknown = sorted(str(key) for key in value if key not in allowed)
    if unknown:
        _fail(path, f"unknown field(s): {', '.join(unknown)}")
    return value


def _required(data: Mapping[str, Any], key: str, path: str) -> Any:
    if key not in data:
        _fail(f"{path}.{key}", "is required")
    return data[key]


def _string(data: Mapping[str, Any], key: str, path: str, *, allow_empty: bool = False) -> str:
    value = _required(data, key, path)
    if not isinstance(value, str):
        _fail(f"{path}.{key}", "must be a string")
    if not allow_empty and not value.strip():
        _fail(f"{path}.{key}", "must not be empty")
    return value


def _optional_string(data: Mapping[str, Any], key: str, path: str) -> str | None:
    if data.get(key) is None:
        return None
    return _string(data, key, path, allow_empty=True)


def _integer(
    data: Mapping[str, Any],
    key: str,
    path: str,
    *,
    minimum: int,
    maximum: int | None = None,
    default: int | None = None,
) -> int:
    value = data.get(key, default)
    if value is None:
        _fail(f"{path}.{key}", "is required")
    if isinstance(value, bool) or not isinstance(value, int):
        _fail(f"{path}.{key}", "must be an integer")
    if value < minimum:
        _fail(f"{path}.{key}", f"must be at least {minimum}")
    if maximum is not None and value > maximum:
        _fail(f"{path}.{key}", f"must be at most {maximum}")
    return value


def _optional_integer(data: Mapping[str, Any], key: str, path: str, *, minimum: int) -> int | None:
    if data.get(key) is None:
        return None
    return _integer(data, key, path, minimum=minimum)


def _boolean(data: Mapping[str, Any], key: str, path: str, *, default: bool) -> bool:
    value = data.get(key, default)
    if not isinstance(value, bool):
        _fail(f"{path}.{key}", "must be true or false")
    return value


def _enum(data: Mapping[str, Any], key: str, path: str, kind: Any) -> Any:
    value = _required(data, key, path)
    options = get_args(kind)
    if value not in options:
        _fail(f"{path}.{key}", f"must be one of {', '.join(options)}")
    return value


def _optional_number(data: Mapping[str, Any], key: str, path: str) -> float | None:
    value = data.get(key)
    if value is None:
        return None
    if isinstance(value, bool) or not isinstance(value, int | float) or not math.isfinite(value):
        _fail(f"{path}.{key}", "must be a finite number")
    return float(value)


def _time(data: Mapping[str, Any], key: str, path: str) -> str:
    value = _required(data, key, path)
    if not isinstance(value, str) or not _TIME_RE.fullmatch(value):
        _fail(f"{path}.{key}", "must be a 24-hour time formatted as HH:MM")
    return value


def _schedule_time(data: Mapping[str, Any], path: str) -> tuple[str, bool]:
    anytime = _boolean(data, "anytime", path, default=False)
    if anytime and data.get("time") is None:
        return DEFAULT_DEADLINE, True
    return _time(data, "time", path), anytime


def _anytime_field(anytime: bool) -> dict[str, Any]:
    return {"anytime": True} if anytime else {}


def as_utc(value: datetime) -> datetime:
    if value.tzinfo is None or value.utcoffset() is None:
        raise ValueError("datetime must be timezone-aware")
    return value.astimezone(UTC)


def parse_instant(value: Any, path: str) -> datetime:
    if not isinstance(value, str):
        _fail(path, "must be an ISO 8601 string")
    try:
        parsed = datetime.fromisoformat(value)
    except ValueError:
        _fail(path, f"is not a valid ISO 8601 date and time: {value!r}")
    if parsed.tzinfo is None or parsed.utcoffset() is None:
        _fail(path, "must include a UTC offset")
    try:
        parsed.astimezone(UTC)
    except OverflowError:
        _fail(path, f"is out of range: {value!r}")
    return parsed


def format_instant(value: datetime | None) -> str | None:
    return None if value is None else value.isoformat()


def _optional_instant(data: Mapping[str, Any], key: str, path: str) -> datetime | None:
    value = data.get(key)
    if value is None:
        return None
    return as_utc(parse_instant(value, f"{path}.{key}"))


@dataclass(frozen=True, slots=True)
class OnceSchedule:
    due: datetime

    def to_dict(self) -> dict[str, Any]:
        return {"type": "once", "due": format_instant(self.due)}


@dataclass(frozen=True, slots=True)
class DailySchedule:
    time: str
    anytime: bool = False

    def to_dict(self) -> dict[str, Any]:
        return {"type": "daily", "time": self.time} | _anytime_field(self.anytime)


@dataclass(frozen=True, slots=True)
class WeeklySchedule:
    weekdays: tuple[int, ...]
    time: str
    anytime: bool = False

    def to_dict(self) -> dict[str, Any]:
        return {
            "type": "weekly",
            "weekdays": list(self.weekdays),
            "time": self.time,
        } | _anytime_field(self.anytime)


@dataclass(frozen=True, slots=True)
class IntervalSchedule:
    every_days: int
    time: str
    anchor: Anchor
    anytime: bool = False

    def to_dict(self) -> dict[str, Any]:
        return {
            "type": "interval",
            "every_days": self.every_days,
            "time": self.time,
            "anchor": self.anchor,
        } | _anytime_field(self.anytime)


Schedule = OnceSchedule | DailySchedule | WeeklySchedule | IntervalSchedule


def is_anytime(schedule: Schedule) -> bool:
    return not isinstance(schedule, OnceSchedule) and schedule.anytime


def schedule_from_dict(value: Any, path: str = "schedule") -> Schedule:
    if not isinstance(value, Mapping):
        _fail(path, "must be an object")
    kind = value.get("type")
    if kind == "once":
        data = _mapping(value, path, frozenset({"type", "due"}))
        return OnceSchedule(due=parse_instant(_required(data, "due", path), f"{path}.due"))
    if kind == "daily":
        data = _mapping(value, path, frozenset({"type", "time", "anytime"}))
        at, anytime = _schedule_time(data, path)
        return DailySchedule(time=at, anytime=anytime)
    if kind == "weekly":
        data = _mapping(value, path, frozenset({"type", "weekdays", "time", "anytime"}))
        at, anytime = _schedule_time(data, path)
        return WeeklySchedule(
            weekdays=_weekdays(_required(data, "weekdays", path), f"{path}.weekdays"),
            time=at,
            anytime=anytime,
        )
    if kind == "interval":
        data = _mapping(value, path, frozenset({"type", "every_days", "time", "anchor", "anytime"}))
        at, anytime = _schedule_time(data, path)
        return IntervalSchedule(
            every_days=_integer(data, "every_days", path, minimum=1),
            time=at,
            anchor=_enum(data, "anchor", path, Anchor),
            anytime=anytime,
        )
    _fail(f"{path}.type", "must be one of once, daily, weekly, interval")


def _weekdays(value: Any, path: str) -> tuple[int, ...]:
    if not isinstance(value, list | tuple) or not value:
        _fail(path, "must be a non-empty list")
    for day in value:
        if isinstance(day, bool) or not isinstance(day, int) or not 0 <= day <= 6:
            _fail(path, "must contain only integers from 0 (Monday) to 6 (Sunday)")
    if len(set(value)) != len(value):
        _fail(path, "must not contain duplicates")
    return tuple(sorted(value))


@dataclass(frozen=True, slots=True)
class Trigger:
    entity_id: str
    above: float | None = None
    below: float | None = None
    state: str | None = None
    for_seconds: int = 0

    @classmethod
    def from_dict(cls, value: Any, path: str = "trigger") -> Trigger:
        data = _mapping(
            value, path, frozenset({"entity_id", "above", "below", "state", "for_seconds"})
        )
        entity_id = _string(data, "entity_id", path, allow_empty=True)
        if entity_id and not _ENTITY_RE.fullmatch(entity_id):
            _fail(f"{path}.entity_id", f"is not a valid entity id: {entity_id!r}")
        above = _optional_number(data, "above", path)
        below = _optional_number(data, "below", path)
        state = _optional_string(data, "state", path)
        if sum(item is not None for item in (above, below, state)) != 1:
            _fail(path, "exactly one of above, below, state must be set")
        if state is not None and not state.strip():
            _fail(f"{path}.state", "must not be empty")
        if state in INDETERMINATE_STATES:
            _fail(f"{path}.state", f"{state!r} can never match")
        return cls(
            entity_id=entity_id,
            above=above,
            below=below,
            state=state,
            for_seconds=_integer(data, "for_seconds", path, minimum=0, default=0),
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "entity_id": self.entity_id,
            "above": self.above,
            "below": self.below,
            "state": self.state,
            "for_seconds": self.for_seconds,
        }


@dataclass(frozen=True, slots=True)
class Stage:
    id: str
    title: str
    role: Role
    action: str | None = None
    complete_when: Trigger | None = None
    stale_after_minutes: int | None = None

    @classmethod
    def from_dict(cls, value: Any, path: str = "stage") -> Stage:
        data = _mapping(
            value,
            path,
            frozenset({"id", "title", "action", "role", "complete_when", "stale_after_minutes"}),
        )
        complete_when = data.get("complete_when")
        return cls(
            id=_string(data, "id", path),
            title=_string(data, "title", path),
            action=_optional_string(data, "action", path),
            role=_enum(data, "role", path, Role),
            complete_when=(
                None
                if complete_when is None
                else Trigger.from_dict(complete_when, f"{path}.complete_when")
            ),
            stale_after_minutes=_optional_integer(data, "stale_after_minutes", path, minimum=1),
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "action": self.action,
            "role": self.role,
            "complete_when": None if self.complete_when is None else self.complete_when.to_dict(),
            "stale_after_minutes": self.stale_after_minutes,
        }


@dataclass(frozen=True, slots=True)
class Look:
    accent: str | None = None
    variant: str | None = None

    @classmethod
    def from_dict(cls, value: Any, path: str = "look") -> Look:
        data = _mapping(value, path, frozenset({"accent", "variant"}))
        accent = _optional_string(data, "accent", path)
        if accent is not None and not _ACCENT_RE.fullmatch(accent):
            _fail(f"{path}.accent", "must be a colour formatted as #rrggbb")
        variant = None if data.get("variant") is None else _string(data, "variant", path)
        if variant is not None and len(variant) > MAX_VARIANT_LENGTH:
            _fail(f"{path}.variant", f"must be at most {MAX_VARIANT_LENGTH} characters")
        return cls(accent=accent, variant=variant)

    def to_dict(self) -> dict[str, Any]:
        return {"accent": self.accent, "variant": self.variant}


def _look(value: Any, path: str) -> Look | None:
    if value is None:
        return None
    look = Look.from_dict(value, path)
    return None if look == Look() else look


@dataclass(frozen=True, slots=True)
class Task:
    id: str
    title: str
    schedule: Schedule
    on_missed: OnMissed
    scene: SceneName
    stages: tuple[Stage, ...]
    icon: str | None = None
    color: str | None = None
    notes: str | None = None
    assignee: str | None = None
    enabled: bool = True
    clean_for_minutes: int = DEFAULT_CLEAN_FOR_MINUTES
    grace_hours: int = DEFAULT_GRACE_HOURS
    look: Look | None = None

    @classmethod
    def from_dict(cls, value: Any, path: str = "task") -> Task:
        data = _mapping(
            value,
            path,
            frozenset(
                {
                    "id",
                    "title",
                    "icon",
                    "color",
                    "look",
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
            ),
        )
        return cls(
            id=_string(data, "id", path),
            title=_string(data, "title", path),
            icon=_optional_string(data, "icon", path),
            color=_optional_string(data, "color", path),
            look=_look(data.get("look"), f"{path}.look"),
            notes=_optional_string(data, "notes", path),
            assignee=_optional_string(data, "assignee", path),
            enabled=_boolean(data, "enabled", path, default=True),
            schedule=schedule_from_dict(_required(data, "schedule", path), f"{path}.schedule"),
            on_missed=_enum(data, "on_missed", path, OnMissed),
            scene=_enum(data, "scene", path, SceneName),
            stages=_stages(_required(data, "stages", path), f"{path}.stages"),
            clean_for_minutes=_integer(
                data, "clean_for_minutes", path, minimum=0, default=DEFAULT_CLEAN_FOR_MINUTES
            ),
            grace_hours=_integer(data, "grace_hours", path, minimum=0, default=DEFAULT_GRACE_HOURS),
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "icon": self.icon,
            "color": self.color,
            "look": None if self.look is None else self.look.to_dict(),
            "notes": self.notes,
            "assignee": self.assignee,
            "enabled": self.enabled,
            "schedule": self.schedule.to_dict(),
            "on_missed": self.on_missed,
            "scene": self.scene,
            "stages": [stage.to_dict() for stage in self.stages],
            "clean_for_minutes": self.clean_for_minutes,
            "grace_hours": self.grace_hours,
        }


def _stages(value: Any, path: str) -> tuple[Stage, ...]:
    if not isinstance(value, list | tuple) or not value:
        _fail(path, "must contain at least one stage")
    stages = tuple(Stage.from_dict(item, f"{path}[{index}]") for index, item in enumerate(value))
    seen: set[str] = set()
    for index, stage in enumerate(stages):
        if stage.id in seen:
            _fail(f"{path}[{index}].id", f"duplicate stage id {stage.id!r}")
        seen.add(stage.id)
    return stages


@dataclass(frozen=True, slots=True)
class Pack:
    cycle: int
    taken: tuple[int, ...] = ()
    missed: tuple[int, ...] = ()

    @classmethod
    def from_dict(cls, value: Any, path: str = "pack") -> Pack:
        data = _mapping(value, path, frozenset({"cycle", "taken", "missed"}))
        return cls(
            cycle=_integer(data, "cycle", path, minimum=-MAX_DAYS),
            taken=_slots(data.get("taken", ()), f"{path}.taken"),
            missed=_slots(data.get("missed", ()), f"{path}.missed"),
        )

    def to_dict(self) -> dict[str, Any]:
        return {"cycle": self.cycle, "taken": list(self.taken), "missed": list(self.missed)}


def _slots(value: Any, path: str) -> tuple[int, ...]:
    if not isinstance(value, list | tuple):
        _fail(path, "must be a list")
    for slot in value:
        if isinstance(slot, bool) or not isinstance(slot, int) or not 0 <= slot < PACK_SIZE:
            _fail(path, f"must contain only integers from 0 to {PACK_SIZE - 1}")
    return tuple(sorted(set(value)))


_RUNTIME_FIELDS = frozenset(
    {
        "task_id",
        "occurrence_id",
        "due_at",
        "stage_index",
        "stage_entered_at",
        "started_at",
        "last_completed_at",
        "next_due_at",
        "clean_until",
        "pack",
        "undo",
    }
)


@dataclass(frozen=True, slots=True)
class Runtime:
    task_id: str
    occurrence_id: str
    due_at: datetime | None = None
    stage_index: int = 0
    stage_entered_at: datetime | None = None
    started_at: datetime | None = None
    last_completed_at: datetime | None = None
    next_due_at: datetime | None = None
    clean_until: datetime | None = None
    pack: Pack | None = None
    undo: Runtime | None = None

    @classmethod
    def from_dict(cls, value: Any, path: str = "runtime") -> Runtime:
        data = _mapping(value, path, _RUNTIME_FIELDS)
        undo = data.get("undo")
        pack = data.get("pack")
        restored = None
        if undo is not None:
            nested = dict(_mapping(undo, f"{path}.undo", _RUNTIME_FIELDS))
            nested["undo"] = None
            restored = cls.from_dict(nested, f"{path}.undo")
        return cls(
            task_id=_string(data, "task_id", path),
            occurrence_id=_string(data, "occurrence_id", path),
            due_at=_optional_instant(data, "due_at", path),
            stage_index=_integer(data, "stage_index", path, minimum=0),
            stage_entered_at=_optional_instant(data, "stage_entered_at", path),
            started_at=_optional_instant(data, "started_at", path),
            last_completed_at=_optional_instant(data, "last_completed_at", path),
            next_due_at=_optional_instant(data, "next_due_at", path),
            clean_until=_optional_instant(data, "clean_until", path),
            pack=None if pack is None else Pack.from_dict(pack, f"{path}.pack"),
            undo=restored,
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "task_id": self.task_id,
            "occurrence_id": self.occurrence_id,
            "due_at": format_instant(self.due_at),
            "stage_index": self.stage_index,
            "stage_entered_at": format_instant(self.stage_entered_at),
            "started_at": format_instant(self.started_at),
            "last_completed_at": format_instant(self.last_completed_at),
            "next_due_at": format_instant(self.next_due_at),
            "clean_until": format_instant(self.clean_until),
            "pack": None if self.pack is None else self.pack.to_dict(),
            "undo": None if self.undo is None else self.undo.to_dict(),
        }


@dataclass(frozen=True, slots=True)
class HistoryEvent:
    id: str
    ts: datetime
    task_id: str
    task_title: str
    type: EventType
    source: EventSource
    occurrence_id: str | None = None
    stage_id: str | None = None
    stage_title: str | None = None
    user_id: str | None = None
    on_time: bool | None = None

    @classmethod
    def from_dict(cls, value: Any, path: str = "event") -> HistoryEvent:
        data = _mapping(
            value,
            path,
            frozenset(
                {
                    "id",
                    "ts",
                    "task_id",
                    "task_title",
                    "occurrence_id",
                    "type",
                    "stage_id",
                    "stage_title",
                    "source",
                    "user_id",
                    "on_time",
                }
            ),
        )
        on_time = data.get("on_time")
        if on_time is not None and not isinstance(on_time, bool):
            _fail(f"{path}.on_time", "must be true, false or null")
        return cls(
            id=_string(data, "id", path),
            ts=as_utc(parse_instant(_required(data, "ts", path), f"{path}.ts")),
            task_id=_string(data, "task_id", path),
            task_title=_string(data, "task_title", path, allow_empty=True),
            occurrence_id=_optional_string(data, "occurrence_id", path),
            type=_enum(data, "type", path, EventType),
            stage_id=_optional_string(data, "stage_id", path),
            stage_title=_optional_string(data, "stage_title", path),
            source=_enum(data, "source", path, EventSource),
            user_id=_optional_string(data, "user_id", path),
            on_time=on_time,
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "ts": format_instant(self.ts),
            "task_id": self.task_id,
            "task_title": self.task_title,
            "occurrence_id": self.occurrence_id,
            "type": self.type,
            "stage_id": self.stage_id,
            "stage_title": self.stage_title,
            "source": self.source,
            "user_id": self.user_id,
            "on_time": self.on_time,
        }


_SETTINGS_FIELDS = frozenset(
    {
        "history_retention_days",
        "focus_minutes",
        "short_break_minutes",
        "long_break_minutes",
        "rounds_until_long_break",
        "auto_start_breaks",
        "auto_start_focus",
    }
)


def _minutes(data: Mapping[str, Any], key: str, path: str, default: int) -> int:
    return _integer(data, key, path, minimum=1, maximum=MAX_POMODORO_MINUTES, default=default)


@dataclass(frozen=True, slots=True)
class Settings:
    history_retention_days: int = DEFAULT_HISTORY_RETENTION_DAYS
    focus_minutes: int = DEFAULT_FOCUS_MINUTES
    short_break_minutes: int = DEFAULT_SHORT_BREAK_MINUTES
    long_break_minutes: int = DEFAULT_LONG_BREAK_MINUTES
    rounds_until_long_break: int = DEFAULT_ROUNDS_UNTIL_LONG_BREAK
    auto_start_breaks: bool = True
    auto_start_focus: bool = False

    @classmethod
    def from_dict(cls, value: Any, path: str = "settings") -> Settings:
        data = _mapping(value, path, _SETTINGS_FIELDS)
        return cls(
            history_retention_days=_integer(
                data,
                "history_retention_days",
                path,
                minimum=1,
                maximum=MAX_DAYS,
                default=DEFAULT_HISTORY_RETENTION_DAYS,
            ),
            focus_minutes=_minutes(data, "focus_minutes", path, DEFAULT_FOCUS_MINUTES),
            short_break_minutes=_minutes(
                data, "short_break_minutes", path, DEFAULT_SHORT_BREAK_MINUTES
            ),
            long_break_minutes=_minutes(
                data, "long_break_minutes", path, DEFAULT_LONG_BREAK_MINUTES
            ),
            rounds_until_long_break=_integer(
                data,
                "rounds_until_long_break",
                path,
                minimum=1,
                maximum=MAX_POMODORO_ROUNDS,
                default=DEFAULT_ROUNDS_UNTIL_LONG_BREAK,
            ),
            auto_start_breaks=_boolean(data, "auto_start_breaks", path, default=True),
            auto_start_focus=_boolean(data, "auto_start_focus", path, default=False),
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "history_retention_days": self.history_retention_days,
            "focus_minutes": self.focus_minutes,
            "short_break_minutes": self.short_break_minutes,
            "long_break_minutes": self.long_break_minutes,
            "rounds_until_long_break": self.rounds_until_long_break,
            "auto_start_breaks": self.auto_start_breaks,
            "auto_start_focus": self.auto_start_focus,
        }


_POMODORO_FIELDS = frozenset(
    {
        "phase",
        "ends_at",
        "paused_remaining_seconds",
        "duration_seconds",
        "round",
        "next_phase",
        "rounds_today",
        "rounds_date",
    }
)


def _optional_date(data: Mapping[str, Any], key: str, path: str) -> str | None:
    value = data.get(key)
    if value is None:
        return None
    try:
        return date.fromisoformat(value).isoformat()
    except TypeError, ValueError:
        _fail(f"{path}.{key}", "must be a date formatted as YYYY-MM-DD")


@dataclass(frozen=True, slots=True)
class PomodoroState:
    phase: PomodoroPhase = "idle"
    ends_at: datetime | None = None
    paused_remaining_seconds: float | None = None
    duration_seconds: int | None = None
    round: int = 1
    next_phase: PomodoroNext = "focus"
    rounds_today: int = 0
    rounds_date: str | None = None

    @classmethod
    def from_dict(cls, value: Any, path: str = "pomodoro") -> PomodoroState:
        data = _mapping(value, path, _POMODORO_FIELDS)
        phase = _enum(data, "phase", path, PomodoroPhase)
        ends_at = _optional_instant(data, "ends_at", path)
        paused = _optional_number(data, "paused_remaining_seconds", path)
        duration = _optional_integer(data, "duration_seconds", path, minimum=1)
        if paused is not None and paused < 0:
            _fail(f"{path}.paused_remaining_seconds", "must not be negative")
        if phase == "idle" and (ends_at, paused, duration) != (None, None, None):
            _fail(path, "an idle timer has no end, remainder or duration")
        if phase != "idle" and ((ends_at is None) == (paused is None) or duration is None):
            _fail(path, "a phase needs a duration and exactly one of ends_at and remainder")
        next_phase = _enum(data, "next_phase", path, PomodoroNext)
        if phase != "idle" and next_phase != "focus":
            _fail(f"{path}.next_phase", "must be focus during a phase")
        return cls(
            phase=phase,
            ends_at=ends_at,
            paused_remaining_seconds=paused,
            duration_seconds=duration,
            round=_integer(data, "round", path, minimum=1),
            next_phase=next_phase,
            rounds_today=_integer(data, "rounds_today", path, minimum=0),
            rounds_date=_optional_date(data, "rounds_date", path),
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "phase": self.phase,
            "ends_at": format_instant(self.ends_at),
            "paused_remaining_seconds": self.paused_remaining_seconds,
            "duration_seconds": self.duration_seconds,
            "round": self.round,
            "next_phase": self.next_phase,
            "rounds_today": self.rounds_today,
            "rounds_date": self.rounds_date,
        }
