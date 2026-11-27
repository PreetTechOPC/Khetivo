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

  // Overview Stats
  total_cultivated_area: string;
  active_crop_varieties: string;
  monthly_inflow: string;
  operating_expenses: string;
  net_realization: string;
  crop_losses: string;

  // Weather & Advisories
  hyperlocal_weather: string;
  safe_to_spray: string;
  spray_window: string;
  optimal_window: string;
  risk_warning: string;
  humidity: string;
  wind_velocity: string;
  precipitation_chance: string;

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
  interface_language: string;
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
    record_entry: "Record Transaction",
    assign_task: "Assign Field Task",
    log_equipment: "Log Equipment Usage",
    request_visit: "Request Agronomist Visit",

    total_cultivated_area: "Total Cultivated Area",
    active_crop_varieties: "Active Crops & Batches",
    monthly_inflow: "Monthly Production Inflow",
    operating_expenses: "Total Operating Expenses",
    net_realization: "Net Farm Realization",
    crop_losses: "Damage & Losses",

    hyperlocal_weather: "Hyper-Local Farm Weather",
    safe_to_spray: "Safe to Spray",
    spray_window: "Foliar Spray Window",
    optimal_window: "Optimal Window • Safe to Spray",
    risk_warning: "Unfavorable Spray Conditions",
    humidity: "Relative Humidity",
    wind_velocity: "Wind Velocity",
    precipitation_chance: "Precipitation Probability",

    save_changes: "Save Settings & Preferences",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    search_placeholder: "Search records, crops, or items...",
    filter: "Filter",
    status: "Status",
    active: "Active",
    completed: "Completed",
    pending: "Pending",
    today: "Today",
    print: "Print / Save PDF",
    export_csv: "Export CSV",
    interface_language: "Interface Language",
    language_updated_toast: "Interface language updated successfully.",
  },

  pa: {
    nav_daily: "ਰੋਜ਼ਾਨਾ ਕੰਮ",
    nav_records: "ਖੇਤੀ ਰਿਕਾਰਡ",
    nav_manage: "ਪ੍ਰਬੰਧਨ",

    nav_dashboard: "ਡੈਸ਼ਬੋਰਡ",
    nav_dashboard_desc: "ਖੇਤ ਦਾ ਸਾਰ ਅਤੇ ਚੇਤਾਵਨੀਆਂ",
    nav_advisories: "ਸਲਾਹਾਂ ਅਤੇ ਚੇਤਾਵਨੀਆਂ",
    nav_advisories_desc: "ਫ਼ਸਲ ਰੋਗ ਅਤੇ ਮੌਸਮ ਚੇਤਾਵਨੀਆਂ",
    nav_weather: "ਮੌਸਮ ਜਾਣਕਾਰੀ",
    nav_weather_desc: "ਸਪਰੇਅ ਲਈ ਸਹੀ ਮੌਸਮ ਸਲਾਹ",
    nav_tasks: "ਖੇਤ ਦੇ ਕੰਮ",
    nav_tasks_desc: "ਕੰਮ ਕੈਲੰਡਰ ਅਤੇ ਸੂਚੀ",
    nav_inventory: "ਸਟਾਕ ਅਤੇ ਗੋਦਾਮ",
    nav_inventory_desc: "ਬੀਜ, ਖਾਦਾਂ ਅਤੇ ਦਵਾਈਆਂ",
    nav_equipment: "ਮਸ਼ੀਨਰੀ ਅਤੇ ਸੰਦ",
    nav_equipment_desc: "ਟਰੈਕਟਰ ਅਤੇ ਸਰਵਿਸ ਰਿਕਾਰਡ",
    nav_crops: "ਫ਼ਸਲ ਪ੍ਰਬੰਧਨ",
    nav_crops_desc: "ਫ਼ਸਲ ਚੱਕਰ ਅਤੇ ਕਿਸਮਾਂ",
    nav_stats: "ਖਰਚ ਅਤੇ ਮੁਨਾਫ਼ਾ",
    nav_stats_desc: "ਆਮਦਨ, ਨੁਕਸਾਨ ਅਤੇ ਖਰਚੇ",
    nav_reports: "ਰਿਪੋਰਟਾਂ",
    nav_reports_desc: "ਖੇਤ ਆਡਿਟ ਰਿਪੋਰਟਾਂ ਅਤੇ PDF",
    nav_my_farms: "ਮੇਰੇ ਖੇਤ",
    nav_my_farms_desc: "ਸਾਰੇ ਰਜਿਸਟਰਡ ਖੇਤ ਅਤੇ ਜ਼ਮੀਨਾਂ",
    nav_team: "ਕਾਮੇ ਅਤੇ ਟੀਮ",
    nav_team_desc: "ਮਜ਼ਦੂਰ ਅਤੇ ਸੁਪਰਵਾਈਜ਼ਰ",
    nav_subscription: "ਸਬਸਕ੍ਰਿਪਸ਼ਨ ਪਲਾਨ",
    nav_subscription_desc: "ਐਕਟਿਵ ਪਲਾਨ ਅਤੇ ਬਿਲਿੰਗ",
    nav_support: "ਸਹਾਇਤਾ",
    nav_support_desc: "24/7 ਖੇਤੀ ਮਾਹਿਰ ਅਤੇ ਹੈਲਪਲਾਈਨ",
    nav_settings: "ਸੈਟਿੰਗਾਂ",
    nav_settings_desc: "ਕਿਸਾਨ ਪ੍ਰੋਫਾਈਲ ਅਤੇ ਪਸੰਦਾਂ",

    select_farm_view: "ਖੇਤ ਚੁਣੋ",
    all_farms_consolidated: "ਸਾਰੇ ਖੇਤ (ਕੁੱਲ ਜ਼ਮੀਨ)",
    holdings_total: "ਕੁੱਲ ਰਕਬਾ",
    add_another_farm: "+ ਹੋਰ ਖੇਤ ਜੋੜੋ",
    holding: "ਖੇਤ",
    location: "ਸਥਾਨ",
    area: "ਰਕਬਾ",

    quick_actions: "ਤੇਜ਼ ਕਾਰਵਾਈਆਂ",
    add_crop: "ਨਵੀਂ ਫ਼ਸਲ ਜੋੜੋ",
    record_entry: "ਖਰਚਾ/ਆਮਦਨ ਦਰਜ ਕਰੋ",
    assign_task: "ਕੰਮ ਸੌਂਪੋ",
    log_equipment: "ਮਸ਼ੀਨਰੀ ਵਰਤੋਂ ਦਰਜ ਕਰੋ",
    request_visit: "ਮਾਹਿਰ ਦਾ ਦੌਰਾ ਬੁੱਕ ਕਰੋ",

    total_cultivated_area: "ਕੁੱਲ ਬੀਜਿਆ ਰਕਬਾ",
    active_crop_varieties: "ਚੱਲ ਰਹੀਆਂ ਫ਼ਸਲਾਂ",
    monthly_inflow: "ਮਹੀਨੇ ਦੀ ਆਮਦਨ",
    operating_expenses: "ਕੁੱਲ ਖਰਚੇ",
    net_realization: "ਸ਼ੁੱਧ ਬਚਤ",
    crop_losses: "ਫ਼ਸਲ ਨੁਕਸਾਨ",

    hyperlocal_weather: "ਖੇਤ ਦਾ ਤਾਜ਼ਾ ਮੌਸਮ",
    safe_to_spray: "ਸਪਰੇਅ ਲਈ ਅਨੁਕੂਲ",
    spray_window: "ਸਪਰੇਅ ਸਮਾਂ",
    optimal_window: "ਸਹੀ ਸਮਾਂ • ਸਪਰੇਅ ਸੁਰੱਖਿਅਤ ਹੈ",
    risk_warning: "ਸਪਰੇਅ ਲਈ ਮੌਸਮ ਠੀਕ ਨਹੀਂ",
    humidity: "ਨਮੀ (ਹਿਊਮਿਡਿਟੀ)",
    wind_velocity: "ਹਵਾ ਦੀ ਰਫ਼ਤਾਰ",
    precipitation_chance: "ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ",

    save_changes: "ਸੈਟਿੰਗਾਂ ਸੇਵ ਕਰੋ",
    cancel: "ਰੱਦ ਕਰੋ",
    edit: "ਬਦਲੋ",
    delete: "ਮਿਟਾਓ",
    search_placeholder: "ਖੋਜੋ (ਰਿਕਾਰਡ, ਫ਼ਸਲ ਜਾਂ ਵਸਤੂ)...",
    filter: "ਫਿਲਟਰ",
    status: "ਸਥਿਤੀ",
    active: "ਚਾਲੂ",
    completed: "ਪੂਰਾ ਹੋਇਆ",
    pending: "ਬਕਾਇਆ",
    today: "ਅੱਜ",
    print: "ਪ੍ਰਿੰਟ / PDF ਸੇਵ ਕਰੋ",
    export_csv: "CSV ਡਾਊਨਲੋਡ ਕਰੋ",
    interface_language: "ਸਿਸਟਮ ਭਾਸ਼ਾ",
    language_updated_toast: "ਭਾਸ਼ਾ ਸਫ਼ਲਤਾਪੂਰਵਕ ਬਦਲੀ ਗਈ ਹੈ।",
  },

  hi: {
    nav_daily: "दैनिक कार्य",
    nav_records: "कृषि रिकॉर्ड",
    nav_manage: "प्रबंधन",

    nav_dashboard: "डैशबोर्ड",
    nav_dashboard_desc: "खेत का सारांश एवं सटीक अलर्ट",
    nav_advisories: "सलाह एवं चेतावनियाँ",
    nav_advisories_desc: "फसल कीट प्रकोप एवं मौसम चेतावनी",
    nav_weather: "मौसम पूर्वानुमान",
    nav_weather_desc: "जीपीएस मौसम एवं छिड़काव सलाह",
    nav_tasks: "खेत के कार्य",
    nav_tasks_desc: "कार्य कैलेंडर और सूची",
    nav_inventory: "गोदाम एवं भंडार",
    nav_inventory_desc: "बीज, उर्वरक, कीटनाशक एवं डीजल",
    nav_equipment: "उपकरण एवं मशीनरी",
    nav_equipment_desc: "ट्रैक्टर, सर्विस व मेंटेनेंस रिकॉर्ड",
    nav_crops: "फसल प्रबंधन",
    nav_crops_desc: "फसल चक्र, समय-सीमा एवं किस्में",
    nav_stats: "खर्च एवं आय",
    nav_stats_desc: "उत्पादन बिक्री, नुकसान व कृषि खर्च",
    nav_reports: "रिपोर्ट्स एवं ऑडिट",
    nav_reports_desc: "फार्म ऑडिट रिपोर्ट एवं पीडीएफ डाउनलोड",
    nav_my_farms: "मेरे खेत",
    nav_my_farms_desc: "सभी पंजीकृत खेत और स्थान",
    nav_team: "कार्यबल एवं टीम",
    nav_team_desc: "मजदूर, ऑपरेटर एवं पर्यवेक्षक प्रबंधन",
    nav_subscription: "सब्सक्रिप्शन प्लान",
    nav_subscription_desc: "सक्रिय प्लान, बिलिंग व सुविधाएं",
    nav_support: "विशेषज्ञ सहायता",
    nav_support_desc: "24/7 कृषि वैज्ञानिक हेल्पलाइन",
    nav_settings: "सेटिंग्स",
    nav_settings_desc: "किसान प्रोफाइल एवं खेत प्राथमिकताएं",

    select_farm_view: "खेत चुनें",
    all_farms_consolidated: "सभी खेत (समेकित)",
    holdings_total: "कुल रकबा",
    add_another_farm: "+ नया खेत जोड़ें",
    holding: "खेत",
    location: "स्थान",
    area: "क्षेत्रफल",

    quick_actions: "त्वरित कार्य",
    add_crop: "नई फसल जोड़ें",
    record_entry: "लेनदेन दर्ज करें",
    assign_task: "कार्य सौंपें",
    log_equipment: "मशीनरी उपयोग दर्ज करें",
    request_visit: "विशेषज्ञ विजिट बुक करें",

    total_cultivated_area: "कुल खेती योग्य रकबा",
    active_crop_varieties: "सक्रिय फसलें व किस्में",
    monthly_inflow: "मासिक उत्पादन आय",
    operating_expenses: "कुल परिचालन खर्च",
    net_realization: "शुद्ध कृषि मुनाफा",
    crop_losses: "नुकसान एवं क्षति",

    hyperlocal_weather: "सटीक खेत मौसम",
    safe_to_spray: "छिड़काव के लिए अनुकूल",
    spray_window: "छिड़काव विंडो",
    optimal_window: "सर्वोत्तम समय • सुरक्षित छिड़काव",
    risk_warning: "प्रतिकूल मौसम • छिड़काव टालें",
    humidity: "हवा में नमी (आर्द्रता)",
    wind_velocity: "हवा की गति",
    precipitation_chance: "बारिश की संभावना",

    save_changes: "सेटिंग्स सुरक्षित करें",
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
    interface_language: "इंटरफेस भाषा",
    language_updated_toast: "भाषा सफलतापूर्वक बदल दी गई है।",
  },

  mr: {
    nav_daily: "दैनंदिन कामकाज",
    nav_records: "शेती नोंदी",
    nav_manage: "व्यवस्थापन",

    nav_dashboard: "डॅशबोर्ड",
    nav_dashboard_desc: "शेताचा सारांश आणि सूचना",
    nav_advisories: "सल्ला व सूचना",
    nav_advisories_desc: "पीक रोग व हवामान इशारे",
    nav_weather: "हवामान अंदाज",
    nav_weather_desc: "फवारणीसाठी अनुकूल हवामान",
    nav_tasks: "कामांचे नियोजन",
    nav_tasks_desc: "दैनंदिन कामे व कॅलेंडर",
    nav_inventory: "साठा व गोदाम",
    nav_inventory_desc: "बियाणे, खते, औषधे व डिझेल",
    nav_equipment: "यंत्रसामग्री व अवजारे",
    nav_equipment_desc: "ट्रॅक्टर व देखभाल नोंदी",
    nav_crops: "पीक व्यवस्थापन",
    nav_crops_desc: "पीक चक्र व वाण",
    nav_stats: "हिशोब व नफा-तोटा",
    nav_stats_desc: "उत्पादन, नुकसान आणि खर्च",
    nav_reports: "अहवाल व ऑडिट",
    nav_reports_desc: "शेती ऑडिट अहवाल व PDF",
    nav_my_farms: "माझी शेते",
    nav_my_farms_desc: "सर्व नोंदणीकृत शेतजमीन",
    nav_team: "मजूर व कामगार",
    nav_team_desc: "कर्मचारी व कामगार व्यवस्थापन",
    nav_subscription: "सदस्यत्व योजना",
    nav_subscription_desc: "प्लॅन तपशील व बिलिंग",
    nav_support: "तज्ज्ञ मार्गदर्शन",
    nav_support_desc: "२४/७ कृषी सल्लागार हेल्पलाइन",
    nav_settings: "सेटिंग्ज",
    nav_settings_desc: "शेतकरी प्रोफाइल व प्राधान्ये",

    select_farm_view: "शेत निवडा",
    all_farms_consolidated: "सर्व शेते (एकत्रित)",
    holdings_total: "एकूण क्षेत्र",
    add_another_farm: "+ नवीन शेत जोडा",
    holding: "शेत",
    location: "ठिकाण",
    area: "क्षेत्रफळ",

    quick_actions: "जलद कृती",
    add_crop: "नवीन पीक जोडा",
    record_entry: "खर्च/उत्पन्न नोंदवा",
    assign_task: "काम सोपवा",
    log_equipment: "यंत्र वापर नोंदवा",
    request_visit: "कृषी तज्ज्ञांची भेट बुक करा",

    total_cultivated_area: "एकूण लागवड क्षेत्र",
    active_crop_varieties: "सध्याची पिके",
    monthly_inflow: "मासिक उत्पादन उत्पन्न",
    operating_expenses: "एकूण चालू खर्च",
    net_realization: "निव्वळ शेती नफा",
    crop_losses: "पिकांचे नुकसान",

    hyperlocal_weather: "स्थानिक हवामान",
    safe_to_spray: "फवारणीस अनुकूल",
    spray_window: "फवारणी वेळ",
    optimal_window: "उत्तम वेळ • फवारणी सुरक्षित",
    risk_warning: "प्रतिकूल हवामान",
    humidity: "हवेतील दमटपणा",
    wind_velocity: "वाऱ्याचा वेग",
    precipitation_chance: "पावसाची शक्यता",

    save_changes: "बदल जतन करा",
    cancel: "रद्द करा",
    edit: "बदला",
    delete: "हटवा",
    search_placeholder: "शोधा (नोंदी, पीक किंवा साहित्य)...",
    filter: "फिल्टर",
    status: "स्थिती",
    active: "सक्रिय",
    completed: "पूर्ण",
    pending: "प्रलंबित",
    today: "आज",
    print: "प्रिंट / PDF जतन करा",
    export_csv: "CSV डाउनलोड",
    interface_language: "भाषा निवडा",
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
    record_entry: "ખર્ચ/આવક નોંધો",
    assign_task: "કામ સોંપો",
    log_equipment: "મશીનરી ઉપયોગ નોંધો",
    request_visit: "નિષ્ણાત મુલાકાત બુક કરો",

    total_cultivated_area: "કુલ વાવેતર વિસ્તાર",
    active_crop_varieties: "ચાલુ પાકો",
    monthly_inflow: "માસિક ઉત્પાદન આવક",
    operating_expenses: "કુલ ખર્ચ",
    net_realization: "ચોખ્ખો નફો",
    crop_losses: "પાક નુકસાન",

    hyperlocal_weather: "ખેતરનું તાજું હવામાન",
    safe_to_spray: "છંટકાવ માટે અનુકૂળ",
    spray_window: "છંટકાવ સમય",
    optimal_window: "શ્રેષ્ઠ સમય • સલામત છંટકાવ",
    risk_warning: "પ્રતિકૂળ હવામાન • છંટકાવ ટાળો",
    humidity: "ભેજનું પ્રમાણ",
    wind_velocity: "પવનની ગતિ",
    precipitation_chance: "વરસાદની શક્યતા",

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
    interface_language: "સિસ્ટમ ભાષા",
    language_updated_toast: "ભાષા સફળતાપૂર્વક બદલાઈ ગઈ છે.",
  },
};
