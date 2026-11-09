import type { HomeAssistant, Schedule, TaskView } from './types.ts'

const en = {
  app_title: 'Housetide',
  tab_today: 'Today',
  tab_tasks: 'Tasks',
  tab_history: 'History',
  card_title: 'Today',
  card_empty: 'All clear. Nothing due today.',
  card_loading: 'Loading tasks…',
  card_error: 'Housetide is not available',
  config_tasks: 'Tasks',
  config_tasks_hint:
    'Nothing ticked means all tasks. Ticked tasks appear in the order you tick them.',
  config_tasks_unknown: 'Task not found',
  config_tasks_kept: 'Your ticked tasks stay as they are.',
  config_show: 'Show',
  config_show_today: 'Today',
  config_show_all: 'All tasks',
  config_layout: 'Layout',
  config_layout_list: 'List',
  config_layout_scenes: 'Scenes',
  config_title: 'Title',
  config_animations: 'Animations',
  action_advance: 'Done',
  action_start: 'Start',
  action_early: 'Do early',
  action_early_confirm: 'Sure?',
  action_skip: 'Skip',
  action_undo: 'Undo',
  action_save: 'Save',
  action_cancel: 'Cancel',
  action_delete: 'Delete',
  action_edit: 'Edit',
  action_add: 'Add',
  action_add_stage: 'Add stage',
  action_remove: 'Remove',
  action_load_more: 'Load more',
  action_new_task: 'New task',
  action_move_up: 'Move up',
  action_move_down: 'Move down',
  status_upcoming: 'Upcoming',
  status_due: 'Due',
  status_overdue: 'Overdue',
  status_in_progress: 'In progress',
  status_clean: 'Clean',
  status_done: 'Done',
  status_disabled: 'Paused',
  automated: 'Automatic',
  due_now: 'Due now',
  due_when: 'Due {when}',
  due_anytime_today: 'Today, any time',
  due_anytime_left: '{duration} left',
  next_when: 'Next {when}',
  overdue_for: 'Overdue · {duration}',
  started_when: 'Started {when}',
  done_when: 'Done {when}',
  not_scheduled: 'Not scheduled',
  stage_progress: 'Step {current} of {total}',
  template_laundry: 'Laundry',
  template_pills: 'Pills',
  template_plant: 'Water the plant',
  template_teeth: 'Brush your teeth',
  template_bed: 'Change the sheets',
  template_dishes: 'Do the dishes',
  template_trash: 'Take out the trash',
  template_vacuum: 'Vacuum',
  template_pet: 'Feed the cat',
  template_bathroom: 'Clean the bathroom',
  template_fridge: 'Tidy the fridge',
  template_window: 'Wash the windows',
  template_water: 'Drink some water',
  template_cooler: 'Order water bottles',
  template_gym: 'Go to the gym',
  template_pool: 'Go swimming',
  template_ev: 'Charge the car',
  template_fuel: 'Fill up the car',
  template_study: 'Study',
  template_language: 'Practise a language',
  template_coding: 'Learn to code',
  template_slides: 'Prepare the presentation',
  template_book: 'Read a book',
  template_filter: 'Replace the water filter',
  template_bills: 'Pay the bills',
  template_yoga: 'Do yoga',
  template_run: 'Go for a run',
  template_groceries: 'Buy groceries',
  template_cooking: 'Cook dinner',
  template_call: 'Call the family',
  template_journal: 'Write in the journal',
  template_lawn: 'Mow the lawn',
  template_music: 'Practise an instrument',
  template_backup: 'Back up the computer',
  template_carwash: 'Wash the car',
  template_owl: 'Do it today. Or else.',
  template_one_off: 'One-off task',
  template_prompt: 'Start from a template',
  field_title: 'Title',
  field_icon: 'Icon',
  field_color: 'Colour',
  field_notes: 'Notes',
  field_assignee: 'Assignee',
  field_enabled: 'Enabled',
  field_scene: 'Scene',
  field_on_missed: 'If missed',
  field_clean_for: 'Stays clean for (minutes)',
  field_grace: 'Grace period (hours)',
  field_grace_anytime: 'Nag before the deadline (hours)',
  field_anytime: 'Any time during the day',
  field_deadline: 'Deadline',
  field_schedule: 'Schedule',
  field_schedule_type: 'Repeats',
  field_due: 'Due',
  field_time: 'Time',
  field_weekdays: 'Weekdays',
  field_every_days: 'Every (days)',
  field_anchor: 'Count from',
  field_stages: 'Stages',
  field_stage_title: 'Stage',
  field_action: 'Button label',
  field_role: 'Role',
  field_stale_after: 'Gets stale after (minutes)',
  field_trigger: 'Advances automatically',
  field_entity: 'When this entity',
  field_condition: 'Is',
  field_value: 'Value',
  field_for_seconds: 'For (seconds)',
  field_current_value: 'Current value: {value}',
  field_retention: 'Keep history (days)',
  condition_above: 'Above',
  condition_below: 'Below',
  condition_state: 'Equal to',
  condition_none: 'By hand only',
  schedule_once: 'Once',
  schedule_daily: 'Daily',
  schedule_weekly: 'Weekly',
  schedule_interval: 'Interval',
  schedule_daily_at: 'Every day at {time}',
  schedule_weekly_at: '{days} at {time}',
  schedule_interval_at: '{every} at {time}',
  schedule_daily_anytime: 'Every day, any time, by {time}',
  schedule_weekly_anytime: '{days}, any time, by {time}',
  schedule_interval_anytime: '{every}, any time, by {time}',
  anchor_completion: 'Last completion',
  anchor_schedule: 'Previous due date',
  on_missed_carry: 'Keep it overdue',
  on_missed_skip: 'Skip to the next',
  role_todo: 'To do',
  role_running: 'Running',
  role_waiting: 'Waiting',
  scene_generic: 'Tide',
  scene_pills: 'Pills',
  scene_laundry: 'Laundry',
  scene_plant: 'Plant',
  scene_teeth: 'Teeth',
  scene_bed: 'Bed',
  scene_dishes: 'Dishes',
  scene_trash: 'Trash',
  scene_vacuum: 'Vacuum',
  scene_pet: 'Pet',
  scene_bathroom: 'Bathroom',
  scene_fridge: 'Fridge',
  scene_window: 'Windows',
  scene_water: 'Water',
  scene_cooler: 'Water cooler',
  scene_gym: 'Gym',
  scene_pool: 'Pool',
  scene_ev: 'Electric car',
  scene_fuel: 'Fuel',
  scene_study: 'Study',
  scene_language: 'Language',
  scene_coding: 'Coding',
  scene_slides: 'Presentation',
  scene_book: 'Book',
  scene_filter: 'Water filter',
  scene_bills: 'Bills',
  scene_yoga: 'Yoga',
  scene_run: 'Running',
  scene_groceries: 'Groceries',
  scene_cooking: 'Cooking',
  scene_call: 'Call',
  scene_journal: 'Journal',
  scene_lawn: 'Lawn',
  scene_music: 'Music',
  scene_backup: 'Backup',
  scene_carwash: 'Car wash',
  scene_owl: 'Owl',
  event_started: 'Started',
  event_advanced: 'Advanced',
  event_completed: 'Completed',
  event_skipped: 'Skipped',
  event_missed: 'Missed',
  event_undone: 'Undone',
  event_created: 'Created',
  event_deleted: 'Deleted',
  source_manual: 'By hand',
  source_trigger: 'By sensor',
  source_service: 'By service',
  source_schedule: 'By schedule',
  source_todo: 'From the to-do list',
  on_time: 'On time',
  late: 'Late',
  history_all_tasks: 'All tasks',
  field_filter_task: 'Task',
  history_empty: 'Nothing has happened yet.',
  stats_current_streak: 'Current streak',
  stats_best_streak: 'Best streak',
  stats_completed: 'Completed',
  stats_skipped: 'Skipped',
  stats_missed: 'Missed',
  stats_on_time: 'On time',
  stats_no_data: '—',
  tasks_empty: 'No tasks yet. Start from a template.',
  tasks_read_only: 'Only administrators can change tasks.',
  confirm_delete: 'Delete “{title}”? History is kept.',
  error_generic: 'Something went wrong: {message}',
  error_required: 'This field is required',
  settings_title: 'Settings',
  disconnected: 'Connection lost. Reconnecting…',
  loading: 'Loading…',
  card_error_hint: 'Check that the Housetide integration is set up.',
  action_retry: 'Try again',
  action_clear: 'Clear',
  action_close: 'Close',
  action_menu: 'Menu',
  today_later: 'Coming up',
  today_clear_title: 'All clear',
  section_details: 'Details',
  section_behaviour: 'If life gets in the way',
  field_stage_n: 'Stage {n}',
  hint_clean_for: 'How long it shows as freshly done.',
  hint_grace: 'After this it counts as overdue and starts to smell.',
  hint_grace_anytime: 'How long before the deadline it starts to nag.',
  hint_icon: 'For example mdi:washing-machine',
  hint_stale_after: 'Leave empty if it can wait forever.',
  hint_assignee: 'A name or a person entity',
  entity_placeholder: 'Search by name or entity id',
  entity_not_found: 'This entity does not exist right now',
  entity_unavailable: 'The entity is unavailable right now',
  entity_no_matches: 'No matching entities',
  trigger_met: 'True right now',
  trigger_unmet: 'Not true right now',
  trigger_none: 'Moves on only when you tap the button.',
  trigger_above: 'Moves on when {entity} goes above {value}',
  trigger_below: 'Moves on when {entity} drops below {value}',
  trigger_state: 'Moves on when {entity} becomes “{value}”',
  trigger_held: '{sentence} and stays there for {hold}.',
  trigger_instant: '{sentence}.',
  trigger_incomplete: 'Choose an entity and a value to finish this rule.',
  error_number: 'Enter a number',
  error_whole: 'Enter a whole number',
  error_min: 'Must be at least {min}',
  error_max: 'Must be at most {max}',
  error_weekdays: 'Pick at least one day',
  error_entity: 'Pick an entity, or turn off automatic advance',
  error_entity_format: 'That is not a valid entity id',
  error_state: 'This state can never match',
  error_datetime: 'Choose a date and time',
  error_time: 'Choose a time',
  error_form: 'Some fields need attention.',
  error_templates: 'Could not load the templates.',
  template_stage_load: 'Collect and load',
  template_action_load: 'Loaded',
  template_stage_wash: 'Washing',
  template_action_wash: 'Finished',
  template_stage_hang: 'Hang it up',
  template_action_hang: 'Hung up',
  template_stage_take: 'Take pills',
  template_action_take: 'Taken',
  template_stage_water: 'Water',
  template_action_water: 'Watered',
  template_stage_do: 'Do it',
  template_action_do: 'Done',
  template_stage_brush: 'Brush',
  template_action_brush: 'Brushed',
  template_stage_change_sheets: 'Change the sheets',
  template_action_change_sheets: 'Changed',
  template_stage_wash_up: 'Wash up',
  template_action_wash_up: 'Washed',
  template_stage_take_out: 'Take it out',
  template_action_take_out: 'Taken out',
  template_stage_vacuum_floor: 'Vacuum the floor',
  template_action_vacuum_floor: 'Vacuumed',
  template_stage_feed: 'Feed',
  template_action_feed: 'Fed',
  template_stage_scrub: 'Scrub it',
  template_action_scrub: 'Cleaned',
  template_stage_tidy: 'Clear it out',
  template_action_tidy: 'Tidied',
  template_stage_wipe_glass: 'Wash the glass',
  template_action_wipe_glass: 'Washed',
  template_stage_drink: 'Drink',
  template_action_drink: 'Drank',
  template_stage_order_water: 'Order bottles',
  template_action_order_water: 'Ordered',
  template_stage_await_water: 'Waiting for delivery',
  template_action_await_water: 'Delivered',
  template_stage_work_out: 'Work out',
  template_action_work_out: 'Done',
  template_stage_swim: 'Swim',
  template_action_swim: 'Swum',
  template_stage_plug_in: 'Plug it in',
  template_action_plug_in: 'Plugged in',
  template_stage_charge_ev: 'Charging',
  template_action_charge_ev: 'Charged',
  template_stage_fill_up: 'Fill up',
  template_action_fill_up: 'Filled up',
  template_stage_study_session: 'Study',
  template_action_study_session: 'Done',
  template_stage_practise_language: 'Practise',
  template_action_practise_language: 'Done',
  template_stage_write_code: 'Code',
  template_action_write_code: 'Done',
  template_stage_draft_slides: 'Draft the slides',
  template_action_draft_slides: 'Drafted',
  template_stage_rehearse: 'Rehearse',
  template_action_rehearse: 'Rehearsed',
  template_stage_read_book: 'Read',
  template_action_read_book: 'Read',
  template_stage_replace_filter: 'Replace it',
  template_action_replace_filter: 'Replaced',
  template_stage_pay_bills: 'Pay',
  template_action_pay_bills: 'Paid',
  template_stage_confirm_payment: 'Check it went through',
  template_action_confirm_payment: 'Confirmed',
  template_stage_stretch: 'Stretch',
  template_action_stretch: 'Done',
  template_stage_go_run: 'Run',
  template_action_go_run: 'Done',
  template_stage_shop: 'Shop',
  template_action_shop: 'Bought',
  template_stage_cook: 'Cook',
  template_action_cook: 'Cooked',
  template_stage_call_family: 'Call',
  template_action_call_family: 'Called',
  template_stage_write_journal: 'Write',
  template_action_write_journal: 'Written',
  template_stage_mow: 'Mow',
  template_action_mow: 'Mowed',
  template_stage_practise_music: 'Practise',
  template_action_practise_music: 'Done',
  template_stage_back_up: 'Back up',
  template_action_back_up: 'Backed up',
  template_stage_wash_car: 'Wash',
  template_action_wash_car: 'Washed',
  template_stage_owl_do: 'Just do it',
  template_action_owl_do: 'Done',
  group_home: 'Home',
  group_pets: 'Pets and plants',
  group_health: 'Health',
  group_car: 'Car',
  group_learning: 'Learning and work',
  group_life: 'Life',
  picker_filter: 'Filter by name',
  picker_empty: 'Nothing matches.',
  field_look: 'Look',
  field_accent: 'Accent colour',
  field_variant: 'Variant',
  look_default: 'Default',
  look_custom: 'Custom colour',
  accent_coral: 'Coral',
  accent_terracotta: 'Terracotta',
  accent_yellow: 'Yellow',
  accent_caramel: 'Caramel',
  accent_green: 'Green',
  accent_mint: 'Mint',
  accent_aqua: 'Aqua',
  accent_blue: 'Blue',
  accent_lilac: 'Lilac',
  accent_pink: 'Pink',
  variant_cat: 'Cat',
  variant_dog: 'Dog',
  variant_colored: 'Colours',
  variant_white: 'Whites',
  variant_black: 'Darks',
  history_window: 'Last 90 days',
  history_day_hint: 'Tap a day to see what happened.',
  history_day: '{date}: {completed} done, {skipped} skipped, {missed} missed',
  history_day_empty: '{date}: nothing recorded',
  history_stage: '{event} · {stage}',
  stats_scope: '{completed} done · {skipped} skipped · {missed} missed',
} as const

export type MessageKey = keyof typeof en

const uk: Record<MessageKey, string> = {
  app_title: 'Housetide',
  tab_today: 'Сьогодні',
  tab_tasks: 'Задачі',
  tab_history: 'Історія',
  card_title: 'Сьогодні',
  card_empty: 'Усе чисто. На сьогодні нічого немає.',
  card_loading: 'Завантаження задач…',
  card_error: 'Housetide недоступний',
  config_tasks: 'Задачі',
  config_tasks_hint:
    'Якщо нічого не позначено, показуються всі задачі. Позначені йдуть у порядку позначення.',
  config_tasks_unknown: 'Задачу не знайдено',
  config_tasks_kept: 'Позначені задачі залишаться без змін.',
  config_show: 'Показувати',
  config_show_today: 'Сьогодні',
  config_show_all: 'Усі задачі',
  config_layout: 'Вигляд',
  config_layout_list: 'Список',
  config_layout_scenes: 'Сцени',
  config_title: 'Заголовок',
  config_animations: 'Анімації',
  action_advance: 'Готово',
  action_start: 'Почати',
  action_early: 'Раніше',
  action_early_confirm: 'Точно?',
  action_skip: 'Пропустити',
  action_undo: 'Скасувати',
  action_save: 'Зберегти',
  action_cancel: 'Скасувати',
  action_delete: 'Видалити',
  action_edit: 'Змінити',
  action_add: 'Додати',
  action_add_stage: 'Додати етап',
  action_remove: 'Прибрати',
  action_load_more: 'Показати ще',
  action_new_task: 'Нова задача',
  action_move_up: 'Вище',
  action_move_down: 'Нижче',
  status_upcoming: 'Заплановано',
  status_due: 'Час виконати',
  status_overdue: 'Прострочено',
  status_in_progress: 'Виконується',
  status_clean: 'Чисто',
  status_done: 'Виконано',
  status_disabled: 'На паузі',
  automated: 'Автоматично',
  due_now: 'Час виконати',
  due_when: 'Термін: {when}',
  due_anytime_today: 'Сьогодні, будь-коли',
  due_anytime_left: 'Ще {duration}',
  next_when: 'Наступне: {when}',
  overdue_for: 'Прострочено · {duration}',
  started_when: 'Почато {when}',
  done_when: 'Виконано {when}',
  not_scheduled: 'Без розкладу',
  stage_progress: 'Етап {current} з {total}',
  template_laundry: 'Прання',
  template_pills: 'Таблетки',
  template_plant: 'Полити рослину',
  template_teeth: 'Почистити зуби',
  template_bed: 'Змінити постіль',
  template_dishes: 'Помити посуд',
  template_trash: 'Винести сміття',
  template_vacuum: 'Пропилососити',
  template_pet: 'Погодувати кота',
  template_bathroom: 'Прибрати у ванній',
  template_fridge: 'Розібрати холодильник',
  template_window: 'Помити вікна',
  template_water: 'Випити води',
  template_cooler: 'Замовити бутлі води',
  template_gym: 'Піти в спортзал',
  template_pool: 'Піти поплавати',
  template_ev: 'Зарядити авто',
  template_fuel: 'Заправити авто',
  template_study: 'Повчитися',
  template_language: 'Попрактикувати мову',
  template_coding: 'Вчитися програмувати',
  template_slides: 'Підготувати презентацію',
  template_book: 'Почитати книгу',
  template_filter: 'Замінити фільтр для води',
  template_bills: 'Оплатити рахунки',
  template_yoga: 'Позайматися йогою',
  template_run: 'Піти на пробіжку',
  template_groceries: 'Купити продукти',
  template_cooking: 'Приготувати вечерю',
  template_call: 'Зателефонувати рідним',
  template_journal: 'Написати в щоденник',
  template_lawn: 'Покосити газон',
  template_music: 'Позайматися на інструменті',
  template_backup: 'Зробити резервну копію компʼютера',
  template_carwash: 'Помити авто',
  template_owl: 'Зроби сьогодні. Інакше…',
  template_one_off: 'Разова задача',
  template_prompt: 'Почати із шаблону',
  field_title: 'Назва',
  field_icon: 'Іконка',
  field_color: 'Колір',
  field_notes: 'Нотатки',
  field_assignee: 'Виконавець',
  field_enabled: 'Увімкнено',
  field_scene: 'Сцена',
  field_on_missed: 'Якщо пропущено',
  field_clean_for: 'Залишається чистим (хвилин)',
  field_grace: 'Запас часу (годин)',
  field_grace_anytime: 'Нагадувати до дедлайну (годин)',
  field_anytime: 'Будь-коли протягом дня',
  field_deadline: 'Дедлайн',
  field_schedule: 'Розклад',
  field_schedule_type: 'Повторення',
  field_due: 'Термін',
  field_time: 'Час',
  field_weekdays: 'Дні тижня',
  field_every_days: 'Кожні (днів)',
  field_anchor: 'Рахувати від',
  field_stages: 'Етапи',
  field_stage_title: 'Етап',
  field_action: 'Напис на кнопці',
  field_role: 'Роль',
  field_stale_after: 'Застоюється через (хвилин)',
  field_trigger: 'Перемикається автоматично',
  field_entity: 'Коли ця сутність',
  field_condition: 'Має значення',
  field_value: 'Значення',
  field_for_seconds: 'Протягом (секунд)',
  field_current_value: 'Поточне значення: {value}',
  field_retention: 'Зберігати історію (днів)',
  condition_above: 'Більше ніж',
  condition_below: 'Менше ніж',
  condition_state: 'Дорівнює',
  condition_none: 'Лише вручну',
  schedule_once: 'Один раз',
  schedule_daily: 'Щодня',
  schedule_weekly: 'Щотижня',
  schedule_interval: 'Інтервал',
  schedule_daily_at: 'Щодня о {time}',
  schedule_weekly_at: '{days} о {time}',
  schedule_interval_at: '{every} о {time}',
  schedule_daily_anytime: 'Щодня, будь-коли, до {time}',
  schedule_weekly_anytime: '{days}, будь-коли, до {time}',
  schedule_interval_anytime: '{every}, будь-коли, до {time}',
  anchor_completion: 'Останнього виконання',
  anchor_schedule: 'Попереднього терміну',
  on_missed_carry: 'Залишати простроченою',
  on_missed_skip: 'Переходити до наступної',
  role_todo: 'Зробити',
  role_running: 'Триває',
  role_waiting: 'Очікує',
  scene_generic: 'Приплив',
  scene_pills: 'Таблетки',
  scene_laundry: 'Прання',
  scene_plant: 'Рослина',
  scene_teeth: 'Зуби',
  scene_bed: 'Постіль',
  scene_dishes: 'Посуд',
  scene_trash: 'Сміття',
  scene_vacuum: 'Пилосос',
  scene_pet: 'Улюбленець',
  scene_bathroom: 'Ванна',
  scene_fridge: 'Холодильник',
  scene_window: 'Вікна',
  scene_water: 'Вода',
  scene_cooler: 'Кулер',
  scene_gym: 'Спортзал',
  scene_pool: 'Басейн',
  scene_ev: 'Електромобіль',
  scene_fuel: 'Пальне',
  scene_study: 'Навчання',
  scene_language: 'Мова',
  scene_coding: 'Програмування',
  scene_slides: 'Презентація',
  scene_book: 'Книга',
  scene_filter: 'Фільтр для води',
  scene_bills: 'Рахунки',
  scene_yoga: 'Йога',
  scene_run: 'Біг',
  scene_groceries: 'Продукти',
  scene_cooking: 'Готування',
  scene_call: 'Дзвінок',
  scene_journal: 'Щоденник',
  scene_lawn: 'Газон',
  scene_music: 'Музика',
  scene_backup: 'Резервна копія',
  scene_carwash: 'Мийка авто',
  scene_owl: 'Сова',
  event_started: 'Розпочато',
  event_advanced: 'Наступний етап',
  event_completed: 'Виконано',
  event_skipped: 'Пропущено',
  event_missed: 'Не виконано',
  event_undone: 'Скасовано',
  event_created: 'Створено',
  event_deleted: 'Видалено',
  source_manual: 'Вручну',
  source_trigger: 'За датчиком',
  source_service: 'Через сервіс',
  source_schedule: 'За розкладом',
  source_todo: 'Зі списку справ',
  on_time: 'Вчасно',
  late: 'Із запізненням',
  history_all_tasks: 'Усі задачі',
  field_filter_task: 'Задача',
  history_empty: 'Поки що нічого не сталося.',
  stats_current_streak: 'Поточна серія',
  stats_best_streak: 'Найкраща серія',
  stats_completed: 'Виконано',
  stats_skipped: 'Пропущено',
  stats_missed: 'Не виконано',
  stats_on_time: 'Вчасно',
  stats_no_data: '—',
  tasks_empty: 'Задач поки немає. Почніть із шаблону.',
  tasks_read_only: 'Змінювати задачі можуть лише адміністратори.',
  confirm_delete: 'Видалити «{title}»? Історія збережеться.',
  error_generic: 'Щось пішло не так: {message}',
  error_required: 'Це поле обовʼязкове',
  settings_title: 'Налаштування',
  disconnected: 'Звʼязок втрачено. Перепідключення…',
  loading: 'Завантаження…',
  card_error_hint: 'Перевірте, чи налаштовано інтеграцію Housetide.',
  action_retry: 'Спробувати ще',
  action_clear: 'Очистити',
  action_close: 'Закрити',
  action_menu: 'Меню',
  today_later: 'Незабаром',
  today_clear_title: 'Усе чисто',
  section_details: 'Основне',
  section_behaviour: 'Якщо щось пішло не так',
  field_stage_n: 'Етап {n}',
  hint_clean_for: 'Скільки часу показувати як щойно зроблене.',
  hint_grace: 'Після цього задача прострочена і починає смердіти.',
  hint_grace_anytime: 'За скільки до дедлайну почнуться нагадування.',
  hint_icon: 'Наприклад, mdi:washing-machine',
  hint_stale_after: 'Залиште порожнім, якщо може чекати вічно.',
  hint_assignee: 'Імʼя або сутність person',
  entity_placeholder: 'Пошук за назвою або id сутності',
  entity_not_found: 'Такої сутності зараз немає',
  entity_unavailable: 'Сутність зараз недоступна',
  entity_no_matches: 'Нічого не знайдено',
  trigger_met: 'Зараз виконується',
  trigger_unmet: 'Зараз не виконується',
  trigger_none: 'Перемикається лише натисканням кнопки.',
  trigger_above: 'Перемикається, коли {entity} перевищить {value}',
  trigger_below: 'Перемикається, коли {entity} впаде нижче {value}',
  trigger_state: 'Перемикається, коли {entity} стане «{value}»',
  trigger_held: '{sentence} і так триматиметься {hold}.',
  trigger_instant: '{sentence}.',
  trigger_incomplete: 'Оберіть сутність і значення, щоб завершити правило.',
  error_number: 'Введіть число',
  error_whole: 'Введіть ціле число',
  error_min: 'Має бути не менше {min}',
  error_max: 'Має бути не більше {max}',
  error_weekdays: 'Оберіть хоча б один день',
  error_entity: 'Оберіть сутність або вимкніть автоматичне перемикання',
  error_entity_format: 'Це не схоже на id сутності',
  error_state: 'Такий стан ніколи не настане',
  error_datetime: 'Оберіть дату й час',
  error_time: 'Оберіть час',
  error_form: 'Деякі поля потребують уваги.',
  error_templates: 'Не вдалося завантажити шаблони.',
  template_stage_load: 'Зібрати й завантажити',
  template_action_load: 'Завантажено',
  template_stage_wash: 'Прання',
  template_action_wash: 'Завершено',
  template_stage_hang: 'Розвісити',
  template_action_hang: 'Розвішано',
  template_stage_take: 'Випити таблетки',
  template_action_take: 'Випито',
  template_stage_water: 'Полити',
  template_action_water: 'Полито',
  template_stage_do: 'Зробити',
  template_action_do: 'Готово',
  template_stage_brush: 'Почистити',
  template_action_brush: 'Почищено',
  template_stage_change_sheets: 'Змінити постіль',
  template_action_change_sheets: 'Змінено',
  template_stage_wash_up: 'Помити',
  template_action_wash_up: 'Помито',
  template_stage_take_out: 'Винести',
  template_action_take_out: 'Винесено',
  template_stage_vacuum_floor: 'Пропилососити',
  template_action_vacuum_floor: 'Готово',
  template_stage_feed: 'Погодувати',
  template_action_feed: 'Погодовано',
  template_stage_scrub: 'Прибрати',
  template_action_scrub: 'Прибрано',
  template_stage_tidy: 'Розібрати',
  template_action_tidy: 'Розібрано',
  template_stage_wipe_glass: 'Помити скло',
  template_action_wipe_glass: 'Помито',
  template_stage_drink: 'Випити',
  template_action_drink: 'Випито',
  template_stage_order_water: 'Замовити',
  template_action_order_water: 'Замовлено',
  template_stage_await_water: 'Чекаємо доставку',
  template_action_await_water: 'Доставлено',
  template_stage_work_out: 'Потренуватися',
  template_action_work_out: 'Готово',
  template_stage_swim: 'Поплавати',
  template_action_swim: 'Поплавано',
  template_stage_plug_in: 'Підключити',
  template_action_plug_in: 'Підключено',
  template_stage_charge_ev: 'Заряджається',
  template_action_charge_ev: 'Заряджено',
  template_stage_fill_up: 'Заправити',
  template_action_fill_up: 'Заправлено',
  template_stage_study_session: 'Повчитися',
  template_action_study_session: 'Готово',
  template_stage_practise_language: 'Попрактикувати',
  template_action_practise_language: 'Готово',
  template_stage_write_code: 'Писати код',
  template_action_write_code: 'Готово',
  template_stage_draft_slides: 'Підготувати чернетку слайдів',
  template_action_draft_slides: 'Чернетка готова',
  template_stage_rehearse: 'Відрепетирувати',
  template_action_rehearse: 'Відрепетирувано',
  template_stage_read_book: 'Почитати',
  template_action_read_book: 'Прочитано',
  template_stage_replace_filter: 'Замінити',
  template_action_replace_filter: 'Замінено',
  template_stage_pay_bills: 'Оплатити',
  template_action_pay_bills: 'Оплачено',
  template_stage_confirm_payment: 'Перевірити, чи пройшов платіж',
  template_action_confirm_payment: 'Підтверджено',
  template_stage_stretch: 'Розтягнутися',
  template_action_stretch: 'Готово',
  template_stage_go_run: 'Побігти',
  template_action_go_run: 'Готово',
  template_stage_shop: 'Закупитися',
  template_action_shop: 'Куплено',
  template_stage_cook: 'Приготувати',
  template_action_cook: 'Приготовано',
  template_stage_call_family: 'Зателефонувати',
  template_action_call_family: 'Зателефоновано',
  template_stage_write_journal: 'Написати',
  template_action_write_journal: 'Написано',
  template_stage_mow: 'Покосити',
  template_action_mow: 'Покошено',
  template_stage_practise_music: 'Позайматися',
  template_action_practise_music: 'Готово',
  template_stage_back_up: 'Зробити копію',
  template_action_back_up: 'Копію зроблено',
  template_stage_wash_car: 'Помити',
  template_action_wash_car: 'Помито',
  template_stage_owl_do: 'Просто зроби',
  template_action_owl_do: 'Готово',
  group_home: 'Дім',
  group_pets: 'Тварини й рослини',
  group_health: 'Здоровʼя',
  group_car: 'Авто',
  group_learning: 'Навчання й робота',
  group_life: 'Життя',
  picker_filter: 'Фільтр за назвою',
  picker_empty: 'Нічого не знайдено.',
  field_look: 'Вигляд',
  field_accent: 'Колір акценту',
  field_variant: 'Варіант',
  look_default: 'Типовий',
  look_custom: 'Свій колір',
  accent_coral: 'Кораловий',
  accent_terracotta: 'Теракотовий',
  accent_yellow: 'Жовтий',
  accent_caramel: 'Карамельний',
  accent_green: 'Зелений',
  accent_mint: 'Мʼятний',
  accent_aqua: 'Блакитний',
  accent_blue: 'Синій',
  accent_lilac: 'Бузковий',
  accent_pink: 'Рожевий',
  variant_cat: 'Кіт',
  variant_dog: 'Пес',
  variant_colored: 'Кольорове',
  variant_white: 'Біле',
  variant_black: 'Темне',
  history_window: 'Останні 90 днів',
  history_day_hint: 'Торкніться дня, щоб побачити подробиці.',
  history_day: '{date}: виконано {completed}, пропущено {skipped}, не виконано {missed}',
  history_day_empty: '{date}: нічого не записано',
  history_stage: '{event} · {stage}',
  stats_scope: 'виконано {completed} · пропущено {skipped} · не виконано {missed}',
}

type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string }

const enPlurals = {
  days: { one: '{n} day', other: '{n} days' },
  every_days: { one: 'Every day', other: 'Every {n} days' },
  tasks_due: { one: '{n} task due', other: '{n} tasks due' },
  occurrences: { one: '{n} in a row', other: '{n} in a row' },
  seconds: { one: '{n} second', other: '{n} seconds' },
} satisfies Record<string, PluralForms>

export type PluralKey = keyof typeof enPlurals

const ukPlurals: Record<PluralKey, PluralForms> = {
  days: { one: '{n} день', few: '{n} дні', many: '{n} днів', other: '{n} дня' },
  every_days: {
    one: 'Кожен {n} день',
    few: 'Кожні {n} дні',
    many: 'Кожні {n} днів',
    other: 'Кожні {n} дня',
  },
  tasks_due: {
    one: '{n} задача на зараз',
    few: '{n} задачі на зараз',
    many: '{n} задач на зараз',
    other: '{n} задачі на зараз',
  },
  occurrences: {
    one: '{n} поспіль',
    few: '{n} поспіль',
    many: '{n} поспіль',
    other: '{n} поспіль',
  },
  seconds: {
    one: '{n} секунду',
    few: '{n} секунди',
    many: '{n} секунд',
    other: '{n} секунди',
  },
}

export type Language = 'en' | 'uk'
export type DateInput = Date | string | number

export interface I18nOptions {
  timeZone?: string
  hour12?: boolean
}

export interface I18n {
  language: Language
  locale: string
  t(key: MessageKey, vars?: Record<string, string | number>): string
  plural(key: PluralKey, n: number): string
  number(value: number): string
  percent(value: number): string
  relative(target: DateInput, now: DateInput): string
  duration(seconds: number): string
  date(value: DateInput): string
  shortDate(value: DateInput): string
  time(value: DateInput): string
  dateTime(value: DateInput): string
  clock(hhmm: string): string
  weekday(index: number, style?: 'short' | 'long' | 'narrow'): string
  scheduleText(schedule: Schedule): string
  dueText(view: TaskView, now: DateInput): string
}

const MINUTE = 60
const HOUR = 3600
const DAY = 86400
const MONDAY_UTC = Date.UTC(2024, 0, 1)

function fill(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template
  return template.replaceAll(/\{(\w+)\}/g, (whole, name: string) => String(vars[name] ?? whole))
}

function capitalize(text: string, locale: string): string {
  return text.charAt(0).toLocaleUpperCase(locale) + text.slice(1)
}

export function resolveLanguage(language: string | undefined): {
  language: Language
  locale: string
} {
  const tag = (language ?? 'en').replace('_', '-')
  if (/^uk\b/i.test(tag)) return { language: 'uk', locale: tag }
  if (/^en\b/i.test(tag)) return { language: 'en', locale: tag }
  return { language: 'en', locale: 'en' }
}

function toDate(value: DateInput): Date {
  return value instanceof Date ? value : new Date(value)
}

function safeZone(timeZone: string | undefined): string | undefined {
  if (!timeZone) return undefined
  try {
    Intl.DateTimeFormat('en', { timeZone })
    return timeZone
  } catch {
    return undefined
  }
}

export function createI18n(language?: string, options: I18nOptions = {}): I18n {
  const resolved = resolveLanguage(language)
  const { locale } = resolved
  const timeZone = safeZone(options.timeZone)
  const { hour12 } = options
  const hourOptions = hour12 === undefined ? {} : { hour12 }
  const uses12 =
    hour12 ?? new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions().hour12
  const hour = uses12 ? 'numeric' : '2-digit'
  const messages: Record<MessageKey, string> = resolved.language === 'uk' ? uk : en
  const pluralForms: Record<PluralKey, PluralForms> =
    resolved.language === 'uk' ? ukPlurals : enPlurals
  const pluralRules = new Intl.PluralRules(locale)
  const numbers = new Intl.NumberFormat(locale)
  const percents = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 })
  const relativeFormat = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone })
  const shortDateFormat = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    timeZone,
  })
  const timeFormat = new Intl.DateTimeFormat(locale, {
    hour,
    minute: '2-digit',
    timeZone,
    ...hourOptions,
  })
  const dateTimeFormat = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    hour,
    minute: '2-digit',
    timeZone,
    ...hourOptions,
  })
  const clockFormat = new Intl.DateTimeFormat(locale, {
    hour,
    minute: '2-digit',
    timeZone: 'UTC',
    ...hourOptions,
  })
  const dayParts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone,
  })
  const weekdayFormats = {
    short: new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' }),
    long: new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' }),
    narrow: new Intl.DateTimeFormat(locale, { weekday: 'narrow', timeZone: 'UTC' }),
  }
  const unitFormat = (unit: string): Intl.NumberFormat =>
    new Intl.NumberFormat(locale, { style: 'unit', unit, unitDisplay: 'long' })
  const units = {
    minute: unitFormat('minute'),
    hour: unitFormat('hour'),
    day: unitFormat('day'),
    week: unitFormat('week'),
  }

  const dayNumber = (date: Date): number => {
    const value = (type: string): number =>
      Number(dayParts.formatToParts(date).find((part) => part.type === type)?.value)
    return Date.UTC(value('year'), value('month') - 1, value('day')) / (DAY * 1000)
  }

  const t: I18n['t'] = (key, vars) => fill(messages[key], vars)

  const plural: I18n['plural'] = (key, n) => {
    const forms = pluralForms[key]
    const text = forms[pluralRules.select(n)] ?? forms.other
    return fill(text, { n: numbers.format(n) })
  }

  const relative: I18n['relative'] = (target, now) => {
    const a = toDate(target)
    const b = toDate(now)
    const seconds = (a.getTime() - b.getTime()) / 1000
    const size = Math.abs(seconds)
    if (size < 45) return relativeFormat.format(0, 'second')
    if (size < HOUR - 30) return relativeFormat.format(Math.round(seconds / MINUTE), 'minute')
    if (size < DAY - 1800) return relativeFormat.format(Math.round(seconds / HOUR), 'hour')
    const days = dayNumber(a) - dayNumber(b)
    if (Math.abs(days) < 7) return relativeFormat.format(days, 'day')
    if (Math.abs(days) < 30) return relativeFormat.format(Math.round(days / 7), 'week')
    if (Math.abs(days) < 365) return relativeFormat.format(Math.round(days / 30), 'month')
    return relativeFormat.format(Math.round(days / 365), 'year')
  }

  const duration: I18n['duration'] = (seconds) => {
    const size = Math.max(0, Math.round(seconds))
    if (size < HOUR - 30) return units.minute.format(Math.max(1, Math.round(size / MINUTE)))
    if (size < DAY - 1800) return units.hour.format(Math.round(size / HOUR))
    if (size < DAY * 14) return units.day.format(Math.round(size / DAY))
    return units.week.format(Math.round(size / (DAY * 7)))
  }

  const clock: I18n['clock'] = (hhmm) => {
    const [hours = 0, minutes = 0] = hhmm.split(':').map(Number)
    return clockFormat.format(Date.UTC(2024, 0, 1, hours, minutes))
  }

  const weekday: I18n['weekday'] = (index, style = 'short') =>
    weekdayFormats[style].format(MONDAY_UTC + (((index % 7) + 7) % 7) * DAY * 1000)

  const scheduleText: I18n['scheduleText'] = (schedule) => {
    if (schedule.type === 'once') return dateTimeFormat.format(toDate(schedule.due))
    const time = clock(schedule.time)
    const form = schedule.anytime === true ? 'anytime' : 'at'
    if (schedule.type === 'daily') return t(`schedule_daily_${form}`, { time })
    if (schedule.type === 'weekly') {
      const days = schedule.weekdays.map((day) => weekday(day)).join(', ')
      return t(`schedule_weekly_${form}`, { days, time })
    }
    return t(`schedule_interval_${form}`, {
      every: plural('every_days', schedule.every_days),
      time,
    })
  }

  const dueText: I18n['dueText'] = (view, now) => {
    const { status } = view
    if (status === 'disabled') return t('status_disabled')
    if (status === 'done' || status === 'clean') {
      return view.last_completed_at
        ? t('done_when', { when: relative(view.last_completed_at, now) })
        : t('status_done')
    }
    if (status === 'in_progress') {
      return view.started_at
        ? t('started_when', { when: relative(view.started_at, now) })
        : t('status_in_progress')
    }
    if (status === 'overdue') {
      const elapsed = view.due_at
        ? (toDate(now).getTime() - toDate(view.due_at).getTime()) / 1000
        : view.overdue_seconds
      return t('overdue_for', { duration: duration(elapsed) })
    }
    if (status === 'due') {
      const left =
        view.anytime && view.due_at ? toDate(view.due_at).getTime() - toDate(now).getTime() : 0
      return left > 0 ? t('due_anytime_left', { duration: duration(left / 1000) }) : t('due_now')
    }
    if (view.anytime && view.is_today) return t('due_anytime_today')
    if (view.due_at) return t('due_when', { when: relative(view.due_at, now) })
    if (view.next_due_at) return t('next_when', { when: relative(view.next_due_at, now) })
    return t('not_scheduled')
  }

  return {
    language: resolved.language,
    locale,
    t,
    plural,
    number: (value) => numbers.format(value),
    percent: (value) => percents.format(value),
    relative,
    duration,
    date: (value) => dateFormat.format(toDate(value)),
    shortDate: (value) => shortDateFormat.format(toDate(value)),
    time: (value) => timeFormat.format(toDate(value)),
    dateTime: (value) => dateTimeFormat.format(toDate(value)),
    clock,
    weekday,
    scheduleText: (schedule) => capitalize(scheduleText(schedule), locale),
    dueText,
  }
}

export function i18nFromHass(hass: Pick<HomeAssistant, 'language' | 'locale' | 'config'>): I18n {
  const timeFormat = hass.locale?.time_format
  const options: I18nOptions = {}
  if (timeFormat === '12') options.hour12 = true
  if (timeFormat === '24') options.hour12 = false
  if (hass.config?.time_zone) options.timeZone = hass.config.time_zone
  return createI18n(hass.locale?.language ?? hass.language, options)
}
