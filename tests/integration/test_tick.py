from datetime import datetime
from typing import Any

from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from pytest_homeassistant_custom_component.common import async_capture_events

from custom_components.housetide.const import SIGNAL_UPDATED
from custom_components.housetide.manager import HousetideManager

from .conftest import chain, daily, stored_events, travel


async def test_due_event_fires_once_per_occurrence(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, manager: HousetideManager
) -> None:
    due = async_capture_events(hass, "housetide_task_due")
    task = manager.async_create_task(chain(title="Carry"))
    await travel(hass, freezer, hours=23)
    assert manager.view(task.id)["status"] == "due"
    assert len(due) == 1
    assert due[0].data == {
        "task_id": task.id,
        "title": "Carry",
        "stage_id": "one",
        "source": "schedule",
    }
    await travel(hass, freezer, minutes=5)
    assert len(due) == 1


async def test_rollover_on_tick_logs_missed(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, manager: HousetideManager
) -> None:
    missed = async_capture_events(hass, "housetide_task_missed")
    due = async_capture_events(hass, "housetide_task_due")
    task = manager.async_create_task(daily())
    first = manager.runtimes[task.id].occurrence_id
    await travel(hass, freezer, hours=23)
    assert manager.runtimes[task.id].occurrence_id == first
    await travel(hass, freezer, hours=24)
    assert manager.runtimes[task.id].occurrence_id != first
    assert [e["type"] for e in stored_events(manager, task.id)] == ["created", "missed"]
    assert missed[0].data["source"] == "schedule"
    assert len(due) == 2


async def test_rollover_catches_up_after_a_gap(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, manager: HousetideManager
) -> None:
    task = manager.async_create_task(daily())
    await travel(hass, freezer, days=4)
    assert [e["type"] for e in stored_events(manager, task.id)].count("missed") == 3


async def test_carry_stays_overdue(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, manager: HousetideManager
) -> None:
    task = manager.async_create_task(chain())
    occurrence = manager.runtimes[task.id].occurrence_id
    await travel(hass, freezer, days=3)
    assert manager.runtimes[task.id].occurrence_id == occurrence
    assert manager.view(task.id)["status"] == "overdue"


async def test_started_occurrence_is_never_rolled_over(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, manager: HousetideManager
) -> None:
    task = manager.async_create_task(chain(on_missed="skip"))
    manager.async_advance(task.id)
    await travel(hass, freezer, days=3)
    assert manager.runtimes[task.id].stage_index == 1
    assert "missed" not in [e["type"] for e in stored_events(manager, task.id)]


async def test_due_not_repeated_after_undoing_a_due_occurrence(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, manager: HousetideManager
) -> None:
    due = async_capture_events(hass, "housetide_task_due")
    task = manager.async_create_task(chain())
    await travel(hass, freezer, hours=23)
    manager.async_skip(task.id)
    manager.async_undo(task.id)
    await travel(hass, freezer, minutes=1)
    assert len(due) == 1


async def test_tick_notifies_only_on_visible_change(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, manager: HousetideManager
) -> None:
    task = manager.async_create_task(chain())
    await travel(hass, freezer, seconds=31)
    calls: list[int] = []
    unsub = async_dispatcher_connect(hass, SIGNAL_UPDATED, lambda: calls.append(1))
    await travel(hass, freezer, seconds=31)
    assert calls == []
    await travel(hass, freezer, hours=23)
    assert calls
    assert manager.view(task.id)["status"] == "due"
    unsub()


async def test_views_use_home_assistant_zone_for_today(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, manager: HousetideManager
) -> None:
    task = manager.async_create_task(daily())
    view: dict[str, Any] = manager.view(task.id)
    assert datetime.fromisoformat(view["due_at"]).isoformat() == "2026-11-05T06:00:00+00:00"
    assert view["is_today"] is False
    freezer.move_to("2026-11-04T23:30:00+00:00")
    assert manager.view(task.id)["is_today"] is True


async def test_retention_prunes_on_tick(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, manager: HousetideManager
) -> None:
    manager.async_update_settings({"history_retention_days": 2})
    task = manager.async_create_task(chain())
    await travel(hass, freezer, days=3)
    assert stored_events(manager, task.id) == []
