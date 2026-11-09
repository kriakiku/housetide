from typing import Any

import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.housetide.manager import HousetideManager

from .conftest import daily, stored_events, travel


async def call(client: Any, command: str, **payload: Any) -> dict[str, Any]:
    await client.send_json_auto_id({"type": f"housetide/{command}", **payload})
    return await client.receive_json()


@pytest.fixture
async def client(hass: HomeAssistant, config_entry: MockConfigEntry, hass_ws_client: Any) -> Any:
    return await hass_ws_client(hass)


async def view_of(client: Any, task_id: str) -> dict[str, Any]:
    views = (await call(client, "state"))["result"]["views"]
    return next(view for view in views if view["task_id"] == task_id)


ANYTIME = {"type": "daily", "anytime": True}


async def test_day_of_an_anytime_task(
    hass: HomeAssistant,
    client: Any,
    manager: HousetideManager,
    freezer: FrozenDateTimeFactory,
) -> None:
    freezer.move_to("2026-11-09T10:00:00+02:00")
    created = await call(client, "task/create", task=daily(schedule=ANYTIME, grace_hours=2))
    assert created["success"]
    task = created["result"]["task"]
    assert task["schedule"] == {"type": "daily", "time": "23:59", "anytime": True}
    view = created["result"]["view"]
    assert view["anytime"] is True
    assert view["status"] == "upcoming"
    assert view["is_today"] is True
    assert view["due_at"].startswith("2026-11-09T21:59:00")

    await travel(hass, freezer, hours=12)
    assert (await view_of(client, task["id"]))["status"] == "due"

    await travel(hass, freezer, hours=2)
    view = await view_of(client, task["id"])
    assert view["status"] == "upcoming"
    assert view["due_at"].startswith("2026-11-10T21:59:00")
    missed = [event for event in stored_events(manager, task["id"]) if event["type"] == "missed"]
    assert len(missed) == 1
    assert missed[0]["ts"].startswith("2026-11-09T21:59:00")


async def test_completing_moves_to_tomorrow_and_undo_brings_it_back(
    hass: HomeAssistant,
    client: Any,
    manager: HousetideManager,
    freezer: FrozenDateTimeFactory,
) -> None:
    freezer.move_to("2026-11-09T10:00:00+02:00")
    task = (await call(client, "task/create", task=daily(schedule=ANYTIME, grace_hours=2)))[
        "result"
    ]["task"]

    assert (await call(client, "advance", task_id=task["id"]))["success"]
    view = await view_of(client, task["id"])
    assert view["status"] == "clean"
    assert view["due_at"].startswith("2026-11-10T21:59:00")
    done = [event for event in stored_events(manager, task["id"]) if event["type"] == "completed"]
    assert done[0]["on_time"] is True

    assert (await call(client, "undo", task_id=task["id"]))["success"]
    assert (await view_of(client, task["id"]))["due_at"].startswith("2026-11-09T21:59:00")


async def test_rejects_anytime_on_a_one_off(client: Any) -> None:
    schedule = {"type": "once", "due": "2026-12-01T10:00:00+02:00", "anytime": True}
    response = await call(client, "task/create", task=daily(schedule=schedule))
    assert not response["success"]


async def test_timed_payload_is_unchanged(client: Any) -> None:
    created = await call(client, "task/create", task=daily())
    assert created["result"]["task"]["schedule"] == {"type": "daily", "time": "08:00"}
    assert created["result"]["view"]["anytime"] is False
