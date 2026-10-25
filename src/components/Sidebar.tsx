import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  Building2,
  AlertTriangle,
  Search,
  Binary,
  Network,
  BookOpen,
  CheckCircle2,
  RotateCcw,
  Download,
  LogIn,
  LogOut,
  User,
  UserCheck
} from 'lucide-react';
import { UserProfile } from '../types/auth';

export type ActiveTab = 
  | 'dashboard' 
  | 'events' 
  | 'calendar'
  | 'venues'
  | 'conflicts' 
  | 'co3' 
  | 'co4' 
  | 'co5' 
  | 'manual' 
  | 'login'
  | 'signup';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  conflictCount: number;
  totalEvents: number;
  currentUser?: UserProfile | null;
  onSignOut?: () => void;
  onOpenResetConfirm: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onLoadDemoConflict?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  conflictCount,
  totalEvents,
  currentUser,
  onSignOut,
  onOpenResetConfirm,
  onExportCSV,
  onExportJSON,
  onLoadDemoConflict
}) => {
  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'events' as ActiveTab,
      label: 'Events',
      icon: Calendar,
      badge: `${totalEvents}`
    },
    {
      id: 'calendar' as ActiveTab,
      label: 'Calendar',
      icon: CalendarDays,
      sublabel: 'Month, Week & Day Views'
    },
    {
      id: 'venues' as ActiveTab,
      label: 'Venues',
      icon: Building2,
      sublabel: 'Occupancy & Facility Specs'
    },
    {
      id: 'conflicts' as ActiveTab,
      label: 'Venue Conflicts',
      icon: AlertTriangle,
      badge: conflictCount > 0 ? `${conflictCount} Overlap` : 'Clean',
      badgeColor: conflictCount > 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300'
    },
    {
      id: 'co3' as ActiveTab,
      label: 'Search & Sort',
      icon: Search,
      sublabel: 'Linear, Binary & Sorting'
    },
    {
      id: 'co4' as ActiveTab,
      label: 'Event Structure',
      icon: Binary,
      sublabel: 'Binary Search Tree'
    },
    {
      id: 'co5' as ActiveTab,
      label: 'Event Network',
      icon: Network,
      sublabel: 'Graph Models & Traversal'
    },
    {
      id: 'manual' as ActiveTab,
      label: 'Documentation',
      icon: BookOpen,
      sublabel: 'Architecture & Specifications'
    }
  ];

  return (
    <aside className="w-64 bg-slate-950 text-slate-200 flex flex-col shrink-0 border-r border-slate-800/80 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-teal-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Network className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base tracking-tight text-white">EventFlow</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Real-Time Event Scheduling System</p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Core Workspaces
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between group relative ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600/30 to-indigo-600/10 text-white font-semibold border border-indigo-500/40 shadow-sm shadow-indigo-950'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <div className="min-w-0">
                  <div className="text-xs truncate">{item.label}</div>
                  {item.sublabel && (
                    <div className="text-[10px] text-slate-500 truncate group-hover:text-slate-400">
                      {item.sublabel}
                    </div>
                  )}
                </div>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ml-1.5 ${
                    item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Account Section */}
      {currentUser ? (
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/60 space-y-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-xs font-extrabold text-indigo-300 shrink-0">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
              <div className="text-[10px] text-slate-400 truncate">{currentUser.email}</div>
            </div>
          </div>
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="w-full px-3 py-2 bg-slate-800/90 hover:bg-red-950/40 border border-slate-700/80 hover:border-red-800/50 rounded-xl text-xs font-semibold text-slate-200 hover:text-red-300 flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span>Logout</span>
            </button>
          )}
        </div>
      ) : (
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/50 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>Account</span>
            <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">Guest</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setActiveTab('login')}
              className={`px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'login'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-900 text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <LogIn className="w-3 h-3 text-indigo-400" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'signup'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30'
              }`}
            >
              <User className="w-3 h-3 text-teal-400" />
              <span>Sign Up</span>
            </button>
          </div>
        </div>
      )}

      {/* Footer Storage / Quick Actions */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 space-y-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2">
          Persistence & Backup
        </div>
        
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={onExportCSV}
            title="Download full schedule as CSV"
            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[11px] font-medium text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-3 h-3 text-teal-400" />
            CSV
          </button>
          <button
            onClick={onExportJSON}
            title="Download full schedule as JSON"
            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[11px] font-medium text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-3 h-3 text-indigo-400" />
            JSON
          </button>
        </div>

        {onLoadDemoConflict && (
          <button
            onClick={onLoadDemoConflict}
            className="w-full px-2.5 py-1.5 bg-amber-950/20 hover:bg-amber-900/30 border border-amber-800/40 hover:border-amber-700/60 rounded-lg text-[11px] font-medium text-amber-300 flex items-center justify-center gap-1.5 transition-all"
            title="Load an intentional venue conflict for demonstration"
          >
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            Load Demo Conflict
          </button>
        )}

        <button
          onClick={onOpenResetConfirm}
          className="w-full px-2.5 py-1.5 bg-slate-900/60 hover:bg-red-950/40 border border-slate-800 hover:border-red-800/50 rounded-lg text-[11px] font-medium text-slate-400 hover:text-red-300 flex items-center justify-center gap-1.5 transition-all"
        >
          <RotateCcw className="w-3 h-3" />
          Reset to Sample Data
        </button>

        <div className="pt-1 text-[10px] text-center text-slate-500">
          EventFlow Pro • Local Workspace
        </div>
      </div>
    </aside>
  );
};
