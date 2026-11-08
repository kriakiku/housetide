import math
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Any

from .models import INDETERMINATE_STATES, Trigger, as_utc


def evaluate(trigger: Trigger, value: Any) -> bool | None:
    if value is None or (isinstance(value, str) and value in INDETERMINATE_STATES):
        return None
    if trigger.state is not None:
        return str(value) == trigger.state
    number = _as_number(value)
    if number is None:
        return None
    if trigger.above is not None:
        return number > trigger.above
    return trigger.below is not None and number < trigger.below


def _as_number(value: Any) -> float | None:
    if isinstance(value, bool):
        return None
    try:
        number = float(value)
    except TypeError, ValueError:
        return None
    return number if math.isfinite(number) else None


@dataclass(slots=True)
class TriggerHold:
    trigger: Trigger
    latched: bool = False
    held_since: datetime | None = None
    _indeterminate: bool = field(default=False, repr=False)

    @property
    def deadline(self) -> datetime | None:
        if self.latched or self.held_since is None:
            return None
        return self.held_since + timedelta(seconds=self.trigger.for_seconds)

    def feed(self, value: Any, now: datetime) -> bool:
        now = as_utc(now)
        matched = evaluate(self.trigger, value)
        self._indeterminate = matched is None
        if matched is None:
            return False
        if not matched:
            self.held_since = None
            self.latched = False
            return False
        if self.held_since is None:
            self.held_since = now
        return self.check(now)

    def check(self, now: datetime) -> bool:
        deadline = self.deadline
        if deadline is None or self._indeterminate or as_utc(now) < deadline:
            return False
        self.latched = True
        return True
