from datetime import timedelta
from typing import Any

from freezegun.api import FrozenDateTimeFactory
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED
from homeassistant.core import CoreState, HomeAssistant
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_capture_events,
)

from custom_components.housetide.const import DOMAIN, HISTORY_CAP
from custom_components.housetide.engine.models import HistoryEvent
from custom_components.housetide.manager import HousetideManager, get_manager

from .conftest import START, chain, daily, travel


async def start_with(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, storage: dict[str, Any], tasks: dict
) -> HousetideManager:
    storage["housetide.tasks"] = {"version": 1, "minor_version": 1, "key": "x", "data": tasks}
    freezer.move_to(START)
    await hass.config.async_set_time_zone("Europe/Kyiv")
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    manager = get_manager(hass)
    assert manager is not None
    return manager


async def test_saves_are_delayed(
    hass: HomeAssistant,
    freezer: FrozenDateTimeFactory,
    manager: HousetideManager,
    hass_storage: dict[str, Any],
) -> None:
    await travel(hass, freezer, seconds=60)
    hass_storage.pop("housetide.tasks", None)
    hass_storage.pop("housetide.history", None)
    task = manager.async_create_task(daily())
    await hass.async_block_till_done()
    assert "housetide.tasks" not in hass_storage
    await travel(hass, freezer, seconds=6)
    assert hass_storage["housetide.tasks"]["data"]["tasks"][0]["id"] == task.id
    assert hass_storage["housetide.tasks"]["version"] == 1
    await travel(hass, freezer, seconds=10)
    assert hass_storage["housetide.history"]["data"]["events"][0]["type"] == "created"


async def test_state_survives_restart(
    hass: HomeAssistant,
    config_entry: MockConfigEntry,
    manager: HousetideManager,
    hass_storage: dict[str, Any],
) -> None:
    task = manager.async_create_task(chain())
    manager.async_advance(task.id)
    manager.async_update_settings({"history_retention_days": 30})
    runtime = manager.runtimes[task.id]
    assert await hass.config_entries.async_unload(config_entry.entry_id)
    assert hass_storage["housetide.tasks"]["data"]["runtimes"][0]["stage_index"] == 1
    assert await hass.config_entries.async_setup(config_entry.entry_id)
    await hass.async_block_till_done()
    fresh = get_manager(hass)
    assert fresh is not None and fresh is not manager
    assert fresh.tasks == {task.id: task}
    assert fresh.runtimes[task.id] == runtime
    assert fresh.settings.history_retention_days == 30
    assert [e["type"] for e in fresh.history(task.id)] == ["advanced", "started", "created"]


async def test_catch_up_runs_at_startup(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, hass_storage: dict[str, Any]
) -> None:
    runtime = {
        "task_id": "pills",
        "occurrence_id": "old",
        "due_at": (START - timedelta(days=3)).isoformat(),
        "stage_index": 0,
        "stage_entered_at": (START - timedelta(days=4)).isoformat(),
        "started_at": None,
        "last_completed_at": None,
        "next_due_at": (START - timedelta(days=2)).isoformat(),
        "clean_until": None,
        "undo": None,
    }
    manager = await start_with(
        hass,
        freezer,
        hass_storage,
        {"tasks": [daily(id="pills")], "runtimes": [runtime], "settings": {}},
    )
    assert manager.runtimes["pills"].occurrence_id != "old"
    assert [e["type"] for e in manager.history("pills")].count("missed") == 3


async def test_due_announced_only_once_across_restart(
    hass: HomeAssistant,
    freezer: FrozenDateTimeFactory,
    config_entry: MockConfigEntry,
    manager: HousetideManager,
) -> None:
    due = async_capture_events(hass, "housetide_task_due")
    manager.async_create_task(chain())
    await travel(hass, freezer, hours=23)
    assert len(due) == 1
    assert await hass.config_entries.async_reload(config_entry.entry_id)
    await hass.async_block_till_done()
    assert len(due) == 1


async def test_invalid_records_are_skipped(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, hass_storage: dict[str, Any]
) -> None:
    hass_storage["housetide.history"] = {
        "version": 1,
        "minor_version": 1,
        "key": "x",
        "data": {"events": [{"id": "broken"}]},
    }
    manager = await start_with(
        hass,
        freezer,
        hass_storage,
        {"tasks": [{"id": "bad"}, daily(id="good")], "runtimes": [], "settings": "nope"},
    )
    assert list(manager.tasks) == ["good"]
    assert "good" in manager.runtimes
    assert manager.settings.history_retention_days == 365
    assert manager.history() == []


async def test_older_minor_version_loads(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, hass_storage: dict[str, Any]
) -> None:
    hass_storage["housetide.tasks"] = {
        "version": 1,
        "minor_version": 0,
        "key": "housetide.tasks",
        "data": {"tasks": [daily(id="kept")], "runtimes": [], "settings": {}},
    }
    freezer.move_to(START)
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    manager = get_manager(hass)
    assert manager is not None
    assert "kept" in manager.tasks


async def test_history_cap(hass: HomeAssistant, manager: HousetideManager) -> None:
    task = manager.async_create_task(daily())
    manager._events = [
        HistoryEvent(
            id=f"e{index}",
            ts=START,
            task_id=task.id,
            task_title="x",
            type="skipped",
            source="manual",
        )
        for index in range(HISTORY_CAP)
    ]
    manager.async_skip(task.id)
    assert len(manager._events) == HISTORY_CAP
    assert manager._events[0].id == "e1"


async def test_oversized_stored_retention_falls_back(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, hass_storage: dict[str, Any]
) -> None:
    manager = await start_with(
        hass,
        freezer,
        hass_storage,
        {"tasks": [], "runtimes": [], "settings": {"history_retention_days": 800000}},
    )
    assert manager.settings.history_retention_days == 365


async def test_startup_events_wait_for_home_assistant_started(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, hass_storage: dict[str, Any]
) -> None:
    runtime = {
        "task_id": "pills",
        "occurrence_id": "o1",
        "due_at": (START - timedelta(hours=2)).isoformat(),
        "stage_index": 0,
        "stage_entered_at": (START - timedelta(days=1)).isoformat(),
        "started_at": None,
        "last_completed_at": None,
        "next_due_at": (START - timedelta(hours=1)).isoformat(),
        "clean_until": None,
        "undo": None,
    }
    due = async_capture_events(hass, "housetide_task_due")
    missed = async_capture_events(hass, "housetide_task_missed")
    hass.set_state(CoreState.not_running)
    await start_with(
        hass,
        freezer,
        hass_storage,
        {"tasks": [daily(id="pills")], "runtimes": [runtime], "settings": {}},
    )
    assert due == []
    assert missed == []
    hass.set_state(CoreState.running)
    hass.bus.async_fire(EVENT_HOMEASSISTANT_STARTED)
    await hass.async_block_till_done()
    assert len(due) == 1
    assert len(missed) == 1
