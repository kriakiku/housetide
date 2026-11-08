import json
from pathlib import Path
from typing import Any

from homeassistant.components.frontend import DATA_EXTRA_MODULE_URL, DATA_PANELS
from homeassistant.config_entries import SOURCE_USER, ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.housetide.const import BUNDLE_URL, DOMAIN, PANEL_URL_PATH
from custom_components.housetide.manager import HousetideManager, get_manager

from .conftest import daily

COMPONENT = Path(__file__).resolve().parents[2] / "custom_components" / "housetide"
MODULE_URL = f"{BUNDLE_URL}?v=0.1.0"


async def test_config_flow_creates_one_entry(hass: HomeAssistant) -> None:
    result: Any = await hass.config_entries.flow.async_init(DOMAIN, context={"source": SOURCE_USER})
    assert result["type"] is FlowResultType.FORM
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {})
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["title"] == "Housetide"
    await hass.async_block_till_done()
    second: Any = await hass.config_entries.flow.async_init(DOMAIN, context={"source": SOURCE_USER})
    assert second["type"] is FlowResultType.ABORT
    assert second["reason"] == "single_instance_allowed"


async def test_setup_registers_panel_and_bundle(
    hass: HomeAssistant, config_entry: MockConfigEntry, hass_client: Any
) -> None:
    assert config_entry.state is ConfigEntryState.LOADED
    panel = hass.data[DATA_PANELS][PANEL_URL_PATH]
    assert panel.sidebar_title == "Housetide"
    assert panel.sidebar_icon == "mdi:waves"
    assert panel.config["_panel_custom"]["name"] == "housetide-panel"
    assert panel.config["_panel_custom"]["module_url"] == MODULE_URL
    assert MODULE_URL in hass.data[DATA_EXTRA_MODULE_URL].urls
    client = await hass_client()
    response = await client.get(MODULE_URL)
    assert response.status == 200
    assert await response.text() == (COMPONENT / "frontend" / "housetide.js").read_text()


async def test_unload_removes_everything(
    hass: HomeAssistant, config_entry: MockConfigEntry, manager: HousetideManager
) -> None:
    assert manager._stop_tick is not None
    assert await hass.config_entries.async_unload(config_entry.entry_id)
    await hass.async_block_till_done()
    assert config_entry.state is ConfigEntryState.NOT_LOADED
    assert PANEL_URL_PATH not in hass.data[DATA_PANELS]
    assert MODULE_URL not in hass.data[DATA_EXTRA_MODULE_URL].urls
    assert manager._stop_tick is None
    assert manager._unwatch is None
    assert get_manager(hass) is None


async def test_reload_keeps_working(
    hass: HomeAssistant, config_entry: MockConfigEntry, manager: HousetideManager
) -> None:
    task = manager.async_create_task(daily())
    assert await hass.config_entries.async_reload(config_entry.entry_id)
    await hass.async_block_till_done()
    assert config_entry.state is ConfigEntryState.LOADED
    assert PANEL_URL_PATH in hass.data[DATA_PANELS]
    fresh = get_manager(hass)
    assert fresh is not None and fresh is not manager
    assert task.id in fresh.tasks


async def test_removing_entry_deletes_storage(
    hass: HomeAssistant,
    config_entry: MockConfigEntry,
    manager: HousetideManager,
    hass_storage: dict[str, Any],
) -> None:
    manager.async_create_task(daily())
    await hass.config_entries.async_unload(config_entry.entry_id)
    assert "housetide.tasks" in hass_storage
    await hass.config_entries.async_remove(config_entry.entry_id)
    await hass.async_block_till_done()
    assert "housetide.tasks" not in hass_storage
    assert "housetide.history" not in hass_storage


def test_translations_match_strings() -> None:
    def shape(value: Any) -> Any:
        if isinstance(value, dict):
            return {key: shape(item) for key, item in value.items()}
        return None

    strings = json.loads((COMPONENT / "strings.json").read_text())
    english = json.loads((COMPONENT / "translations" / "en.json").read_text())
    ukrainian = json.loads((COMPONENT / "translations" / "uk.json").read_text())
    assert english == strings
    assert shape(ukrainian) == shape(strings)


def test_brand_icon_is_a_256_png() -> None:
    data = (COMPONENT / "brand" / "icon.png").read_bytes()
    assert data[:8] == b"\x89PNG\r\n\x1a\n"
    assert int.from_bytes(data[16:20]) == 256
    assert int.from_bytes(data[20:24]) == 256
