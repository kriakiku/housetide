from collections.abc import Callable

import voluptuous as vol
from homeassistant.core import HomeAssistant, ServiceCall, callback
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import config_validation as cv

from .const import DOMAIN
from .engine import pomodoro
from .engine.machine import MachineError
from .manager import HousetideManager, TaskNotFoundError, get_manager

_SCHEMA = vol.Schema({vol.Required("task_id"): cv.string})
_POMODORO_SCHEMA = vol.Schema({})
_POMODORO_PREFIX = "pomodoro_"

_ACTIONS: dict[str, Callable[..., None]] = {
    "advance": HousetideManager.async_advance,
    "skip": HousetideManager.async_skip,
    "undo": HousetideManager.async_undo,
}


@callback
def async_register(hass: HomeAssistant) -> None:
    @callback
    def handle(call: ServiceCall) -> None:
        manager = get_manager(hass)
        if manager is None:
            raise ServiceValidationError(translation_domain=DOMAIN, translation_key="not_loaded")
        task_id = call.data["task_id"]
        try:
            _ACTIONS[call.service](manager, task_id, "service", call.context.user_id)
        except TaskNotFoundError as err:
            raise ServiceValidationError(
                translation_domain=DOMAIN,
                translation_key="task_not_found",
                translation_placeholders={"task_id": task_id},
            ) from err
        except MachineError as err:
            raise ServiceValidationError(
                translation_domain=DOMAIN,
                translation_key="action_not_allowed",
                translation_placeholders={"task_id": task_id},
            ) from err

    @callback
    def handle_pomodoro(call: ServiceCall) -> None:
        manager = get_manager(hass)
        if manager is None:
            raise ServiceValidationError(translation_domain=DOMAIN, translation_key="not_loaded")
        try:
            manager.async_pomodoro(call.service.removeprefix(_POMODORO_PREFIX))
        except MachineError as err:
            raise ServiceValidationError(
                translation_domain=DOMAIN, translation_key="pomodoro_not_allowed"
            ) from err

    for name in _ACTIONS:
        hass.services.async_register(DOMAIN, name, handle, schema=_SCHEMA)
    for action in pomodoro.SERVICE_ACTIONS:
        hass.services.async_register(
            DOMAIN, f"{_POMODORO_PREFIX}{action}", handle_pomodoro, schema=_POMODORO_SCHEMA
        )
