from datetime import datetime
from typing import Any

from homeassistant.components.todo import (
    TodoItem,
    TodoItemStatus,
    TodoListEntity,
    TodoListEntityFeature,
)
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.util import dt as dt_util

from .const import DOMAIN, SIGNAL_UPDATED
from .engine.machine import MachineError
from .manager import HousetideConfigEntry, HousetideManager, TaskNotFoundError
from .sensor import device_info


async def async_setup_entry(
    hass: HomeAssistant,
    entry: HousetideConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    async_add_entities([HousetideTodoList(entry, entry.runtime_data)])


def _item(view: dict[str, Any], notes: str | None) -> TodoItem:
    title = view["title"]
    if view["stage_count"] > 1:
        title = f"{title}: {view['stage_title']}"
    due = None
    if view["due_at"] is not None:
        due = dt_util.as_local(datetime.fromisoformat(view["due_at"]))
    return TodoItem(
        uid=view["task_id"],
        summary=title,
        status=TodoItemStatus.NEEDS_ACTION,
        due=due,
        description=notes,
    )


class HousetideTodoList(TodoListEntity):
    _attr_has_entity_name = True
    _attr_name = None
    _attr_should_poll = False
    _attr_supported_features = TodoListEntityFeature.UPDATE_TODO_ITEM

    def __init__(self, entry: HousetideConfigEntry, manager: HousetideManager) -> None:
        self.entity_id = "todo.housetide"
        self._manager = manager
        self._attr_unique_id = f"{entry.entry_id}_todo"
        self._attr_device_info = device_info(entry)
        self._attr_todo_items = self._build()

    def _build(self) -> list[TodoItem]:
        return [
            _item(view, self._manager.tasks[view["task_id"]].notes)
            for view in self._manager.all_views()
            if view["is_today"]
        ]

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self.async_on_remove(
            async_dispatcher_connect(self.hass, SIGNAL_UPDATED, self._handle_update)
        )

    @callback
    def _handle_update(self) -> None:
        items = self._build()
        if items != self._attr_todo_items:
            self._attr_todo_items = items
            self.async_write_ha_state()

    async def async_update_todo_item(self, item: TodoItem) -> None:
        if item.status != TodoItemStatus.COMPLETED or item.uid is None:
            raise ServiceValidationError(
                translation_domain=DOMAIN, translation_key="todo_read_only"
            )
        try:
            self._manager.async_advance(item.uid, "todo", self._context_user_id())
        except (TaskNotFoundError, MachineError) as err:
            raise ServiceValidationError(
                translation_domain=DOMAIN,
                translation_key="action_not_allowed",
                translation_placeholders={"task_id": item.uid},
            ) from err

    def _context_user_id(self) -> str | None:
        return None if self._context is None else self._context.user_id
