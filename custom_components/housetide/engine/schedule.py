from datetime import UTC, date, datetime, time, timedelta
from zoneinfo import ZoneInfo

from .models import (
    DailySchedule,
    IntervalSchedule,
    OnceSchedule,
    Schedule,
    WeeklySchedule,
    as_utc,
)


def parse_hhmm(value: str) -> time:
    hours, minutes = value.split(":")
    return time(int(hours), int(minutes))


def resolve_local(day: date, at: time, zone: ZoneInfo) -> datetime:
    return datetime.combine(day, at, zone).replace(fold=0).astimezone(UTC)


def local_date(moment: datetime, zone: ZoneInfo) -> date:
    return moment.astimezone(zone).date()


def start_of_next_day(moment: datetime, zone: ZoneInfo) -> datetime:
    return resolve_local(local_date(moment, zone) + timedelta(days=1), time(0, 0), zone)


def next_due(
    schedule: Schedule,
    after: datetime,
    zone: ZoneInfo,
    last_completed: datetime | None = None,
    previous_due: datetime | None = None,
) -> datetime | None:
    after = as_utc(after)
    match schedule:
        case OnceSchedule(due=due):
            return as_utc(due) if as_utc(due) > after else None
        case DailySchedule():
            return _first_matching(schedule.time, after, zone, None)
        case WeeklySchedule():
            return _first_matching(schedule.time, after, zone, set(schedule.weekdays))
        case IntervalSchedule():
            return _next_interval(schedule, after, zone, last_completed, previous_due)
    raise TypeError(f"unsupported schedule: {schedule!r}")


def first_due(
    schedule: Schedule,
    now: datetime,
    zone: ZoneInfo,
    last_completed: datetime | None = None,
) -> datetime | None:
    if isinstance(schedule, OnceSchedule):
        return as_utc(schedule.due)
    return next_due(schedule, now, zone, last_completed)


def _first_matching(
    at: str, after: datetime, zone: ZoneInfo, weekdays: set[int] | None
) -> datetime:
    moment = parse_hhmm(at)
    start = local_date(after, zone)
    for offset in range(9):
        day = start + timedelta(days=offset)
        if weekdays is not None and day.weekday() not in weekdays:
            continue
        candidate = resolve_local(day, moment, zone)
        if candidate > after:
            return candidate
    raise ValueError(f"no due moment found after {after!r}")


def _next_interval(
    schedule: IntervalSchedule,
    after: datetime,
    zone: ZoneInfo,
    last_completed: datetime | None,
    previous_due: datetime | None,
) -> datetime:
    reference = previous_due
    if schedule.anchor == "completion" and last_completed is not None:
        reference = last_completed
    if reference is None:
        base = local_date(after, zone)
        steps = 0
    else:
        base = local_date(as_utc(reference), zone)
        steps = max(1, (local_date(after, zone) - base).days // schedule.every_days)
    moment = parse_hhmm(schedule.time)
    while True:
        candidate = resolve_local(base + timedelta(days=steps * schedule.every_days), moment, zone)
        if candidate > after:
            return candidate
        steps += 1
