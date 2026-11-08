import pytest
from homeassistant.core import Context, Event, HomeAssistant, callback
from homeassistant.exceptions import ServiceValidationError
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_capture_events

from custom_components.housetide.const import DOMAIN
from custom_components.housetide.manager import HousetideManager

from .conftest import chain, daily


async def test_services_drive_the_task(hass: HomeAssistant, manager: HousetideManager) -> None:
    task = manager.async_create_task(chain())
    advanced = async_capture_events(hass, "housetide_task_advanced")
    skipped = async_capture_events(hass, "housetide_task_skipped")
    context = Context(user_id="someone")

    await hass.services.async_call(
        DOMAIN, "advance", {"task_id": task.id}, blocking=True, context=context
    )
    assert manager.runtimes[task.id].stage_index == 1
    latest = manager.history(task.id, limit=1)[0]
    assert (latest["source"], latest["user_id"]) == ("service", "someone")
    await hass.async_block_till_done()
    assert advanced[0].data["source"] == "service"

    await hass.services.async_call(DOMAIN, "undo", {"task_id": task.id}, blocking=True)
    assert manager.runtimes[task.id].stage_index == 0

    await hass.services.async_call(DOMAIN, "skip", {"task_id": task.id}, blocking=True)
    await hass.async_block_till_done()
    assert skipped[0].data["task_id"] == task.id


async def test_completion_fires_event(hass: HomeAssistant, manager: HousetideManager) -> None:
    task = manager.async_create_task(daily())
    completed = async_capture_events(hass, "housetide_task_completed")
    await hass.services.async_call(DOMAIN, "advance", {"task_id": task.id}, blocking=True)
    await hass.async_block_till_done()
    assert completed[0].data == {
        "task_id": task.id,
        "title": "Pills",
        "stage_id": "take",
        "source": "service",
    }


async def test_bus_events_see_updated_entities(
    hass: HomeAssistant, manager: HousetideManager
) -> None:
    task = manager.async_create_task(chain())
    await hass.async_block_till_done()
    seen: list[int] = []

    @callback
    def record(event: Event) -> None:
        seen.append(hass.states.get("sensor.housetide_chain").attributes["stage_index"])

    hass.bus.async_listen("housetide_task_advanced", record)
    manager.async_advance(task.id)
    await hass.async_block_till_done()
    assert seen == [1]


async def test_unknown_task_is_a_validation_error(
    hass: HomeAssistant, manager: HousetideManager
) -> None:
    with pytest.raises(ServiceValidationError) as raised:
        await hass.services.async_call(DOMAIN, "advance", {"task_id": "missing"}, blocking=True)
    assert raised.value.translation_key == "task_not_found"


async def test_nothing_to_undo_is_a_validation_error(
    hass: HomeAssistant, manager: HousetideManager
) -> None:
    task = manager.async_create_task(daily())
    with pytest.raises(ServiceValidationError) as raised:
        await hass.services.async_call(DOMAIN, "undo", {"task_id": task.id}, blocking=True)
    assert raised.value.translation_key == "action_not_allowed"


async def test_services_when_unloaded(hass: HomeAssistant, config_entry: MockConfigEntry) -> None:
    await hass.config_entries.async_unload(config_entry.entry_id)
    with pytest.raises(ServiceValidationError) as raised:
        await hass.services.async_call(DOMAIN, "advance", {"task_id": "x"}, blocking=True)
    assert raised.value.translation_key == "not_loaded"
