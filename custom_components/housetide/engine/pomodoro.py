from collections.abc import Callable
from dataclasses import dataclass, replace
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from .machine import MachineError
from .models import PomodoroPhase, PomodoroState, Settings, as_utc

type Action = Callable[[PomodoroState, Settings, datetime, ZoneInfo], PomodoroState]


class PomodoroError(MachineError):
    pass


@dataclass(frozen=True, slots=True)
class Expiry:
    state: PomodoroState
    steps: int


def _local_date(moment: datetime, zone: ZoneInfo) -> str:
    return as_utc(moment).astimezone(zone).date().isoformat()


def _seconds(phase: PomodoroPhase, settings: Settings) -> int:
    minutes = {
        "focus": settings.focus_minutes,
        "short_break": settings.short_break_minutes,
        "long_break": settings.long_break_minutes,
    }
    return minutes[phase] * 60


def _begin(
    state: PomodoroState, phase: PomodoroPhase, settings: Settings, at: datetime
) -> PomodoroState:
    seconds = _seconds(phase, settings)
    return replace(
        state,
        phase=phase,
        ends_at=as_utc(at) + timedelta(seconds=seconds),
        paused_remaining_seconds=None,
        duration_seconds=seconds,
        next_phase="focus",
    )


def _rest(state: PomodoroState, next_phase: PomodoroPhase, round_number: int) -> PomodoroState:
    return replace(
        state,
        phase="idle",
        ends_at=None,
        paused_remaining_seconds=None,
        duration_seconds=None,
        next_phase=next_phase,
        round=round_number,
    )


def _round_after(state: PomodoroState, finished: PomodoroPhase) -> int:
    return 1 if finished == "long_break" else state.round + 1


def _finish(
    state: PomodoroState,
    finished: PomodoroPhase,
    settings: Settings,
    at: datetime,
    *,
    counted: bool,
) -> PomodoroState:
    if finished == "focus":
        if counted:
            state = replace(state, rounds_today=state.rounds_today + 1)
        follows: PomodoroPhase = (
            "long_break" if state.round >= settings.rounds_until_long_break else "short_break"
        )
        if settings.auto_start_breaks:
            return _begin(state, follows, settings, at)
        return _rest(state, follows, state.round)
    next_round = _round_after(state, finished)
    if settings.auto_start_focus:
        return _begin(replace(state, round=next_round), "focus", settings, at)
    return _rest(state, "focus", next_round)


def roll_day(state: PomodoroState, now: datetime, zone: ZoneInfo) -> PomodoroState:
    today = _local_date(now, zone)
    if state.rounds_date == today:
        return state
    fresh = replace(state, rounds_today=0, rounds_date=today)
    if state.rounds_date is None or state.phase != "idle":
        return fresh
    return replace(fresh, round=1, next_phase="focus")


def expire(state: PomodoroState, settings: Settings, now: datetime, zone: ZoneInfo) -> Expiry:
    now = as_utc(now)
    steps = 0
    while state.ends_at is not None and state.ends_at <= now:
        ended = state.ends_at
        state = _finish(roll_day(state, ended, zone), state.phase, settings, ended, counted=True)
        steps += 1
    return Expiry(roll_day(state, now, zone), steps)


def start(state: PomodoroState, settings: Settings, now: datetime, zone: ZoneInfo) -> PomodoroState:
    state = roll_day(state, now, zone)
    if state.phase != "idle":
        raise PomodoroError("the timer is already running")
    if state.next_phase == "focus":
        state = replace(state, round=min(state.round, settings.rounds_until_long_break))
    return _begin(state, state.next_phase, settings, now)


def pause(
    state: PomodoroState, _settings: Settings, now: datetime, zone: ZoneInfo
) -> PomodoroState:
    state = roll_day(state, now, zone)
    if state.ends_at is None:
        raise PomodoroError("the timer is not running")
    remaining = max(0.0, (state.ends_at - as_utc(now)).total_seconds())
    return replace(state, ends_at=None, paused_remaining_seconds=remaining)


def resume(
    state: PomodoroState, _settings: Settings, now: datetime, zone: ZoneInfo
) -> PomodoroState:
    state = roll_day(state, now, zone)
    if state.paused_remaining_seconds is None:
        raise PomodoroError("the timer is not paused")
    return replace(
        state,
        ends_at=as_utc(now) + timedelta(seconds=state.paused_remaining_seconds),
        paused_remaining_seconds=None,
    )


def skip(state: PomodoroState, settings: Settings, now: datetime, zone: ZoneInfo) -> PomodoroState:
    state = roll_day(state, now, zone)
    finished = state.next_phase if state.phase == "idle" else state.phase
    if state.phase == "idle" and finished == "focus":
        raise PomodoroError("there is nothing to skip")
    return _finish(state, finished, settings, now, counted=False)


def stop(state: PomodoroState, _settings: Settings, now: datetime, zone: ZoneInfo) -> PomodoroState:
    state = roll_day(state, now, zone)
    if state.phase == "idle":
        raise PomodoroError("the timer is not running")
    if state.phase == "focus":
        return _rest(state, "focus", state.round)
    return _rest(state, "focus", _round_after(state, state.phase))


def reset(
    _state: PomodoroState, _settings: Settings, now: datetime, zone: ZoneInfo
) -> PomodoroState:
    return PomodoroState(rounds_date=_local_date(now, zone))


ACTIONS: dict[str, Action] = {
    "start": start,
    "pause": pause,
    "resume": resume,
    "skip": skip,
    "stop": stop,
    "reset": reset,
}
SERVICE_ACTIONS = ("start", "pause", "resume", "skip", "stop")
