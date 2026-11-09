from bisect import bisect_left
from collections.abc import Hashable
from datetime import UTC, date, datetime, time, timedelta
from zoneinfo import ZoneInfo

from .models import (
    PACK_SIZE,
    DailySchedule,
    IntervalSchedule,
    OnceSchedule,
    Schedule,
    WeeklySchedule,
    as_utc,
    is_anytime,
)

SLOT_EPOCH = date(2000, 1, 3)


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
    if is_anytime(schedule) and last_completed is not None:
        day = local_date(as_utc(last_completed), zone)
        after = max(after, resolve_local(day, parse_hhmm(schedule.time), zone))
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
    if isinstance(schedule, IntervalSchedule) and schedule.anytime and last_completed is None:
        return _first_matching(schedule.time, as_utc(now), zone, None)
    return next_due(schedule, now, zone, last_completed)


def dose_slot(schedule: Schedule, due: datetime, zone: ZoneInfo) -> tuple[int, int]:
    days = (local_date(as_utc(due), zone) - SLOT_EPOCH).days
    match schedule:
        case OnceSchedule():
            return 0, 0
        case DailySchedule():
            period = days
        case WeeklySchedule(weekdays=weekdays):
            period = days // 7 * len(weekdays) + bisect_left(weekdays, days % 7)
        case IntervalSchedule(every_days=every_days):
            period = days // every_days
        case _:
            raise TypeError(f"unsupported schedule: {schedule!r}")
    return divmod(period, PACK_SIZE)


def on_schedule(schedule: Schedule, due: datetime, zone: ZoneInfo) -> bool:
    if isinstance(schedule, WeeklySchedule):
        return local_date(as_utc(due), zone).weekday() in schedule.weekdays
    return True


def slot_rhythm(schedule: Schedule) -> Hashable:
    match schedule:
        case WeeklySchedule(weekdays=weekdays):
            return "weekly", weekdays
        case IntervalSchedule(every_days=every_days):
            return "interval", every_days
    return type(schedule).__name__


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
