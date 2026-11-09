# Changelog

## 0.2.0

### Added

- **Weekly pill packs.** Every occurrence now has a cell in a seven-cell pack. Taken pills pop out, missed ones stay in place and look ashamed, and the current one pulses.
- **Fifty-seven new scenes, each with a template.** That makes sixty-one templates and, with the tomato below, sixty-two scenes. Eleven for the house: teeth, sheets, dishes, trash, vacuuming, the cat, the bathroom, the fridge, windows, a glass of water and a water cooler with a delivery van. Twenty-two for everything else: the gym, the pool, yoga, a run, charging, fuel and washing the car, study, a language, code, a presentation, a book, a water filter, bills, groceries, dinner, a phone call, a journal, the lawn, an instrument, a backup and an owl. Twenty-four more: mopping, dusting, ironing, the wardrobe, a smoke detector, the air conditioner, the post, recycling, a dog walk, a litter box, an aquarium, the garden, blood pressure, a check-up, bedtime, skincare, a haircut, resting your eyes, tyres, a car service, the inbox, taxes, a birthday gift and a suitcase.
- **A Pomodoro timer.** Focus rounds, short breaks and a long one, with a tomato and its kitchen-timer dial. It sits on the Today tab and comes as a card, `custom:housetide-pomodoro-card`. Durations, rounds and two auto-start switches are on the Tasks tab. It has `sensor.housetide_pomodoro`, five services and the `housetide_pomodoro_phase` event, and it is not a task, so it has no history or streaks.
- **Tasks with no set time.** Daily, weekly and interval tasks can ask for "some time today" instead of a time. The time becomes a deadline, 23:59 by default, and the grace period becomes how long before it the nagging starts. One tap finishes it, and a finished day stays finished.
- **The owl.** A new scene and a **Do it today. Or else.** template, due any time before 23:59 with six hours of nagging. Its eyes light up as the day goes on, and if you run late the stare gets worse and a butter knife comes out, a little at a time.
- **Make a scene yours.** Each task has a look: an accent colour from ten swatches or the colour picker, and a variant where the scene has one. The pet can be a dog. The laundry can be whites or darks.
- **Templates and scenes in groups.** The template list and the scene picker share six headings, and each has a filter by name.
- **Picture tiles and strips.** A task is now one picture, with its text and button drawn on the scene. The card has a `layout` option: `list` or `scenes`.
- **A layout switch on the Today tab** of the sidebar page. Each browser remembers its own choice.
- **A visual card editor.** Title, layout, what to show, which tasks and in what order, animations. No YAML needed, though it still works.

### Changed

- Scenes load on demand. Every scene except Tide is its own chunk, fetched once when it comes near the screen, so a scene you never see costs nothing. Until it arrives you get its empty wall and floor, and a failed fetch tries again after 30 seconds. A page left open across an update reloads itself once when it asks for a scene that is gone.
- Superellipse corners across the card, the panel and the art, in browsers that support `corner-shape`.
- The animated README art moves element by element: pills pop, laundry flies into the drum, the plant droops at the joints.
- `hacs.json` now states the real minimum, Home Assistant 2026.3. The code needs Python 3.14, and 2026.3 is the first release that runs on it.

## 0.1.0

First release.

- One-off and recurring tasks: daily, weekly, every N days counted from completion or on a fixed rhythm.
- Tasks as chains of stages, finished by hand or by a sensor holding a condition for as long as you say.
- Animated scenes for laundry, pills, plants and everything else, which get worse the longer you ignore them.
- A sidebar page with Today, Tasks and History, a dashboard card, a sensor per task, `binary_sensor.housetide_due`, `todo.housetide`, services and events.
- English and Ukrainian.
