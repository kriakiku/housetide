from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType

from . import panel, services, websocket_api
from .const import DOMAIN, PLATFORMS
from .manager import DATA_MANAGER, HousetideConfigEntry, HousetideManager

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    websocket_api.async_register(hass)
    services.async_register(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: HousetideConfigEntry) -> bool:
    manager = HousetideManager(hass)
    await manager.async_load()
    entry.runtime_data = manager
    hass.data[DATA_MANAGER] = manager
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    await panel.async_register(hass)
    manager.async_start()
    return True


async def async_unload_entry(hass: HomeAssistant, entry: HousetideConfigEntry) -> bool:
    if not await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        return False
    panel.async_unregister(hass)
    hass.data.pop(DATA_MANAGER, None)
    await entry.runtime_data.async_stop()
    return True


async def async_remove_entry(hass: HomeAssistant, entry: HousetideConfigEntry) -> None:
    await HousetideManager(hass).async_remove_storage()
