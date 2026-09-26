export const NAV = [
  { group: 'Overview', items: [{ id: 'dashboard', label: 'Command center' }, { id: 'notifications', label: 'Notifications' }] },
  { group: 'Emergency operations', items: [{ id: 'incidents', label: 'Incidents' }] },
  { group: 'Resource management', items: [
    { id: 'inventory', label: 'Inventory' },
    { id: 'requests', label: 'Requests' },
    { id: 'allocation', label: 'Allocation center' },
    { id: 'donations', label: 'Donations' }
  ] },
  { group: 'People & response', items: [
    { id: 'teams', label: 'Rescue teams' },
    { id: 'volunteers', label: 'Volunteers' },
    { id: 'registry', label: 'Victims & missing', roles: ['coordinator'] }
  ] },
  { group: 'Medical & relief', items: [{ id: 'hospitals', label: 'Hospitals' }, { id: 'shelters', label: 'Shelters' }] },
  { group: 'Maps & planning', items: [{ id: 'map', label: 'Live disaster map' }, { id: 'risk', label: 'Risk & weather' }] },
  { group: 'Communication', items: [{ id: 'comms', label: 'Alerts & messages' }] },
  { group: 'Intelligence', items: [{ id: 'analytics', label: 'Reports & analytics' }] },
  { group: 'Administration', items: [{ id: 'admin', label: 'Users & audit', roles: ['admin'] }, { id: 'settings', label: 'Settings' }] }
];
