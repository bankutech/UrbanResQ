// UrbanResQ Tactical EOC — Simulated Offline Telemetry Dataset
// Used for Vercel preview environments, air-gapped demo stations, and offline training drills.

export interface MockUser {
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
}

export function getMockUserByEmail(email: string): MockUser {
  const normalized = (email || '').toLowerCase().trim();
  if (normalized.includes('admin')) {
    return {
      userId: 'usr-admin-001',
      email: 'admin@urbanresq.city',
      fullName: 'Chief Systems Administrator',
      roles: ['ADMIN'],
    };
  }
  if (normalized.includes('manager')) {
    return {
      userId: 'usr-manager-002',
      email: 'manager@urbanresq.city',
      fullName: 'EOC Operations Incident Commander',
      roles: ['EMERGENCY_MANAGER', 'ADMIN'],
    };
  }
  if (normalized.includes('resources') || normalized.includes('logistics')) {
    return {
      userId: 'usr-logistics-003',
      email: 'resources@urbanresq.city',
      fullName: 'Depot Logistics & Supply Chief',
      roles: ['RESOURCE_MANAGER'],
    };
  }
  if (normalized.includes('medical')) {
    return {
      userId: 'usr-medical-004',
      email: 'medical@urbanresq.city',
      fullName: 'Chief Medical & ICU Triage Director',
      roles: ['MEDICAL_COORDINATOR'],
    };
  }
  if (normalized.includes('rescue')) {
    return {
      userId: 'usr-rescue-005',
      email: 'rescue@urbanresq.city',
      fullName: 'Field Rescue & SAR Taskforce Lead',
      roles: ['RESCUE_COORDINATOR'],
    };
  }
  if (normalized.includes('officer')) {
    return {
      userId: 'usr-officer-006',
      email: 'officer@urbanresq.city',
      fullName: 'Field Assessment Officer',
      roles: ['DISASTER_OFFICER'],
    };
  }
  // Default fallback for any email
  return {
    userId: 'usr-operator-007',
    email: email || 'manager@urbanresq.city',
    fullName: 'Tactical EOC Controller',
    roles: ['ADMIN', 'EMERGENCY_MANAGER', 'RESOURCE_MANAGER', 'MEDICAL_COORDINATOR', 'RESCUE_COORDINATOR'],
  };
}

export const MOCK_DISASTERS = [
  {
    disaster_id: 'DIS-2026-001',
    title: 'Cyclone Mandous Coastal Surge & Flash Flood',
    disaster_name: 'Cyclone Mandous Coastal Surge & Flash Flood',
    disaster_type_name: 'Coastal Flooding & Storm Surge',
    severity: 'CRITICAL',
    status: 'ACTIVE',
    affected_population: 48500,
    primary_zone: 'Zone 4 — Marina & Adyar Estuary',
    latitude: 13.0418,
    longitude: 80.2507,
    unresolved_requests: 18,
    declared_at: '2026-11-15T02:15:00Z',
    radius_km: 5.2,
    description: 'Severe gale winds and seawall breach causing inundation of arterial coastal sectors. Multiple communities isolated.',
  },
  {
    disaster_id: 'DIS-2026-002',
    title: 'Chemical Warehouse HAZMAT Spill',
    disaster_name: 'Chemical Warehouse HAZMAT Spill',
    disaster_type_name: 'Industrial HAZMAT Spill',
    severity: 'HIGH',
    status: 'ACTIVE',
    affected_population: 14200,
    primary_zone: 'Zone 7 — North Industrial Corridor',
    latitude: 13.0920,
    longitude: 80.2810,
    unresolved_requests: 7,
    declared_at: '2026-11-15T04:40:00Z',
    radius_km: 2.8,
    description: 'Vapor plume release detected following structural collapse in storage warehouse. Containment perimeter active.',
  },
  {
    disaster_id: 'DIS-2026-003',
    title: 'Metro Rail Sub-surface Water Ingress',
    disaster_name: 'Metro Rail Sub-surface Water Ingress',
    disaster_type_name: 'Infrastructure Failure',
    severity: 'MODERATE',
    status: 'CONTAINED',
    affected_population: 6800,
    primary_zone: 'Zone 2 — Central Transit Interchange',
    latitude: 13.0827,
    longitude: 80.2707,
    unresolved_requests: 3,
    declared_at: '2026-11-15T01:10:00Z',
    radius_km: 1.4,
    description: 'Storm water conduit overflow into underground concourse. Dewatering pumps deployed.',
  },
];

export const MOCK_REQUESTS = [
  {
    request_id: 'REQ-4011',
    disaster_id: 'DIS-2026-001',
    urgency: 'CRITICAL',
    status: 'PENDING',
    description: 'Immediate aerial medical airlift & pediatric IV fluids required at isolated rooftop settlement.',
    live_priority_score: 98.4,
    zone_name: 'Adyar Estuary Block 3',
    location_label: 'Adyar Estuary Block 3',
    latitude: 13.0395,
    longitude: 80.2540,
    requested_by: 'SAR Squad Charlie Lead',
    resource_type_name: 'Pediatric Emergency Medkits',
    quantity_requested: 40,
    created_at: '2026-11-15T06:45:00Z',
  },
  {
    request_id: 'REQ-4012',
    disaster_id: 'DIS-2026-001',
    urgency: 'CRITICAL',
    status: 'PENDING',
    description: '1,200 Liters potable drinking water and water purification tablets for 350 stranded evacuees.',
    live_priority_score: 93.1,
    zone_name: 'Santhome High School Relief Point',
    location_label: 'Santhome High School Relief Point',
    latitude: 13.0320,
    longitude: 80.2760,
    requested_by: 'Community Evacuation Warden',
    resource_type_name: 'Potable Drinking Water (20L Jerrycans)',
    quantity_requested: 60,
    created_at: '2026-11-15T07:05:00Z',
  },
  {
    request_id: 'REQ-4013',
    disaster_id: 'DIS-2026-002',
    urgency: 'HIGH',
    status: 'PENDING',
    description: 'Class-B chemical fire suppressant foam and positive-pressure SCBA breathing units.',
    live_priority_score: 87.6,
    zone_name: 'North Port Logistics Yard 4',
    location_label: 'North Port Logistics Yard 4',
    latitude: 13.0950,
    longitude: 80.2840,
    requested_by: 'Fire Incident Commander',
    resource_type_name: 'Chemical Fire Foam 200L',
    quantity_requested: 12,
    created_at: '2026-11-15T07:22:00Z',
  },
  {
    request_id: 'REQ-4014',
    disaster_id: 'DIS-2026-001',
    urgency: 'HIGH',
    status: 'PENDING',
    description: 'Heavy dewatering high-volume submersible pumps & industrial diesel generators.',
    live_priority_score: 82.0,
    zone_name: 'Marina Underpass Junction',
    location_label: 'Marina Underpass Junction',
    latitude: 13.0510,
    longitude: 80.2820,
    requested_by: 'Civic Works Inspector',
    resource_type_name: 'Submersible Trash Pumps',
    quantity_requested: 8,
    created_at: '2026-11-15T07:35:00Z',
  },
  {
    request_id: 'REQ-4015',
    disaster_id: 'DIS-2026-003',
    urgency: 'MODERATE',
    status: 'PENDING',
    description: 'Thermal blankets, dry emergency rations kits, and battery-powered portable floodlights.',
    live_priority_score: 74.3,
    zone_name: 'Central Transit Concourse B',
    location_label: 'Central Transit Concourse B',
    latitude: 13.0820,
    longitude: 80.2710,
    requested_by: 'Metro Safety Marshal',
    resource_type_name: 'MRE Ready-to-Eat Ration Packs',
    quantity_requested: 300,
    created_at: '2026-11-15T07:50:00Z',
  },
];

export const MOCK_HOSPITALS = [
  {
    hospital_id: 'HOSP-01',
    name: 'Government General Tertiary Trauma Center',
    total_beds: 450,
    available_beds: 68,
    total_icu_beds: 60,
    available_icu_beds: 9,
    occupancy_pct: 84.9,
    latitude: 13.0810,
    longitude: 80.2760,
    status: 'OPERATIONAL',
    tier: 'Tier 1 Trauma',
    contact_phone: '+91 44 2530 5000',
  },
  {
    hospital_id: 'HOSP-02',
    name: 'Apollo Disaster Response Specialty Care',
    total_beds: 320,
    available_beds: 42,
    total_icu_beds: 45,
    available_icu_beds: 7,
    occupancy_pct: 86.8,
    latitude: 13.0600,
    longitude: 80.2500,
    status: 'OPERATIONAL',
    tier: 'Tier 1 Trauma',
    contact_phone: '+91 44 2829 0200',
  },
  {
    hospital_id: 'HOSP-03',
    name: 'South Coast Emergency Medical Station',
    total_beds: 180,
    available_beds: 24,
    total_icu_beds: 20,
    available_icu_beds: 3,
    occupancy_pct: 86.7,
    latitude: 13.0180,
    longitude: 80.2610,
    status: 'SURGE_WARNING',
    tier: 'Tier 2 Acute',
    contact_phone: '+91 44 2491 1122',
  },
];

export const MOCK_SHELTERS = [
  {
    shelter_id: 'SHL-01',
    name: 'Nehru Indoor Stadium Mega Evacuation Shelter',
    capacity: 2500,
    occupancy: 1780,
    available_capacity: 720,
    occupancy_pct: 71.2,
    latitude: 13.0850,
    longitude: 80.2740,
    status: 'ACCEPTING_RESIDENTS',
    medical_station: true,
    food_supply_status: 'ADEQUATE',
  },
  {
    shelter_id: 'SHL-02',
    name: 'Santhome Civic Center Relief Point',
    capacity: 900,
    occupancy: 780,
    available_capacity: 120,
    occupancy_pct: 86.7,
    latitude: 13.0330,
    longitude: 80.2770,
    status: 'APPROACHING_CAPACITY',
    medical_station: true,
    food_supply_status: 'NEEDS_RESTOCK',
  },
  {
    shelter_id: 'SHL-03',
    name: 'Adyar Community Hall & Emergency Base',
    capacity: 650,
    occupancy: 410,
    available_capacity: 240,
    occupancy_pct: 63.1,
    latitude: 13.0070,
    longitude: 80.2580,
    status: 'ACCEPTING_RESIDENTS',
    medical_station: false,
    food_supply_status: 'ADEQUATE',
  },
];

export const MOCK_RESCUE_TEAMS = [
  {
    team_id: 'TEAM-01',
    team_name: 'NDRF Battalion 4 Swift Water Squad Alpha',
    specialization: 'Swift Water & Inundation Rescue',
    member_count: 24,
    availability: 'DEPLOYED',
    current_mission: 'Adyar Estuary Rooftop Evacuations',
    latitude: 13.0400,
    longitude: 80.2520,
    lead_officer: 'Cmdr. R. Veerappan',
  },
  {
    team_id: 'TEAM-02',
    team_name: 'HAZMAT Containment Taskforce Echo',
    specialization: 'Industrial Toxic Gas & Chemical Neutralization',
    member_count: 16,
    availability: 'DEPLOYED',
    current_mission: 'North Port Warehouse Perimeter Vapors',
    latitude: 13.0930,
    longitude: 80.2820,
    lead_officer: 'Capt. A. Sundaram',
  },
  {
    team_id: 'TEAM-03',
    team_name: 'Urban Technical Search & Canine Unit Delta',
    specialization: 'Structural Collapse & Heavy Rescue',
    member_count: 18,
    availability: 'STANDBY',
    current_mission: 'Staged at Central Fire Headquarters',
    latitude: 13.0780,
    longitude: 80.2640,
    lead_officer: 'Lt. K. Rajesh',
  },
  {
    team_id: 'TEAM-04',
    team_name: 'Air Ambulance Heli-Rescue Flight 1',
    specialization: 'Tactical Aeromedical Evacuation',
    member_count: 8,
    availability: 'AIRBORNE',
    current_mission: 'En route to Sector 4 Trauma Extraction',
    latitude: 13.0490,
    longitude: 80.2600,
    lead_officer: 'Flight Surgeon Dr. M. Iyer',
  },
];

export const MOCK_RESOURCES = [
  {
    resource_type_id: 1,
    resource_type_name: 'Potable Drinking Water (20L Jerrycan)',
    category_name: 'Water & Hydration',
    total_quantity: 6500,
    available_quantity: 4120,
    unit_of_measure: 'jerrycans',
  },
  {
    resource_type_id: 2,
    resource_type_name: 'Ready-to-Eat Emergency Ration Packs (MRE)',
    category_name: 'Food & Nutrition',
    total_quantity: 12000,
    available_quantity: 8450,
    unit_of_measure: 'packs',
  },
  {
    resource_type_id: 3,
    resource_type_name: 'Tactical Emergency Trauma Medkits',
    category_name: 'Medical Supplies',
    total_quantity: 850,
    available_quantity: 490,
    unit_of_measure: 'kits',
  },
  {
    resource_type_id: 4,
    resource_type_name: 'Submersible Electric Dewatering Pumps',
    category_name: 'Heavy Equipment',
    total_quantity: 64,
    available_quantity: 26,
    unit_of_measure: 'units',
  },
  {
    resource_type_id: 5,
    resource_type_name: 'Motorized Inflatable Rescue Boats (Zodiac)',
    category_name: 'Marine Rescue',
    total_quantity: 36,
    available_quantity: 14,
    unit_of_measure: 'boats',
  },
  {
    resource_type_id: 6,
    resource_type_name: 'All-Weather Disaster Family Relief Tents',
    category_name: 'Shelter Equipment',
    total_quantity: 920,
    available_quantity: 610,
    unit_of_measure: 'tents',
  },
];

export const MOCK_INVENTORY = [
  {
    inventory_id: 'INV-101',
    batch_number: 'BATCH-2026-W01',
    resource_type_id: 1,
    resource_name: 'Potable Drinking Water (20L Jerrycan)',
    category_name: 'Water & Hydration',
    depot_name: 'Central EOC Logistics Depot',
    depot_code: 'DEPOT-CENTRAL',
    quantity: 1850,
    received_date: '2026-10-12',
    expiry_date: '2027-10-12',
    status: 'ACTIVE_FIFO_FIRST',
    shelf_life_days: 331,
  },
  {
    inventory_id: 'INV-102',
    batch_number: 'BATCH-2026-W02',
    resource_type_id: 1,
    resource_name: 'Potable Drinking Water (20L Jerrycan)',
    category_name: 'Water & Hydration',
    depot_name: 'South Port Warehouse Bravo',
    depot_code: 'DEPOT-SOUTH',
    quantity: 2270,
    received_date: '2026-11-01',
    expiry_date: '2027-11-01',
    status: 'QUEUED_FIFO',
    shelf_life_days: 351,
  },
  {
    inventory_id: 'INV-201',
    batch_number: 'BATCH-2026-MED-09',
    resource_type_id: 3,
    resource_name: 'Tactical Emergency Trauma Medkits',
    category_name: 'Medical Supplies',
    depot_name: 'North Airfield Medical Reserve',
    depot_code: 'DEPOT-NORTH',
    quantity: 490,
    received_date: '2026-09-15',
    expiry_date: '2028-09-15',
    status: 'ACTIVE_FIFO_FIRST',
    shelf_life_days: 669,
  },
];

export const MOCK_ALLOCATIONS = [
  {
    allocation_id: 'ALLOC-8801',
    request_id: 'REQ-4011',
    batch_number: 'BATCH-2026-MED-09',
    resource_name: 'Tactical Emergency Trauma Medkits',
    quantity_allocated: 40,
    depot_name: 'North Airfield Medical Reserve',
    status: 'COMMITTED_IN_TRANSIT',
    fifo_priority_score: 98.4,
    allocated_at: '2026-11-15T06:55:00Z',
    courier_callsign: 'Air Ambulance Flight 1',
  },
  {
    allocation_id: 'ALLOC-8802',
    request_id: 'REQ-4012',
    batch_number: 'BATCH-2026-W01',
    resource_name: 'Potable Drinking Water (20L Jerrycan)',
    quantity_allocated: 60,
    depot_name: 'Central EOC Logistics Depot',
    status: 'DISPATCHED',
    fifo_priority_score: 93.1,
    allocated_at: '2026-11-15T07:15:00Z',
    courier_callsign: 'NDRF Logistics Convoy 3',
  },
];

export const MOCK_VEHICLES = [
  {
    vehicle_id: 'VEH-01',
    callsign: 'Ambulance Unit Delta-1',
    vehicle_type: 'Advanced Life Support Ambulance',
    status: 'DISPATCHED',
    current_driver: 'Opr. S. Murugan',
    battery_or_fuel_pct: 92,
    latitude: 13.0450,
    longitude: 80.2510,
  },
  {
    vehicle_id: 'VEH-02',
    callsign: 'Rescue Craft Zodiac-4',
    vehicle_type: 'Inflatable Flood Rescue Boat',
    status: 'ON_MISSION',
    current_driver: 'Sgt. M. Paul',
    battery_or_fuel_pct: 88,
    latitude: 13.0390,
    longitude: 80.2530,
  },
  {
    vehicle_id: 'VEH-03',
    callsign: 'Logistics Hauler Atlas-8',
    vehicle_type: 'Heavy 4x4 High-Clearance Truck',
    status: 'AVAILABLE_DEPOT',
    current_driver: 'Opr. P. Krishnan',
    battery_or_fuel_pct: 98,
    latitude: 13.0760,
    longitude: 80.2600,
  },
];

export const MOCK_VOLUNTEERS = [
  {
    volunteer_id: 'VOL-01',
    full_name: 'Ananya Sharma',
    phone: '+91 98401 23456',
    skills: 'Paramedic EMT-B, Wilderness First Aid',
    assigned_shelter: 'Santhome Civic Center Relief Point',
    status: 'ON_DUTY',
    checkin_time: '2026-11-15T05:30:00Z',
  },
  {
    volunteer_id: 'VOL-02',
    full_name: 'Vikramaditya Rao',
    phone: '+91 98402 34567',
    skills: 'Boat Handling, Civil Defense Ham Radio',
    assigned_shelter: 'Adyar Community Hall & Emergency Base',
    status: 'ON_DUTY',
    checkin_time: '2026-11-15T06:00:00Z',
  },
  {
    volunteer_id: 'VOL-03',
    full_name: 'Meenakshi Sundaresan',
    phone: '+91 98403 45678',
    skills: 'Community Logistics, Food Distribution, Triage Desk',
    assigned_shelter: 'Nehru Indoor Stadium Mega Evacuation Shelter',
    status: 'ON_DUTY',
    checkin_time: '2026-11-15T05:00:00Z',
  },
];

export const MOCK_SHORTAGES = [
  {
    shortage_id: 'SHT-01',
    resource_name: 'Chemical Neutralization Agent Neutral-9',
    category_name: 'HAZMAT Equipment',
    current_stock: 40,
    burn_rate_per_hour: 25,
    depletion_estimate_hours: 1.6,
    urgency: 'CRITICAL',
    action_required: 'Emergency procurement airlift from Naval Stores Depot',
  },
  {
    shortage_id: 'SHT-02',
    resource_name: 'Pediatric Antibiotic Rehydration Dextrose',
    category_name: 'Medical Supplies',
    current_stock: 120,
    burn_rate_per_hour: 45,
    depletion_estimate_hours: 2.7,
    urgency: 'HIGH',
    action_required: 'Inter-district hospital transfer requested',
  },
];

export const MOCK_AUDIT_LOGS = [
  {
    log_id: 'LOG-99201',
    timestamp: '2026-11-15T07:15:32Z',
    actor_email: 'manager@urbanresq.city',
    actor_role: 'EMERGENCY_MANAGER',
    action: 'FIFO_DISPATCH_EXECUTE',
    entity_type: 'ALLOCATION',
    entity_id: 'ALLOC-8802',
    ip_address: '10.24.0.12',
    hash: '0x8f2a93c1...b72e',
    details: 'sp_generate_resource_allocation_plan committed 60 Jerrycans against BATCH-2026-W01',
  },
  {
    log_id: 'LOG-99200',
    timestamp: '2026-11-15T06:55:18Z',
    actor_email: 'medical@urbanresq.city',
    actor_role: 'MEDICAL_COORDINATOR',
    action: 'TRIAGE_PRIORITY_ESCALATE',
    entity_type: 'REQUEST',
    entity_id: 'REQ-4011',
    ip_address: '10.24.0.15',
    hash: '0x3c1d9b7a...a991',
    details: 'Urgency escalated to CRITICAL (score 98.4) based on SAR aeromedical report',
  },
  {
    log_id: 'LOG-99199',
    timestamp: '2026-11-15T06:30:05Z',
    actor_email: 'admin@urbanresq.city',
    actor_role: 'ADMIN',
    action: 'DISASTER_PERIMETER_UPDATE',
    entity_type: 'DISASTER',
    entity_id: 'DIS-2026-001',
    ip_address: '10.24.0.1',
    hash: '0x17c9f82d...ee41',
    details: 'GIS threat boundary expanded to 5.2 km radius following high tide forecast',
  },
];

export function getMockResponseForUrl(url: string, method: string = 'get', body?: any): any {
  const cleanUrl = url.replace(/^\/api\/?/, '/').replace(/^\/?/, '/');
  const path = cleanUrl.split('?')[0];

  // Auth
  if (path === '/auth/login' || path === '/auth') {
    const email = body?.email || 'manager@urbanresq.city';
    const user = getMockUserByEmail(email);
    return {
      token: `simulated_jwt_${user.roles[0]}_${Date.now()}`,
      user,
    };
  }

  // Dashboard
  if (path === '/dashboard') {
    return {
      status: {
        active_disasters: 3,
        critical_incidents: 2,
        people_affected: 69500,
        resource_lines_available: 18,
        available_rescue_teams: 14,
        deployed_rescue_teams: 8,
        hospital_occupancy_pct: 85.8,
        shelter_occupancy_pct: 73.4,
      },
      disasters: MOCK_DISASTERS,
      severity: [
        { severity: 'CRITICAL', disaster_count: 1, fill: '#EF4444' },
        { severity: 'HIGH', disaster_count: 1, fill: '#F97316' },
        { severity: 'MODERATE', disaster_count: 1, fill: '#EAB308' },
        { severity: 'LOW', disaster_count: 0, fill: '#10B981' },
      ],
      trend: [
        { hour_label: '02:00', request_count: 8 },
        { hour_label: '03:00', request_count: 14 },
        { hour_label: '04:00', request_count: 22 },
        { hour_label: '05:00', request_count: 31 },
        { hour_label: '06:00', request_count: 47 },
        { hour_label: '07:00', request_count: 62 },
        { hour_label: '08:00', request_count: 75 },
      ],
      activity: [
        {
          id: 'act-1',
          time_ago: '4m ago',
          title: 'FIFO Medical Dispatch Committed',
          description: '40 Pediatric trauma kits dispatched via Heli-Rescue Flight 1.',
          type: 'DISPATCH',
        },
        {
          id: 'act-2',
          time_ago: '18m ago',
          title: 'ICU Surge Barrier Enacted',
          description: 'South Coast Emergency station approaching 87% occupancy.',
          type: 'HOSPITAL',
        },
        {
          id: 'act-3',
          time_ago: '35m ago',
          title: 'GIS Threat Perimeter Expanded',
          description: 'Cyclone Mandous flood zone extended across Marina sector.',
          type: 'DISASTER',
        },
      ],
      utilization: [
        { category_name: 'Water & Hydration', utilization_pct: 78 },
        { category_name: 'Medical Supplies', utilization_pct: 64 },
        { category_name: 'Food & Nutrition', utilization_pct: 59 },
        { category_name: 'Heavy Equipment', utilization_pct: 82 },
        { category_name: 'Marine Boats', utilization_pct: 71 },
      ],
    };
  }

  // Disasters
  if (path === '/disasters') {
    return MOCK_DISASTERS;
  }
  if (path.startsWith('/disasters/')) {
    const id = path.split('/')[2];
    const found = MOCK_DISASTERS.find((d) => d.disaster_id === id) || MOCK_DISASTERS[0];
    return {
      ...found,
      requests: MOCK_REQUESTS,
      teams: MOCK_RESCUE_TEAMS,
      hospitals: MOCK_HOSPITALS,
      shelters: MOCK_SHELTERS,
    };
  }

  // Emergency Requests
  if (path === '/emergency-requests') {
    return {
      data: MOCK_REQUESTS,
      total: MOCK_REQUESTS.length,
      page: 1,
      pageSize: 20,
    };
  }
  if (path.startsWith('/emergency-requests/')) {
    const id = path.split('/')[2];
    return MOCK_REQUESTS.find((r) => r.request_id === id) || MOCK_REQUESTS[0];
  }

  // Facilities
  if (path === '/hospitals') return MOCK_HOSPITALS;
  if (path === '/hospitals/admissions') return [];
  if (path === '/shelters') return MOCK_SHELTERS;
  if (path === '/shelters/residents') return [];

  // Logistics & Teams
  if (path === '/rescue-teams') return MOCK_RESCUE_TEAMS;
  if (path === '/resources') return MOCK_RESOURCES;
  if (path === '/inventory') return MOCK_INVENTORY;
  if (path === '/allocations') return MOCK_ALLOCATIONS;
  if (path === '/vehicles') return MOCK_VEHICLES;
  if (path === '/volunteers') return MOCK_VOLUNTEERS;
  if (path === '/shortages') return MOCK_SHORTAGES;

  // Analytics
  if (path.startsWith('/analytics/')) {
    if (path.includes('requests-by-severity')) {
      return [
        { severity: 'CRITICAL', count: 18 },
        { severity: 'HIGH', count: 29 },
        { severity: 'MODERATE', count: 22 },
        { severity: 'LOW', count: 6 },
      ];
    }
    if (path.includes('requests-by-category')) {
      return [
        { category_name: 'Water & Hydration', count: 32 },
        { category_name: 'Medical Supplies', count: 24 },
        { category_name: 'Food & Nutrition', count: 18 },
        { category_name: 'Heavy Rescue', count: 14 },
      ];
    }
    if (path.includes('requests-by-zone')) {
      return [
        { zone_name: 'Zone 4 (Adyar/Marina)', count: 42 },
        { zone_name: 'Zone 7 (North Port)', count: 26 },
        { zone_name: 'Zone 2 (Central Transit)', count: 17 },
      ];
    }
    if (path.includes('resolution-rate')) {
      return { resolution_rate_pct: 78.4, total_resolved: 62, total_intake: 79 };
    }
    if (path.includes('resource-consumption-trend')) {
      return [
        { date: 'Day 1', water: 1200, food: 800, medical: 150 },
        { date: 'Day 2', water: 2400, food: 1600, medical: 320 },
        { date: 'Day 3', water: 3800, food: 2500, medical: 490 },
      ];
    }
    return [];
  }

  // Audit Logs
  if (path === '/audit-logs') {
    return {
      data: MOCK_AUDIT_LOGS,
      total: MOCK_AUDIT_LOGS.length,
      page: 1,
      pageSize: 20,
    };
  }

  // Healthcheck
  if (path === '/health') {
    return {
      status: 'healthy',
      service: 'urbanresq-simulation-engine',
      mode: 'offline_telemetry_simulator',
      uptimeSeconds: 86400,
      time: new Date().toISOString(),
    };
  }

  // Action mutations (POST / PATCH / PUT / DELETE)
  if (method.toLowerCase() !== 'get') {
    if (path.includes('/allocations/generate')) {
      return {
        success: true,
        summary: 'Atomic FIFO resource plan generated and committed against Depot Inventory',
        allocated_items: 2,
        total_quantity: 100,
        dispatched_at: new Date().toISOString(),
      };
    }
    return {
      success: true,
      message: 'Action recorded successfully in EOC Operational Log',
      updated_at: new Date().toISOString(),
    };
  }

  return [];
}
