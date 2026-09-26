import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Radio, 
  LayoutDashboard, 
  Flame, 
  ClipboardList, 
  Send, 
  Package, 
  AlertTriangle, 
  Users, 
  Building2, 
  Home, 
  HeartHandshake, 
  BarChart3, 
  ScrollText, 
  Camera, 
  Settings, 
  LogOut, 
  UserCheck 
} from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../hooks/useAuth';

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { logout, user, switchRole } = useAuth();

  const commands = [
    // Core Modules
    { id: 'cc', title: 'Command Center (Tactical Cockpit)', icon: Radio, action: () => navigate('/command-center'), type: 'Navigation' },
    { id: 'dash', title: 'City Overview Dashboard', icon: LayoutDashboard, action: () => navigate('/dashboard'), type: 'Navigation' },
    { id: 'disasters', title: 'Active Disaster Tracking', icon: Flame, action: () => navigate('/disasters'), type: 'Navigation' },
    { id: 'drone', title: 'UAV Aerial Surveillance Feed', icon: Camera, action: () => navigate('/drone-feed'), type: 'Navigation' },
    { id: 'req', title: 'Emergency Requests Triage', icon: ClipboardList, action: () => navigate('/emergency-requests'), type: 'Navigation' },
    { id: 'alloc', title: 'FIFO Resource Allocation Engine', icon: Send, action: () => navigate('/allocations'), type: 'Action' },
    { id: 'inv', title: 'Inventory Depots & Batch Stock', icon: Package, action: () => navigate('/inventory'), type: 'Navigation' },
    { id: 'shortages', title: 'Critical Supply Shortages', icon: AlertTriangle, action: () => navigate('/shortages'), type: 'Navigation' },
    { id: 'hosp', title: 'Hospital ER & ICU Surge Matrices', icon: Building2, action: () => navigate('/hospitals'), type: 'Navigation' },
    { id: 'shelters', title: 'Relief Shelters & Capacity', icon: Home, action: () => navigate('/shelters'), type: 'Navigation' },
    { id: 'teams', title: 'Rescue Teams Field Roster', icon: Users, action: () => navigate('/rescue-teams'), type: 'Navigation' },
    { id: 'volunteers', title: 'Volunteer Operations Roster', icon: HeartHandshake, action: () => navigate('/volunteers'), type: 'Navigation' },
    { id: 'analytics', title: 'Predictive Intelligence & Telemetry', icon: BarChart3, action: () => navigate('/analytics'), type: 'Navigation' },
    { id: 'audit', title: 'Cryptographic Audit Trail', icon: ScrollText, action: () => navigate('/audit-logs'), type: 'Navigation' },
    { id: 'settings', title: 'System & RBAC Settings', icon: Settings, action: () => navigate('/settings'), type: 'System' },
    
    // RBAC Drill Switchers
    { id: 'role-admin', title: 'Switch Role -> EOC Commander (ADMIN)', icon: UserCheck, action: () => switchRole('ADMIN'), type: 'RBAC Switch' },
    { id: 'role-manager', title: 'Switch Role -> Emergency Manager', icon: UserCheck, action: () => switchRole('EMERGENCY_MANAGER'), type: 'RBAC Switch' },
    { id: 'role-resources', title: 'Switch Role -> Resource Logistics Chief', icon: UserCheck, action: () => switchRole('RESOURCE_MANAGER'), type: 'RBAC Switch' },
    { id: 'role-medical', title: 'Switch Role -> Medical Coordinator', icon: UserCheck, action: () => switchRole('MEDICAL_COORDINATOR'), type: 'RBAC Switch' },
    { id: 'role-rescue', title: 'Switch Role -> Rescue Coordinator', icon: UserCheck, action: () => switchRole('RESCUE_COORDINATOR'), type: 'RBAC Switch' },
    { id: 'role-officer', title: 'Switch Role -> Disaster Officer', icon: UserCheck, action: () => switchRole('DISASTER_OFFICER'), type: 'RBAC Switch' },
    { id: 'role-viewer', title: 'Switch Role -> Viewer / Observer', icon: UserCheck, action: () => switchRole('VIEWER'), type: 'RBAC Switch' },

    { id: 'logout', title: 'End Operator Session (Logout)', icon: LogOut, action: () => logout(), type: 'System' },
  ];

  const filteredCommands = commands.filter(c => 
    c.title.toLowerCase().includes(query.toLowerCase()) || 
    c.type.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = filteredCommands[selectedIndex];
      if (cmd) {
        cmd.action();
        setIsOpen(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Quick Command Palette"
    >
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={() => setIsOpen(false)}
      />
      
      <div className="relative w-full max-w-xl overflow-hidden rounded-md bg-eoc-panel border border-cyan-500/40 shadow-tactical-accent">
        <div className="flex items-center border-b border-eoc-border px-4 py-3 bg-eoc-panel2">
          <Search size={16} className="text-cyan-400 mr-2.5 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none placeholder:text-eoc-subtle text-eoc-text text-sm font-mono"
            placeholder="Type a command, route, or role switch (e.g., 'Allocations', 'Medical', 'UAV')..."
            spellCheck={false}
          />
          <span className="rounded bg-eoc-panel border border-eoc-border px-1.5 py-0.5 text-[10px] text-eoc-muted font-mono">
            ESC
          </span>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-1.5" role="listbox">
          {filteredCommands.length === 0 ? (
            <div className="py-10 text-center text-xs font-mono text-eoc-muted">
              NO SYSTEM ACTIONS MATCHING "{query}"
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded text-left transition-colors border ${
                    isSelected 
                      ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-200' 
                      : 'hover:bg-eoc-panel2 border-transparent text-eoc-muted'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon size={15} className={isSelected ? 'text-cyan-400 shrink-0' : 'text-eoc-subtle shrink-0'} />
                    <span className="text-xs font-mono font-medium truncate text-eoc-text">
                      {cmd.title}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${
                    isSelected ? 'border-cyan-500/40 text-cyan-300' : 'border-eoc-border text-eoc-subtle'
                  }`}>
                    {cmd.type}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
