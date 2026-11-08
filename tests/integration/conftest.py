import sys
import types
from collections.abc import AsyncGenerator
from datetime import datetime, timedelta
from typing import Any

import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_time_changed,
)

from custom_components.housetide.const import DOMAIN
from custom_components.housetide.manager import HousetideManager, get_manager

START = datetime.fromisoformat("2026-11-04T07:00:00+00:00")
POWER = "sensor.washer_power"


@pytest.fixture(autouse=True)
def stub_hass_frontend(tmp_path_factory: pytest.TempPathFactory) -> None:
    root = tmp_path_factory.mktemp("hass_frontend")
    (root / "static").mkdir()
    module = types.ModuleType("hass_frontend")
    module.where = lambda: root  # type: ignore[attr-defined]
    sys.modules["hass_frontend"] = module


@pytest.fixture(autouse=True)
def _custom_integrations(enable_custom_integrations: None) -> None:
    return None


@pytest.fixture
async def config_entry(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> AsyncGenerator[MockConfigEntry]:
    freezer.move_to(START)
    await hass.config.async_set_time_zone("Europe/Kyiv")
    entry = MockConfigEntry(domain=DOMAIN, title="Housetide", data={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    yield entry


@pytest.fixture
def manager(hass: HomeAssistant, config_entry: MockConfigEntry) -> HousetideManager:
    found = get_manager(hass)
    assert found is not None
    return found


def daily(**overrides: Any) -> dict[str, Any]:
    return {
        "title": "Pills",
        "schedule": {"type": "daily", "time": "08:00"},
        "on_missed": "skip",
        "scene": "pills",
        "stages": [{"id": "take", "title": "Take", "role": "todo"}],
    } | overrides


def chain(**overrides: Any) -> dict[str, Any]:
    return {
        "title": "Chain",
        "schedule": {"type": "daily", "time": "08:00"},
        "on_missed": "carry",
        "scene": "generic",
        "stages": [
            {"id": "one", "title": "One", "role": "todo"},
            {"id": "two", "title": "Two", "role": "running"},
        ],
    } | overrides


def laundry(manager: HousetideManager, entity_id: str = POWER) -> dict[str, Any]:
    draft = manager.templates()["laundry"]
    for stage in draft["stages"]:
        if stage["complete_when"] is not None:
            stage["complete_when"]["entity_id"] = entity_id
    return draft


async def travel(hass: HomeAssistant, freezer: FrozenDateTimeFactory, **delta: float) -> None:
    freezer.tick(timedelta(**delta))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()


async def set_power(hass: HomeAssistant, value: str) -> None:
    hass.states.async_set(POWER, value)
    await hass.async_block_till_done()


def stored_events(manager: HousetideManager, task_id: str) -> list[dict[str, Any]]:
    return list(reversed(manager.history(task_id)))
