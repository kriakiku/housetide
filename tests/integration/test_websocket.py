from datetime import timedelta
from typing import Any

import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.housetide.manager import HousetideManager

from .conftest import chain, daily, set_power, travel


async def call(client: Any, command: str, **payload: Any) -> dict[str, Any]:
    await client.send_json_auto_id({"type": f"housetide/{command}", **payload})
    return await client.receive_json()


async def assert_silent(hass: HomeAssistant, client: Any) -> None:
    await hass.async_block_till_done()
    await client.send_json_auto_id({"type": "ping"})
    assert (await client.receive_json())["type"] == "pong"


@pytest.fixture
async def client(hass: HomeAssistant, config_entry: MockConfigEntry, hass_ws_client: Any) -> Any:
    return await hass_ws_client(hass)


@pytest.fixture
async def read_only(
    hass: HomeAssistant,
    config_entry: MockConfigEntry,
    hass_ws_client: Any,
    hass_read_only_access_token: str,
) -> Any:
    return await hass_ws_client(hass, hass_read_only_access_token)


async def test_state_shape(client: Any) -> None:
    response = await call(client, "state")
    assert response["success"]
    assert set(response["result"]) == {"tasks", "views", "settings", "now"}
    assert response["result"]["settings"] == {"history_retention_days": 365}


async def test_task_crud(
    hass: HomeAssistant, client: Any, manager: HousetideManager, hass_admin_user: Any
) -> None:
    created = await call(client, "task/create", task=chain())
    assert created["success"]
    task = created["result"]["task"]
    assert task["id"]
    assert created["result"]["view"]["status"] == "upcoming"
    assert [view["task_id"] for view in (await call(client, "state"))["result"]["views"]] == [
        task["id"]
    ]

    renamed = await call(client, "task/update", task={**task, "title": "Renamed"})
    assert renamed["success"]
    assert renamed["result"]["task"]["title"] == "Renamed"
    assert manager.tasks[task["id"]].title == "Renamed"

    deleted = await call(client, "task/delete", task_id=task["id"])
    assert deleted["success"]
    assert manager.tasks == {}
    history = (await call(client, "history", task_id=task["id"]))["result"]["events"]
    assert [event["type"] for event in history] == ["deleted", "created"]
    assert history[0]["user_id"] == hass_admin_user.id


async def test_create_uses_supplied_id_and_refuses_duplicates(client: Any) -> None:
    first = await call(client, "task/create", task=daily(id="mine"))
    assert first["result"]["task"]["id"] == "mine"
    second = await call(client, "task/create", task=daily(id="mine"))
    assert not second["success"]
    assert second["error"]["code"] == "invalid_format"


@pytest.mark.parametrize(
    ("command", "payload"),
    [
        ("task/create", {"task": daily()}),
        ("task/update", {"task": daily(id="x")}),
        ("task/delete", {"task_id": "x"}),
        ("settings/update", {"settings": {"history_retention_days": 7}}),
    ],
)
async def test_admin_only_commands_refuse_regular_users(
    read_only: Any, manager: HousetideManager, command: str, payload: dict[str, Any]
) -> None:
    response = await call(read_only, command, **payload)
    assert not response["success"]
    assert response["error"]["code"] == "unauthorized"
    assert manager.tasks == {}
    assert manager.settings.history_retention_days == 365


async def test_regular_users_can_act_and_are_recorded(
    read_only: Any, manager: HousetideManager, hass_read_only_user: Any
) -> None:
    task = manager.async_create_task(chain())
    assert (await call(read_only, "state"))["success"]
    response = await call(read_only, "advance", task_id=task.id)
    assert response["success"]
    assert response["result"]["stage_index"] == 1
    assert manager.history(task.id, limit=1)[0]["user_id"] == hass_read_only_user.id


@pytest.mark.parametrize(
    ("command", "payload", "code"),
    [
        ("task/create", {"task": {"title": "No schedule"}}, "invalid_format"),
        ("task/create", {"task": daily(unknown=1)}, "invalid_format"),
        ("task/create", {"task": "nope"}, "invalid_format"),
        ("task/create", {"task": daily(grace_hours=10**12)}, "invalid_format"),
        ("task/create", {"task": daily(clean_for_minutes=10**12)}, "invalid_format"),
        (
            "task/create",
            {"task": daily(schedule={"type": "once", "due": "9999-12-31T23:59:59+00:00"})},
            "invalid_format",
        ),
        (
            "task/create",
            {
                "task": daily(
                    schedule={
                        "type": "interval",
                        "every_days": 10**12,
                        "time": "08:00",
                        "anchor": "schedule",
                    }
                )
            },
            "invalid_format",
        ),
        ("task/update", {"task": daily(id="missing")}, "not_found"),
        ("task/update", {"task": daily()}, "invalid_format"),
        ("task/delete", {"task_id": "missing"}, "not_found"),
        ("settings/update", {"settings": {"history_retention_days": 0}}, "invalid_format"),
        ("settings/update", {"settings": {"other": 1}}, "invalid_format"),
        ("advance", {"task_id": "missing"}, "not_found"),
        ("skip", {"task_id": "missing"}, "not_found"),
        ("undo", {"task_id": "missing"}, "not_found"),
        ("advance", {}, "invalid_format"),
        ("history", {"limit": 0}, "invalid_format"),
        ("history", {"before": "yesterday"}, "invalid_format"),
        ("stats", {"days": 0}, "invalid_format"),
    ],
)
async def test_bad_input_returns_errors(
    client: Any, command: str, payload: dict[str, Any], code: str
) -> None:
    response = await call(client, command, **payload)
    assert not response["success"]
    assert response["error"]["code"] == code


async def test_undo_without_history_is_not_allowed(client: Any, manager: HousetideManager) -> None:
    task = manager.async_create_task(daily())
    response = await call(client, "undo", task_id=task.id)
    assert response["error"]["code"] == "not_allowed"


async def test_advance_skip_undo(client: Any, manager: HousetideManager) -> None:
    task = manager.async_create_task(chain())
    advanced = await call(client, "advance", task_id=task.id)
    assert advanced["result"]["stage_index"] == 1
    assert advanced["result"]["can_undo"]
    undone = await call(client, "undo", task_id=task.id)
    assert undone["result"]["stage_index"] == 0
    assert not undone["result"]["can_undo"]
    occurrence = manager.runtimes[task.id].occurrence_id
    skipped = await call(client, "skip", task_id=task.id)
    assert skipped["success"]
    assert manager.runtimes[task.id].occurrence_id != occurrence
    history = (await call(client, "history", task_id=task.id))["result"]["events"]
    assert [event["type"] for event in history] == [
        "skipped",
        "undone",
        "advanced",
        "started",
        "created",
    ]


async def test_pills_view_reports_slots(client: Any, manager: HousetideManager) -> None:
    task = manager.async_create_task(daily())
    other = manager.async_create_task(chain())

    async def views() -> dict[str, dict[str, Any]]:
        result = (await call(client, "state"))["result"]
        return {view["task_id"]: view["scene"] for view in result["views"]}

    scenes = await views()
    assert scenes[task.id]["slots"] == ["full", "full", "full", "current", "full", "full", "full"]
    assert "slots" not in scenes[other.id]

    done = await call(client, "advance", task_id=task.id)
    assert done["result"]["scene"]["slots"][3] == "taken"
    assert manager.runtimes[task.id].pack is not None

    undone = await call(client, "undo", task_id=task.id)
    assert undone["result"]["scene"]["slots"][3] == "current"
    assert manager.runtimes[task.id].pack is None

    skipped = await call(client, "skip", task_id=task.id)
    assert skipped["result"]["scene"]["slots"][:5] == [
        "full",
        "full",
        "full",
        "missed",
        "current",
    ]


async def test_history_paging(
    hass: HomeAssistant, client: Any, manager: HousetideManager, freezer: FrozenDateTimeFactory
) -> None:
    task = manager.async_create_task(chain())
    other = manager.async_create_task(daily())
    for _ in range(3):
        manager.async_skip(task.id)
        freezer.tick(60)
    page = (await call(client, "history", task_id=task.id, limit=2))["result"]["events"]
    assert len(page) == 2
    older = (await call(client, "history", task_id=task.id, limit=2, before=page[-1]["ts"]))[
        "result"
    ]["events"]
    assert [event["type"] for event in older] == ["skipped", "created"]
    everything = (await call(client, "history"))["result"]["events"]
    assert {event["task_id"] for event in everything} == {task.id, other.id}


async def test_stats(client: Any, manager: HousetideManager) -> None:
    task = manager.async_create_task(daily())
    manager.async_advance(task.id)
    manager.async_advance(task.id)
    manager.async_skip(task.id)
    result = (await call(client, "stats", task_id=task.id, days=7))["result"]
    assert result["completed"] == 2
    assert result["skipped"] == 1
    assert result["current_streak"] == 0
    assert result["best_streak"] == 2
    assert len(result["per_day"]) == 7


async def test_templates(client: Any) -> None:
    result = (await call(client, "templates"))["result"]
    assert set(result) == {
        "laundry",
        "pills",
        "plant",
        "teeth",
        "bed",
        "dishes",
        "trash",
        "vacuum",
        "pet",
        "bathroom",
        "fridge",
        "window",
        "water",
        "one_off",
    }
    assert "id" not in result["laundry"]
    created = await call(client, "task/create", task=result["laundry"])
    assert created["success"]
    assert created["result"]["view"]["automated"] is False


async def test_settings_update_prunes_history(
    hass: HomeAssistant, client: Any, manager: HousetideManager, freezer: FrozenDateTimeFactory
) -> None:
    task = manager.async_create_task(daily())
    freezer.tick(timedelta(days=10))
    response = await call(client, "settings/update", settings={"history_retention_days": 5})
    assert response["result"] == {"history_retention_days": 5}
    assert all(event["type"] != "created" for event in manager.history(task.id))


async def test_subscribe_pushes_changes(client: Any, manager: HousetideManager) -> None:
    await client.send_json_auto_id({"type": "housetide/subscribe"})
    assert (await client.receive_json())["success"]
    first = await client.receive_json()
    assert first["type"] == "event"
    assert first["event"]["tasks"] == []

    task = manager.async_create_task(chain())
    created = await client.receive_json()
    assert [item["id"] for item in created["event"]["tasks"]] == [task.id]

    manager.async_advance(task.id)
    advanced = await client.receive_json()
    assert advanced["event"]["views"][0]["stage_index"] == 1


async def test_subscription_is_quiet_when_nothing_changes(
    hass: HomeAssistant,
    client: Any,
    manager: HousetideManager,
    freezer: FrozenDateTimeFactory,
) -> None:
    manager.async_create_task(chain())
    await travel(hass, freezer, seconds=31)
    await client.send_json_auto_id({"type": "housetide/subscribe"})
    await client.receive_json()
    await client.receive_json()
    await set_power(hass, "1")
    await travel(hass, freezer, seconds=31)
    await assert_silent(hass, client)


async def test_subscription_survives_reload(
    hass: HomeAssistant, client: Any, config_entry: MockConfigEntry
) -> None:
    await client.send_json_auto_id({"type": "housetide/subscribe"})
    await client.receive_json()
    await client.receive_json()
    assert await hass.config_entries.async_reload(config_entry.entry_id)
    await hass.async_block_till_done()
    assert (await client.receive_json())["type"] == "event"


async def test_unsubscribe_stops_pushes(
    hass: HomeAssistant, client: Any, manager: HousetideManager
) -> None:
    await client.send_json_auto_id({"type": "housetide/subscribe"})
    subscription = (await client.receive_json())["id"]
    await client.receive_json()
    await client.send_json_auto_id({"type": "unsubscribe_events", "subscription": subscription})
    assert (await client.receive_json())["success"]
    manager.async_create_task(chain())
    await assert_silent(hass, client)


async def test_settings_reject_retention_too_large(client: Any, manager: HousetideManager) -> None:
    response = await call(client, "settings/update", settings={"history_retention_days": 800000})
    assert response["error"]["code"] == "invalid_format"
    assert manager.settings.history_retention_days == 365


@pytest.mark.parametrize("before", ["0001-01-01T00:00:00+05:00", "9999-12-31T23:59:59-05:00"])
async def test_history_rejects_out_of_range_before(client: Any, before: str) -> None:
    response = await call(client, "history", before=before)
    assert response["error"]["code"] == "invalid_format"


async def test_history_pages_never_split_a_timestamp(
    client: Any, manager: HousetideManager, freezer: FrozenDateTimeFactory
) -> None:
    task = manager.async_create_task(chain())
    freezer.tick(60)
    manager.async_advance(task.id)
    page = (await call(client, "history", limit=1))["result"]["events"]
    assert [event["type"] for event in page] == ["advanced", "started"]
    older = (await call(client, "history", limit=10, before=page[-1]["ts"]))["result"]["events"]
    assert [event["type"] for event in older] == ["created"]


async def test_subscribe_fails_while_unloaded(
    hass: HomeAssistant, client: Any, config_entry: MockConfigEntry
) -> None:
    assert await hass.config_entries.async_unload(config_entry.entry_id)
    await hass.async_block_till_done()
    response = await call(client, "subscribe")
    assert not response["success"]
    assert response["error"]["code"] == "not_loaded"
