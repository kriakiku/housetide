from collections.abc import Callable
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import (
    HISTORY_SAVE_DELAY,
    STORAGE_KEY_HISTORY,
    STORAGE_KEY_TASKS,
    STORAGE_MINOR_VERSION,
    STORAGE_VERSION,
    TASKS_SAVE_DELAY,
)

type Data = dict[str, Any]


class VersionedStore(Store[Data]):
    async def _async_migrate_func(
        self, old_major_version: int, old_minor_version: int, old_data: Data
    ) -> Data:
        if old_major_version > STORAGE_VERSION:
            raise NotImplementedError(
                f"{self.key} was written by a newer version ({old_major_version})"
            )
        return old_data


class HousetideStorage:
    def __init__(self, hass: HomeAssistant) -> None:
        self._tasks = VersionedStore(
            hass, STORAGE_VERSION, STORAGE_KEY_TASKS, minor_version=STORAGE_MINOR_VERSION
        )
        self._history = VersionedStore(
            hass, STORAGE_VERSION, STORAGE_KEY_HISTORY, minor_version=STORAGE_MINOR_VERSION
        )

    async def async_load(self) -> tuple[Data, Data]:
        return await self._tasks.async_load() or {}, await self._history.async_load() or {}

    def delay_save_tasks(self, data: Callable[[], Data]) -> None:
        self._tasks.async_delay_save(data, TASKS_SAVE_DELAY)

    def delay_save_history(self, data: Callable[[], Data]) -> None:
        self._history.async_delay_save(data, HISTORY_SAVE_DELAY)

    async def async_flush(self, tasks: Data, history: Data) -> None:
        await self._tasks.async_save(tasks)
        await self._history.async_save(history)

    async def async_remove(self) -> None:
        await self._tasks.async_remove()
        await self._history.async_remove()
