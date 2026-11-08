import pytest
from engine_factories import KYIV, at

from custom_components.housetide.engine.machine import initial_runtime
from custom_components.housetide.engine.models import Task, Trigger
from custom_components.housetide.engine.templates import templates

NOW = at("2026-06-10T07:00:00+03:00")


@pytest.mark.parametrize(
    ("name", "scene", "on_missed", "schedule_type", "stage_count"),
    [
        ("laundry", "laundry", "carry", "interval", 3),
        ("pills", "pills", "skip", "daily", 1),
        ("plant", "plant", "carry", "interval", 1),
        ("teeth", "teeth", "skip", "daily", 1),
        ("bed", "bed", "carry", "interval", 1),
        ("dishes", "dishes", "carry", "daily", 1),
        ("trash", "trash", "carry", "interval", 1),
        ("vacuum", "vacuum", "carry", "interval", 1),
        ("pet", "pet", "skip", "daily", 1),
        ("bathroom", "bathroom", "carry", "interval", 1),
        ("fridge", "fridge", "carry", "interval", 1),
        ("window", "window", "carry", "interval", 1),
        ("water", "water", "skip", "daily", 1),
        ("one_off", "generic", "carry", "once", 1),
    ],
)
def test_templates_are_ready_to_create(
    name: str, scene: str, on_missed: str, schedule_type: str, stage_count: int
) -> None:
    template = templates(NOW, KYIV)[name]
    assert "id" not in template
    assert template["scene"] == scene
    assert template["on_missed"] == on_missed
    assert template["schedule"]["type"] == schedule_type
    assert len(template["stages"]) == stage_count
    task = Task.from_dict({"id": "new"} | template)
    assert initial_runtime(task, NOW, KYIV).task_id == "new"


def test_only_expected_templates() -> None:
    assert set(templates(NOW, KYIV)) == {
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


def test_laundry_details() -> None:
    template = templates(NOW, KYIV)["laundry"]
    assert template["schedule"]["every_days"] == 7
    load, wash, hang = Task.from_dict({"id": "x"} | template).stages
    assert (load.title, load.role) == ("Collect/load", "todo")
    assert load.complete_when == Trigger(entity_id="", above=10, for_seconds=60)
    assert (wash.title, wash.role) == ("Washing", "running")
    assert wash.complete_when == Trigger(entity_id="", below=5, for_seconds=300)
    assert (hang.title, hang.role) == ("Hang it up", "waiting")
    assert hang.complete_when is None
    assert hang.stale_after_minutes == 180


def test_pills_details() -> None:
    assert templates(NOW, KYIV)["pills"]["schedule"] == {"type": "daily", "time": "08:00"}


def test_plant_details() -> None:
    assert templates(NOW, KYIV)["plant"]["schedule"]["every_days"] == 7


def test_one_off_due_is_tomorrow_morning_with_offset() -> None:
    assert templates(NOW, KYIV)["one_off"]["schedule"]["due"] == "2026-06-11T09:00:00+03:00"
