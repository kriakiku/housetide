from collections.abc import Iterable
from datetime import datetime, timedelta
from typing import Any
from zoneinfo import ZoneInfo

from .models import HistoryEvent, as_utc
from .schedule import local_date

_OUTCOMES = frozenset({"completed", "skipped", "missed"})


def occurrence_outcomes(events: Iterable[HistoryEvent], now: datetime) -> list[HistoryEvent]:
    now = as_utc(now)
    outcomes: dict[str, HistoryEvent] = {}
    for event in sorted((e for e in events if e.ts <= now), key=lambda e: e.ts):
        key = event.occurrence_id or event.id
        if event.type in _OUTCOMES:
            outcomes[key] = event
        elif event.type == "undone":
            outcomes.pop(key, None)
    return sorted(outcomes.values(), key=lambda e: e.ts)


def summary(
    events: Iterable[HistoryEvent], now: datetime, days: int, zone: ZoneInfo
) -> dict[str, Any]:
    if days < 1:
        raise ValueError("days must be at least 1")
    outcomes = occurrence_outcomes(events, now)
    current = best = 0
    for event in outcomes:
        current = current + 1 if event.type == "completed" else 0
        best = max(best, current)
    today = local_date(as_utc(now), zone)
    dates = [today - timedelta(days=offset) for offset in range(days - 1, -1, -1)]
    per_day: dict[str, dict[str, Any]] = {
        day.isoformat(): {"date": day.isoformat(), "completed": 0, "skipped": 0, "missed": 0}
        for day in dates
    }
    totals = {"completed": 0, "skipped": 0, "missed": 0}
    timed = on_time = 0
    for event in outcomes:
        bucket = per_day.get(local_date(event.ts, zone).isoformat())
        if bucket is None:
            continue
        bucket[event.type] += 1
        totals[event.type] += 1
        if event.type == "completed" and event.on_time is not None:
            timed += 1
            on_time += event.on_time
    return {
        "current_streak": current,
        "best_streak": best,
        **totals,
        "on_time_rate": on_time / timed if timed else None,
        "per_day": list(per_day.values()),
    }
