# Housetide specification

Housetide is a Home Assistant custom integration for recurring and one-off household tasks. A task can be a chain of stages that advance by hand or by a sensor. Its frontend is one entry module holding a Lovelace card and a sidebar panel, with each scene but `generic` in a chunk of its own. Domain `housetide`, card `custom:housetide-card`, panel element `housetide-panel`, panel URL `/housetide`.

Code rules: almost no comments. Python 3.14, type hints, ruff clean. TypeScript strict, oxlint and oxfmt clean, Lit 3 using `static properties` and `declare` fields (no decorators). No runtime dependency beyond `lit`. Never read the wall clock inside pure logic; `now` is an argument.

## Repository layout

- `custom_components/housetide/engine/` pure Python, no `homeassistant` imports: `models.py`, `schedule.py`, `machine.py`, `triggers.py`, `views.py`, `stats.py`, `templates.py`, `pomodoro.py`.
- `custom_components/housetide/` the Home Assistant layer: `__init__.py`, `const.py`, `config_flow.py`, `store.py`, `manager.py`, `websocket_api.py`, `services.py`, `services.yaml`, `sensor.py`, `binary_sensor.py`, `todo.py`, `panel.py`, `strings.json`, `translations/en.json`, `translations/uk.json`.
- `custom_components/housetide/frontend/` the build output, committed: the entry `housetide.js` next to content-hashed chunks (`<scene>-<hash>.js`, shared code in `housetide-<hash>.js`). `bun run build` (`scripts/build.ts`) removes every other file, so the directory holds exactly the current chunks. The module URL is `housetide.js?v=<hash of the built entry>`, so every build gets a new URL.
- `frontend/src/` TypeScript: `housetide.ts` (entry, registers the cards, the editor and the panel), `types.ts` (mirrors the JSON below), `api.ts`, `i18n.ts`, `scenes/*.ts`, `card.ts`, `card-editor.ts`, `pomodoro-card.ts`, `panel/*.ts`, `styles.ts`.
- `tests/engine/` plain pytest. `tests/integration/` uses pytest-homeassistant-custom-component. `frontend/src/**/*.test.ts` bun test with happy-dom.

Tools come from mise: `mise exec -- bun run <script>` and `.venv/bin/pytest`, `.venv/bin/ruff`.

## JSON model (snake_case on the wire, identical in Python and TypeScript)

Task:
`{id, title, icon: str|null, color: str|null, look: Look|null (default null), notes: str|null, assignee: str|null, enabled: bool, schedule: Schedule, on_missed: "carry"|"skip", scene: "generic"|"pills"|"laundry"|"plant"|"teeth"|"bed"|"dishes"|"trash"|"vacuum"|"pet"|"bathroom"|"fridge"|"window"|"water"|"cooler"|"gym"|"pool"|"ev"|"fuel"|"study"|"language"|"coding"|"slides"|"book"|"filter"|"bills"|"yoga"|"run"|"groceries"|"cooking"|"call"|"journal"|"lawn"|"music"|"backup"|"carwash"|"owl"|"mop"|"dust"|"iron"|"wardrobe"|"smoke"|"aircon"|"mail"|"recycle"|"dogwalk"|"litter"|"aquarium"|"garden"|"pressure"|"doctor"|"sleep"|"skincare"|"haircut"|"eyes"|"tyres"|"service"|"inbox"|"taxes"|"gift"|"suitcase"|"tomato", stages: Stage[] (at least one), clean_for_minutes: int (default 720), grace_hours: int (default 24)}`

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
`{history_retention_days: int (default 365), focus_minutes: int (default 25), short_break_minutes: int (default 5), long_break_minutes: int (default 15), rounds_until_long_break: int (default 4), auto_start_breaks: bool (default true), auto_start_focus: bool (default false)}`. Durations are 1..1440 minutes and `rounds_until_long_break` is 1..12.

PomodoroState:
`{phase: "idle"|"focus"|"short_break"|"long_break", ends_at: ISO|null, paused_remaining_seconds: float|null, duration_seconds: int|null, round: int>=1, next_phase: "focus"|"short_break"|"long_break", rounds_today: int>=0, rounds_date: "YYYY-MM-DD"|null}`. An `idle` timer has none of `ends_at`, `paused_remaining_seconds` and `duration_seconds`. A phase has `duration_seconds`, the length it started with, and exactly one of the other two: `ends_at` while running, `paused_remaining_seconds` while paused. `next_phase` is what Start begins from `idle`, and is `"focus"` during a phase. A stored state that breaks these rules loads as a fresh `idle` state.

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

Built-in templates from `templates.py`, returned ready to create (no id): `laundry` (scene laundry, interval 7 days, carry, stages Collect/load role todo with `complete_when` power above 10 for 60 s, Washing role running with `complete_when` power below 5 for 300 s, Hang it up role waiting with stale_after_minutes 180; the power entity is left as an empty string for the user to fill in), `pills` (scene pills, daily 08:00, skip, one stage), `plant` (scene plant, interval 7 days, carry, one stage), `cooler` (scene cooler, interval 14 days at 10:00, carry, stages Order bottles role todo, Waiting for delivery role waiting with stale_after_minutes 2880), `one_off` (generic, once). One template per remaining scene, keyed by the scene name, with stage ids unique across all templates: `gym` (weekly Mon, Wed, Fri 18:00, skip), `pool` (weekly Tue, Sat 18:00, skip), `ev` (interval 7 days 20:00, carry, stages Plug it in role todo, Charging role running), `fuel` (interval 14 days 18:00, carry), `study` (weekly Mon to Fri 19:00, skip), `language` (daily 09:00, skip), `coding` (weekly Tue, Thu 20:00, skip), `slides` (once, due like `one_off`, carry, stages Draft the slides role todo, Rehearse role waiting), `book` (daily 21:30, skip), `filter` (interval 90 days 10:00, carry), `bills` (interval 30 days 10:00 anchored to the schedule, carry, stages Pay role todo, Check it went through role waiting), `yoga` (daily 07:30, skip), `run` (weekly Tue, Thu, Sat 07:00, skip), `groceries` (interval 7 days 17:00, carry), `cooking` (daily 18:30, skip), `call` (interval 7 days 19:00, carry), `journal` (daily 22:00, skip), `lawn` (interval 14 days 11:00, carry), `music` (weekly Mon, Thu 20:00, skip), `backup` (interval 30 days 20:00 anchored to the schedule, carry), `carwash` (interval 30 days 11:00, carry), `owl` (daily, `anytime` with deadline 23:59, skip, grace_hours 6, stage id `owl_do`), `mop` (interval 7 days 11:00, carry), `dust` (interval 14 days 11:00, carry), `iron` (weekly Sun 19:00, carry), `wardrobe` (interval 90 days 11:00, carry), `smoke` (interval 180 days 11:00 anchored to the schedule, carry), `aircon` (interval 90 days 11:00, carry), `mail` (interval 3 days 18:00, carry), `recycle` (interval 7 days 19:00, carry), `dogwalk` (daily 08:00, skip), `litter` (daily 09:00, carry), `aquarium` (interval 14 days 11:00, carry), `garden` (interval 3 days 18:00, carry), `pressure` (daily 09:00, skip), `doctor` (interval 180 days 10:00 anchored to the schedule, carry, stages Book role todo, Go to the appointment role waiting), `sleep` (daily 23:00, skip), `skincare` (daily 22:00, skip), `haircut` (interval 30 days 12:00, carry), `eyes` (daily 15:00, skip), `tyres` (interval 30 days 11:00, carry), `service` (interval 180 days 10:00 anchored to the schedule, carry, stages Book it role todo, Drop it off role waiting), `inbox` (daily, `anytime` with deadline 23:59, skip, grace_hours 6), `taxes` (interval 90 days 10:00 anchored to the schedule, carry, stages Prepare role todo, Submit role waiting), `gift` (interval 365 days 10:00 anchored to the schedule, carry, stages Find a gift role todo, Wrap it role waiting), `suitcase` (once, due like `one_off`, carry). Intervals count from completion unless stated. The scene `tomato` belongs to the Pomodoro timer: it has no template and is not offered in the scene picker.

### Pomodoro timer

The timer is its own feature, not a task: it has no occurrences, no history events and no stats. `engine/pomodoro.py` is pure, with `start`, `pause`, `resume`, `skip`, `stop`, `reset`, `expire` and `roll_day`. An action that is not allowed raises a `MachineError`.

- `round` is the focus round of the set, from 1, and a break belongs to the round before it. The break after a focus of round N is short, or long when N is at least `rounds_until_long_break`. A short break ending moves to round N+1 and a long break ending to round 1.
- Start works only from `idle` and begins `next_phase`. It clamps a `round` beyond a set that was shortened.
- A focus that runs out adds one to `rounds_today`. The break then starts by itself with `auto_start_breaks`; otherwise the timer goes `idle` with the break as `next_phase`. A break that runs out starts the next focus by itself with `auto_start_focus`, and otherwise goes `idle`.
- Pause keeps the exact time left, and resume sets `ends_at` to now plus that time. A paused phase never expires.
- Skip follows the same path as a phase running out, but never counts a round. From `idle` it skips a pending break and is refused when `next_phase` is `focus`. Stop goes `idle` without starting anything and without counting: a stopped focus keeps its round, a stopped break finishes its round. Pause needs a running phase, resume a paused one, stop any phase.
- Reset, allowed at any time, returns to `idle` on round 1 with `rounds_today` 0.
- `rounds_date` is the local date `rounds_today` belongs to. On a new local day `rounds_today` is 0, and an `idle` timer also goes back to round 1 with `next_phase` `focus`; a running or paused phase keeps its round and counts for the day it ends on.
- A changed setting applies from the next phase on. The running phase keeps its `ends_at` and `duration_seconds`.

`expire(state, settings, now, zone)` replays every phase with `ends_at <= now`, each one ending at its own `ends_at` and the next starting at that moment, counted on the local date of that moment. Replaying from the same stored state gives the same result, so a restart cannot count a round twice. Startup runs it before the entities are added.

## Home Assistant layer

One config entry, created by a config flow without fields. Data lives in two `Store`s: `housetide.tasks` (tasks, runtimes, settings, pomodoro) and `housetide.history` (events, pruned by retention, capped at 20000). Saves are delayed. A manager owns all state, runs a tick every 30 seconds for rollovers, the Pomodoro new-day reset and view refresh, listens to the state of the entities the current stages need, and pushes changes to subscribers.

Events fired on the bus: `housetide_task_due`, `housetide_task_advanced`, `housetide_task_completed`, `housetide_task_skipped`, `housetide_task_missed`, each with `task_id`, `title`, `stage_id`, `source`. `housetide_pomodoro_phase` has `from`, `to`, `round`, `rounds_today` and is fired whenever the phase changes, by hand or by time, but not on pause or resume. Phases replayed at startup fire one event from the stored phase to the final one, so an automation does not ring once per missed phase. A Pomodoro phase ends through one point-in-time callback, armed for `ends_at` and cancelled on pause, stop, reset, skip and unload; nothing polls for it.

Entities: one `sensor` per task with `status` as state and the TaskView as attributes, added and removed as tasks change; one `binary_sensor.housetide_due` that is on when any task is due or overdue, with a count; one `todo` list `todo.housetide` showing today's tasks, where completing an item advances that task; one `sensor.housetide_pomodoro` whose state is the phase, with attributes `ends_at`, `round` and `rounds_today`. Unique ids are based on the task id, and the Pomodoro sensor's on the config entry id.

Services `housetide.advance`, `housetide.skip`, `housetide.undo`, each with `task_id`, and without fields `housetide.pomodoro_start`, `pomodoro_pause`, `pomodoro_resume`, `pomodoro_skip`, `pomodoro_stop`.

Websocket commands, all under `housetide/`:
`state` → `{tasks, views, settings, pomodoro, now}`; `subscribe` (subscription, sends the same payload on every change, first message immediately); `advance`, `skip`, `undo` with `task_id`; `history` with optional `task_id`, `limit`, `before`; `stats` with optional `task_id`, `days`; `templates`; and, admin only, `task/create` with `task`, `task/update` with `task`, `task/delete` with `task_id`, `settings/update` with `settings` (a partial update: keys left out keep their value). `pomodoro/start`, `pomodoro/pause`, `pomodoro/resume`, `pomodoro/skip`, `pomodoro/stop` and `pomodoro/reset` are open to every user and return the PomodoroState; one that is not allowed is a `not_allowed` error. `advance`, `skip` and `undo` record `connection.user.id`. Everything is validated, and bad input returns a websocket error rather than raising.

The directory `custom_components/housetide/frontend/` is served at `/housetide_static/`. The entry is `/housetide_static/housetide.js` with cache busting from the manifest version. Chunks are imported by relative URL, which drops the query string, and carry no query of their own, so the panel and the card share one copy of every module. The panel is registered with `panel_custom` (sidebar title Housetide, icon `mdi:waves`), and the same bundle is added with `frontend.add_extra_js_url` so that the card is available on every dashboard. Unloading the entry removes the panel and stops listeners and timers.

## Frontend

`housetide-card` config (all optional): `tasks: string[]` (ids, default all), `show: "today"|"all"`, `layout: "list"|"scenes"`, `columns: 2|3|4` (tiles only, default auto) (compact strips or tiles, both drawn as one picture with the text and button on the scene surface), `title`, `animations: bool` (default true). It offers `getConfigElement`, `getStubConfig`, `getGridOptions`, `getCardSize` and registers in `window.customCards`. `getConfigElement` returns `housetide-card-editor`, a visual editor for those options. The editor never writes a default the config did not already have, keeps unknown task ids and unknown config keys, and saves `tasks` in tick order, which is the display order. It subscribes once through `hass.connection.subscribeMessage`, re-renders on pushes and on a 30 second tick, and unsubscribes on disconnect. Rows keep a constant height. A row shows the scene thumbnail, title, stage, due text and one large touch target that advances the current stage. When a task is automated the row says so, but it still can be advanced by hand. A small undo appears after an advance. A press on a task that is not due yet needs a second confirming press, except for an `anytime` task on its deadline day (`is_today`), which completes on the first.

`housetide-panel` receives `hass`, `narrow`, `route`, `panel`. Three tabs: Today (the scenes large), Tasks (list, create from a template, full editor for schedule, stages and triggers including an entity field with suggestions from `hass.states` and a live view of the current value; admin only, others see it read-only), History (timeline filtered by task, day grid of the last 90 days, streak and on-time numbers). Only native form controls and Lit, styled with Home Assistant theme variables, because `ha-form` and friends are not guaranteed to be loaded in a custom panel.

`housetide-pomodoro` is the timer widget, drawn as one picture like a tile, with the text and buttons on the colours of the scene. It sits on the Today tab in a section that collapses, remembered in `localStorage` under `housetide.today.pomodoro`, and in the dashboard card `custom:housetide-pomodoro-card` (config: optional `title`; stub config `{}`; listed in `window.customCards`). It shows the status, an `mm:ss` countdown from `ends_at` against the server clock, the rounds of the set as dots and `rounds_today`. While `idle` the countdown shows the full length of `next_phase`. It re-renders itself alone once a second, only while a phase is running, the page is visible and the widget is on screen, and the scene is guarded so that a tick leaves it untouched until the dial moves a step. Buttons at least 60px high: Start from `idle`, Pause or Resume plus Skip and Stop in a phase, Skip for a pending break, and Reset from `idle` once there is something to reset.

The `tomato` scene shows the timer as: `resting` for a fresh `idle`, `due` for any other `idle`, `running` for focus, `waiting` while paused, `accumulating` for a short break and `clean` for a long break. `progress` and `fill` are the share of the phase gone, in twelfths, and `stink` is 0.

The Tasks tab has the Pomodoro durations, the rounds and the two auto-start switches next to the other settings, admin only.

Scenes are pure functions from `scene` plus options to an SVG template, drawn in flat style and visually delightful, using CSS transform and opacity animations only. They stop animating when `animations` is false, when `prefers-reduced-motion` is set, and on hidden pages.

Every scene except `generic` is loaded on demand (`scenes/lazy.ts`). `renderScene` stays synchronous: until the chunk has arrived it returns the scene's own `frame()` with no art, the same wall, floor and size, and an async directive replaces that with the scene when it arrives, including behind `guard`. A chunk is fetched once, and only when its placeholder comes within 200px of the viewport, so a scene that is filtered out or scrolled away costs nothing. "Within 200px" is measured against the nearest scrolling ancestor, across shadow roots, or the viewport when there is none. A failed fetch keeps the placeholder, never throws, and is retried after 30 seconds while the scene is still shown. A retry imports the chunk under a distinct URL (`?retry=n`), because a browser never refetches a module URL that failed, and the build writes the table of chunk names into the entry for it. After a failed fetch a page compares the live entry, fetched past the cache, with its own chunk name: when the entry no longer names that chunk the page belongs to an older build and reloads, at most once per build (`sessionStorage`, key `housetide.stale-build`). An unknown name draws `generic` at once. `preloadScene` and `preloadAllScenes` load chunks ahead of time and reject on failure; `scripts/render-docs.ts` and the tests use them so that rendering is fully synchronous there.

- `laundry`: `accumulating` a basket with a pile of colorful clothes that grows with `fill` in visible steps; `due` the pile overflows; rising `stink` adds wavy green stench lines and then flies; `running` the washing machine rumbles, drum turning, bubbles; `waiting` the machine has stopped, door with wet clothes, drips, and `stink` adds a musty cloud; `clean` folded laundry or a drying line with sparkles.
- `pills`: a blister pack of seven drawn from `slots` when present: `taken` cells are popped and empty, `missed` cells keep their pill in place, slightly muted, `full` cells are normal, and the `current` cell always pulses, softly while it is upcoming, running or waiting and at full strength when `due`; `clean` the last `taken` cell gets a check; `stink` makes the pack look increasingly neglected. Without `slots` the cells come from the `day` option, earlier days popped and the rest full.
- `plant`: a pot whose plant droops with `fill` and wilts with `stink`; `clean` perks up with water drops.
- `teeth`, `bed`, `dishes`, `trash`, `vacuum`, `pet`, `bathroom`, `fridge`, `window`, `water`, `gym`, `pool`, `ev`, `fuel`, `study`, `language`, `coding`, `slides`, `book`, `filter`, `bills`, `yoga`, `run`, `groceries`, `cooking`, `call`, `journal`, `lawn`, `music`, `backup`, `carwash`, `mop`, `dust`, `iron`, `wardrobe`, `smoke`, `aircon`, `mail`, `recycle`, `dogwalk`, `litter`, `aquarium`, `garden`, `pressure`, `doctor`, `sleep`, `skincare`, `haircut`, `eyes`, `tyres`, `service`, `inbox`, `taxes`, `gift`, `suitcase`: each draws its own chore through all six states, building up with `fill` and getting visibly worse with `stink`.
- `cooler`: a water cooler whose bottle empties in steps with `fill` while the spare bottles run out; `running` is placing the order, drawn only for a stage with role `running`, so the built-in template goes from `due` straight to `waiting`; `waiting` is the delivery on its way, `clean` a fresh full bottle; rising `stink` brings dust, cobwebs, stench and flies.
- `owl`: an original owl with ear tufts and a knitted scarf, lilac by default, watching the task. `resting` asleep on a perch, `accumulating` its eyes light up in steps with `fill`, `due` eyes fully lit with a clock beside it, `running` supervising with a clipboard, `waiting` tapping a foot with the knife lowered, `clean` hearts. While `due`, rising `stink` makes the look more unhinged and a butter knife comes out bit by bit, absent at `stink` 0 and fully out from 0.85.
- `tomato`: an original tomato character with a kitchen-timer dial for the Pomodoro timer, the dial lit in twelve steps with `progress`; `running` focused at the desk, `waiting` paused, `accumulating` distracted by a phone, `clean` in a hammock; rising `stink` rots it and brings stench and flies.
- `generic`: a ring that fills up like a tide, with stink as a warm tint.

`scene.look.accent` recolours the main object of every scene except `generic`, and an invalid value is ignored. `scene.look.variant` selects a drawing where one exists (`scenes/looks.ts`): `pet` is `cat` (default) or `dog`, `laundry` is `colored` (default), `white` or `black`. The task editor edits both under Look, with a live preview, and changing the scene drops a variant the new scene does not have.

For `daily`, `weekly` and `interval` the task editor has an "Any time during the day" switch. Turning it on sets the time to `23:59` and relabels it as the deadline, and the grace hours field is relabelled as how long before the deadline the nagging starts. It also changes a grace of `24` to `6`, so the task does not nag all day. Turning it off puts `09:00` back if the time is still `23:59` and `24` back if the grace is still `6`, and otherwise keeps them. An empty deadline is saved as `23:59`. The schedule summary reads "Every day, any time, by 18:00". For an `anytime` task on its day the due text reads "Today, any time" while `upcoming` and the time left until the deadline while `due`, falling back to the usual texts otherwise.

The template list on the Tasks tab and the scene picker in the editor share the same headings (Home, Pets and plants, Health, Car, Learning and work, Life) and each has a text filter.

Text uses `Intl` for dates and relative times and `i18n.ts` for labels in English and Ukrainian, falling back to English.
