from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import SIGNAL_UPDATED
from .manager import HousetideConfigEntry, HousetideManager
from .sensor import device_info


async def async_setup_entry(
    hass: HomeAssistant,
    entry: HousetideConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    async_add_entities([HousetideDueBinarySensor(entry, entry.runtime_data)])


class HousetideDueBinarySensor(BinarySensorEntity):
    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_translation_key = "due"

    def __init__(self, entry: HousetideConfigEntry, manager: HousetideManager) -> None:
        self.entity_id = "binary_sensor.housetide_due"
        self._manager = manager
        self._attr_unique_id = f"{entry.entry_id}_due"
        self._attr_device_info = device_info(entry)
        self._refresh()

    def _refresh(self) -> None:
        count = sum(view["status"] in ("due", "overdue") for view in self._manager.all_views())
        self._attr_is_on = count > 0
        self._attr_extra_state_attributes = {"count": count}

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(
            async_dispatcher_connect(self.hass, SIGNAL_UPDATED, self._handle_update)
        )

    @callback
    def _handle_update(self) -> None:
        self._refresh()
        self.async_write_ha_state()
