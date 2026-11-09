from collections.abc import Callable
from functools import wraps
from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.components.websocket_api import ActiveConnection
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect

from .const import SIGNAL_UPDATED
from .engine import pomodoro
from .engine.machine import MachineError
from .engine.models import ValidationError, parse_instant
from .manager import HousetideManager, TaskNotFoundError, get_manager

type Handler = Callable[[HousetideManager, ActiveConnection, dict[str, Any]], None]

_TASK_ID = vol.All(str, vol.Length(min=1))


def _with_manager(handler: Handler) -> websocket_api.WebSocketCommandHandler:
    @wraps(handler)
    def wrapper(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> None:
        manager = get_manager(hass)
        if manager is None:
            connection.send_error(msg["id"], "not_loaded", "Housetide is not loaded")
            return
        try:
            handler(manager, connection, msg)
        except TaskNotFoundError as err:
            connection.send_error(msg["id"], websocket_api.ERR_NOT_FOUND, str(err))
        except ValidationError as err:
            connection.send_error(msg["id"], websocket_api.ERR_INVALID_FORMAT, str(err))
        except MachineError as err:
            connection.send_error(msg["id"], websocket_api.ERR_NOT_ALLOWED, str(err))

    return wrapper


def _user_id(connection: ActiveConnection) -> str | None:
    return None if connection.user is None else connection.user.id


@websocket_api.websocket_command({vol.Required("type"): "housetide/state"})
@callback
@_with_manager
def ws_state(manager: HousetideManager, connection: ActiveConnection, msg: dict[str, Any]) -> None:
    connection.send_result(msg["id"], manager.payload())


@websocket_api.websocket_command({vol.Required("type"): "housetide/subscribe"})
@callback
def ws_subscribe(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> None:
    if get_manager(hass) is None:
        connection.send_error(msg["id"], "not_loaded", "Housetide is not loaded")
        return

    @callback
    def push() -> None:
        manager = get_manager(hass)
        if manager is not None:
            connection.send_message(websocket_api.event_message(msg["id"], manager.payload()))

    connection.subscriptions[msg["id"]] = async_dispatcher_connect(hass, SIGNAL_UPDATED, push)
    connection.send_result(msg["id"])
    push()


@websocket_api.websocket_command(
    {vol.Required("type"): "housetide/advance", vol.Required("task_id"): _TASK_ID}
)
@callback
@_with_manager
def ws_advance(
    manager: HousetideManager, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    manager.async_advance(msg["task_id"], "manual", _user_id(connection))
    connection.send_result(msg["id"], manager.view(msg["task_id"]))


@websocket_api.websocket_command(
    {vol.Required("type"): "housetide/skip", vol.Required("task_id"): _TASK_ID}
)
@callback
@_with_manager
def ws_skip(manager: HousetideManager, connection: ActiveConnection, msg: dict[str, Any]) -> None:
    manager.async_skip(msg["task_id"], "manual", _user_id(connection))
    connection.send_result(msg["id"], manager.view(msg["task_id"]))


@websocket_api.websocket_command(
    {vol.Required("type"): "housetide/undo", vol.Required("task_id"): _TASK_ID}
)
@callback
@_with_manager
def ws_undo(manager: HousetideManager, connection: ActiveConnection, msg: dict[str, Any]) -> None:
    manager.async_undo(msg["task_id"], "manual", _user_id(connection))
    connection.send_result(msg["id"], manager.view(msg["task_id"]))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "housetide/history",
        vol.Optional("task_id"): _TASK_ID,
        vol.Optional("limit", default=100): vol.All(int, vol.Range(min=1, max=1000)),
        vol.Optional("before"): str,
    }
)
@callback
@_with_manager
def ws_history(
    manager: HousetideManager, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    before = None if "before" not in msg else parse_instant(msg["before"], "before")
    events = manager.history(msg.get("task_id"), msg["limit"], before)
    connection.send_result(msg["id"], {"events": events})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "housetide/stats",
        vol.Optional("task_id"): _TASK_ID,
        vol.Optional("days", default=90): vol.All(int, vol.Range(min=1, max=3660)),
    }
)
@callback
@_with_manager
def ws_stats(manager: HousetideManager, connection: ActiveConnection, msg: dict[str, Any]) -> None:
    connection.send_result(msg["id"], manager.stats(msg.get("task_id"), msg["days"]))


@websocket_api.websocket_command({vol.Required("type"): "housetide/templates"})
@callback
@_with_manager
def ws_templates(
    manager: HousetideManager, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    connection.send_result(msg["id"], manager.templates())


@websocket_api.websocket_command(
    {vol.Required("type"): "housetide/task/create", vol.Required("task"): dict}
)
@websocket_api.require_admin
@callback
@_with_manager
def ws_task_create(
    manager: HousetideManager, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    task = manager.async_create_task(msg["task"], _user_id(connection))
    connection.send_result(msg["id"], {"task": task.to_dict(), "view": manager.view(task.id)})


@websocket_api.websocket_command(
    {vol.Required("type"): "housetide/task/update", vol.Required("task"): dict}
)
@websocket_api.require_admin
@callback
@_with_manager
def ws_task_update(
    manager: HousetideManager, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    task = manager.async_update_task(msg["task"])
    connection.send_result(msg["id"], {"task": task.to_dict(), "view": manager.view(task.id)})


@websocket_api.websocket_command(
    {vol.Required("type"): "housetide/task/delete", vol.Required("task_id"): _TASK_ID}
)
@websocket_api.require_admin
@callback
@_with_manager
def ws_task_delete(
    manager: HousetideManager, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    manager.async_delete_task(msg["task_id"], _user_id(connection))
    connection.send_result(msg["id"])


@websocket_api.websocket_command(
    {vol.Required("type"): "housetide/settings/update", vol.Required("settings"): dict}
)
@websocket_api.require_admin
@callback
@_with_manager
def ws_settings_update(
    manager: HousetideManager, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    connection.send_result(msg["id"], manager.async_update_settings(msg["settings"]).to_dict())


def _pomodoro_command(action: str) -> websocket_api.WebSocketCommandHandler:
    @websocket_api.websocket_command({vol.Required("type"): f"housetide/pomodoro/{action}"})
    @callback
    @_with_manager
    def ws_pomodoro(
        manager: HousetideManager, connection: ActiveConnection, msg: dict[str, Any]
    ) -> None:
        connection.send_result(msg["id"], manager.async_pomodoro(action).to_dict())

    return ws_pomodoro


@callback
def async_register(hass: HomeAssistant) -> None:
    for command in (
        ws_state,
        ws_subscribe,
        ws_advance,
        ws_skip,
        ws_undo,
        ws_history,
        ws_stats,
        ws_templates,
        ws_task_create,
        ws_task_update,
        ws_task_delete,
        ws_settings_update,
        *(_pomodoro_command(action) for action in pomodoro.ACTIONS),
    ):
        websocket_api.async_register_command(hass, command)
