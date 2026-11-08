from typing import Any

import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_capture_events

from custom_components.housetide.engine.models import Task
from custom_components.housetide.manager import HousetideManager, get_manager

from .conftest import POWER, laundry, set_power, stored_events, travel


@pytest.fixture
async def washer(hass: HomeAssistant, manager: HousetideManager) -> Task:
    await set_power(hass, "0")
    return manager.async_create_task(laundry(manager))


def stage(manager: HousetideManager, task: Task) -> int:
    return manager.runtimes[task.id].stage_index


async def run_to_washing(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, manager: HousetideManager, task: Task
) -> None:
    await set_power(hass, "1500")
    await travel(hass, freezer, seconds=61)
    assert stage(manager, task) == 1


async def test_full_laundry_cycle(
    hass: HomeAssistant,
    freezer: FrozenDateTimeFactory,
    manager: HousetideManager,
    washer: Task,
) -> None:
    advanced = async_capture_events(hass, "housetide_task_advanced")
    completed = async_capture_events(hass, "housetide_task_completed")

    await set_power(hass, "1500")
    await travel(hass, freezer, seconds=59)
    assert stage(manager, washer) == 0
    await travel(hass, freezer, seconds=2)
    assert stage(manager, washer) == 1
    assert manager.view(washer.id)["scene"]["state"] == "running"

    await set_power(hass, "2")
    await travel(hass, freezer, seconds=299)
    assert stage(manager, washer) == 1
    await travel(hass, freezer, seconds=2)
    assert stage(manager, washer) == 2
    assert manager.view(washer.id)["scene"]["state"] == "waiting"

    assert [event.data["stage_id"] for event in advanced] == ["wash", "hang"]
    assert all(event.data["source"] == "trigger" for event in advanced)
    assert advanced[0].data["task_id"] == washer.id
    assert advanced[0].data["title"] == "Laundry"
    assert [(e["type"], e["source"]) for e in stored_events(manager, washer.id)] == [
        ("created", "manual"),
        ("started", "trigger"),
        ("advanced", "trigger"),
        ("advanced", "trigger"),
    ]

    manager.async_advance(washer.id)
    await hass.async_block_till_done()
    assert stage(manager, washer) == 0
    assert manager.view(washer.id)["status"] == "clean"
    assert completed[0].data["source"] == "manual"


async def test_dip_shorter_than_hold_restarts_nothing_early(
    hass: HomeAssistant,
    freezer: FrozenDateTimeFactory,
    manager: HousetideManager,
    washer: Task,
) -> None:
    await run_to_washing(hass, freezer, manager, washer)
    await set_power(hass, "2")
    await travel(hass, freezer, seconds=200)
    await set_power(hass, "900")
    await travel(hass, freezer, seconds=200)
    assert stage(manager, washer) == 1
    await set_power(hass, "2")
    await travel(hass, freezer, seconds=299)
    assert stage(manager, washer) == 1
    await travel(hass, freezer, seconds=2)
    assert stage(manager, washer) == 2


@pytest.mark.parametrize("value", ["unavailable", "unknown", "garbage"])
async def test_indeterminate_values_do_not_reset_hold(
    hass: HomeAssistant,
    freezer: FrozenDateTimeFactory,
    manager: HousetideManager,
    washer: Task,
    value: str,
) -> None:
    await set_power(hass, "1500")
    await travel(hass, freezer, seconds=40)
    await set_power(hass, value)
    await travel(hass, freezer, seconds=10)
    await set_power(hass, "1500")
    await travel(hass, freezer, seconds=9)
    assert stage(manager, washer) == 0
    await travel(hass, freezer, seconds=2)
    assert stage(manager, washer) == 1


async def test_indeterminate_at_deadline_fires_on_next_real_match(
    hass: HomeAssistant,
    freezer: FrozenDateTimeFactory,
    manager: HousetideManager,
    washer: Task,
) -> None:
    await set_power(hass, "1500")
    await travel(hass, freezer, seconds=30)
    await set_power(hass, "unavailable")
    await travel(hass, freezer, seconds=120)
    assert stage(manager, washer) == 0
    await set_power(hass, "1500")
    assert stage(manager, washer) == 1


async def test_entity_removed_does_not_reset_hold(
    hass: HomeAssistant,
    freezer: FrozenDateTimeFactory,
    manager: HousetideManager,
    washer: Task,
) -> None:
    await set_power(hass, "1500")
    await travel(hass, freezer, seconds=40)
    hass.states.async_remove(POWER)
    await hass.async_block_till_done()
    await travel(hass, freezer, seconds=30)
    assert stage(manager, washer) == 0
    await set_power(hass, "1500")
    assert stage(manager, washer) == 1


async def test_entity_appearing_later_starts_hold(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, manager: HousetideManager
) -> None:
    task = manager.async_create_task(laundry(manager, "sensor.late"))
    hass.states.async_set("sensor.late", "1500")
    await hass.async_block_till_done()
    await travel(hass, freezer, seconds=59)
    assert stage(manager, task) == 0
    await travel(hass, freezer, seconds=2)
    assert stage(manager, task) == 1


async def test_tripping_upcoming_task_starts_early(
    hass: HomeAssistant,
    freezer: FrozenDateTimeFactory,
    manager: HousetideManager,
    washer: Task,
) -> None:
    assert manager.view(washer.id)["status"] == "upcoming"
    await run_to_washing(hass, freezer, manager, washer)
    assert manager.view(washer.id)["status"] == "in_progress"


async def test_manual_advance_waits_for_the_machine_to_really_run(
    hass: HomeAssistant,
    freezer: FrozenDateTimeFactory,
    manager: HousetideManager,
    washer: Task,
) -> None:
    manager.async_advance(washer.id)
    await travel(hass, freezer, seconds=600)
    assert stage(manager, washer) == 1
    await set_power(hass, "1500")
    await travel(hass, freezer, seconds=600)
    assert stage(manager, washer) == 1
    await set_power(hass, "1")
    await travel(hass, freezer, seconds=301)
    assert stage(manager, washer) == 2


async def test_undo_does_not_refire_while_condition_holds(
    hass: HomeAssistant,
    freezer: FrozenDateTimeFactory,
    manager: HousetideManager,
    washer: Task,
) -> None:
    await run_to_washing(hass, freezer, manager, washer)
    manager.async_undo(washer.id)
    await travel(hass, freezer, seconds=600)
    assert stage(manager, washer) == 0
    await set_power(hass, "0")
    await set_power(hass, "1500")
    await travel(hass, freezer, seconds=61)
    assert stage(manager, washer) == 1


async def test_single_stage_instant_trigger_completes_once(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, manager: HousetideManager
) -> None:
    hass.states.async_set("binary_sensor.door", "off")
    await hass.async_block_till_done()
    completed = async_capture_events(hass, "housetide_task_completed")
    task = manager.async_create_task(
        {
            "title": "Door",
            "schedule": {"type": "daily", "time": "08:00"},
            "on_missed": "carry",
            "scene": "generic",
            "stages": [
                {
                    "id": "open",
                    "title": "Open",
                    "role": "todo",
                    "complete_when": {"entity_id": "binary_sensor.door", "state": "on"},
                }
            ],
        }
    )
    hass.states.async_set("binary_sensor.door", "on")
    await hass.async_block_till_done()
    assert len(completed) == 1
    assert completed[0].data["source"] == "trigger"
    await travel(hass, freezer, seconds=120)
    assert len(completed) == 1
    hass.states.async_set("binary_sensor.door", "off")
    await hass.async_block_till_done()
    hass.states.async_set("binary_sensor.door", "on")
    await hass.async_block_till_done()
    assert len(completed) == 2
    assert manager.view(task.id)["status"] == "clean"


async def test_restart_begins_hold_at_startup(
    hass: HomeAssistant,
    freezer: FrozenDateTimeFactory,
    config_entry: MockConfigEntry,
    manager: HousetideManager,
    washer: Task,
) -> None:
    await set_power(hass, "1500")
    await travel(hass, freezer, seconds=40)
    assert await hass.config_entries.async_reload(config_entry.entry_id)
    await hass.async_block_till_done()
    fresh = get_manager(hass)
    assert fresh is not None
    await travel(hass, freezer, seconds=40)
    assert stage(fresh, washer) == 0
    await travel(hass, freezer, seconds=21)
    assert stage(fresh, washer) == 1


async def test_disabled_task_ignores_triggers(
    hass: HomeAssistant,
    freezer: FrozenDateTimeFactory,
    manager: HousetideManager,
    washer: Task,
) -> None:
    manager.async_update_task({**washer.to_dict(), "enabled": False})
    assert manager._unwatch is None
    await set_power(hass, "1500")
    await travel(hass, freezer, seconds=120)
    assert stage(manager, washer) == 0


async def test_editing_trigger_moves_the_listener(
    hass: HomeAssistant,
    freezer: FrozenDateTimeFactory,
    manager: HousetideManager,
    washer: Task,
) -> None:
    data: dict[str, Any] = washer.to_dict()
    data["stages"][0]["complete_when"]["entity_id"] = "sensor.other"
    manager.async_update_task(data)
    await set_power(hass, "1500")
    await travel(hass, freezer, seconds=120)
    assert stage(manager, washer) == 0
    hass.states.async_set("sensor.other", "1500")
    await hass.async_block_till_done()
    await travel(hass, freezer, seconds=61)
    assert stage(manager, washer) == 1


async def test_unrelated_edit_keeps_running_hold(
    hass: HomeAssistant,
    freezer: FrozenDateTimeFactory,
    manager: HousetideManager,
    washer: Task,
) -> None:
    await set_power(hass, "1500")
    await travel(hass, freezer, seconds=40)
    manager.async_update_task({**washer.to_dict(), "title": "Washing"})
    await travel(hass, freezer, seconds=21)
    assert stage(manager, washer) == 1


async def test_deleted_task_stops_listening(
    hass: HomeAssistant,
    freezer: FrozenDateTimeFactory,
    manager: HousetideManager,
    washer: Task,
) -> None:
    await set_power(hass, "1500")
    manager.async_delete_task(washer.id)
    assert manager._unwatch is None
    await travel(hass, freezer, seconds=120)
    assert manager.tasks == {}
