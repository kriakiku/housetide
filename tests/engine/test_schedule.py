from datetime import UTC, date, time, timedelta
from typing import Any
from zoneinfo import ZoneInfo

import pytest
from engine_factories import KYIV, LORD_HOWE, NEW_YORK, at

from custom_components.housetide.engine.models import (
    DailySchedule,
    IntervalSchedule,
    OnceSchedule,
    WeeklySchedule,
)
from custom_components.housetide.engine.schedule import (
    first_due,
    next_due,
    resolve_local,
    start_of_next_day,
)

SUNDAY = 6
DST_CASES = [
    pytest.param(KYIV, date(2026, 3, 29), "03:30", "2026-03-29T01:30:00+00:00", id="kyiv-gap"),
    pytest.param(KYIV, date(2026, 10, 25), "03:30", "2026-10-25T00:30:00+00:00", id="kyiv-repeat"),
    pytest.param(NEW_YORK, date(2026, 3, 8), "02:30", "2026-03-08T07:30:00+00:00", id="ny-gap"),
    pytest.param(NEW_YORK, date(2026, 11, 1), "01:30", "2026-11-01T05:30:00+00:00", id="ny-repeat"),
    pytest.param(LORD_HOWE, date(2026, 10, 4), "02:15", "2026-10-03T15:45:00+00:00", id="lh-gap"),
    pytest.param(LORD_HOWE, date(2026, 4, 5), "01:45", "2026-04-04T14:45:00+00:00", id="lh-repeat"),
]


def utc(moment: Any) -> Any:
    return moment.astimezone(UTC)


def local_noon_before(day: date, zone: ZoneInfo, days: int = 1) -> Any:
    return resolve_local(day - timedelta(days=days), time(12, 0), zone)


@pytest.mark.parametrize(("zone", "day", "at_time", "expected"), DST_CASES)
def test_resolve_local(zone: ZoneInfo, day: date, at_time: str, expected: str) -> None:
    hours, minutes = at_time.split(":")
    assert resolve_local(day, time(int(hours), int(minutes)), zone) == at(expected)


@pytest.mark.parametrize(("zone", "day", "at_time", "expected"), DST_CASES)
def test_daily_across_dst(zone: ZoneInfo, day: date, at_time: str, expected: str) -> None:
    assert next_due(DailySchedule(at_time), local_noon_before(day, zone), zone) == at(expected)


@pytest.mark.parametrize(("zone", "day", "at_time", "expected"), DST_CASES)
def test_weekly_across_dst(zone: ZoneInfo, day: date, at_time: str, expected: str) -> None:
    schedule = WeeklySchedule((SUNDAY,), at_time)
    assert next_due(schedule, local_noon_before(day, zone, 3), zone) == at(expected)


@pytest.mark.parametrize(("zone", "day", "at_time", "expected"), DST_CASES)
def test_interval_schedule_across_dst(
    zone: ZoneInfo, day: date, at_time: str, expected: str
) -> None:
    hours, minutes = at_time.split(":")
    previous = resolve_local(day - timedelta(days=7), time(int(hours), int(minutes)), zone)
    schedule = IntervalSchedule(7, at_time, "schedule")
    assert next_due(schedule, previous, zone, None, previous) == at(expected)


@pytest.mark.parametrize(("zone", "day", "at_time", "expected"), DST_CASES)
def test_interval_completion_across_dst(
    zone: ZoneInfo, day: date, at_time: str, expected: str
) -> None:
    completed = local_noon_before(day, zone, 2)
    schedule = IntervalSchedule(2, at_time, "completion")
    assert next_due(schedule, completed, zone, completed) == at(expected)


@pytest.mark.parametrize(("zone", "day", "at_time", "expected"), DST_CASES)
def test_once_is_absolute_across_dst(
    zone: ZoneInfo, day: date, at_time: str, expected: str
) -> None:
    due = at(expected).astimezone(zone)
    schedule = OnceSchedule(due)
    assert next_due(schedule, local_noon_before(day, zone), zone) == at(expected)
    assert next_due(schedule, due, zone) is None


@pytest.mark.parametrize(
    ("zone", "at_time", "after", "expected"),
    [
        pytest.param(
            NEW_YORK,
            "01:30",
            "2026-11-01T05:30:00+00:00",
            "2026-11-02T06:30:00+00:00",
            id="ny-first-pass-does-not-refire",
        ),
        pytest.param(
            NEW_YORK,
            "01:30",
            "2026-11-01T06:15:00+00:00",
            "2026-11-02T06:30:00+00:00",
            id="ny-inside-second-pass",
        ),
        pytest.param(
            KYIV,
            "03:30",
            "2026-10-25T00:30:00+00:00",
            "2026-10-26T01:30:00+00:00",
            id="kyiv-first-pass-does-not-refire",
        ),
        pytest.param(
            LORD_HOWE,
            "01:45",
            "2026-04-04T14:45:00+00:00",
            "2026-04-05T15:15:00+00:00",
            id="lh-first-pass-does-not-refire",
        ),
        pytest.param(
            NEW_YORK,
            "02:30",
            "2026-03-08T07:30:00+00:00",
            "2026-03-09T06:30:00+00:00",
            id="ny-gap-then-normal",
        ),
        pytest.param(
            KYIV,
            "03:30",
            "2026-03-29T01:00:00+00:00",
            "2026-03-29T01:30:00+00:00",
            id="kyiv-after-inside-shifted-window",
        ),
    ],
)
def test_daily_does_not_double_fire(
    zone: ZoneInfo, at_time: str, after: str, expected: str
) -> None:
    assert next_due(DailySchedule(at_time), at(after), zone) == at(expected)


def test_same_zone_comparison_uses_absolute_time() -> None:
    first_pass = at("2026-11-01T05:30:00+00:00").astimezone(NEW_YORK)
    second_pass = at("2026-11-01T06:30:00+00:00").astimezone(NEW_YORK)
    assert next_due(DailySchedule("01:30"), first_pass, NEW_YORK) == at("2026-11-02T06:30:00+00:00")
    assert next_due(DailySchedule("01:30"), second_pass, NEW_YORK) == at(
        "2026-11-02T06:30:00+00:00"
    )


def test_skipped_calendar_day() -> None:
    apia = ZoneInfo("Pacific/Apia")
    first = next_due(DailySchedule("10:00"), at("2011-12-29T12:00:00-10:00"), apia)
    assert first == at("2011-12-31T10:00:00+14:00")
    assert next_due(DailySchedule("10:00"), first, apia) == at("2012-01-01T10:00:00+14:00")


@pytest.mark.parametrize(
    ("after", "expected"),
    [
        pytest.param("2026-06-10T07:59:59+03:00", "2026-06-10T08:00:00+03:00", id="just-before"),
        pytest.param("2026-06-10T08:00:00+03:00", "2026-06-11T08:00:00+03:00", id="strict"),
        pytest.param("2026-06-10T23:59:00+03:00", "2026-06-11T08:00:00+03:00", id="late"),
        pytest.param("2026-06-09T21:59:00-07:00", "2026-06-10T08:00:00+03:00", id="other-zone"),
    ],
)
def test_daily(after: str, expected: str) -> None:
    assert next_due(DailySchedule("08:00"), at(after), KYIV) == at(expected)


@pytest.mark.parametrize(
    ("weekdays", "after", "expected"),
    [
        pytest.param((2,), "2026-06-10T07:00:00+03:00", "2026-06-10T08:00:00+03:00", id="today"),
        pytest.param((2,), "2026-06-10T08:00:00+03:00", "2026-06-17T08:00:00+03:00", id="wrap-7"),
        pytest.param((0,), "2026-06-14T23:00:00+03:00", "2026-06-15T08:00:00+03:00", id="sun-mon"),
        pytest.param((6,), "2026-06-15T09:00:00+03:00", "2026-06-21T08:00:00+03:00", id="mon-sun"),
        pytest.param((0, 6), "2026-06-14T09:00:00+03:00", "2026-06-15T08:00:00+03:00", id="pair"),
        pytest.param(
            (1, 3, 5), "2026-06-11T08:30:00+03:00", "2026-06-13T08:00:00+03:00", id="middle"
        ),
        pytest.param(
            (3,), "2026-12-31T08:30:00+02:00", "2027-01-07T08:00:00+02:00", id="year-wrap"
        ),
    ],
)
def test_weekly(weekdays: tuple[int, ...], after: str, expected: str) -> None:
    assert next_due(WeeklySchedule(weekdays, "08:00"), at(after), KYIV) == at(expected)


@pytest.mark.parametrize(
    ("every", "after", "previous", "expected"),
    [
        pytest.param(
            7,
            "2026-06-10T10:00:00+03:00",
            "2026-06-10T10:00:00+03:00",
            "2026-06-17T10:00:00+03:00",
            id="one-step",
        ),
        pytest.param(
            7,
            "2026-06-30T11:00:00+03:00",
            "2026-06-10T10:00:00+03:00",
            "2026-07-01T10:00:00+03:00",
            id="skip-forward-past-after",
        ),
        pytest.param(
            3,
            "2026-06-16T10:00:00+03:00",
            "2026-06-10T10:00:00+03:00",
            "2026-06-19T10:00:00+03:00",
            id="after-exactly-on-rhythm",
        ),
        pytest.param(
            3,
            "2026-06-16T09:59:00+03:00",
            "2026-06-10T10:00:00+03:00",
            "2026-06-16T10:00:00+03:00",
            id="after-just-before-rhythm",
        ),
        pytest.param(
            2,
            "2026-06-09T00:00:00+03:00",
            "2026-06-10T10:00:00+03:00",
            "2026-06-12T10:00:00+03:00",
            id="after-before-previous",
        ),
    ],
)
def test_interval_schedule_anchor(every: int, after: str, previous: str, expected: str) -> None:
    schedule = IntervalSchedule(every, "10:00", "schedule")
    assert next_due(schedule, at(after), KYIV, at("2026-01-01T00:00:00+00:00"), at(previous)) == at(
        expected
    )


@pytest.mark.parametrize(
    ("every", "after", "completed", "expected"),
    [
        pytest.param(
            7,
            "2026-06-10T15:00:00+03:00",
            "2026-06-10T15:00:00+03:00",
            "2026-06-17T10:00:00+03:00",
            id="from-completion-date",
        ),
        pytest.param(
            1,
            "2026-06-10T08:00:00+03:00",
            "2026-06-10T08:00:00+03:00",
            "2026-06-11T10:00:00+03:00",
            id="before-time-of-day-still-next-interval",
        ),
        pytest.param(
            7,
            "2026-06-20T15:00:00+03:00",
            "2026-06-10T15:00:00+03:00",
            "2026-06-24T10:00:00+03:00",
            id="steps-past-after",
        ),
    ],
)
def test_interval_completion_anchor(every: int, after: str, completed: str, expected: str) -> None:
    schedule = IntervalSchedule(every, "10:00", "completion")
    assert next_due(schedule, at(after), KYIV, at(completed)) == at(expected)


@pytest.mark.parametrize(
    ("anchor", "after", "expected"),
    [
        ("completion", "2026-06-10T09:00:00+03:00", "2026-06-10T10:00:00+03:00"),
        ("schedule", "2026-06-10T09:00:00+03:00", "2026-06-10T10:00:00+03:00"),
        ("completion", "2026-06-10T10:00:00+03:00", "2026-06-17T10:00:00+03:00"),
        ("schedule", "2026-06-10T11:00:00+03:00", "2026-06-17T10:00:00+03:00"),
    ],
)
def test_interval_without_reference(anchor: str, after: str, expected: str) -> None:
    assert next_due(IntervalSchedule(7, "10:00", anchor), at(after), KYIV) == at(expected)


def test_interval_completion_uses_previous_due_when_never_completed() -> None:
    schedule = IntervalSchedule(7, "10:00", "completion")
    previous = at("2026-06-10T10:00:00+03:00")
    assert next_due(schedule, previous, KYIV, None, previous) == at("2026-06-17T10:00:00+03:00")


@pytest.mark.parametrize(
    ("after", "expected"),
    [
        ("2026-06-10T07:59:59+03:00", "2026-06-10T08:00:00+03:00"),
        ("2026-06-10T08:00:00+03:00", None),
        ("2026-06-10T08:00:01+03:00", None),
    ],
)
def test_once(after: str, expected: str | None) -> None:
    schedule = OnceSchedule(at("2026-06-10T08:00:00+03:00"))
    result = next_due(schedule, at(after), KYIV)
    assert result == (None if expected is None else at(expected))


def test_first_due_keeps_past_one_off() -> None:
    due = at("2026-06-10T08:00:00+03:00")
    assert first_due(OnceSchedule(due), at("2026-06-20T08:00:00+03:00"), KYIV) == due


def test_start_of_next_day_with_midnight_gap() -> None:
    havana = ZoneInfo("America/Havana")
    assert start_of_next_day(at("2026-03-07T12:00:00-05:00"), havana) == at(
        "2026-03-08T01:00:00-04:00"
    )


@pytest.mark.parametrize(
    ("moment", "expected"),
    [
        ("2026-03-28T23:30:00+02:00", "2026-03-29T00:00:00+02:00"),
        ("2026-03-29T00:30:00+02:00", "2026-03-30T00:00:00+03:00"),
        ("2026-10-25T23:30:00+02:00", "2026-10-26T00:00:00+02:00"),
    ],
)
def test_start_of_next_day(moment: str, expected: str) -> None:
    assert start_of_next_day(at(moment), KYIV) == at(expected)


def test_naive_after_rejected() -> None:
    with pytest.raises(ValueError, match="timezone-aware"):
        next_due(DailySchedule("08:00"), at("2026-06-10T08:00:00"), KYIV)
