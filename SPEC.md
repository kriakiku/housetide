# Housetide specification

Housetide is a Home Assistant custom integration for recurring and one-off household tasks. A task can be a chain of stages that advance by hand or by a sensor. Its frontend is one bundle holding a Lovelace card and a sidebar panel. Domain `housetide`, card `custom:housetide-card`, panel element `housetide-panel`, panel URL `/housetide`.

Code rules: almost no comments. Python 3.14, type hints, ruff clean. TypeScript strict, oxlint and oxfmt clean, Lit 3 using `static properties` and `declare` fields (no decorators). No runtime dependency beyond `lit`. Never read the wall clock inside pure logic; `now` is an argument.

## Repository layout

- `custom_components/housetide/engine/` pure Python, no `homeassistant` imports: `models.py`, `schedule.py`, `machine.py`, `triggers.py`, `views.py`, `stats.py`, `templates.py`.
- `custom_components/housetide/` the Home Assistant layer: `__init__.py`, `const.py`, `config_flow.py`, `store.py`, `manager.py`, `websocket_api.py`, `services.py`, `services.yaml`, `sensor.py`, `binary_sensor.py`, `todo.py`, `panel.py`, `strings.json`, `translations/en.json`, `translations/uk.json`.
- `custom_components/housetide/frontend/housetide.js` the built bundle, committed.
- `frontend/src/` TypeScript: `housetide.ts` (entry, registers the card, its editor and the panel), `types.ts` (mirrors the JSON below), `api.ts`, `i18n.ts`, `scenes/*.ts`, `card.ts`, `card-editor.ts`, `panel/*.ts`, `styles.ts`.
- `tests/engine/` plain pytest. `tests/integration/` uses pytest-homeassistant-custom-component. `frontend/src/**/*.test.ts` bun test with happy-dom.

Tools come from mise: `mise exec -- bun run <script>` and `.venv/bin/pytest`, `.venv/bin/ruff`.

## JSON model (snake_case on the wire, identical in Python and TypeScript)

Task:
`{id, title, icon: str|null, color: str|null, look: Look|null (default null), notes: str|null, assignee: str|null, enabled: bool, schedule: Schedule, on_missed: "carry"|"skip", scene: "generic"|"pills"|"laundry"|"plant"|"teeth"|"bed"|"dishes"|"trash"|"vacuum"|"pet"|"bathroom"|"fridge"|"window"|"water"|"cooler"|"gym"|"pool"|"ev"|"fuel"|"study"|"language"|"coding"|"slides"|"book"|"filter"|"bills"|"yoga"|"run"|"groceries"|"cooking"|"call"|"journal"|"lawn"|"music"|"backup"|"carwash"|"owl", stages: Stage[] (at least one), clean_for_minutes: int (default 720), grace_hours: int (default 24)}`

Look: `{accent: "#rrggbb"|null, variant: str|null (non-empty, at most 32 characters)}`. A look with both values null is stored as `look: null`. The backend does not check a variant against the scene; a scene ignores a variant it does not draw.

Schedule, one of:

- `{type:"once", due:"<ISO 8601 with offset>"}`
- `{type:"daily", time:"HH:MM", anytime?: bool}`
- `{type:"weekly", weekdays:[0..6, Monday=0], time:"HH:MM", anytime?: bool}`
- `{type:"interval", every_days:int>=1, time:"HH:MM", anchor:"completion"|"schedule", anytime?: bool}`

`anytime` defaults to false and is left out of the JSON when false, so a `false` never appears on output. With `anytime: true`, `time` is the deadline of that day and may be left out on input, defaulting to `23:59`. A `once` schedule has no `anytime` and rejects the field.

Stage:
`{id, title, action: str|null, role: "todo"|"running"|"waiting", complete_when: Trigger|null, stale_after_minutes: int|null}`

Trigger:
`{entity_id, above: float|null, below: float|null, state: str|null, for_seconds: int>=0}`. Exactly one of `above`, `below`, `state` is set.

Runtime, stored per task:
`{task_id, occurrence_id, due_at: ISO|null, stage_index: int, stage_entered_at: ISO|null, started_at: ISO|null, last_completed_at: ISO|null, next_due_at: ISO|null, clean_until: ISO|null, pack: Pack|null, undo: Runtime|null (one level, undo of undo is null)}`. Stored runtimes without `pack` load as null.

Pack, the blister in use:
`{cycle: int, taken: [slot...], missed: [slot...]}`, where a slot is 0..6 and a slot is in at most one list.

TaskView, computed by `views.task_view(task, runtime, now)`:
`{task_id, title, icon, color, status, stage_index, stage_count, stage_id, stage_title, action, role, due_at, next_due_at, started_at, last_completed_at, is_today: bool, overdue_seconds: int, can_advance: bool, can_skip: bool, can_undo: bool, automated: bool, anytime: bool, scene: {name, state, fill: 0..1, stink: 0..1, progress: 0..1, slots?: ("taken"|"missed"|"current"|"full")[7], look?: Look}}`. `slots` is present only when the scene name is `pills`. `look` is present only when the task has one.

Status values: `upcoming` (not due yet), `due`, `overdue` (past due), `in_progress` (past the first stage or the first stage was started), `clean` (finished recently, inside clean_for_minutes), `done` (one-off finished), `disabled`.

Scene state values: `resting`, `accumulating`, `due`, `running`, `waiting`, `clean`.

`fill` is how far the task has built up between `last_completed_at` (or creation) and the due time, clamped. `stink` starts at 0 and reaches 1 over `grace_hours` after the due time. For an `anytime` schedule both differ, see Any-time tasks. In a stage with `stale_after_minutes`, it instead rises from 0 at that threshold to 1 at twice that threshold. `progress` is `stage_index / stage_count`, or 1 when clean.

HistoryEvent:
`{id, ts, task_id, task_title, occurrence_id, type: "started"|"advanced"|"completed"|"skipped"|"missed"|"undone"|"created"|"deleted", stage_id, stage_title, source: "manual"|"trigger"|"service"|"schedule"|"todo", user_id: str|null, on_time: bool|null}`

Stats, from `stats.summary(events, now, days, zone)`:
`{current_streak, best_streak, completed, skipped, missed, on_time_rate: 0..1|null, per_day: [{date:"YYYY-MM-DD", completed, skipped, missed}]}`, where a streak counts consecutive occurrences not skipped or missed.

Settings:
`{history_retention_days: int (default 365)}`

## Behaviour

Schedules use wall-clock time in the Home Assistant time zone and must be correct across DST, including nonexistent and repeated local times. `next_due(schedule, after, zone, last_completed)` returns the first due moment strictly after `after`, or null for a finished one-off. For `interval` with `anchor:"completion"` it counts from the last completion; for `anchor:"schedule"` it keeps a fixed rhythm from the previous due date, skipping forward past `after`.

Advancing moves to the next stage. Advancing the last stage completes the occurrence: `last_completed_at`, `clean_until` and the next occurrence are set, and a `completed` event is logged with `on_time` true when completed at or before due plus `grace_hours`. The first advance of a multi-stage task also logs `started`.

Skip ends the occurrence without completing it and logs `skipped`. A rollover happens when the next scheduled moment arrives while an occurrence is unfinished and still on stage 0: with `on_missed:"skip"` it logs `missed` and moves to the next occurrence; with `on_missed:"carry"` it stays overdue. An occurrence already past stage 0 is never rolled over.

Triggers are active for the current stage at all times, including when a task is `upcoming` or `clean`: starting the washing machine early starts the occurrence early, and the next due date is computed after that completion. A trigger fires only when its condition has held continuously for `for_seconds`. Values `unknown`, `unavailable` and non-numeric states for numeric triggers never match, and they do not reset a running hold; only a real value that fails the condition does. After a restart the conditions are evaluated afresh, with the hold starting at startup.

Undo restores the runtime as it was before the last transition, once, and logs `undone`. Undoing a completion or a skip gives the restored occurrence a new `occurrence_id`, and the `undone` event carries the old one, so `undone` cancels only the outcome it undid and a later `missed` backdated to the deadline still counts.

Every occurrence maps to a `(cycle, slot)` of a seven-cell pack by `schedule.dose_slot(schedule, due, zone)`, from the due date in the Home Assistant time zone and counted from Monday 2000-01-03:

- `daily`: the slot is the weekday (Monday = 0) and the pack is one ISO week.
- `weekly`: with the weekdays W sorted, `period = whole weeks since the epoch * len(W) + index of the due weekday in W`.
- `interval`: `period = whole days since the epoch div every_days`.
- `once`: slot 0, cycle 0.

For `weekly` and `interval`, `slot = period mod 7` and `cycle = period div 7`. A once-a-week task uses one pack for seven weeks, and because the counter is absolute, the current slot moves every week and a new task usually starts mid-pack.

Completing an occurrence records its slot as taken, skipping or a missed rollover records it as missed. A record for a different cycle replaces the pack with a fresh one, and a later record for a slot replaces the earlier one. An occurrence always uses the slot of its own due date, so early completion marks the slot of the occurrence that was completed and a carried occurrence keeps its slot until it is done. An occurrence on a weekday the schedule no longer has (a started occurrence kept through an edit of the weekdays) records nothing, and while it is present the cell of the next scheduled occurrence is `current`, so one cell is popped for it at most once. Undo brings the previous pack back through the runtime snapshot. Packs are recorded for every task whatever its scene. Editing a schedule so that the mapping changes (another kind, other weekdays, another `every_days`) clears the pack; changing only the time or the anchor keeps it.

`scene.slots` shows the pack in view. While the status is `clean` or `done`, the finished occurrence is in view: the stored pack is shown as it is, with no `current`, so the last dose of a pack stays visibly taken until the clean period ends. Otherwise the present occurrence is in view: its slot is `current`, and a stored pack of another cycle is ignored, which refills the pack. `missed` is a slot recorded as missed and `taken` one recorded as taken. Every other slot is `full`, including past ones with no record, so doses that were skipped, missed or never recorded stay in the pack until it changes.

`today` means due at or before the end of the local day, or already in progress or overdue.

### Any-time tasks

A `daily`, `weekly` or `interval` schedule with `anytime: true` asks for the task to be done some time during the day. `due_at` is the deadline: the schedule's `time` on that local day, resolved like any other wall-clock time. `grace_hours` then counts backwards from the deadline, in absolute hours, instead of forwards from the due time. The nag window starts at `due_at - grace_hours`, but never before local midnight of the deadline's day, so a task is not nagging the day before and a deadline at local midnight has no window at all. The rules below replace the general ones for such an occurrence and hold across DST.

- Status of an occurrence still on stage 0: `upcoming` (or `clean` inside `clean_until`) before the nag window; `due` from the start of the window through `due_at` inclusive, so with `grace_hours` 0 it is `due` only at the deadline; `overdue` after it. `next_due_at` plays no part. An `upcoming` occurrence on its deadline day is a today's task by the general `today` rule.
- Rollover: an occurrence on stage 0 with `on_missed:"skip"` is rolled over once `now` is past `due_at`. The `missed` event carries `ts = due_at`, and `next_due_at` becomes the next occurrence, repeated for as many deadlines as have passed. At exactly the deadline it has not been missed. With `on_missed:"carry"` it becomes `overdue` and stays. An occurrence past stage 0 is never rolled over.
- The first occurrence is today's when the deadline has not passed yet, and the next scheduled day's otherwise. For `interval` with no completion yet, that is the next calendar day rather than `every_days` later.
- The local day of `last_completed_at` never gets another occurrence: `next_due` looks strictly after the deadline of that day. This covers completing during the day, completing a carried occurrence on a later day, and editing or re-enabling a task after completing it. Skipping and rollover move past their own deadline only.
- `on_time` of a `completed` event is true at or before `due_at`.
- `scene.fill`: never drops. On earlier days the general formula. From local midnight of the deadline's day on, the greater of the general formula and the share of that local day gone between local midnight and `due_at`, clamped, that share being 1 when the deadline is itself at local midnight.
- `scene.stink`: 0 until the nag window starts, then linear up to 1 at `due_at`, and 1 while overdue. With no window (`grace_hours` 0 or a deadline at local midnight) it is 0 before the deadline and 1 from it on. It is computed under the same status gate as the general rule, and a stage with `stale_after_minutes` keeps its own rule.
- Packs use the date of `due_at` through `dose_slot`, as for any occurrence. Triggers and undo are unchanged.
- `TaskView.anytime` is true for such a task.

Built-in templates from `templates.py`, returned ready to create (no id): `laundry` (scene laundry, interval 7 days, carry, stages Collect/load role todo with `complete_when` power above 10 for 60 s, Washing role running with `complete_when` power below 5 for 300 s, Hang it up role waiting with stale_after_minutes 180; the power entity is left as an empty string for the user to fill in), `pills` (scene pills, daily 08:00, skip, one stage), `plant` (scene plant, interval 7 days, carry, one stage), `cooler` (scene cooler, interval 14 days at 10:00, carry, stages Order bottles role todo, Waiting for delivery role waiting with stale_after_minutes 2880), `one_off` (generic, once). One template per remaining scene, keyed by the scene name, with stage ids unique across all templates: `gym` (weekly Mon, Wed, Fri 18:00, skip), `pool` (weekly Tue, Sat 18:00, skip), `ev` (interval 7 days 20:00, carry, stages Plug it in role todo, Charging role running), `fuel` (interval 14 days 18:00, carry), `study` (weekly Mon to Fri 19:00, skip), `language` (daily 09:00, skip), `coding` (weekly Tue, Thu 20:00, skip), `slides` (once, due like `one_off`, carry, stages Draft the slides role todo, Rehearse role waiting), `book` (daily 21:30, skip), `filter` (interval 90 days 10:00, carry), `bills` (interval 30 days 10:00 anchored to the schedule, carry, stages Pay role todo, Check it went through role waiting), `yoga` (daily 07:30, skip), `run` (weekly Tue, Thu, Sat 07:00, skip), `groceries` (interval 7 days 17:00, carry), `cooking` (daily 18:30, skip), `call` (interval 7 days 19:00, carry), `journal` (daily 22:00, skip), `lawn` (interval 14 days 11:00, carry), `music` (weekly Mon, Thu 20:00, skip), `backup` (interval 30 days 20:00 anchored to the schedule, carry), `carwash` (interval 30 days 11:00, carry), `owl` (daily, `anytime` with deadline 23:59, skip, grace_hours 6, stage id `owl_do`). Intervals count from completion unless stated.

## Home Assistant layer

One config entry, created by a config flow without fields. Data lives in two `Store`s: `housetide.tasks` (tasks, runtimes, settings) and `housetide.history` (events, pruned by retention, capped at 20000). Saves are delayed. A manager owns all state, runs a tick every 30 seconds for rollovers and view refresh, listens to the state of the entities the current stages need, and pushes changes to subscribers.

Events fired on the bus: `housetide_task_due`, `housetide_task_advanced`, `housetide_task_completed`, `housetide_task_skipped`, `housetide_task_missed`, each with `task_id`, `title`, `stage_id`, `source`.

Entities: one `sensor` per task with `status` as state and the TaskView as attributes, added and removed as tasks change; one `binary_sensor.housetide_due` that is on when any task is due or overdue, with a count; one `todo` list `todo.housetide` showing today's tasks, where completing an item advances that task. Unique ids are based on the task id.

Services `housetide.advance`, `housetide.skip`, `housetide.undo`, each with `task_id`.

Websocket commands, all under `housetide/`:
`state` → `{tasks, views, settings, now}`; `subscribe` (subscription, sends the same payload on every change, first message immediately); `advance`, `skip`, `undo` with `task_id`; `history` with optional `task_id`, `limit`, `before`; `stats` with optional `task_id`, `days`; `templates`; and, admin only, `task/create` with `task`, `task/update` with `task`, `task/delete` with `task_id`, `settings/update` with `settings`. `advance`, `skip` and `undo` record `connection.user.id`. Everything is validated, and bad input returns a websocket error rather than raising.

The frontend bundle is served at `/housetide_static/housetide.js` with cache busting from the manifest version. The panel is registered with `panel_custom` (sidebar title Housetide, icon `mdi:waves`), and the same bundle is added with `frontend.add_extra_js_url` so that the card is available on every dashboard. Unloading the entry removes the panel and stops listeners and timers.

## Frontend

`housetide-card` config (all optional): `tasks: string[]` (ids, default all), `show: "today"|"all"`, `layout: "list"|"scenes"` (compact strips or tiles, both drawn as one picture with the text and button on the scene surface), `title`, `animations: bool` (default true). It offers `getConfigElement`, `getStubConfig`, `getGridOptions`, `getCardSize` and registers in `window.customCards`. `getConfigElement` returns `housetide-card-editor`, a visual editor for those options. The editor never writes a default the config did not already have, keeps unknown task ids and unknown config keys, and saves `tasks` in tick order, which is the display order. It subscribes once through `hass.connection.subscribeMessage`, re-renders on pushes and on a 30 second tick, and unsubscribes on disconnect. Rows keep a constant height. A row shows the scene thumbnail, title, stage, due text and one large touch target that advances the current stage. When a task is automated the row says so, but it still can be advanced by hand. A small undo appears after an advance. A press on a task that is not due yet needs a second confirming press, except for an `anytime` task on its deadline day (`is_today`), which completes on the first.

`housetide-panel` receives `hass`, `narrow`, `route`, `panel`. Three tabs: Today (the scenes large), Tasks (list, create from a template, full editor for schedule, stages and triggers including an entity field with suggestions from `hass.states` and a live view of the current value; admin only, others see it read-only), History (timeline filtered by task, day grid of the last 90 days, streak and on-time numbers). Only native form controls and Lit, styled with Home Assistant theme variables, because `ha-form` and friends are not guaranteed to be loaded in a custom panel.

Scenes are pure functions from `scene` plus options to an SVG template, drawn in flat style and visually delightful, using CSS transform and opacity animations only. They stop animating when `animations` is false, when `prefers-reduced-motion` is set, and on hidden pages.

- `laundry`: `accumulating` a basket with a pile of colorful clothes that grows with `fill` in visible steps; `due` the pile overflows; rising `stink` adds wavy green stench lines and then flies; `running` the washing machine rumbles, drum turning, bubbles; `waiting` the machine has stopped, door with wet clothes, drips, and `stink` adds a musty cloud; `clean` folded laundry or a drying line with sparkles.
- `pills`: a blister pack of seven drawn from `slots` when present: `taken` cells are popped and empty, `missed` cells keep their pill in place, slightly muted, `full` cells are normal, and the `current` cell always pulses, softly while it is upcoming, running or waiting and at full strength when `due`; `clean` the last `taken` cell gets a check; `stink` makes the pack look increasingly neglected. Without `slots` the cells come from the `day` option, earlier days popped and the rest full.
- `plant`: a pot whose plant droops with `fill` and wilts with `stink`; `clean` perks up with water drops.
- `teeth`, `bed`, `dishes`, `trash`, `vacuum`, `pet`, `bathroom`, `fridge`, `window`, `water`, `gym`, `pool`, `ev`, `fuel`, `study`, `language`, `coding`, `slides`, `book`, `filter`, `bills`, `yoga`, `run`, `groceries`, `cooking`, `call`, `journal`, `lawn`, `music`, `backup`, `carwash`: each draws its own chore through all six states, building up with `fill` and getting visibly worse with `stink`.
- `cooler`: a water cooler whose bottle empties in steps with `fill` while the spare bottles run out; `running` is placing the order, drawn only for a stage with role `running`, so the built-in template goes from `due` straight to `waiting`; `waiting` is the delivery on its way, `clean` a fresh full bottle; rising `stink` brings dust, cobwebs, stench and flies.
- `owl`: an original owl with ear tufts and a knitted scarf, lilac by default, watching the task. `resting` asleep on a perch, `accumulating` its eyes light up in steps with `fill`, `due` eyes fully lit with a clock beside it, `running` supervising with a clipboard, `waiting` tapping a foot with the knife lowered, `clean` hearts. While `due`, rising `stink` makes the look more unhinged and a butter knife comes out bit by bit, absent at `stink` 0 and fully out from 0.85.
- `generic`: a ring that fills up like a tide, with stink as a warm tint.

`scene.look.accent` recolours the main object of every scene except `generic`, and an invalid value is ignored. `scene.look.variant` selects a drawing where one exists (`scenes/looks.ts`): `pet` is `cat` (default) or `dog`, `laundry` is `colored` (default), `white` or `black`. The task editor edits both under Look, with a live preview, and changing the scene drops a variant the new scene does not have.

For `daily`, `weekly` and `interval` the task editor has an "Any time during the day" switch. Turning it on sets the time to `23:59` and relabels it as the deadline, and the grace hours field is relabelled as how long before the deadline the nagging starts. It also changes a grace of `24` to `6`, so the task does not nag all day. Turning it off puts `09:00` back if the time is still `23:59` and `24` back if the grace is still `6`, and otherwise keeps them. An empty deadline is saved as `23:59`. The schedule summary reads "Every day, any time, by 18:00". For an `anytime` task on its day the due text reads "Today, any time" while `upcoming` and the time left until the deadline while `due`, falling back to the usual texts otherwise.

The template list on the Tasks tab and the scene picker in the editor share the same headings (Home, Pets and plants, Health, Car, Learning and work, Life) and each has a text filter.

Text uses `Intl` for dates and relative times and `i18n.ts` for labels in English and Ukrainian, falling back to English.
