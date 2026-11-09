from datetime import timedelta
from typing import Any

import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_capture_events,
    async_fire_time_changed,
)

from custom_components.housetide.const import DOMAIN, EVENT_POMODORO_PHASE
from custom_components.housetide.engine.models import PomodoroState
from custom_components.housetide.manager import HousetideManager, get_manager

from .conftest import START, travel

SENSOR = "sensor.housetide_pomodoro"
FOCUS_END = START + timedelta(minutes=25)


async def call(client: Any, command: str, **payload: Any) -> dict[str, Any]:
    await client.send_json_auto_id({"type": f"housetide/{command}", **payload})
    return await client.receive_json()


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


def timers(hass: HomeAssistant) -> list[Any]:
    return [
        handle
        for handle in hass.loop._scheduled
        if not handle.cancelled() and "_on_pomodoro_end" in repr(handle)
    ]


async def ring(hass: HomeAssistant, freezer: FrozenDateTimeFactory, minutes: int) -> None:
    freezer.tick(timedelta(minutes=minutes))
    found = timers(hass)
    assert len(found) == 1
    found[0]._run()
    found[0].cancel()
    await hass.async_block_till_done()


async def test_full_round_over_the_websocket(
    hass: HomeAssistant, client: Any, freezer: FrozenDateTimeFactory
) -> None:
    events = async_capture_events(hass, EVENT_POMODORO_PHASE)
    await client.send_json_auto_id({"type": "housetide/subscribe"})
    assert (await client.receive_json())["success"]
    first = (await client.receive_json())["event"]
    assert first["pomodoro"]["phase"] == "idle"

    ends_at = FOCUS_END.isoformat()
    await client.send_json_auto_id({"type": "housetide/pomodoro/start"})
    pushed = await client.receive_json()
    assert pushed["event"]["pomodoro"]["ends_at"] == ends_at
    response = await client.receive_json()
    assert response["success"]
    assert response["result"]["phase"] == "focus"
    assert response["result"]["ends_at"] == ends_at

    await ring(hass, freezer, 25)
    pushed = await client.receive_json()
    assert pushed["event"]["pomodoro"]["phase"] == "short_break"
    assert pushed["event"]["pomodoro"]["rounds_today"] == 1
    assert [(e.data["from"], e.data["to"]) for e in events] == [
        ("idle", "focus"),
        ("focus", "short_break"),
    ]
    assert events[1].data["round"] == 1
    assert events[1].data["rounds_today"] == 1

    await client.send_json_auto_id({"type": "ping"})
    assert (await client.receive_json())["type"] == "pong"
    await ring(hass, freezer, 5)
    pushed = await client.receive_json()
    assert pushed["event"]["pomodoro"]["phase"] == "idle"
    assert pushed["event"]["pomodoro"]["round"] == 2
    assert (events[-1].data["from"], events[-1].data["to"]) == ("short_break", "idle")


async def test_every_command(
    hass: HomeAssistant,
    client: Any,
    manager: HousetideManager,
    freezer: FrozenDateTimeFactory,
) -> None:
    await call(client, "pomodoro/start")
    freezer.tick(timedelta(minutes=10))
    paused = await call(client, "pomodoro/pause")
    assert paused["result"]["ends_at"] is None
    assert paused["result"]["paused_remaining_seconds"] == 900

    freezer.tick(timedelta(minutes=30))
    resumed = await call(client, "pomodoro/resume")
    expected = START + timedelta(minutes=40) + timedelta(seconds=900)
    assert resumed["result"]["ends_at"] == expected.isoformat()

    skipped = await call(client, "pomodoro/skip")
    assert skipped["result"]["phase"] == "short_break"
    assert skipped["result"]["rounds_today"] == 0

    stopped = await call(client, "pomodoro/stop")
    assert stopped["result"]["phase"] == "idle"
    assert stopped["result"]["round"] == 2

    reset = await call(client, "pomodoro/reset")
    assert reset["result"]["round"] == 1
    assert manager.pomodoro.round == 1


async def test_read_only_users_can_control_it(read_only: Any) -> None:
    assert (await call(read_only, "pomodoro/start"))["success"]


@pytest.mark.parametrize("command", ["pause", "resume", "skip", "stop"])
async def test_not_allowed_is_a_websocket_error(client: Any, command: str) -> None:
    response = await call(client, f"pomodoro/{command}")
    assert not response["success"]
    assert response["error"]["code"] == "not_allowed"


async def test_second_start_is_an_error(client: Any) -> None:
    await call(client, "pomodoro/start")
    response = await call(client, "pomodoro/start")
    assert response["error"]["code"] == "not_allowed"


async def test_pause_cancels_the_timer(
    hass: HomeAssistant,
    manager: HousetideManager,
    freezer: FrozenDateTimeFactory,
) -> None:
    manager.async_pomodoro("start")
    assert len(timers(hass)) == 1
    manager.async_pomodoro("pause")
    assert timers(hass) == []
    await travel(hass, freezer, hours=2)
    assert manager.pomodoro.phase == "focus"
    assert manager.pomodoro.paused_remaining_seconds == 1500


async def test_resume_arms_for_the_remainder(
    hass: HomeAssistant, manager: HousetideManager, freezer: FrozenDateTimeFactory
) -> None:
    manager.async_pomodoro("start")
    await travel(hass, freezer, minutes=20)
    manager.async_pomodoro("pause")
    await travel(hass, freezer, hours=1)
    manager.async_pomodoro("resume")
    assert len(timers(hass)) == 1
    await travel(hass, freezer, minutes=4, seconds=59)
    assert manager.pomodoro.phase == "focus"
    await travel(hass, freezer, seconds=1)
    assert manager.pomodoro.phase == "short_break"
    assert manager.pomodoro.rounds_today == 1


async def test_stop_cancels_the_timer(hass: HomeAssistant, manager: HousetideManager) -> None:
    manager.async_pomodoro("start")
    manager.async_pomodoro("stop")
    assert timers(hass) == []


async def test_only_one_timer_after_chained_phases(
    hass: HomeAssistant, manager: HousetideManager, freezer: FrozenDateTimeFactory
) -> None:
    manager.async_pomodoro("start")
    await travel(hass, freezer, minutes=25)
    assert len(timers(hass)) == 1


async def test_unload_cancels_the_timer_and_persists(
    hass: HomeAssistant,
    config_entry: MockConfigEntry,
    manager: HousetideManager,
    hass_storage: dict[str, Any],
) -> None:
    manager.async_pomodoro("start")
    assert await hass.config_entries.async_unload(config_entry.entry_id)
    await hass.async_block_till_done()
    assert timers(hass) == []
    assert hass_storage["housetide.tasks"]["data"]["pomodoro"]["phase"] == "focus"


async def test_survives_a_reload_while_running(
    hass: HomeAssistant,
    config_entry: MockConfigEntry,
    manager: HousetideManager,
    freezer: FrozenDateTimeFactory,
) -> None:
    manager.async_pomodoro("start")
    assert await hass.config_entries.async_reload(config_entry.entry_id)
    await hass.async_block_till_done()
    fresh = get_manager(hass)
    assert fresh is not None
    assert fresh is not manager
    assert fresh.pomodoro.ends_at == FOCUS_END
    await travel(hass, freezer, minutes=25)
    assert fresh.pomodoro.phase == "short_break"


async def boot(
    hass: HomeAssistant,
    freezer: FrozenDateTimeFactory,
    storage: dict[str, Any],
    state: PomodoroState,
    settings: dict[str, Any] | None = None,
) -> HousetideManager:
    storage["housetide.tasks"] = {
        "version": 1,
        "minor_version": 1,
        "key": "housetide.tasks",
        "data": {
            "tasks": [],
            "runtimes": [],
            "settings": settings or {},
            "pomodoro": state.to_dict(),
        },
    }
    freezer.move_to(START)
    await hass.config.async_set_time_zone("Europe/Kyiv")
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    manager = get_manager(hass)
    assert manager is not None
    return manager


def running(minutes_ago: float, **overrides: Any) -> PomodoroState:
    values: dict[str, Any] = {
        "phase": "focus",
        "ends_at": START - timedelta(minutes=minutes_ago),
        "duration_seconds": 1500,
        "rounds_today": 1,
        "rounds_date": "2026-11-04",
    }
    return PomodoroState(**(values | overrides))


async def test_startup_advances_a_phase_that_ended_while_down(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, hass_storage: dict[str, Any]
) -> None:
    events = async_capture_events(hass, EVENT_POMODORO_PHASE)
    manager = await boot(hass, freezer, hass_storage, running(2))
    assert manager.pomodoro.phase == "short_break"
    assert manager.pomodoro.ends_at == START + timedelta(minutes=3)
    assert manager.pomodoro.rounds_today == 2
    assert len(timers(hass)) == 1
    assert [(e.data["from"], e.data["to"]) for e in events] == [("focus", "short_break")]

    await travel(hass, freezer, minutes=3)
    assert manager.pomodoro.phase == "idle"
    assert manager.pomodoro.rounds_today == 2


async def test_startup_fires_one_event_for_many_phases(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, hass_storage: dict[str, Any]
) -> None:
    events = async_capture_events(hass, EVENT_POMODORO_PHASE)
    manager = await boot(
        hass, freezer, hass_storage, running(16), {"auto_start_focus": False, "focus_minutes": 25}
    )
    assert manager.pomodoro.phase == "idle"
    assert manager.pomodoro.round == 2
    assert manager.pomodoro.rounds_today == 2
    assert [(e.data["from"], e.data["to"]) for e in events] == [("focus", "idle")]


async def test_second_restart_does_not_count_again(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, hass_storage: dict[str, Any]
) -> None:
    manager = await boot(hass, freezer, hass_storage, running(2))
    entries = hass.config_entries.async_entries(DOMAIN)
    assert await hass.config_entries.async_reload(entries[0].entry_id)
    await hass.async_block_till_done()
    fresh = get_manager(hass)
    assert fresh is not None
    assert fresh is not manager
    assert fresh.pomodoro.phase == "short_break"
    assert fresh.pomodoro.rounds_today == 2


async def test_startup_keeps_a_paused_phase(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, hass_storage: dict[str, Any]
) -> None:
    state = running(0, ends_at=None, paused_remaining_seconds=61.5)
    manager = await boot(hass, freezer, hass_storage, state)
    assert manager.pomodoro == state
    assert timers(hass) == []


async def test_invalid_stored_state_starts_idle(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, hass_storage: dict[str, Any]
) -> None:
    hass_storage["housetide.tasks"] = {
        "version": 1,
        "minor_version": 1,
        "key": "housetide.tasks",
        "data": {"tasks": [], "runtimes": [], "settings": {}, "pomodoro": {"phase": "nap"}},
    }
    freezer.move_to(START)
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    manager = get_manager(hass)
    assert manager is not None
    assert manager.pomodoro.phase == "idle"


async def test_new_day_resets_while_idle(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, hass_storage: dict[str, Any]
) -> None:
    state = PomodoroState(round=3, rounds_today=6, rounds_date="2026-11-04")
    manager = await boot(hass, freezer, hass_storage, state)
    assert manager.pomodoro.rounds_today == 6
    await travel(hass, freezer, days=1)
    assert manager.pomodoro.rounds_today == 0
    assert manager.pomodoro.round == 1
    assert manager.pomodoro.rounds_date == "2026-11-05"


async def test_sensor(
    hass: HomeAssistant, manager: HousetideManager, freezer: FrozenDateTimeFactory
) -> None:
    state = hass.states.get(SENSOR)
    assert state is not None
    assert state.state == "idle"
    assert state.attributes["ends_at"] is None
    assert state.attributes["round"] == 1
    assert state.attributes["rounds_today"] == 0
    assert state.attributes["options"] == ["idle", "focus", "short_break", "long_break"]

    manager.async_pomodoro("start")
    await hass.async_block_till_done()
    state = hass.states.get(SENSOR)
    assert state is not None
    assert state.state == "focus"
    assert state.attributes["ends_at"] == FOCUS_END.isoformat()

    await travel(hass, freezer, minutes=25)
    state = hass.states.get(SENSOR)
    assert state is not None
    assert state.state == "short_break"
    assert state.attributes["rounds_today"] == 1


async def test_sensor_is_kept_by_the_orphan_cleanup(
    hass: HomeAssistant, config_entry: MockConfigEntry
) -> None:
    assert await hass.config_entries.async_reload(config_entry.entry_id)
    await hass.async_block_till_done()
    assert hass.states.get(SENSOR) is not None


async def test_services(hass: HomeAssistant, manager: HousetideManager) -> None:
    for action, phase in (
        ("start", "focus"),
        ("pause", "focus"),
        ("resume", "focus"),
        ("skip", "short_break"),
        ("stop", "idle"),
    ):
        await hass.services.async_call(DOMAIN, f"pomodoro_{action}", {}, blocking=True)
        assert manager.pomodoro.phase == phase
    assert manager.pomodoro.round == 2


async def test_service_not_allowed(hass: HomeAssistant, manager: HousetideManager) -> None:
    with pytest.raises(ServiceValidationError) as raised:
        await hass.services.async_call(DOMAIN, "pomodoro_pause", {}, blocking=True)
    assert raised.value.translation_key == "pomodoro_not_allowed"


async def test_service_rejects_unknown_fields(
    hass: HomeAssistant, manager: HousetideManager
) -> None:
    with pytest.raises(Exception, match="not a valid option"):
        await hass.services.async_call(DOMAIN, "pomodoro_start", {"task_id": "x"}, blocking=True)


async def test_partial_settings_keep_the_rest(client: Any, manager: HousetideManager) -> None:
    response = await call(client, "settings/update", settings={"focus_minutes": 50})
    assert response["result"]["focus_minutes"] == 50
    response = await call(client, "settings/update", settings={"history_retention_days": 30})
    assert response["result"]["focus_minutes"] == 50
    assert response["result"]["history_retention_days"] == 30
    started = await call(client, "pomodoro/start")
    assert started["result"]["duration_seconds"] == 3000


async def test_invalid_settings_are_a_websocket_error(client: Any) -> None:
    response = await call(client, "settings/update", settings={"focus_minutes": 0})
    assert response["error"]["code"] == "invalid_format"


async def test_settings_persist(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, hass_storage: dict[str, Any]
) -> None:
    manager = await boot(
        hass, freezer, hass_storage, PomodoroState(), {"rounds_until_long_break": 2}
    )
    assert manager.settings.rounds_until_long_break == 2
    assert manager.settings.focus_minutes == 25


async def test_callback_after_the_clock_is_past_the_end(
    hass: HomeAssistant, manager: HousetideManager, freezer: FrozenDateTimeFactory
) -> None:
    manager.async_pomodoro("start")
    freezer.tick(timedelta(minutes=26))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert manager.pomodoro.ends_at == FOCUS_END + timedelta(minutes=5)
    assert manager.pomodoro.rounds_today == 1


async def test_action_after_a_missed_callback_applies_the_expiry_first(
    hass: HomeAssistant, manager: HousetideManager, freezer: FrozenDateTimeFactory
) -> None:
    manager.async_pomodoro("start")
    freezer.tick(timedelta(minutes=26))
    manager.async_pomodoro("pause")
    assert manager.pomodoro.phase == "short_break"
    assert manager.pomodoro.paused_remaining_seconds == 240
    assert manager.pomodoro.rounds_today == 1
