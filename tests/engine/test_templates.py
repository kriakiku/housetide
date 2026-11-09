from typing import Any, get_args

import pytest
from engine_factories import KYIV, at

from custom_components.housetide.engine.machine import initial_runtime
from custom_components.housetide.engine.models import SceneName, Task, Trigger
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
        ("cooler", "cooler", "carry", "interval", 2),
        ("gym", "gym", "skip", "weekly", 1),
        ("pool", "pool", "skip", "weekly", 1),
        ("ev", "ev", "carry", "interval", 2),
        ("fuel", "fuel", "carry", "interval", 1),
        ("study", "study", "skip", "weekly", 1),
        ("language", "language", "skip", "daily", 1),
        ("coding", "coding", "skip", "weekly", 1),
        ("slides", "slides", "carry", "once", 2),
        ("book", "book", "skip", "daily", 1),
        ("filter", "filter", "carry", "interval", 1),
        ("bills", "bills", "carry", "interval", 2),
        ("yoga", "yoga", "skip", "daily", 1),
        ("run", "run", "skip", "weekly", 1),
        ("groceries", "groceries", "carry", "interval", 1),
        ("cooking", "cooking", "skip", "daily", 1),
        ("call", "call", "carry", "interval", 1),
        ("journal", "journal", "skip", "daily", 1),
        ("lawn", "lawn", "carry", "interval", 1),
        ("music", "music", "skip", "weekly", 1),
        ("backup", "backup", "carry", "interval", 1),
        ("carwash", "carwash", "carry", "interval", 1),
        ("owl", "owl", "skip", "daily", 1),
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
        "cooler",
        "gym",
        "pool",
        "ev",
        "fuel",
        "study",
        "language",
        "coding",
        "slides",
        "book",
        "filter",
        "bills",
        "yoga",
        "run",
        "groceries",
        "cooking",
        "call",
        "journal",
        "lawn",
        "music",
        "backup",
        "carwash",
        "owl",
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


def test_cooler_details() -> None:
    template = templates(NOW, KYIV)["cooler"]
    assert template["schedule"]["every_days"] == 14
    order, wait = Task.from_dict({"id": "x"} | template).stages
    assert (order.title, order.role) == ("Order bottles", "todo")
    assert order.stale_after_minutes is None
    assert (wait.title, wait.role) == ("Waiting for delivery", "waiting")
    assert wait.stale_after_minutes == 2880


def test_owl_details() -> None:
    template = templates(NOW, KYIV)["owl"]
    assert template["schedule"] == {"type": "daily", "time": "23:59", "anytime": True}
    assert template["grace_hours"] == 6
    assert template["icon"] == "mdi:owl"
    stage = Task.from_dict({"id": "x"} | template).stages[0]
    assert (stage.id, stage.title, stage.action) == ("owl_do", "Just do it", "Done")


def test_pills_details() -> None:
    assert templates(NOW, KYIV)["pills"]["schedule"] == {"type": "daily", "time": "08:00"}


def test_plant_details() -> None:
    assert templates(NOW, KYIV)["plant"]["schedule"]["every_days"] == 7


def test_one_off_due_is_tomorrow_morning_with_offset() -> None:
    assert templates(NOW, KYIV)["one_off"]["schedule"]["due"] == "2026-06-11T09:00:00+03:00"


def test_stage_ids_are_unique_across_templates() -> None:
    ids = [
        stage["id"] for template in templates(NOW, KYIV).values() for stage in template["stages"]
    ]
    assert len(ids) == len(set(ids))


def test_every_scene_has_a_template_with_its_name() -> None:
    all_templates = templates(NOW, KYIV)
    assert len(all_templates) == 37
    for scene in get_args(SceneName):
        assert all_templates["one_off" if scene == "generic" else scene]["scene"] == scene


@pytest.mark.parametrize(
    ("name", "schedule"),
    [
        ("gym", {"type": "weekly", "weekdays": [0, 2, 4], "time": "18:00"}),
        ("pool", {"type": "weekly", "weekdays": [1, 5], "time": "18:00"}),
        ("ev", {"type": "interval", "every_days": 7, "time": "20:00", "anchor": "completion"}),
        ("fuel", {"type": "interval", "every_days": 14, "time": "18:00", "anchor": "completion"}),
        ("study", {"type": "weekly", "weekdays": [0, 1, 2, 3, 4], "time": "19:00"}),
        ("language", {"type": "daily", "time": "09:00"}),
        ("coding", {"type": "weekly", "weekdays": [1, 3], "time": "20:00"}),
        ("book", {"type": "daily", "time": "21:30"}),
        ("filter", {"type": "interval", "every_days": 90, "time": "10:00", "anchor": "completion"}),
        ("bills", {"type": "interval", "every_days": 30, "time": "10:00", "anchor": "schedule"}),
        ("yoga", {"type": "daily", "time": "07:30"}),
        ("run", {"type": "weekly", "weekdays": [1, 3, 5], "time": "07:00"}),
        (
            "groceries",
            {"type": "interval", "every_days": 7, "time": "17:00", "anchor": "completion"},
        ),
        ("cooking", {"type": "daily", "time": "18:30"}),
        ("call", {"type": "interval", "every_days": 7, "time": "19:00", "anchor": "completion"}),
        ("journal", {"type": "daily", "time": "22:00"}),
        ("lawn", {"type": "interval", "every_days": 14, "time": "11:00", "anchor": "completion"}),
        ("music", {"type": "weekly", "weekdays": [0, 3], "time": "20:00"}),
        ("backup", {"type": "interval", "every_days": 30, "time": "20:00", "anchor": "schedule"}),
        (
            "carwash",
            {"type": "interval", "every_days": 30, "time": "11:00", "anchor": "completion"},
        ),
    ],
)
def test_new_template_schedules(name: str, schedule: dict[str, Any]) -> None:
    assert templates(NOW, KYIV)[name]["schedule"] == schedule


def test_slides_are_due_like_a_one_off() -> None:
    all_templates = templates(NOW, KYIV)
    assert all_templates["slides"]["schedule"] == all_templates["one_off"]["schedule"]


@pytest.mark.parametrize(
    ("name", "stages"),
    [
        ("ev", [("Plug it in", "todo", "Plugged in"), ("Charging", "running", "Charged")]),
        ("slides", [("Draft the slides", "todo", "Drafted"), ("Rehearse", "waiting", "Rehearsed")]),
        ("bills", [("Pay", "todo", "Paid"), ("Check it went through", "waiting", "Confirmed")]),
    ],
)
def test_two_stage_templates(name: str, stages: list[tuple[str, str, str]]) -> None:
    found = templates(NOW, KYIV)[name]["stages"]
    assert [(stage["title"], stage["role"], stage["action"]) for stage in found] == stages
