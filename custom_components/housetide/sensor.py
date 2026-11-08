from typing import Any

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import DOMAIN, SIGNAL_UPDATED, STATUSES
from .manager import HousetideConfigEntry, HousetideManager, view_fingerprint


def device_info(entry: HousetideConfigEntry) -> DeviceInfo:
    return DeviceInfo(
        identifiers={(DOMAIN, entry.entry_id)},
        name="Housetide",
        entry_type=DeviceEntryType.SERVICE,
    )


def _unique_id(task_id: str) -> str:
    return f"{DOMAIN}_{task_id}"


async def async_setup_entry(
    hass: HomeAssistant,
    entry: HousetideConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    manager = entry.runtime_data
    registry = er.async_get(hass)
    valid = {_unique_id(task_id) for task_id in manager.tasks}
    for registered in er.async_entries_for_config_entry(registry, entry.entry_id):
        if registered.domain == "sensor" and registered.unique_id not in valid:
            registry.async_remove(registered.entity_id)
    known: set[str] = set()

    @callback
    def sync() -> None:
        known.intersection_update(manager.tasks)
        fresh = [task_id for task_id in manager.tasks if task_id not in known]
        known.update(fresh)
        if fresh:
            async_add_entities(HousetideTaskSensor(entry, manager, task_id) for task_id in fresh)

    sync()
    entry.async_on_unload(async_dispatcher_connect(hass, SIGNAL_UPDATED, sync))


class HousetideTaskSensor(SensorEntity):
    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_device_class = SensorDeviceClass.ENUM
    _attr_options = STATUSES
    _attr_translation_key = "task"
    _unrecorded_attributes = frozenset({"overdue_seconds", "scene"})

    def __init__(
        self, entry: HousetideConfigEntry, manager: HousetideManager, task_id: str
    ) -> None:
        self._manager = manager
        self._task_id = task_id
        self._removing = False
        self._attr_unique_id = _unique_id(task_id)
        self._attr_device_info = device_info(entry)
        self._refresh()

    def _refresh(self) -> dict[str, Any]:
        view = self._manager.view(self._task_id)
        self._attr_name = view["title"]
        self._attr_icon = view["icon"] or "mdi:checkbox-marked-circle-outline"
        self._attr_native_value = view["status"]
        self._attr_extra_state_attributes = view
        self._printed = view_fingerprint(view)
        return self._printed

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(
            async_dispatcher_connect(self.hass, SIGNAL_UPDATED, self._handle_update)
        )

    @callback
    def _handle_update(self) -> None:
        if self._removing:
            return
        if self._task_id not in self._manager.tasks:
            self._removing = True
            if self.registry_entry is not None:
                er.async_get(self.hass).async_remove(self.entity_id)
            else:
                self.hass.async_create_task(self.async_remove())
            return
        before = self._printed
        if self._refresh() != before:
            self.async_write_ha_state()
