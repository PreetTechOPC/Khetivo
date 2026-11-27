export type SupportedLanguage = "en" | "pa" | "hi" | "mr" | "gu";

export interface Translations {
  // Navigation Sections
  nav_daily: string;
  nav_records: string;
  nav_manage: string;

  // Nav items
  nav_dashboard: string;
  nav_dashboard_desc: string;
  nav_advisories: string;
  nav_advisories_desc: string;
  nav_weather: string;
  nav_weather_desc: string;
  nav_tasks: string;
  nav_tasks_desc: string;
  nav_inventory: string;
  nav_inventory_desc: string;
  nav_equipment: string;
  nav_equipment_desc: string;
  nav_crops: string;
  nav_crops_desc: string;
  nav_stats: string;
  nav_stats_desc: string;
  nav_reports: string;
  nav_reports_desc: string;
  nav_my_farms: string;
  nav_my_farms_desc: string;
  nav_team: string;
  nav_team_desc: string;
  nav_subscription: string;
  nav_subscription_desc: string;
  nav_support: string;
  nav_support_desc: string;
  nav_settings: string;
  nav_settings_desc: string;

  // Farm Selector
  select_farm_view: string;
  all_farms_consolidated: string;
  holdings_total: string;
  add_another_farm: string;
  holding: string;
  location: string;
  area: string;

  // Quick Action Buttons
  quick_actions: string;
  add_crop: string;
  record_entry: string;
  assign_task: string;
  log_equipment: string;
  request_visit: string;
  add_task: string;
  financial_entry: string;
  raise_field_visit: string;

  // Overview Stats & Financials
  total_cultivated_area: string;
  active_crop_varieties: string;
  monthly_inflow: string;
  operating_expenses: string;
  net_realization: string;
  crop_losses: string;
  stats: string;
  view_ledger: string;
  production: string;
  losses: string;
  expenses: string;
  net: string;

  // Overview Widgets & Banners
  advisory_label: string;
  view_all: string;
  farm_operations_active: string;
  farm_operations_active_desc: string;
  active_crops_title: string;
  detailed_timeline: string;
  day: string;
  stage: string;
  todays_field_tasks: string;
  all_tasks_link: string;
  weather_spray_conditions: string;
  foliar_spray_window: string;
  view_weather_satellite_map: string;
  inventory_status: string;
  all_warehouses: string;
  manage_stock: string;
  no_inventory_items: string;
  no_inventory_desc: string;
  add_inventory_item: string;
  wind: string;
  humidity_label: string;
  rain_chance: string;

  // Weather Tab
  hyperlocal_weather: string;
  live_weather_api: string;
  weather_advisory_title: string;
  refresh: string;
  coordinates: string;
  updated: string;
  relative_humidity: string;
  wind_velocity: string;
  precipitation_probability: string;
  safe_to_spray: string;
  spray_window: string;
  optimal_window: string;
  risk_warning: string;
  seven_day_forecast: string;
  farm_location_map_title: string;
  open_map: string;

  // Tasks Tab
  tasks_operations_title: string;
  tasks_operations_desc: string;
  view_list: string;
  view_calendar: string;
  create_task: string;
  all_tasks_count: string;
  to_do_count: string;
  in_progress_count: string;
  completed_count: string;
  to_do: string;
  in_progress: string;
  pending_status: string;
  done_status: string;
  active_status: string;
  all_farms_option: string;
  search_tasks_placeholder: string;
  priority_urgent: string;
  priority_high: string;
  priority_medium: string;
  priority_low: string;
  overdue_by: string;
  due_today: string;

  // My Farms Tab
  my_farms_title: string;
  my_farms_subtitle: string;
  all_farms_view_active: string;
  switch_to_all_farms: string;
  add_new_farm: string;

  // Crops Tab
  crop_planning_title: string;
  add_crop_to_farm: string;

  // Advisories Tab
  crop_advisories_title: string;
  category_all: string;
  category_pest: string;
  category_weather: string;

  // Inventory Tab
  inventory_title: string;
  add_store_btn: string;
  add_item_btn: string;

  // Equipment Tab
  equipment_title: string;
  report_problem_btn: string;
  register_equipment_btn: string;

  // Stats / Financials Tab
  financial_stats_title: string;

  // Team Tab
  team_title: string;
  team_subtitle: string;
  members_subtab: string;
  roles_subtab: string;
  add_member_btn: string;
  create_role_btn: string;

  // Reports Tab
  reports_title: string;
  reports_subtitle: string;
  download_pdf: string;
  export_csv_btn: string;

  // Subscription Tab
  subscription_title: string;
  subscription_subtitle: string;
  annual_billing: string;
  monthly_billing: string;

  // Support Tab
  support_title: string;
  support_subtitle: string;
  open_ticket_btn: string;

  // Settings Tab
  settings_title: string;
  settings_subtitle: string;
  settings_reset: string;
  settings_save: string;
  settings_sign_out: string;
  farmer_identity_title: string;
  farmer_identity_desc: string;
  verified_farmer_id: string;
  farmer_name_label: string;
  farmer_phone_label: string;
  farmer_email_label: string;
  primary_mandi_label: string;
  farm_address_label: string;
  regional_units_title: string;
  regional_units_desc: string;
  default_unit_label: string;
  interface_language: string;
  currency_standard_label: string;
  date_format_label: string;
  danger_zone_title: string;
  danger_zone_desc: string;
  delete_account_btn: string;

  // Common UI
  save_changes: string;
  cancel: string;
  edit: string;
  delete: string;
  search_placeholder: string;
  filter: string;
  status: string;
  active: string;
  completed: string;
  pending: string;
  today: string;
  print: string;
  export_csv: string;
  language_updated_toast: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, Translations> = {
  en: {
    nav_daily: "DAILY",
    nav_records: "RECORDS",
    nav_manage: "MANAGE",

    nav_dashboard: "Dashboard",
    nav_dashboard_desc: "Farm summary & precision alerts",
    nav_advisories: "Advisories & Alerts",
    nav_advisories_desc: "Crop outbreak alerts & weather warnings",
    nav_weather: "Weather",
    nav_weather_desc: "Hyper-local GPS weather & spray advisory",
    nav_tasks: "Tasks",
    nav_tasks_desc: "Task calendar & kanban board",
    nav_inventory: "Inventory",
    nav_inventory_desc: "Seeds, fertilizers & hardware stock",
    nav_equipment: "Equipment",
    nav_equipment_desc: "Machinery, tractors & maintenance logs",
    nav_crops: "Crop Management",
    nav_crops_desc: "Crop cycle, timeline & varieties",
    nav_stats: "Stats & Financials",
    nav_stats_desc: "Production, losses & farm expenses",
    nav_reports: "Reports & Audits",
    nav_reports_desc: "Farm audit reports & data downloads",
    nav_my_farms: "My Farms",
    nav_my_farms_desc: "All registered farms & locations",
    nav_team: "Team & Workforce",
    nav_team_desc: "Farm workforce & operator management",
    nav_subscription: "Subscription / Plan",
    nav_subscription_desc: "Active plan, billing & enterprise tier",
    nav_support: "Support",
    nav_support_desc: "24/7 Agronomist helpline & WhatsApp support",
    nav_settings: "Settings",
    nav_settings_desc: "Farmer profile & farm preferences",

    select_farm_view: "SELECT FARM VIEW",
    all_farms_consolidated: "All Farms (Consolidated)",
    holdings_total: "Holdings Total",
    add_another_farm: "Add Another Farm",
    holding: "Holding",
    location: "Location",
    area: "Area",

    quick_actions: "Quick Operational Actions",
    add_crop: "Add New Crop",
    record_entry: "Record Entry",
    assign_task: "Assign Field Task",
    log_equipment: "Log Equipment Usage",
    request_visit: "Request Agronomist Visit",
    add_task: "Add Task",
    financial_entry: "Financial Entry",
    raise_field_visit: "Raise a Field Visit",

    total_cultivated_area: "Total Cultivated Area",
    active_crop_varieties: "Active Crops & Batches",
    monthly_inflow: "Monthly Production Inflow",
    operating_expenses: "Total Operating Expenses",
    net_realization: "Net Farm Realization",
    crop_losses: "Damage & Losses",
    stats: "Stats",
    view_ledger: "View Ledger",
    production: "Production",
    losses: "Losses",
    expenses: "Expenses",
    net: "Net",

    advisory_label: "Advisory",
    view_all: "View All",
    farm_operations_active: "Farm Operations Active",
    farm_operations_active_desc: "All field activities, crops, and storage records are up to date.",
    active_crops_title: "Active Crops",
    detailed_timeline: "Detailed Timeline",
    day: "Day",
    stage: "Stage",
    todays_field_tasks: "Today's Field Tasks",
    all_tasks_link: "All Tasks",
    weather_spray_conditions: "Weather & Spray Conditions",
    foliar_spray_window: "Foliar Spray Window",
    view_weather_satellite_map: "View Weather Satellite Map",
    inventory_status: "Inventory Status",
    all_warehouses: "(All Warehouses)",
    manage_stock: "Manage Stock",
    no_inventory_items: "No Inventory Items",
    no_inventory_desc: "No seeds, fertilizers, or supplies recorded yet.",
    add_inventory_item: "+ Add Inventory Item",
    wind: "Wind",
    humidity_label: "Humidity",
    rain_chance: "Rain Chance",

    hyperlocal_weather: "Hyper-Local Farm Weather",
    live_weather_api: "Live WeatherAPI",
    weather_advisory_title: "Weather Advisory",
    refresh: "Refresh",
    coordinates: "Coordinates",
    updated: "Updated",
    relative_humidity: "Relative Humidity",
    wind_velocity: "Wind Velocity",
    precipitation_probability: "Precipitation Probability",
    safe_to_spray: "Safe to Spray",
    spray_window: "Foliar Spray Window",
    optimal_window: "Optimal Window • Safe to Spray",
    risk_warning: "Unfavorable Spray Conditions",
    seven_day_forecast: "7-Day Agricultural Forecast",
    farm_location_map_title: "Farm Location & Satellite Weather Map",
    open_map: "Open Map",

    tasks_operations_title: "Tasks & Operations",
    tasks_operations_desc: "Field operations, fertilizer cycles & calendar",
    view_list: "List",
    view_calendar: "Calendar",
    create_task: "Create Task",
    all_tasks_count: "All Tasks",
    to_do_count: "To Do",
    in_progress_count: "In Progress",
    completed_count: "Completed",
    to_do: "To Do",
    in_progress: "In Progress",
    pending_status: "Pending",
    done_status: "Done",
    active_status: "Active",
    all_farms_option: "All Farms",
    search_tasks_placeholder: "Search tasks, crop, worker...",
    priority_urgent: "Urgent",
    priority_high: "High",
    priority_medium: "Medium",
    priority_low: "Low",
    overdue_by: "Overdue by",
    due_today: "Due today",

    my_farms_title: "My Registered Farms",
    my_farms_subtitle: "Switch between individual farm holdings or view your combined multi-farm portfolio.",
    all_farms_view_active: "All Farms View Active",
    switch_to_all_farms: "Switch to All Farms",
    add_new_farm: "Add New Farm",

    crop_planning_title: "Crop Planning & Timeline",
    add_crop_to_farm: "Add Crop to Farm",

    crop_advisories_title: "Crop Advisories & Bulletins",
    category_all: "All",
    category_pest: "Pest & Disease",
    category_weather: "Weather",

    inventory_title: "Inventory & Stores",
    add_store_btn: "+ Store",
    add_item_btn: "Add Item",

    equipment_title: "Equipment & Machinery",
    report_problem_btn: "Report Problem",
    register_equipment_btn: "Register Equipment",

    financial_stats_title: "Stats & Financials",

    team_title: "Team & Workforce Management",
    team_subtitle: "Configure staff members, roles, and farm holding permissions.",
    members_subtab: "Members",
    roles_subtab: "Roles",
    add_member_btn: "Add Team Member",
    create_role_btn: "Create Designation",

    reports_title: "Reports & Audits",
    reports_subtitle: "Official farm audit statement, crop performance and financial summaries.",
    download_pdf: "Print / Save PDF",
    export_csv_btn: "Export CSV",

    subscription_title: "Subscription & Plan",
    subscription_subtitle: "Manage your farm license, active acreage allocation, and billing.",
    annual_billing: "Annual (Save 20%)",
    monthly_billing: "Monthly",

    support_title: "Agronomy Help & Support",
    support_subtitle: "Direct agricultural advisory, crop disease diagnosis, and platform support.",
    open_ticket_btn: "Open Support Ticket",

    settings_title: "Farm & System Settings",
    settings_subtitle: "Configure your farmer identity, regional measurement units, and interface preferences.",
    settings_reset: "Reset",
    settings_save: "Save Preferences",
    settings_sign_out: "Sign Out",
    farmer_identity_title: "Farmer Identity & Account Profile",
    farmer_identity_desc: "Official details used on mandi dispatch slips and GST receipts",
    verified_farmer_id: "Verified Farmer ID",
    farmer_name_label: "Registered Farmer Full Name",
    farmer_phone_label: "Primary Mobile Number (OTP & SMS)",
    farmer_email_label: "Official Email Address",
    primary_mandi_label: "Primary APMC Mandi Linkage",
    farm_address_label: "Farm Headquarters Base Address",
    regional_units_title: "Regional Units & Interface Preferences",
    regional_units_desc: "Standards used across all crop records, field maps, and reports",
    default_unit_label: "Default Area Measurement Unit",
    interface_language: "Interface Language",
    currency_standard_label: "Currency & Financial Standard",
    date_format_label: "Calendar Date Format",
    danger_zone_title: "Account Security & Danger Zone",
    danger_zone_desc: "Permanently delete your account, farms, crop cycles, and financial records",
    delete_account_btn: "Permanently Delete Account & Data",

    save_changes: "Save Changes",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    search_placeholder: "Search records, crops, or inventory...",
    filter: "Filter",
    status: "Status",
    active: "Active",
    completed: "Completed",
    pending: "Pending",
    today: "Today",
    print: "Print / Save PDF",
    export_csv: "Export CSV",
    language_updated_toast: "Interface language updated successfully.",
  },

  pa: {
    nav_daily: "ਰੋਜ਼ਾਨਾ ਕੰਮ",
    nav_records: "ਖੇਤੀ ਰਿਕਾਰਡ",
    nav_manage: "ਪ੍ਰਬੰਧਨ",

    nav_dashboard: "ਡੈਸ਼ਬੋਰਡ",
    nav_dashboard_desc: "ਖੇਤ ਦਾ ਸਾਰ ਅਤੇ ਚੇਤਾਵਨੀਆਂ",
    nav_advisories: "ਸਲਾਹ ਅਤੇ ਚੇਤਾਵਨੀਆਂ",
    nav_advisories_desc: "ਫ਼ਸਲ ਰੋਗ ਅਤੇ ਮੌਸਮ ਸੰਬੰਧੀ ਚੇਤਾਵਨੀਆਂ",
    nav_weather: "ਮੌਸਮ ਜਾਣਕਾਰੀ",
    nav_weather_desc: "ਸਪ੍ਰੇ ਲਈ ਸਹੀ ਮੌਸਮ ਅਤੇ ਹਵਾ ਦੀ ਗਤੀ",
    nav_tasks: "ਖੇਤ ਦੇ ਕੰਮ",
    nav_tasks_desc: "ਕੰਮਾਂ ਦਾ ਕੈਲੰਡਰ ਅਤੇ ਸੂਚੀ",
    nav_inventory: "ਸਟਾਕ ਅਤੇ ਗੋਦਾਮ",
    nav_inventory_desc: "ਬੀਜ, ਖਾਦ ਅਤੇ ਕੀਟਨਾਸ਼ਕਾਂ ਦਾ ਸਟਾਕ",
    nav_equipment: "ਮਸ਼ੀਨਰੀ ਅਤੇ ਸੰਦ",
    nav_equipment_desc: "ਟਰੈਕਟਰ, ਸੰਦ ਅਤੇ ਸਰਵਿਸ ਰਿਕਾਰਡ",
    nav_crops: "ਫ਼ਸਲ ਪ੍ਰਬੰਧਨ",
    nav_crops_desc: "ਫ਼ਸਲ ਚੱਕਰ, ਵਿਕਾਸ ਅਤੇ ਕਿਸਮਾਂ",
    nav_stats: "ਖ਼ਰਚ ਅਤੇ ਕਮਾਈ",
    nav_stats_desc: "ਉਤਪਾਦਨ, ਨੁਕਸਾਨ ਅਤੇ ਖੇਤੀ ਖ਼ਰਚੇ",
    nav_reports: "ਰਿਪੋਰਟਾਂ ਅਤੇ ਆਡਿਟ",
    nav_reports_desc: "ਖੇਤ ਆਡਿਟ ਰਿਪੋਰਟ ਅਤੇ PDF",
    nav_my_farms: "ਮੇਰੇ ਖੇਤ",
    nav_my_farms_desc: "ਸਾਰੇ ਰਜਿਸਟਰਡ ਖੇਤ ਅਤੇ ਰਕਬਾ",
    nav_team: "ਮਜ਼ਦੂਰ ਅਤੇ ਟੀਮ",
    nav_team_desc: "ਖੇਤ ਮਜ਼ਦੂਰ ਅਤੇ ਸੁਪਰਵਾਈਜ਼ਰ",
    nav_subscription: "ਸਬਸਕ੍ਰਿਪਸ਼ਨ ਪਲਾਨ",
    nav_subscription_desc: "ਐਕਟਿਵ ਪਲਾਨ ਅਤੇ ਬਿਲਿੰਗ",
    nav_support: "ਮਾਹਰ ਸਹਾਇਤਾ",
    nav_support_desc: "੨੪/੭ ਖੇਤੀ ਮਾਹਰ ਹੈਲਪਲਾਈਨ",
    nav_settings: "ਸੈਟਿੰਗਾਂ",
    nav_settings_desc: "ਕਿਸਾਨ ਪ੍ਰੋਫਾਈਲ ਅਤੇ ਪਸੰਦ",

    select_farm_view: "ਖੇਤ ਚੁਣੋ",
    all_farms_consolidated: "ਸਾਰੇ ਖੇਤ (ਕੁੱਲ ਰਕਬਾ)",
    holdings_total: "ਕੁੱਲ ਰਕਬਾ",
    add_another_farm: "+ ਨਵਾਂ ਖੇਤ ਜੋੜੋ",
    holding: "ਖੇਤ",
    location: "ਸਥਾਨ",
    area: "ਰਕਬਾ",

    quick_actions: "ਤੇਜ਼ ਕਾਰਵਾਈਆਂ",
    add_crop: "ਨਵੀਂ ਫ਼ਸਲ ਜੋੜੋ",
    record_entry: "ਐਂਟਰੀ ਦਰਜ ਕਰੋ",
    assign_task: "ਕੰਮ ਸੌਂਪੋ",
    log_equipment: "ਮਸ਼ੀਨਰੀ ਵਰਤੋਂ ਲਿਖੋ",
    request_visit: "ਮਾਹਰ ਮੁਲਾਕਾਤ ਬੁੱਕ ਕਰੋ",
    add_task: "ਕੰਮ ਜੋੜੋ",
    financial_entry: "ਖ਼ਰਚਾ/ਕਮਾਈ ਐਂਟਰੀ",
    raise_field_visit: "ਖੇਤ ਵਿਜ਼ਿਟ ਬੁੱਕ ਕਰੋ",

    total_cultivated_area: "ਕੁੱਲ ਬੀਜਿਆ ਰਕਬਾ",
    active_crop_varieties: "ਚੱਲ ਰਹੀਆਂ ਫ਼ਸਲਾਂ",
    monthly_inflow: "ਮਹੀਨਾਵਾਰ ਆਮਦਨ",
    operating_expenses: "ਕੁੱਲ ਖ਼ਰਚੇ",
    net_realization: "ਸ਼ੁੱਧ ਮੁਨਾਫ਼ਾ",
    crop_losses: "ਫ਼ਸਲ ਨੁਕਸਾਨ",
    stats: "ਅੰਕੜੇ",
    view_ledger: "ਖਾਤਾ ਵੇਖੋ",
    production: "ਉਤਪਾਦਨ",
    losses: "ਨੁਕਸਾਨ",
    expenses: "ਖ਼ਰਚੇ",
    net: "ਸ਼ੁੱਧ ਬਚਤ",

    advisory_label: "ਸਲਾਹ",
    view_all: "ਸਾਰੀਆਂ ਵੇਖੋ",
    farm_operations_active: "ਖੇਤ ਦੇ ਕੰਮ ਚੱਲ ਰਹੇ ਹਨ",
    farm_operations_active_desc: "ਸਾਰੀਆਂ ਖੇਤੀ ਗਤੀਵਿਧੀਆਂ, ਫ਼ਸਲਾਂ ਅਤੇ ਸਟਾਕ ਰਿਕਾਰਡ ਅਪਡੇਟ ਹਨ।",
    active_crops_title: "ਮੌਜੂਦਾ ਫ਼ਸਲਾਂ",
    detailed_timeline: "ਵਿਸਤ੍ਰਿਤ ਟਾਈਮਲਾਈਨ",
    day: "ਦਿਨ",
    stage: "ਪੜਾਅ",
    todays_field_tasks: "ਅੱਜ ਦੇ ਖੇਤ ਕਾਰਜ",
    all_tasks_link: "ਸਾਰੇ ਕੰਮ",
    weather_spray_conditions: "ਮੌਸਮ ਅਤੇ ਸਪ੍ਰੇ ਸਥਿਤੀ",
    foliar_spray_window: "ਸਪ੍ਰੇ ਕਰਨ ਦਾ ਸਮਾਂ",
    view_weather_satellite_map: "ਸੈਟੇਲਾਈਟ ਮੌਸਮ ਨਕਸ਼ਾ ਵੇਖੋ",
    inventory_status: "ਗੋਦਾਮ ਸਟਾਕ ਸਥਿਤੀ",
    all_warehouses: "(ਸਾਰੇ ਗੋਦਾਮ)",
    manage_stock: "ਸਟਾਕ ਸੰਭਾਲੋ",
    no_inventory_items: "ਕੋਈ ਵਸਤੂ ਨਹੀਂ ਮਿਲੀ",
    no_inventory_desc: "ਅਜੇ ਕੋਈ ਬੀਜ, ਖਾਦ ਜਾਂ ਦਵਾਈ ਦਰਜ ਨਹੀਂ ਹੈ।",
    add_inventory_item: "+ ਨਵੀਂ ਵਸਤੂ ਜੋੜੋ",
    wind: "ਹਵਾ",
    humidity_label: "ਨਮੀ",
    rain_chance: "ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ",

    hyperlocal_weather: "ਖੇਤ ਦਾ ਤਾਜ਼ਾ ਮੌਸਮ",
    live_weather_api: "ਲਾਈਵ ਮੌਸਮ ਜਾਣਕਾਰੀ",
    weather_advisory_title: "ਮੌਸਮ ਸਲਾਹਕਾਰੀ",
    refresh: "ਤਾਜ਼ਾ ਕਰੋ",
    coordinates: "ਕੋਆਰਡੀਨੇਟਸ",
    updated: "ਅਪਡੇਟ ਹੋਇਆ",
    relative_humidity: "ਹਵਾ ਵਿੱਚ ਨਮੀ",
    wind_velocity: "ਹਵਾ ਦੀ ਰਫ਼ਤਾਰ",
    precipitation_probability: "ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ",
    safe_to_spray: "ਸਪ੍ਰੇ ਲਈ ਅਨੁਕੂਲ",
    spray_window: "ਸਪ੍ਰੇ ਦਾ ਸਮਾਂ",
    optimal_window: "ਉੱਤਮ ਸਮਾਂ • ਸੁਰੱਖਿਅਤ ਸਪ੍ਰੇ",
    risk_warning: "ਮੌਸਮ ਖ਼ਰਾਬ • ਸਪ੍ਰੇ ਨਾ ਕਰੋ",
    seven_day_forecast: "੭ ਦਿਨਾਂ ਦੀ ਖੇਤੀਬਾੜੀ ਮੌਸਮ ਭਵਿੱਖਬਾਣੀ",
    farm_location_map_title: "ਖੇਤ ਸਥਾਨ ਅਤੇ ਸੈਟੇਲਾਈਟ ਮੌਸਮ ਨਕਸ਼ਾ",
    open_map: "ਨਕਸ਼ਾ ਖੋਲ੍ਹੋ",

    tasks_operations_title: "ਖੇਤ ਦੇ ਕੰਮ ਅਤੇ ਸੰਚਾਲਨ",
    tasks_operations_desc: "ਖੇਤ ਦੀਆਂ ਗਤੀਵਿਧੀਆਂ, ਖਾਦ ਚੱਕਰ ਅਤੇ ਕੈਲੰਡਰ",
    view_list: "ਸੂਚੀ",
    view_calendar: "ਕੈਲੰਡਰ",
    create_task: "ਨਵਾਂ ਕੰਮ ਬਣਾਓ",
    all_tasks_count: "ਸਾਰੇ ਕੰਮ",
    to_do_count: "ਬਾਕੀ ਕੰਮ",
    in_progress_count: "ਚੱਲ ਰਹੇ",
    completed_count: "ਮੁਕੰਮਲ",
    to_do: "ਬਾਕੀ",
    in_progress: "ਜਾਰੀ",
    pending_status: "ਬਕਾਇਆ",
    done_status: "ਪੂਰਾ ਹੋਇਆ",
    active_status: "ਸਰਗਰਮ",
    all_farms_option: "ਸਾਰੇ ਖੇਤ",
    search_tasks_placeholder: "ਕੰਮ, ਫ਼ਸਲ ਜਾਂ ਮਜ਼ਦੂਰ ਖੋਜੋ...",
    priority_urgent: "ਜ਼ਰੂਰੀ",
    priority_high: "ਉੱਚ",
    priority_medium: "ਮੱਧਮ",
    priority_low: "ਆਮ",
    overdue_by: "ਲੇਟ",
    due_today: "ਅੱਜ ਦਾ ਕੰਮ",

    my_farms_title: "ਮੇਰੇ ਰਜਿਸਟਰਡ ਖੇਤ",
    my_farms_subtitle: "ਆਪਣੇ ਵੱਖ-ਵੱਖ ਖੇਤਾਂ ਵਿਚਕਾਰ ਬਦਲੋ ਜਾਂ ਸਾਂਝਾ ਪੋਰਟਫੋਲੀਓ ਵੇਖੋ।",
    all_farms_view_active: "ਸਾਰੇ ਖੇਤਾਂ ਦਾ ਦ੍ਰਿਸ਼ ਸਰਗਰਮ",
    switch_to_all_farms: "ਸਾਰੇ ਖੇਤ ਵੇਖੋ",
    add_new_farm: "+ ਨਵਾਂ ਖੇਤ ਜੋੜੋ",

    crop_planning_title: "ਫ਼ਸਲ ਯੋਜਨਾਬੰਦੀ ਅਤੇ ਟਾਈਮਲਾਈਨ",
    add_crop_to_farm: "+ ਨਵੀਂ ਫ਼ਸਲ ਜੋੜੋ",

    crop_advisories_title: "ਫ਼ਸਲ ਸਲਾਹਾਂ ਅਤੇ ਬੁਲੇਟਿਨ",
    category_all: "ਸਾਰੇ",
    category_pest: "ਕੀੜੇ ਅਤੇ ਰੋਗ",
    category_weather: "ਮੌਸਮ",

    inventory_title: "ਗੋਦਾਮ ਅਤੇ ਸਟਾਕ",
    add_store_btn: "+ ਗੋਦਾਮ ਜੋੜੋ",
    add_item_btn: "+ ਵਸਤੂ ਜੋੜੋ",

    equipment_title: "ਮਸ਼ੀਨਰੀ ਅਤੇ ਸੰਦ",
    report_problem_btn: "ਖ਼ਰਾਬੀ ਦਰਜ ਕਰੋ",
    register_equipment_btn: "+ ਨਵੀਂ ਮਸ਼ੀਨ ਜੋੜੋ",

    financial_stats_title: "ਖ਼ਰਚ ਅਤੇ ਕਮਾਈ ਅੰਕੜੇ",

    team_title: "ਮਜ਼ਦੂਰ ਅਤੇ ਟੀਮ ਪ੍ਰਬੰਧਨ",
    team_subtitle: "ਖੇਤ ਮਜ਼ਦੂਰ, ਭੂਮਿਕਾਵਾਂ ਅਤੇ ਅਧਿਕਾਰ ਸੈੱਟ ਕਰੋ।",
    members_subtab: "ਮੈਂਬਰ",
    roles_subtab: "ਭੂਮਿਕਾਵਾਂ",
    add_member_btn: "+ ਟੀਮ ਮੈਂਬਰ ਜੋੜੋ",
    create_role_btn: "+ ਨਵੀਂ ਭੂਮਿਕਾ ਬਣਾਓ",

    reports_title: "ਰਿਪੋਰਟਾਂ ਅਤੇ ਆਡਿਟ",
    reports_subtitle: "ਅਧਿਕਾਰਤ ਖੇਤ ਆਡਿਟ ਸਟੇਟਮੈਂਟ, ਉਤਪਾਦਨ ਅਤੇ ਵਿੱਤੀ ਸਾਰ।",
    download_pdf: "ਪ੍ਰਿੰਟ / PDF ਸੰਭਾਲੋ",
    export_csv_btn: "CSV ਡਾਊਨਲੋਡ",

    subscription_title: "ਸਬਸਕ੍ਰਿਪਸ਼ਨ ਅਤੇ ਪਲਾਨ",
    subscription_subtitle: "ਆਪਣਾ ਫਾਰਮ ਲਾਇਸੈਂਸ, ਰਕਬਾ ਕੋਟਾ ਅਤੇ ਬਿਲਿੰਗ ਸੰਭਾਲੋ।",
    annual_billing: "ਸਾਲਾਨਾ (੨੦% ਛੋਟ)",
    monthly_billing: "ਮਹੀਨਾਵਾਰ",

    support_title: "ਖੇਤੀ ਮਾਹਰ ਹੈਲਪਲਾਈਨ ਅਤੇ ਸਹਾਇਤਾ",
    support_subtitle: "ਸਿੱਧੀ ਖੇਤੀਬਾੜੀ ਸਲਾਹ, ਫ਼ਸਲ ਰੋਗ ਨਿਦਾਨ ਅਤੇ ਸਿਸਟਮ ਸਹਾਇਤਾ।",
    open_ticket_btn: "+ ਸਹਾਇਤਾ ਟਿਕਟ ਖੋਲ੍ਹੋ",

    settings_title: "ਖੇਤ ਅਤੇ ਸਿਸਟਮ ਸੈਟਿੰਗਾਂ",
    settings_subtitle: "ਆਪਣੀ ਕਿਸਾਨ ਪਛਾਣ, ਰਕਬਾ ਮਾਪ ਇਕਾਈਆਂ ਅਤੇ ਭਾਸ਼ਾ ਪਸੰਦ ਸੈੱਟ ਕਰੋ।",
    settings_reset: "ਰੀਸੈੱਟ",
    settings_save: "ਸੈਟਿੰਗਾਂ ਸੰਭਾਲੋ",
    settings_sign_out: "ਲੌਗ ਆਉਟ",
    farmer_identity_title: "ਕਿਸਾਨ ਪਛਾਣ ਅਤੇ ਖਾਤਾ ਪ੍ਰੋਫਾਈਲ",
    farmer_identity_desc: "ਮੰਡੀ ਪਰਚੀਆਂ ਅਤੇ ਬਿੱਲਾਂ ਲਈ ਅਧਿਕਾਰਤ ਵੇਰਵੇ",
    verified_farmer_id: "ਪ੍ਰਮਾਣਿਤ ਕਿਸਾਨ ID",
    farmer_name_label: "ਰਜਿਸਟਰਡ ਕਿਸਾਨ ਦਾ ਪੂਰਾ ਨਾਮ",
    farmer_phone_label: "ਮੁੱਖ ਮੋਬਾਈਲ ਨੰਬਰ (OTP ਅਤੇ SMS)",
    farmer_email_label: "ਸਰਕਾਰੀ ਈਮੇਲ ਪਤਾ",
    primary_mandi_label: "ਮੁੱਖ APMC ਦਾਣਾ ਮੰਡੀ ਲਿੰਕ",
    farm_address_label: "ਖੇਤ ਦਾ ਪੱਕਾ ਪਤਾ",
    regional_units_title: "ਖੇਤਰੀ ਇਕਾਈਆਂ ਅਤੇ ਭਾਸ਼ਾ ਪਸੰਦ",
    regional_units_desc: "ਫ਼ਸਲ ਰਿਕਾਰਡ, ਨਕਸ਼ਿਆਂ ਅਤੇ ਰਿਪੋਰਟਾਂ ਵਿੱਚ ਵਰਤੀਆਂ ਜਾਣ ਵਾਲੀਆਂ ਇਕਾਈਆਂ",
    default_unit_label: "ਜ਼ਮੀਨ ਮਾਪਣ ਦੀ ਡਿਫਾਲਟ ਇਕਾਈ",
    interface_language: "ਸਿਸਟਮ ਭਾਸ਼ਾ",
    currency_standard_label: "ਕਰੰਸੀ ਅਤੇ ਵਿੱਤੀ ਮਿਆਰ",
    date_format_label: "ਕੈਲੰਡਰ ਤਾਰੀਖ ਫਾਰਮੈਟ",
    danger_zone_title: "ਖਾਤਾ ਸੁਰੱਖਿਆ ਅਤੇ ਖ਼ਤਰਾ ਜ਼ੋਨ",
    danger_zone_desc: "ਆਪਣਾ ਖਾਤਾ, ਖੇਤ, ਫ਼ਸਲ ਚੱਕਰ ਅਤੇ ਵਿੱਤੀ ਰਿਕਾਰਡ ਪੱਕੇ ਤੌਰ 'ਤੇ ਮਿਟਾਓ",
    delete_account_btn: "ਖਾਤਾ ਅਤੇ ਸਾਰਾ ਡਾਟਾ ਪੱਕੇ ਤੌਰ 'ਤੇ ਮਿਟਾਓ",

    save_changes: "ਸੰਭਾਲੋ",
    cancel: "ਰੱਦ ਕਰੋ",
    edit: "ਸੋਧੋ",
    delete: "ਮਿਟਾਓ",
    search_placeholder: "ਖੋਜੋ (ਰਿਕਾਰਡ, ਫ਼ਸਲ ਜਾਂ ਵਸਤੂ)...",
    filter: "ਫਿਲਟਰ",
    status: "ਸਥਿਤੀ",
    active: "ਸਰਗਰਮ",
    completed: "ਮੁਕੰਮਲ",
    pending: "ਬਕਾਇਆ",
    today: "ਅੱਜ",
    print: "ਪ੍ਰਿੰਟ / PDF ਸੰਭਾਲੋ",
    export_csv: "CSV ਡਾਊਨਲੋਡ",
    language_updated_toast: "ਭਾਸ਼ਾ ਸਫ਼ਲਤਾਪੂਰਵਕ ਬਦਲੀ ਗਈ ਹੈ।",
  },

  hi: {
    nav_daily: "दैनिक कार्य",
    nav_records: "कृषि रिकॉर्ड्स",
    nav_manage: "प्रबंधन",

    nav_dashboard: "डैशबोर्ड",
    nav_dashboard_desc: "खेत का सारांश एवं चेतावनी",
    nav_advisories: "सलाह और अलर्ट",
    nav_advisories_desc: "फसल रोग चेतावनी और मौसम सलाह",
    nav_weather: "मौसम पूर्वानुमान",
    nav_weather_desc: "स्प्रे अनुकूलता और सटीक मौसम",
    nav_tasks: "खेत कार्य",
    nav_tasks_desc: "कार्य कैलेंडर और सूची",
    nav_inventory: "गोदाम और स्टॉक",
    nav_inventory_desc: "बीज, उर्वरक और कीटनाशक स्टॉक",
    nav_equipment: "मशीनरी और उपकरण",
    nav_equipment_desc: "ट्रैक्टर और सर्विस रिकॉर्ड",
    nav_crops: "फसल प्रबंधन",
    nav_crops_desc: "फसल चक्र, विकास और किस्में",
    nav_stats: "खर्च और मुनाफा",
    nav_stats_desc: "उत्पादन, नुकसान और कृषि खर्च",
    nav_reports: "रिपोर्ट्स और ऑडिट",
    nav_reports_desc: "फार्म ऑडिट रिपोर्ट और PDF",
    nav_my_farms: "मेरे खेत",
    nav_my_farms_desc: "सभी पंजीकृत खेत और रकबा",
    nav_team: "कार्यबल और टीम",
    nav_team_desc: "मजदूर और सुपरवाइजर प्रबंधन",
    nav_subscription: "सदस्यता योजना",
    nav_subscription_desc: "सक्रिय प्लान और बिलिंग",
    nav_support: "कृषि विशेषज्ञ सहायता",
    nav_support_desc: "२४/७ किसान हेल्पलाइन",
    nav_settings: "सेटिंग्स",
    nav_settings_desc: "किसान प्रोफाइल और प्राथमिकताएं",

    select_farm_view: "खेत चुनें",
    all_farms_consolidated: "सभी खेत (कुल रकबा)",
    holdings_total: "कुल रकबा",
    add_another_farm: "+ नया खेत जोड़ें",
    holding: "खेत",
    location: "स्थान",
    area: "क्षेत्रफल",

    quick_actions: "त्वरित कार्य",
    add_crop: "नई फसल जोड़ें",
    record_entry: "प्रविष्टि दर्ज करें",
    assign_task: "कार्य सौंपें",
    log_equipment: "मशीनरी उपयोग दर्ज करें",
    request_visit: "विशेषज्ञ विजिट बुक करें",
    add_task: "कार्य जोड़ें",
    financial_entry: "वित्तीय प्रविष्टि",
    raise_field_visit: "फील्ड विजिट बुक करें",

    total_cultivated_area: "कुल बोया गया रकबा",
    active_crop_varieties: "सक्रिय फसलें",
    monthly_inflow: "मासिक उत्पादन आय",
    operating_expenses: "कुल कृषि खर्च",
    net_realization: "शुद्ध मुनाफा",
    crop_losses: "फसल नुकसान",
    stats: "सांख्यिकी",
    view_ledger: "बहीखाता देखें",
    production: "उत्पादन",
    losses: "नुकसान",
    expenses: "खर्च",
    net: "शुद्ध आय",

    advisory_label: "सलाह",
    view_all: "सभी देखें",
    farm_operations_active: "खेत कार्य सुचारू हैं",
    farm_operations_active_desc: "सभी कृषि गतिविधियां, फसलें और स्टॉक रिकॉर्ड अद्यतित हैं।",
    active_crops_title: "सक्रिय फसलें",
    detailed_timeline: "विस्तृत टाइमलाइन",
    day: "दिन",
    stage: "चरण",
    todays_field_tasks: "आज के खेत कार्य",
    all_tasks_link: "सभी कार्य",
    weather_spray_conditions: "मौसम एवं छिड़काव स्थिति",
    foliar_spray_window: "छिड़काव का सही समय",
    view_weather_satellite_map: "मौसम उपग्रह मानचित्र देखें",
    inventory_status: "गोदाम स्टॉक स्थिति",
    all_warehouses: "(सभी गोदाम)",
    manage_stock: "स्टॉक प्रबंधित करें",
    no_inventory_items: "कोई स्टॉक सामग्री नहीं",
    no_inventory_desc: "अभी तक कोई बीज, खाद या दवा दर्ज नहीं है।",
    add_inventory_item: "+ नया सामान जोड़ें",
    wind: "हवा",
    humidity_label: "नमी",
    rain_chance: "बारिश की संभावना",

    hyperlocal_weather: "खेत का सटीक मौसम",
    live_weather_api: "लाइव मौसम जानकारी",
    weather_advisory_title: "मौसम सलाह",
    refresh: "ताज़ा करें",
    coordinates: "निर्देशांक",
    updated: "अपडेट हुआ",
    relative_humidity: "हवा में नमी",
    wind_velocity: "हवा की गति",
    precipitation_probability: "बारिश की संभावना",
    safe_to_spray: "छिड़काव के लिए अनुकूल",
    spray_window: "छिड़काव का समय",
    optimal_window: "उत्तम समय • सुरक्षित छिड़काव",
    risk_warning: "प्रतिकूल मौसम • छिड़काव न करें",
    seven_day_forecast: "७-दिवसीय कृषि मौसम पूर्वानुमान",
    farm_location_map_title: "खेत स्थान एवं उपग्रह मौसम मानचित्र",
    open_map: "नक्शा खोलें",

    tasks_operations_title: "खेत कार्य एवं संचालन",
    tasks_operations_desc: "खेत गतिविधियां, उर्वरक चक्र एवं कैलेंडर",
    view_list: "सूची",
    view_calendar: "कैलेंडर",
    create_task: "नया कार्य बनाएं",
    all_tasks_count: "सभी कार्य",
    to_do_count: "करने योग्य",
    in_progress_count: "प्रगति पर",
    completed_count: "पूर्ण",
    to_do: "बाकी",
    in_progress: "प्रगति पर",
    pending_status: "लंबित",
    done_status: "संपन्न",
    active_status: "सक्रिय",
    all_farms_option: "सभी खेत",
    search_tasks_placeholder: "कार्य, फसल या मजदूर खोजें...",
    priority_urgent: "अति आवश्यक",
    priority_high: "उच्च",
    priority_medium: "मध्यम",
    priority_low: "सामान्य",
    overdue_by: "विलंबित",
    due_today: "आज देय",

    my_farms_title: "मेरे पंजीकृत खेत",
    my_farms_subtitle: "व्यक्तिगत खेत होल्डिंग्स के बीच स्विच करें या संयुक्त पोर्टफोलियो देखें।",
    all_farms_view_active: "सभी खेत दृश्य सक्रिय",
    switch_to_all_farms: "सभी खेत देखें",
    add_new_farm: "+ नया खेत जोड़ें",

    crop_planning_title: "फसल योजना एवं समयरेखा",
    add_crop_to_farm: "+ नई फसल जोड़ें",

    crop_advisories_title: "फसल सलाह एवं बुलेटिन",
    category_all: "सभी",
    category_pest: "कीट एवं रोग",
    category_weather: "मौसम",

    inventory_title: "गोदाम और स्टॉक",
    add_store_btn: "+ गोदाम जोड़ें",
    add_item_btn: "+ सामान जोड़ें",

    equipment_title: "मशीनरी एवं उपकरण",
    report_problem_btn: "समस्या दर्ज करें",
    register_equipment_btn: "+ मशीन पंजीकृत करें",

    financial_stats_title: "आंकड़े एवं वित्तीय बहीखाता",

    team_title: "कार्यबल एवं टीम प्रबंधन",
    team_subtitle: "खेत कर्मचारी, पदनाम और मॉड्यूल अनुमतियां प्रबंधित करें।",
    members_subtab: "सदस्य",
    roles_subtab: "पदनाम",
    add_member_btn: "+ नया सदस्य जोड़ें",
    create_role_btn: "+ नया पदनाम बनाएं",

    reports_title: "रिपोर्ट्स और ऑडिट",
    reports_subtitle: "आधिकारिक फार्म ऑडिट विवरण, फसल प्रदर्शन और वित्तीय सारांश।",
    download_pdf: "प्रिंट / PDF सहेजें",
    export_csv_btn: "CSV डाउनलोड",

    subscription_title: "सदस्यता और प्लान",
    subscription_subtitle: "अपना फार्म लाइसेंस, सक्रिय रकबा और बिलिंग प्रबंधित करें।",
    annual_billing: "वार्षिक (२०% बचत)",
    monthly_billing: "मासिक",

    support_title: "कृषि विशेषज्ञ एवं सहायता",
    support_subtitle: "प्रत्यक्ष कृषि सलाह, फसल रोग निदान और सिस्टम सहायता।",
    open_ticket_btn: "+ सहायता टिकट खोलें",

    settings_title: "खेत और सिस्टम सेटिंग्स",
    settings_subtitle: "अपनी किसान पहचान, क्षेत्रीय माप इकाइयां और भाषा प्राथमिकताएं सेट करें।",
    settings_reset: "रीसेट",
    settings_save: "सेटिंग्स सहेजें",
    settings_sign_out: "लॉग आउट",
    farmer_identity_title: "किसान पहचान और खाता प्रोफाइल",
    farmer_identity_desc: "मंडी पर्चियों और बिलों के लिए आधिकारिक विवरण",
    verified_farmer_id: "सत्यापित किसान ID",
    farmer_name_label: "पंजीकृत किसान का पूरा नाम",
    farmer_phone_label: "मुख्य मोबाइल नंबर (OTP और SMS)",
    farmer_email_label: "आधिकारिक ईमेल पता",
    primary_mandi_label: "मुख्य APMC अनाज मंडी लिंकेज",
    farm_address_label: "खेत का स्थायी पता",
    regional_units_title: "क्षेत्रीय इकाइयां और भाषा प्राथमिकताएं",
    regional_units_desc: "फसल रिकॉर्ड, मानचित्र और रिपोर्ट में उपयोग की जाने वाली इकाइयां",
    default_unit_label: "जमीन मापने की डिफ़ॉल्ट इकाई",
    interface_language: "सिस्टम भाषा",
    currency_standard_label: "मुद्रा और वित्तीय मानक",
    date_format_label: "कैलेंडर तिथि प्रारूप",
    danger_zone_title: "खाता सुरक्षा और डेंजर ज़ोन",
    danger_zone_desc: "अपना खाता, खेत, फसल चक्र और वित्तीय रिकॉर्ड हमेशा के लिए हटाएं",
    delete_account_btn: "खाता और सारा डेटा हमेशा के लिए हटाएं",

    save_changes: "सहेजें",
    cancel: "रद्द करें",
    edit: "संपादित करें",
    delete: "हटाएं",
    search_placeholder: "खोजें (रिकॉर्ड, फसल या वस्तु)...",
    filter: "फ़िल्टर",
    status: "स्थिति",
    active: "सक्रिय",
    completed: "पूर्ण",
    pending: "लंबित",
    today: "आज",
    print: "प्रिंट / PDF सहेजें",
    export_csv: "CSV डाउनलोड",
    language_updated_toast: "भाषा सफलतापूर्वक बदल दी गई है।",
  },

  mr: {
    nav_daily: "दैनिक कामे",
    nav_records: "शेती नोंदी",
    nav_manage: "व्यवस्थापन",

    nav_dashboard: "डॅशबोर्ड",
    nav_dashboard_desc: "शेताचा सारांश आणि सूचना",
    nav_advisories: "सल्ला आणि सूचना",
    nav_advisories_desc: "पीक रोग आणि हवामान अंदाज",
    nav_weather: "हवामान अंदाज",
    nav_weather_desc: "फवारणीसाठी अनुकूल हवामान",
    nav_tasks: "शेतातील कामे",
    nav_tasks_desc: "काम कॅलेंडर आणि यादी",
    nav_inventory: "गोदाम आणि साठा",
    nav_inventory_desc: "बियाणे, खते आणि औषधे साठा",
    nav_equipment: "यंत्रसामग्री आणि अवजारे",
    nav_equipment_desc: "ट्रॅक्टर आणि दुरुस्ती नोंदी",
    nav_crops: "पीक व्यवस्थापन",
    nav_crops_desc: "पीक चक्र आणि वाण",
    nav_stats: "खर्च आणि उत्पन्न",
    nav_stats_desc: "उत्पादन, नुकसान आणि शेती खर्च",
    nav_reports: "अहवाल आणि ऑडिट",
    nav_reports_desc: "फार्म ऑडिट अहवाल आणि PDF",
    nav_my_farms: "माझी शेते",
    nav_my_farms_desc: "सर्व नोंदणीकृत शेतजमीन",
    nav_team: "मजूर आणि टीम",
    nav_team_desc: "मजूर आणि सुपरवायझर व्यवस्थापन",
    nav_subscription: "सदस्यता प्लॅन",
    nav_subscription_desc: "सक्रिय प्लॅन आणि बिलिंग",
    nav_support: "कृषी तज्ञ सहाय्य",
    nav_support_desc: "२४/७ शेतकरी हेल्पलाइन",
    nav_settings: "सेटिंग्ज",
    nav_settings_desc: "शेतकरी प्रोफाइल आणि प्राधान्ये",

    select_farm_view: "शेत निवडा",
    all_farms_consolidated: "सर्व शेते (एकूण क्षेत्रफळ)",
    holdings_total: "एकूण क्षेत्रफळ",
    add_another_farm: "+ नवीन शेत जोडा",
    holding: "शेत",
    location: "स्थान",
    area: "क्षेत्रफळ",

    quick_actions: "जलद कृती",
    add_crop: "नवीन पीक जोडा",
    record_entry: "नोंद करा",
    assign_task: "काम सोपवा",
    log_equipment: "यंत्रसामग्री वापर नोंदवा",
    request_visit: "तज्ञ भेट नोंदवा",
    add_task: "काम जोडा",
    financial_entry: "आर्थिक नोंद",
    raise_field_visit: "शेत भेट बुक करा",

    total_cultivated_area: "एकूण लागवड क्षेत्र",
    active_crop_varieties: "चालू पिके",
    monthly_inflow: "मासिक उत्पादन उत्पन्न",
    operating_expenses: "एकूण शेती खर्च",
    net_realization: "निव्वळ नफा",
    crop_losses: "पीक नुकसान",
    stats: "आकडेवारी",
    view_ledger: "खातेवही पहा",
    production: "उत्पादन",
    losses: "नुकसान",
    expenses: "खर्च",
    net: "निव्वळ बचत",

    advisory_label: "सल्ला",
    view_all: "सर्व पहा",
    farm_operations_active: "शेतीची कामे सुरू आहेत",
    farm_operations_active_desc: "सर्व शेती उपक्रम, पिके आणि साठा नोंदी अद्ययावत आहेत.",
    active_crops_title: "सक्रिय पिके",
    detailed_timeline: "सविस्तर टाइमलाइन",
    day: "दिवस",
    stage: "टप्पा",
    todays_field_tasks: "आजची शेतातील कामे",
    all_tasks_link: "सर्व कामे",
    weather_spray_conditions: "हवामान आणि फवारणी परिस्थिती",
    foliar_spray_window: "फवारणीची योग्य वेळ",
    view_weather_satellite_map: "उपग्रह हवामान नकाशा पहा",
    inventory_status: "गोदाम साठा स्थिती",
    all_warehouses: "(सर्व गोदामांमध्ये)",
    manage_stock: "साठा व्यवस्थापित करा",
    no_inventory_items: "साठ्यात कोणतीही सामग्री नाही",
    no_inventory_desc: "अजून कोणतेही बियाणे, खत किंवा औषध नोंदवले नाही.",
    add_inventory_item: "+ नवीन वस्तू जोडा",
    wind: "वारा",
    humidity_label: "आर्द्रता",
    rain_chance: "पावसाची शक्यता",

    hyperlocal_weather: "शेताचे अचूक हवामान",
    live_weather_api: "थेट हवामान माहिती",
    weather_advisory_title: "हवामान सल्ला",
    refresh: "ताजे करा",
    coordinates: "अक्षांश-रेखांश",
    updated: "अपडेट केले",
    relative_humidity: "हवेतील आर्द्रता",
    wind_velocity: "वाऱ्याचा वेग",
    precipitation_probability: "पावसाची शक्यता",
    safe_to_spray: "फवारणीसाठी अनुकूल",
    spray_window: "फवारणीची वेळ",
    optimal_window: "उत्तम वेळ • सुरक्षित फवारणी",
    risk_warning: "प्रतिकूल हवामान • फवारणी टाळा",
    seven_day_forecast: "७-दिवसीय कृषी हवामान अंदाज",
    farm_location_map_title: "शेत स्थान आणि उपग्रह हवामान नकाशा",
    open_map: "नकाशा उघडा",

    tasks_operations_title: "शेतातील कामे आणि व्यवस्थापन",
    tasks_operations_desc: "शेती कामे, खत चक्र आणि कॅलेंडर",
    view_list: "यादी",
    view_calendar: "कॅलेंडर",
    create_task: "नवीन काम जोडा",
    all_tasks_count: "सर्व कामे",
    to_do_count: "करावयाची कामे",
    in_progress_count: "सुरू कामे",
    completed_count: "पूर्ण कामे",
    to_do: "बाकी",
    in_progress: "सुरू",
    pending_status: "प्रलंबित",
    done_status: "पूर्ण",
    active_status: "सक्रिय",
    all_farms_option: "सर्व शेते",
    search_tasks_placeholder: "काम, पीक किंवा मजूर शोधा...",
    priority_urgent: "तातडीचे",
    priority_high: "उच्च",
    priority_medium: "मध्यम",
    priority_low: "सामान्य",
    overdue_by: "उशीर",
    due_today: "आज देय",

    my_farms_title: "माझी नोंदणीकृत शेते",
    my_farms_subtitle: "वैयक्तिक शेतांमध्ये स्विच करा किंवा एकत्रित पोर्टफोलिओ पहा.",
    all_farms_view_active: "सर्व शेत दृश्य सक्रिय",
    switch_to_all_farms: "सर्व शेते पहा",
    add_new_farm: "+ नवीन शेत जोडा",

    crop_planning_title: "पीक नियोजन आणि टाइमलाइन",
    add_crop_to_farm: "+ नवीन पीक जोडा",

    crop_advisories_title: "पीक सल्ला आणि बुलेटिन",
    category_all: "सर्व",
    category_pest: "कीटक आणि रोग",
    category_weather: "हवामान",

    inventory_title: "गोदाम आणि साठा",
    add_store_btn: "+ गोदाम जोडा",
    add_item_btn: "+ वस्तू जोडा",

    equipment_title: "यंत्रसामग्री आणि अवजारे",
    report_problem_btn: "तक्रार नोंदवा",
    register_equipment_btn: "+ नवीन यंत्र जोडा",

    financial_stats_title: "आकडेवारी आणि हिशेब",

    team_title: "मजूर आणि टीम व्यवस्थापन",
    team_subtitle: "शेत कामगार, पदे आणि परवानग्या व्यवस्थापित करा.",
    members_subtab: "सदस्य",
    roles_subtab: "भूमिका",
    add_member_btn: "+ नवीन सदस्य जोडा",
    create_role_btn: "+ नवीन पद तयार करा",

    reports_title: "अहवाल आणि ऑडिट",
    reports_subtitle: "अधिकृत शेत ऑडिट अहवाल, पीक कामगिरी आणि आर्थिक सारांश.",
    download_pdf: "प्रिंट / PDF जतन करा",
    export_csv_btn: "CSV डाउनलोड",

    subscription_title: "सदस्यता आणि प्लॅन",
    subscription_subtitle: "आपला शेती परवाना, क्षेत्रफळ कोटा आणि बिलिंग व्यवस्थापित करा.",
    annual_billing: "वार्षिक (२०% बचत)",
    monthly_billing: "मासिक",

    support_title: "कृषी तज्ञ आणि मदत",
    support_subtitle: "थेट कृषी सल्ला, पीक रोग निदान आणि तांत्रिक मदत.",
    open_ticket_btn: "+ नवीन तिकीट उघडा",

    settings_title: "शेत आणि सिस्टम सेटिंग्ज",
    settings_subtitle: "आपली शेतकरी ओळख, प्रादेशिक मोजमाप एकके आणि भाषा प्राधान्ये सेट करा.",
    settings_reset: "रीसेट",
    settings_save: "सेटिंग्ज जतन करा",
    settings_sign_out: "लॉग आउट",
    farmer_identity_title: "शेतकरी ओळख आणि प्रोफाइल",
    farmer_identity_desc: "मार्केट पावत्या आणि बिलांसाठी अधिकृत तपशील",
    verified_farmer_id: "प्रमाणित शेतकरी ID",
    farmer_name_label: "नोंदणीकृत शेतकऱ्याचे नाव",
    farmer_phone_label: "मुख्य मोबाइल नंबर (OTP आणि SMS)",
    farmer_email_label: "अधिकृत ईमेल पत्ता",
    primary_mandi_label: "मुख्य APMC बाजार समिती",
    farm_address_label: "शेताचा मुख्य पत्ता",
    regional_units_title: "प्रादेशिक एकके आणि भाषा प्राधान्ये",
    regional_units_desc: "पीक नोंदी, नकाशे आणि अहवालांमध्ये वापरली जाणारी एकके",
    default_unit_label: "जमीन मोजण्याची डीफॉल्ट एकक",
    interface_language: "सिस्टम भाषा",
    currency_standard_label: "चलन आणि आर्थिक मानक",
    date_format_label: "कॅलेंडर तारीख फॉरमॅट",
    danger_zone_title: "खाते सुरक्षा आणि डेंजर झोन",
    danger_zone_desc: "आपले खाते, शेत, पीक चक्र आणि आर्थिक नोंदी कायमस्वरूपी हटवा",
    delete_account_btn: "खाते आणि सर्व डेटा कायमस्वरूपी हटवा",

    save_changes: "जतन करा",
    cancel: "रद्द करा",
    edit: "संपादन",
    delete: "हटवा",
    search_placeholder: "शोधा (नोंदी, पीक किंवा वस्तू)...",
    filter: "फिल्टर",
    status: "स्थिती",
    active: "सक्रिय",
    completed: "पूर्ण",
    pending: "प्रलंबित",
    today: "आज",
    print: "प्रिंट / PDF जतन करा",
    export_csv: "CSV डाउनलोड",
    language_updated_toast: "भाषा यशस्वीरित्या बदलली आहे.",
  },

  gu: {
    nav_daily: "દૈનિક કામગીરી",
    nav_records: "ખેતી રેકોર્ડ્સ",
    nav_manage: "વ્યવસ્થાપન",

    nav_dashboard: "ડેશબોર્ડ",
    nav_dashboard_desc: "ખેતરનો સારાંશ અને ચેતવણીઓ",
    nav_advisories: "સલાહ અને ચેતવણીઓ",
    nav_advisories_desc: "પાક રોગ અને હવામાન ચેતવણીઓ",
    nav_weather: "હવામાન આગાહી",
    nav_weather_desc: "દવા છંટકાવ માટે હવામાન સલાહ",
    nav_tasks: "ખેતરના કાર્યો",
    nav_tasks_desc: "કાર્ય કેલેન્ડર અને લિસ્ટ",
    nav_inventory: "ગોદામ અને સ્ટોક",
    nav_inventory_desc: "બિયારણ, ખાતર અને દવાઓ",
    nav_equipment: "મશીનરી અને સાધનો",
    nav_equipment_desc: "ટ્રેક્ટર અને સર્વિસ રેકોર્ડ",
    nav_crops: "પાક વ્યવસ્થાપન",
    nav_crops_desc: "પાક ચક્ર અને જાતો",
    nav_stats: "ખર્ચ અને આવક",
    nav_stats_desc: "ઉત્પાદન, નુકસાન અને ખેતી ખર્ચ",
    nav_reports: "રિપોર્ટ્સ અને ઓડિટ",
    nav_reports_desc: "ફાર્મ ઓડિટ રિપોર્ટ્સ અને PDF",
    nav_my_farms: "મારા ખેતરો",
    nav_my_farms_desc: "તમામ નોંધાયેલા ખેતરો",
    nav_team: "કામદારો અને ટીમ",
    nav_team_desc: "મજૂરો અને સુપરવાઈઝર",
    nav_subscription: "સબ્સ્ક્રિપ્શન પ્લાન",
    nav_subscription_desc: "એક્ટિવ પ્લાન અને બિલિંગ",
    nav_support: "ખેતી નિષ્ણાત સહાય",
    nav_support_desc: "૨૪/૭ કૃષિ હેલ્પલાઇન",
    nav_settings: "સેટિંગ્સ",
    nav_settings_desc: "ખેડૂત પ્રોફાઇલ અને પસંદગીઓ",

    select_farm_view: "ખેતર પસંદ કરો",
    all_farms_consolidated: "તમામ ખેતરો (કુલ જમીન)",
    holdings_total: "કુલ ક્ષેત્રફળ",
    add_another_farm: "+ નવું ખેતર ઉમેરો",
    holding: "ખેતર",
    location: "સ્થળ",
    area: "વિસ્તાર",

    quick_actions: "ઝડપી ક્રિયાઓ",
    add_crop: "નવો પાક ઉમેરો",
    record_entry: "નોંધણી કરો",
    assign_task: "કામ સોંપો",
    log_equipment: "મશીનરી ઉપયોગ નોંધો",
    request_visit: "નિષ્ણાત મુલાકાત બુક કરો",
    add_task: "કામ ઉમેરો",
    financial_entry: "ખર્ચ/આવક એન્ટ્રી",
    raise_field_visit: "ખેતર મુલાકાત બુક કરો",

    total_cultivated_area: "કુલ વાવેતર વિસ્તાર",
    active_crop_varieties: "ચાલુ પાકો",
    monthly_inflow: "માસિક ઉત્પાદન આવક",
    operating_expenses: "કુલ ખર્ચ",
    net_realization: "ચોખ્ખો નફો",
    crop_losses: "પાક નુકસાન",
    stats: "આંકડા",
    view_ledger: "ખાતાવહી જુઓ",
    production: "ઉત્પાદન",
    losses: "નુકસાન",
    expenses: "ખર્ચ",
    net: "ચોખ્ખી આવક",

    advisory_label: "સલાહ",
    view_all: "બધા જુઓ",
    farm_operations_active: "ખેતી કામગીરી સક્રિય છે",
    farm_operations_active_desc: "તમામ ખેતી પ્રવૃત્તિઓ, પાક અને સ્ટોક રેકોર્ડ અદ્યતન છે.",
    active_crops_title: "સક્રિય પાકો",
    detailed_timeline: "વિગતવાર સમયરેખા",
    day: "દિવસ",
    stage: "તબક્કો",
    todays_field_tasks: "આજના ખેતરના કાર્યો",
    all_tasks_link: "બધા કાર્યો",
    weather_spray_conditions: "હવામાન અને છંટકાવ સ્થિતિ",
    foliar_spray_window: "છંટકાવ સમય",
    view_weather_satellite_map: "હવામાન સેટેલાઇટ નકશો જુઓ",
    inventory_status: "ગોદામ સ્ટોક સ્થિતિ",
    all_warehouses: "(તમામ ગોદામો)",
    manage_stock: "સ્ટોક મેનેજ કરો",
    no_inventory_items: "કોઈ સ્ટોક સામગ્રી નથી",
    no_inventory_desc: "હજુ સુધી કોઈ બિયારણ, ખાતર કે દવા નોંધાયેલ નથી.",
    add_inventory_item: "+ નવી વસ્તુ ઉમેરો",
    wind: "પવન",
    humidity_label: "ભેજ",
    rain_chance: "વરસાદની શક્યતા",

    hyperlocal_weather: "ખેતરનું તાજું હવામાન",
    live_weather_api: "લાઇવ હવામાન માહિતી",
    weather_advisory_title: "હવામાન સલાહ",
    refresh: "રીફ્રેશ",
    coordinates: "અક્ષાંશ-રેખાંશ",
    updated: "અપડેટ થયેલ",
    relative_humidity: "હવામાં ભેજ",
    wind_velocity: "પવનની ગતિ",
    precipitation_probability: "વરસાદની શક્યતા",
    safe_to_spray: "છંટકાવ માટે અનુકૂળ",
    spray_window: "છંટકાવ સમય",
    optimal_window: "શ્રેષ્ઠ સમય • સલામત છંટકાવ",
    risk_warning: "પ્રતિકૂળ હવામાન • છંટકાવ ટાળો",
    seven_day_forecast: "૭-દિવસીય કૃષિ હવામાન આગાહી",
    farm_location_map_title: "ખેતર સ્થાન અને સેટેલાઇટ હવામાન નકશો",
    open_map: "નકશો ખોલો",

    tasks_operations_title: "ખેતરના કાર્યો અને સંચાલન",
    tasks_operations_desc: "ખેતરની પ્રવૃત્તિઓ, ખાતર ચક્ર અને કેલેન્ડર",
    view_list: "યાદી",
    view_calendar: "કેલેન્ડર",
    create_task: "નવું કાર્ય બનાવો",
    all_tasks_count: "બધા કાર્યો",
    to_do_count: "કરવાના કાર્યો",
    in_progress_count: "ચાલુ કાર્યો",
    completed_count: "પૂર્ણ થયેલ",
    to_do: "કરવાનું બાકી",
    in_progress: "પ્રગતિમાં",
    pending_status: "બાકી",
    done_status: "પૂર્ણ",
    active_status: "સક્રિય",
    all_farms_option: "તમામ ખેતરો",
    search_tasks_placeholder: "કાર્ય, પાક અથવા કામદાર શોધો...",
    priority_urgent: "અતિ મહત્વનું",
    priority_high: "ઉચ્ચ",
    priority_medium: "મધ્યમ",
    priority_low: "સામાન્ય",
    overdue_by: "વિલંબિત",
    due_today: "આજે પૂર્ણ કરવાનું",

    my_farms_title: "મારા નોંધાયેલા ખેતરો",
    my_farms_subtitle: "વ્યક્તિગત ખેતરો વચ્ચે સ્વિચ કરો અથવા સંયુક્ત પોર્ટફોલિયો જુઓ.",
    all_farms_view_active: "તમામ ખેતરો દર્શન સક્રિય",
    switch_to_all_farms: "બધા ખેતરો જુઓ",
    add_new_farm: "+ નવું ખેતર ઉમેરો",

    crop_planning_title: "પાક આયોજન અને સમયરેખા",
    add_crop_to_farm: "+ નવો પાક ઉમેરો",

    crop_advisories_title: "પાક સલાહ અને બુલેટિન",
    category_all: "બધા",
    category_pest: "જીવાત અને રોગ",
    category_weather: "હવામાન",

    inventory_title: "ગોદામ અને સ્ટોક",
    add_store_btn: "+ સ્ટોર ઉમેરો",
    add_item_btn: "+ વસ્તુ ઉમેરો",

    equipment_title: "મશીનરી અને સાધનો",
    report_problem_btn: "ખામી નોંધાવો",
    register_equipment_btn: "+ મશીન ઉમેરો",

    financial_stats_title: "આંકડા અને હિસાબ",

    team_title: "કામદારો અને ટીમ સંચાલન",
    team_subtitle: "ખેતર કામદારો, હોદ્દા અને પરવાનગીઓ મેનેજ કરો.",
    members_subtab: "સભ્યો",
    roles_subtab: "હોદ્દા",
    add_member_btn: "+ નવો સભ્ય ઉમેરો",
    create_role_btn: "+ નવો હોદ્દો બનાવો",

    reports_title: "રિપોર્ટ્સ અને ઓડિટ",
    reports_subtitle: "સત્તાવાર ફાર્મ ઓડિટ સ્ટેટમેન્ટ, પાક ઉત્પાદન અને નાણાકીય સારાંશ.",
    download_pdf: "પ્રિન્ટ / PDF સાચવો",
    export_csv_btn: "CSV ડાઉનલોડ",

    subscription_title: "સબ્સ્ક્રિપ્શન અને પ્લાન",
    subscription_subtitle: "તમારું ફાર્મ લાઇસન્સ, વિસ્તાર ક્વોટા અને બિલિંગ સંભાળો.",
    annual_billing: "વાર્ષિક (૨૦% બચત)",
    monthly_billing: "માસિક",

    support_title: "ખેતી નિષ્ણાત હેલ્પલાઇન અને સપોર્ટ",
    support_subtitle: "સીધી કૃષિ સલાહ, પાક રોગ નિદાન અને સિસ્ટમ સહાય.",
    open_ticket_btn: "+ સપોર્ટ ટિકિટ ખોલો",

    settings_title: "ખેતર અને સિસ્ટમ સેટિંગ્સ",
    settings_subtitle: "તમારી ખેડૂત ઓળખ, જમીન માપણી એકમો અને ભાષા પસંદ કરો.",
    settings_reset: "રીસેટ",
    settings_save: "સેટિંગ્સ સાચવો",
    settings_sign_out: "લૉગ આઉટ",
    farmer_identity_title: "ખેડૂત ઓળખ અને પ્રોફાઇલ",
    farmer_identity_desc: "બજાર સ્લિપ અને બિલ માટે સત્તાવાર વિગતો",
    verified_farmer_id: "પ્રમાણિત ખેડૂત ID",
    farmer_name_label: "નોંધાયેલ ખેડૂતનું પૂરું નામ",
    farmer_phone_label: "મુખ્ય મોબાઇલ નંબર (OTP અને SMS)",
    farmer_email_label: "સત્તાવાર ઈમેલ સરનામું",
    primary_mandi_label: "મુખ્ય APMC માર્કેટ યાર્ડ",
    farm_address_label: "ખેતરનું મુખ્ય સરનામું",
    regional_units_title: "પ્રાદેશિક એકમો અને ભાષા પસંદગી",
    regional_units_desc: "પાક રેકોર્ડ, નકશા અને રિપોર્ટ્સમાં વપરાતા માપદંડો",
    default_unit_label: "જમીન માપવાનો ડિફોલ્ટ એકમ",
    interface_language: "સિસ્ટમ ભાષા",
    currency_standard_label: "ચલણ અને નાણાકીય ધોરણ",
    date_format_label: "તારીખ ફોર્મેટ",
    danger_zone_title: "ખાતા સુરક્ષા અને ડેન્જર ઝોન",
    danger_zone_desc: "તમારું એકાઉન્ટ, ખેતર, પાક ચક્ર અને નાણાકીય રેકોર્ડ કાયમ માટે કાઢી નાખો",
    delete_account_btn: "એકાઉન્ટ અને તમામ ડેટા કાયમ માટે કાઢી નાખો",

    save_changes: "સેટિંગ્સ સાચવો",
    cancel: "રદ કરો",
    edit: "ફેરફાર કરો",
    delete: "કાઢી નાખો",
    search_placeholder: "શોધો (રેકોર્ડ, પાક અથવા વસ્તુ)...",
    filter: "ફિલ્ટર",
    status: "સ્થિતિ",
    active: "સક્રિય",
    completed: "પૂર્ણ",
    pending: "બાકી",
    today: "આજે",
    print: "પ્રિન્ટ / PDF સાચવો",
    export_csv: "CSV ડાઉનલોડ",
    language_updated_toast: "ભાષા સફળતાપૂર્વક બદલાઈ ગઈ છે.",
  },
};
