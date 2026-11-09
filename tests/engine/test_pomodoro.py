from dataclasses import replace
from datetime import datetime, timedelta
from typing import Any
from zoneinfo import ZoneInfo

import pytest

from custom_components.housetide.engine import pomodoro
from custom_components.housetide.engine.machine import MachineError
from custom_components.housetide.engine.models import PomodoroState, Settings, ValidationError

ZONE = ZoneInfo("Europe/Kyiv")
T0 = datetime.fromisoformat("2026-11-04T07:00:00+00:00")
DAY = "2026-11-04"
SETTINGS = Settings()
ONE_SET = (25, 5, 25, 5, 25, 5, 25, 15)


def minutes(value: float) -> timedelta:
    return timedelta(minutes=value)


def started(settings: Settings = SETTINGS, at: datetime = T0) -> PomodoroState:
    return pomodoro.start(PomodoroState(), settings, at, ZONE)


def expire_at(
    state: PomodoroState, now: datetime, settings: Settings = SETTINGS
) -> pomodoro.Expiry:
    return pomodoro.expire(state, settings, now, ZONE)


def test_defaults() -> None:
    state = PomodoroState()
    assert (state.phase, state.ends_at, state.round, state.rounds_today) == ("idle", None, 1, 0)
    assert state.to_dict() == {
        "phase": "idle",
        "ends_at": None,
        "paused_remaining_seconds": None,
        "duration_seconds": None,
        "round": 1,
        "next_phase": "focus",
        "rounds_today": 0,
        "rounds_date": None,
    }


def test_start_begins_focus() -> None:
    state = started()
    assert state.phase == "focus"
    assert state.ends_at == T0 + minutes(25)
    assert state.duration_seconds == 1500
    assert state.rounds_date == DAY


def test_start_uses_the_configured_length() -> None:
    assert started(Settings(focus_minutes=50)).ends_at == T0 + minutes(50)


def test_start_while_running_is_refused() -> None:
    with pytest.raises(MachineError, match="already running"):
        pomodoro.start(started(), SETTINGS, T0, ZONE)


def test_nothing_expires_before_the_end() -> None:
    state = started()
    assert expire_at(state, T0 + minutes(25) - timedelta(seconds=1)) == pomodoro.Expiry(state, 0)


def test_focus_end_counts_and_auto_starts_short_break() -> None:
    end = T0 + minutes(25)
    expiry = expire_at(started(), end)
    assert expiry.steps == 1
    state = expiry.state
    assert state.phase == "short_break"
    assert state.ends_at == end + minutes(5)
    assert state.duration_seconds == 300
    assert (state.round, state.rounds_today) == (1, 1)


def test_expiry_is_idempotent() -> None:
    end = T0 + minutes(25)
    once = expire_at(started(), end).state
    assert expire_at(once, end) == pomodoro.Expiry(once, 0)


def test_break_end_waits_for_a_manual_focus() -> None:
    end = T0 + minutes(30)
    state = expire_at(expire_at(started(), T0 + minutes(25)).state, end).state
    assert state.phase == "idle"
    assert state.ends_at is None
    assert (state.round, state.next_phase, state.rounds_today) == (2, "focus", 1)


def test_auto_start_focus_chains_on_the_previous_end() -> None:
    settings = Settings(auto_start_focus=True)
    state = expire_at(started(settings), T0 + minutes(30), settings).state
    assert state.phase == "focus"
    assert state.ends_at == T0 + minutes(55)
    assert state.round == 2


def test_without_auto_breaks_start_begins_the_pending_break() -> None:
    settings = Settings(auto_start_breaks=False)
    end = T0 + minutes(25)
    state = expire_at(started(settings), end, settings).state
    assert (state.phase, state.next_phase, state.round, state.rounds_today) == (
        "idle",
        "short_break",
        1,
        1,
    )
    later = end + minutes(3)
    resting = pomodoro.start(state, settings, later, ZONE)
    assert resting.phase == "short_break"
    assert resting.ends_at == later + minutes(5)
    assert resting.next_phase == "focus"


def play_set(settings: Settings = SETTINGS) -> list[tuple[str, int, int]]:
    state = PomodoroState()
    at = T0
    seen: list[tuple[str, int, int]] = []
    for _ in range(4):
        state = pomodoro.start(state, settings, at, ZONE)
        seen.append((state.phase, state.round, state.rounds_today))
        while state.ends_at is not None:
            at = state.ends_at
            state = pomodoro.expire(state, settings, at, ZONE).state
            seen.append((state.phase, state.round, state.rounds_today))
    return seen


def test_long_break_after_the_fourth_round() -> None:
    assert play_set() == [
        ("focus", 1, 0),
        ("short_break", 1, 1),
        ("idle", 2, 1),
        ("focus", 2, 1),
        ("short_break", 2, 2),
        ("idle", 3, 2),
        ("focus", 3, 2),
        ("short_break", 3, 3),
        ("idle", 4, 3),
        ("focus", 4, 3),
        ("long_break", 4, 4),
        ("idle", 1, 4),
    ]


def test_long_break_length() -> None:
    state = replace(started(), round=4)
    long_break = expire_at(state, T0 + minutes(25)).state
    assert long_break.ends_at == T0 + minutes(40)
    assert long_break.duration_seconds == 900


def test_set_of_one_has_only_long_breaks() -> None:
    settings = Settings(rounds_until_long_break=1)
    assert expire_at(started(settings), T0 + minutes(25), settings).state.phase == "long_break"


def test_start_clamps_a_round_beyond_a_shortened_set() -> None:
    settings = Settings(rounds_until_long_break=2)
    assert pomodoro.start(PomodoroState(round=4), settings, T0, ZONE).round == 2


def test_pause_keeps_the_remainder() -> None:
    paused = pomodoro.pause(started(), SETTINGS, T0 + minutes(10), ZONE)
    assert paused.phase == "focus"
    assert paused.ends_at is None
    assert paused.paused_remaining_seconds == 900
    assert paused.duration_seconds == 1500


def test_resume_arithmetic_with_fractions() -> None:
    at = T0 + timedelta(minutes=7, seconds=12, milliseconds=250)
    paused = pomodoro.pause(started(), SETTINGS, at, ZONE)
    assert paused.paused_remaining_seconds == 1067.75
    back = T0 + timedelta(hours=3)
    resumed = pomodoro.resume(paused, SETTINGS, back, ZONE)
    assert resumed.ends_at == back + timedelta(seconds=1067.75)
    assert resumed.paused_remaining_seconds is None


def test_repeated_pauses_add_up() -> None:
    state = started()
    at = T0
    for _ in range(4):
        at += minutes(5)
        state = pomodoro.pause(state, SETTINGS, at, ZONE)
        at += minutes(30)
        state = pomodoro.resume(state, SETTINGS, at, ZONE)
    assert state.ends_at == at + minutes(5)


def test_paused_timer_never_expires() -> None:
    paused = pomodoro.pause(started(), SETTINGS, T0 + minutes(1), ZONE)
    assert expire_at(paused, T0 + timedelta(hours=5)).steps == 0


@pytest.mark.parametrize(
    ("action", "state", "message"),
    [
        (pomodoro.pause, PomodoroState(), "not running"),
        (pomodoro.resume, PomodoroState(), "not paused"),
        (pomodoro.resume, started(), "not paused"),
        (pomodoro.stop, PomodoroState(), "not running"),
        (pomodoro.skip, PomodoroState(), "nothing to skip"),
        (pomodoro.pause, pomodoro.pause(started(), SETTINGS, T0, ZONE), "not running"),
        (pomodoro.start, pomodoro.pause(started(), SETTINGS, T0, ZONE), "already running"),
    ],
)
def test_refused_actions(action: pomodoro.Action, state: PomodoroState, message: str) -> None:
    with pytest.raises(MachineError, match=message):
        action(state, SETTINGS, T0, ZONE)


def test_skip_focus_goes_to_the_break_without_counting() -> None:
    at = T0 + minutes(3)
    state = pomodoro.skip(started(), SETTINGS, at, ZONE)
    assert state.phase == "short_break"
    assert state.ends_at == at + minutes(5)
    assert (state.round, state.rounds_today) == (1, 0)


def test_skip_while_paused() -> None:
    paused = pomodoro.pause(started(), SETTINGS, T0, ZONE)
    state = pomodoro.skip(paused, SETTINGS, T0 + minutes(1), ZONE)
    assert state.phase == "short_break"
    assert state.paused_remaining_seconds is None


def test_skip_break_moves_to_the_next_round() -> None:
    resting = expire_at(started(), T0 + minutes(25)).state
    state = pomodoro.skip(resting, SETTINGS, T0 + minutes(26), ZONE)
    assert (state.phase, state.round, state.rounds_today) == ("idle", 2, 1)


def test_skip_a_pending_break() -> None:
    settings = Settings(auto_start_breaks=False)
    pending = expire_at(started(settings), T0 + minutes(25), settings).state
    state = pomodoro.skip(pending, settings, T0 + minutes(26), ZONE)
    assert (state.phase, state.next_phase, state.round) == ("idle", "focus", 2)


def test_skip_long_break_starts_a_new_set() -> None:
    resting = expire_at(replace(started(), round=4), T0 + minutes(25)).state
    assert pomodoro.skip(resting, SETTINGS, T0 + minutes(26), ZONE).round == 1


def test_stop_focus_keeps_the_round_uncounted() -> None:
    state = pomodoro.stop(replace(started(), round=2), SETTINGS, T0 + minutes(1), ZONE)
    assert (state.phase, state.ends_at, state.round, state.rounds_today) == ("idle", None, 2, 0)


def test_stop_break_finishes_the_round() -> None:
    resting = expire_at(started(), T0 + minutes(25)).state
    state = pomodoro.stop(resting, SETTINGS, T0 + minutes(26), ZONE)
    assert (state.phase, state.round, state.next_phase, state.rounds_today) == (
        "idle",
        2,
        "focus",
        1,
    )


def test_stop_ignores_auto_start() -> None:
    settings = Settings(auto_start_focus=True)
    resting = expire_at(started(settings), T0 + minutes(25), settings).state
    assert pomodoro.stop(resting, settings, T0 + minutes(26), ZONE).phase == "idle"


def test_reset_clears_the_set_and_the_day() -> None:
    state = replace(expire_at(started(), T0 + minutes(25)).state, round=3)
    assert pomodoro.reset(state, SETTINGS, T0 + minutes(26), ZONE) == PomodoroState(rounds_date=DAY)


def test_new_day_resets_idle_counters() -> None:
    state = PomodoroState(round=3, rounds_today=7, rounds_date=DAY)
    rolled = pomodoro.roll_day(state, T0 + timedelta(days=1), ZONE)
    assert (rolled.round, rolled.rounds_today, rolled.rounds_date) == (1, 0, "2026-11-05")


def test_new_day_follows_the_local_midnight() -> None:
    state = PomodoroState(rounds_today=2, rounds_date=DAY)
    before = datetime.fromisoformat("2026-11-04T21:59:59+00:00")
    after = datetime.fromisoformat("2026-11-04T22:00:00+00:00")
    assert pomodoro.roll_day(state, before, ZONE) == state
    assert pomodoro.roll_day(state, after, ZONE).rounds_date == "2026-11-05"


def test_new_day_drops_a_pending_break() -> None:
    state = PomodoroState(round=2, next_phase="short_break", rounds_today=2, rounds_date=DAY)
    rolled = pomodoro.roll_day(state, T0 + timedelta(days=1), ZONE)
    assert (rolled.next_phase, rolled.round) == ("focus", 1)


def test_new_day_keeps_a_running_round() -> None:
    state = replace(started(), round=3, rounds_today=2)
    rolled = pomodoro.roll_day(state, T0 + timedelta(days=1), ZONE)
    assert (rolled.phase, rolled.round, rolled.rounds_today) == ("focus", 3, 0)


def test_focus_across_midnight_counts_for_the_new_day() -> None:
    late = datetime.fromisoformat("2026-11-04T21:50:00+00:00")
    state = replace(pomodoro.start(PomodoroState(), SETTINGS, late, ZONE), rounds_today=5)
    after = expire_at(state, late + minutes(25)).state
    assert (after.rounds_today, after.rounds_date) == (1, "2026-11-05")


def test_restart_after_a_phase_ended_advances_as_if_on_time() -> None:
    now = T0 + minutes(27)
    expiry = expire_at(started(), now)
    assert expiry.steps == 1
    assert expiry.state.phase == "short_break"
    assert expiry.state.ends_at == T0 + minutes(30)
    assert expiry.state.rounds_today == 1


def test_restart_runs_through_every_phase_that_ended() -> None:
    expiry = expire_at(started(), T0 + timedelta(hours=2))
    assert expiry.steps == 2
    assert (expiry.state.phase, expiry.state.round, expiry.state.rounds_today) == ("idle", 2, 1)


def test_restart_with_full_auto_replays_whole_set() -> None:
    settings = Settings(auto_start_focus=True)
    expiry = expire_at(started(settings), T0 + minutes(sum(ONE_SET)), settings)
    assert expiry.steps == 8
    assert (expiry.state.phase, expiry.state.round, expiry.state.rounds_today) == ("focus", 1, 4)


def test_restart_replay_from_the_same_stored_state_is_deterministic() -> None:
    stored = started()
    now = T0 + minutes(40)
    assert expire_at(stored, now) == expire_at(stored, now)
    assert expire_at(expire_at(stored, now).state, now).steps == 0


def test_restart_on_a_later_day_only_keeps_that_day() -> None:
    expiry = expire_at(started(), T0 + timedelta(days=2))
    assert expiry.steps == 2
    state = expiry.state
    assert (state.phase, state.round, state.rounds_today, state.rounds_date) == (
        "idle",
        1,
        0,
        "2026-11-06",
    )


def test_changed_settings_leave_the_running_phase_alone() -> None:
    state = started()
    longer = Settings(focus_minutes=90)
    assert expire_at(state, T0 + minutes(25), longer).steps == 1


def test_round_trip() -> None:
    paused = pomodoro.pause(replace(started(), round=2), SETTINGS, T0 + minutes(1.5), ZONE)
    for state in (PomodoroState(), started(), paused):
        assert PomodoroState.from_dict(state.to_dict()) == state


VALID: dict[str, Any] = PomodoroState().to_dict()


@pytest.mark.parametrize(
    "broken",
    [
        {"phase": "nap"},
        {"round": 0},
        {"rounds_today": -1},
        {"next_phase": "idle"},
        {"rounds_date": "soon"},
        {"rounds_date": 5},
        {"ends_at": "2026-11-04T07:00:00+00:00"},
        {"paused_remaining_seconds": 3},
        {"duration_seconds": 60},
        {"phase": "focus"},
        {"phase": "focus", "duration_seconds": 60},
        {"phase": "focus", "paused_remaining_seconds": 3},
        {
            "phase": "focus",
            "duration_seconds": 60,
            "paused_remaining_seconds": -1,
        },
        {
            "phase": "focus",
            "duration_seconds": 60,
            "paused_remaining_seconds": 1,
            "ends_at": "2026-11-04T07:00:00+00:00",
        },
        {
            "phase": "focus",
            "duration_seconds": 60,
            "paused_remaining_seconds": 1,
            "next_phase": "long_break",
        },
        {"surprise": True},
    ],
)
def test_invalid_state_is_rejected(broken: dict[str, Any]) -> None:
    with pytest.raises(ValidationError):
        PomodoroState.from_dict(VALID | broken)


def test_settings_defaults() -> None:
    assert Settings.from_dict({}) == Settings(
        focus_minutes=25,
        short_break_minutes=5,
        long_break_minutes=15,
        rounds_until_long_break=4,
        auto_start_breaks=True,
        auto_start_focus=False,
    )


@pytest.mark.parametrize(
    "broken",
    [
        {"focus_minutes": 0},
        {"focus_minutes": 1441},
        {"focus_minutes": "25"},
        {"focus_minutes": True},
        {"short_break_minutes": 0},
        {"long_break_minutes": 2000},
        {"rounds_until_long_break": 0},
        {"rounds_until_long_break": 13},
        {"auto_start_breaks": "yes"},
        {"auto_start_focus": 1},
    ],
)
def test_invalid_settings_are_rejected(broken: dict[str, Any]) -> None:
    with pytest.raises(ValidationError):
        Settings.from_dict(broken)
