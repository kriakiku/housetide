from datetime import timedelta
from typing import Any

import pytest
from engine_factories import at

from custom_components.housetide.engine.models import Trigger
from custom_components.housetide.engine.triggers import TriggerHold, evaluate

T0 = at("2026-06-10T08:00:00+03:00")
ABOVE = Trigger("sensor.p", above=10, for_seconds=60)
BELOW = Trigger("sensor.p", below=5, for_seconds=300)
STATE = Trigger("binary_sensor.door", state="on", for_seconds=30)


def t(seconds: float) -> Any:
    return T0 + timedelta(seconds=seconds)


@pytest.mark.parametrize(
    ("trigger", "value", "expected"),
    [
        (ABOVE, "10.5", True),
        (ABOVE, 11, True),
        (ABOVE, 11.0, True),
        (ABOVE, "10", False),
        (ABOVE, "9.9", False),
        (ABOVE, "unknown", None),
        (ABOVE, "unavailable", None),
        (ABOVE, None, None),
        (ABOVE, "on", None),
        (ABOVE, "", None),
        (ABOVE, "nan", None),
        (ABOVE, "inf", None),
        (ABOVE, "-inf", None),
        (ABOVE, True, None),
        (ABOVE, [], None),
        (BELOW, "4.9", True),
        (BELOW, "5", False),
        (BELOW, "5.1", False),
        (BELOW, "-3", True),
        (BELOW, "unavailable", None),
        (BELOW, "off", None),
        (STATE, "on", True),
        (STATE, "off", False),
        (STATE, "unknown", None),
        (STATE, "unavailable", None),
        (STATE, None, None),
    ],
)
def test_evaluate(trigger: Trigger, value: Any, expected: bool | None) -> None:
    assert evaluate(trigger, value) is expected


@pytest.mark.parametrize(
    ("trigger", "feed", "fires"),
    [
        pytest.param(ABOVE, [(0, "20"), (59, "20")], [False, False], id="short"),
        pytest.param(ABOVE, [(0, "20"), (60, "20")], [False, True], id="exact-boundary"),
        pytest.param(ABOVE, [(0, "20"), (30, "15"), (70, "12")], [False, False, True], id="varied"),
        pytest.param(
            ABOVE,
            [(0, "20"), (30, "5"), (40, "20"), (99, "20"), (100, "20")],
            [False, False, False, False, True],
            id="real-failure-resets",
        ),
        pytest.param(
            ABOVE,
            [(0, "20"), (30, "unavailable"), (70, "20")],
            [False, False, True],
            id="unavailable-keeps-hold",
        ),
        pytest.param(
            ABOVE,
            [(0, "20"), (30, "unknown"), (70, "20")],
            [False, False, True],
            id="unknown-keeps-hold",
        ),
        pytest.param(
            ABOVE,
            [(0, "20"), (30, "garbage"), (70, "20")],
            [False, False, True],
            id="non-numeric-keeps-hold",
        ),
        pytest.param(
            ABOVE,
            [(0, "20"), (30, None), (70, "20")],
            [False, False, True],
            id="none-keeps-hold",
        ),
        pytest.param(
            ABOVE,
            [(0, "unavailable"), (70, "unavailable"), (80, "20"), (139, "20"), (140, "20")],
            [False, False, False, False, True],
            id="indeterminate-does-not-start-hold",
        ),
        pytest.param(
            ABOVE,
            [(0, "20"), (61, "unavailable")],
            [False, False],
            id="indeterminate-never-fires",
        ),
        pytest.param(
            ABOVE,
            [(0, "20"), (30, "unavailable"), (40, "3"), (70, "20"), (129, "20"), (130, "20")],
            [False, False, False, False, False, True],
            id="real-failure-after-gap-resets",
        ),
        pytest.param(BELOW, [(0, "2"), (299, "2"), (300, "2")], [False, False, True], id="below"),
        pytest.param(STATE, [(0, "on"), (30, "on")], [False, True], id="state"),
        pytest.param(
            STATE,
            [(0, "on"), (10, "off"), (20, "on"), (49, "on"), (50, "on")],
            [False, False, False, False, True],
            id="state-resets",
        ),
        pytest.param(
            STATE,
            [(0, "on"), (10, "unavailable"), (30, "on")],
            [False, False, True],
            id="state-unavailable-keeps-hold",
        ),
        pytest.param(
            Trigger("sensor.p", above=10, for_seconds=0),
            [(0, "5"), (1, "20")],
            [False, True],
            id="zero-hold-fires-immediately",
        ),
    ],
)
def test_hold_feed(trigger: Trigger, feed: list[tuple[float, Any]], fires: list[bool]) -> None:
    hold = TriggerHold(trigger)
    assert [hold.feed(value, t(moment)) for moment, value in feed] == fires


def test_hold_check_fires_without_new_values() -> None:
    hold = TriggerHold(ABOVE)
    assert hold.feed("20", t(0)) is False
    assert hold.deadline == t(60)
    assert hold.check(t(59)) is False
    assert hold.check(t(60)) is True


def test_hold_check_waits_while_indeterminate() -> None:
    hold = TriggerHold(ABOVE)
    hold.feed("20", t(0))
    hold.feed("unavailable", t(10))
    assert hold.check(t(120)) is False
    assert hold.held_since == t(0)
    assert hold.feed("20", t(121)) is True


def test_hold_fires_once_until_real_failure() -> None:
    hold = TriggerHold(ABOVE)
    hold.feed("20", t(0))
    assert hold.feed("20", t(60)) is True
    assert hold.feed("20", t(61)) is False
    assert hold.check(t(200)) is False
    assert hold.deadline is None
    assert hold.feed("unavailable", t(201)) is False
    assert hold.latched is True
    assert hold.feed("1", t(202)) is False
    assert hold.latched is False
    hold.feed("20", t(203))
    assert hold.feed("20", t(263)) is True


def test_latched_hold_needs_real_failure_first() -> None:
    hold = TriggerHold(ABOVE, latched=True)
    assert hold.feed("20", t(0)) is False
    assert hold.feed("20", t(600)) is False
    assert hold.feed("1", t(601)) is False
    assert hold.feed("20", t(602)) is False
    assert hold.feed("20", t(662)) is True


def test_fresh_hold_starts_at_restart() -> None:
    before = TriggerHold(ABOVE)
    before.feed("20", t(0))
    after = TriggerHold(ABOVE)
    assert after.feed("20", t(3600)) is False
    assert after.held_since == t(3600)
    assert after.feed("20", t(3660)) is True


def test_no_value_yet_is_inert() -> None:
    hold = TriggerHold(ABOVE)
    assert hold.deadline is None
    assert hold.check(t(1000)) is False
