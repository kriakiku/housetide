from typing import Any

import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.housetide.manager import HousetideManager

from .conftest import chain, daily, travel


async def todo_items(hass: HomeAssistant) -> list[dict[str, Any]]:
    result: Any = await hass.services.async_call(
        "todo",
        "get_items",
        {},
        target={"entity_id": "todo.housetide"},
        blocking=True,
        return_response=True,
    )
    return result["todo.housetide"]["items"]


async def test_sensor_follows_task_lifecycle(
    hass: HomeAssistant, manager: HousetideManager, entity_registry: er.EntityRegistry
) -> None:
    assert hass.states.async_entity_ids("sensor") == ["sensor.housetide_pomodoro"]
    task = manager.async_create_task(daily())
    await hass.async_block_till_done()
    entity_id = "sensor.housetide_pills"
    state = hass.states.get(entity_id)
    assert state is not None
    assert state.state == "upcoming"
    assert state.attributes["task_id"] == task.id
    assert state.attributes["scene"]["name"] == "pills"
    assert state.attributes["friendly_name"] == "Housetide Pills"
    assert entity_registry.async_get_entity_id("sensor", "housetide", f"housetide_{task.id}")

    manager.async_update_task({**task.to_dict(), "title": "Vitamins", "icon": "mdi:pill"})
    await hass.async_block_till_done()
    state = hass.states.get(entity_id)
    assert state is not None
    assert state.attributes["friendly_name"] == "Housetide Vitamins"
    assert state.attributes["icon"] == "mdi:pill"

    manager.async_delete_task(task.id)
    await hass.async_block_till_done()
    assert hass.states.get(entity_id) is None
    assert entity_registry.async_get(entity_id) is None


async def test_orphaned_sensors_are_removed_at_startup(
    hass: HomeAssistant,
    config_entry: MockConfigEntry,
    manager: HousetideManager,
    entity_registry: er.EntityRegistry,
) -> None:
    orphan = entity_registry.async_get_or_create(
        "sensor", "housetide", "housetide_gone", config_entry=config_entry
    )
    assert await hass.config_entries.async_reload(config_entry.entry_id)
    await hass.async_block_till_done()
    assert entity_registry.async_get(orphan.entity_id) is None


async def test_sensor_skips_writes_without_visible_change(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, manager: HousetideManager
) -> None:
    manager.async_create_task(chain())
    await travel(hass, freezer, seconds=31)
    before = hass.states.get("sensor.housetide_chain")
    await travel(hass, freezer, seconds=31)
    assert hass.states.get("sensor.housetide_chain") is before


async def test_binary_sensor_counts_due_tasks(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, manager: HousetideManager
) -> None:
    state = hass.states.get("binary_sensor.housetide_due")
    assert state is not None
    assert state.state == "off"
    assert state.attributes["count"] == 0
    first = manager.async_create_task(chain(title="A"))
    manager.async_create_task(chain(title="B"))
    await travel(hass, freezer, hours=23)
    state = hass.states.get("binary_sensor.housetide_due")
    assert state is not None
    assert state.state == "on"
    assert state.attributes["count"] == 2
    manager.async_skip(first.id)
    await hass.async_block_till_done()
    state = hass.states.get("binary_sensor.housetide_due")
    assert state is not None
    assert state.attributes["count"] == 1


async def test_todo_lists_today_and_completion_advances(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, manager: HousetideManager
) -> None:
    task = manager.async_create_task(chain())
    state = hass.states.get("todo.housetide")
    assert state is not None
    assert state.state == "0"
    assert await todo_items(hass) == []

    await travel(hass, freezer, hours=23)
    state = hass.states.get("todo.housetide")
    assert state is not None
    assert state.state == "1"
    items = await todo_items(hass)
    assert items[0]["uid"] == task.id
    assert items[0]["summary"] == "Chain: One"
    assert items[0]["status"] == "needs_action"

    await hass.services.async_call(
        "todo",
        "update_item",
        {"item": task.id, "status": "completed"},
        target={"entity_id": "todo.housetide"},
        blocking=True,
    )
    await hass.async_block_till_done()
    assert manager.runtimes[task.id].stage_index == 1
    assert manager.history(task.id, limit=1)[0]["source"] == "todo"
    items = await todo_items(hass)
    assert items[0]["summary"] == "Chain: Two"

    await hass.services.async_call(
        "todo",
        "update_item",
        {"item": task.id, "status": "completed"},
        target={"entity_id": "todo.housetide"},
        blocking=True,
    )
    await hass.async_block_till_done()
    assert await todo_items(hass) == []
    assert manager.view(task.id)["status"] == "clean"


async def test_todo_refuses_renaming(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, manager: HousetideManager
) -> None:
    task = manager.async_create_task(chain())
    await travel(hass, freezer, hours=23)
    with pytest.raises(ServiceValidationError):
        await hass.services.async_call(
            "todo",
            "update_item",
            {"item": task.id, "rename": "Other"},
            target={"entity_id": "todo.housetide"},
            blocking=True,
        )
    assert manager.runtimes[task.id].stage_index == 0
