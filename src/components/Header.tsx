import React, { useEffect } from 'react';
import {
  Plus,
  AlertTriangle,
  Menu,
  Clock,
  Search,
  Printer,
  History,
  LogIn,
  LogOut,
  User
} from 'lucide-react';
import { ActiveTab } from './Sidebar';
import { UserProfile } from '../types/auth';

interface HeaderProps {
  activeTab: ActiveTab;
  conflictCount: number;
  currentUser?: UserProfile | null;
  onNavigateLogin?: () => void;
  onNavigateSignUp?: () => void;
  onSignOut?: () => void;
  onOpenNewEvent: () => void;
  onNavigateConflicts: () => void;
  onToggleMobileSidebar: () => void;
  onOpenSearch?: () => void;
  onOpenPrintReport?: () => void;
  onOpenActivityHistory?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  conflictCount,
  currentUser,
  onNavigateLogin,
  onNavigateSignUp,
  onSignOut,
  onOpenNewEvent,
  onNavigateConflicts,
  onToggleMobileSidebar,
  onOpenSearch,
  onOpenPrintReport,
  onOpenActivityHistory
}) => {
  // Global Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onOpenSearch?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearch]);

  const getTabTitle = (tab: ActiveTab) => {
    switch (tab) {
      case 'dashboard':
        return {
          title: 'Dashboard',
          subtitle: 'Plan schedules, manage venues, and keep every event running smoothly'
        };
      case 'events':
        return {
          title: 'Event Management',
          subtitle: 'Searchable database, filterable grid, and schedule operations'
        };
      case 'calendar':
        return {
          title: 'Interactive Calendar',
          subtitle: 'Multi-view scheduling overview across Month, Week, and Day perspectives'
        };
      case 'venues':
        return {
          title: 'Venues & Facilities',
          subtitle: 'Track campus hall utilization, equipment capabilities, and capacity constraints'
        };
      case 'conflicts':
        return {
          title: 'Venue Conflicts',
          subtitle: 'Interval overlap analysis (startA < endB && endA > startB) with verified resolution engine'
        };
      case 'co3':
        return {
          title: 'Search & Sort',
          subtitle: 'Step-by-step Linear Search, Binary Search, Bubble, Selection & Merge Sort'
        };
      case 'co4':
        return {
          title: 'Event Structure',
          subtitle: 'Binary Search Tree construction, In-Order/Pre-Order/Post-Order/BFS traversals'
        };
      case 'co5':
        return {
          title: 'Event Network',
          subtitle: 'Adjacency list/matrix model, Breadth-First & Depth-First Search on event relations'
        };
      case 'manual':
        return {
          title: 'Documentation',
          subtitle: 'System architecture, algorithm complexity analysis & Course Outcome specifications'
        };
      case 'login':
        return {
          title: 'Sign In',
          subtitle: 'Access your EventFlow account and scheduled symposium sessions'
        };
      case 'signup':
        return {
          title: 'Create Account',
          subtitle: 'Register as an event organizer to manage sessions and conflict resolutions'
        };
    }
  };

  const { title, subtitle } = getTabTitle(activeTab);

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 md:px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h2 className="text-base md:text-lg font-bold text-slate-900 leading-tight truncate">
            {title}
          </h2>
          <p className="text-xs text-slate-500 hidden lg:block truncate">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Quick Search Button (Ctrl+K) */}
        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-600 text-xs font-medium border border-slate-200 transition-colors shadow-2xs"
            title="Search Schedule (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white rounded border border-slate-300 text-slate-500 shadow-3xs">
              ⌘K
            </kbd>
          </button>
        )}

        {/* Activity Log Button */}
        {onOpenActivityHistory && (
          <button
            onClick={onOpenActivityHistory}
            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-lg transition-colors"
            title="Local Activity History"
          >
            <History className="w-4 h-4" />
          </button>
        )}

        {/* Print Report Button */}
        {onOpenPrintReport && (
          <button
            onClick={onOpenPrintReport}
            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-lg transition-colors hidden sm:flex"
            title="Print Schedule Report"
          >
            <Printer className="w-4 h-4" />
          </button>
        )}

        {/* Conflict Warning Pill */}
        {conflictCount > 0 && (
          <button
            onClick={onNavigateConflicts}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-300 hover:bg-amber-100 transition-colors animate-pulse"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>{conflictCount} Conflict{conflictCount > 1 ? 's' : ''}</span>
          </button>
        )}

        {/* New Event Button */}
        <button
          onClick={onOpenNewEvent}
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs md:text-sm font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-all hover:shadow-indigo-500/25 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Event</span>
        </button>

        {/* Authentication Controls */}
        {currentUser ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="w-6 h-6 rounded-md bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shadow-xs">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-none truncate max-w-[120px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">Organizer</div>
              </div>
            </div>
            {onSignOut && (
              <button
                onClick={onSignOut}
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 rounded-lg transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
            {onNavigateLogin && (
              <button
                onClick={onNavigateLogin}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'login'
                    ? 'bg-slate-200 text-slate-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LogIn className="w-3.5 h-3.5 text-indigo-600" />
                <span>Sign In</span>
              </button>
            )}
            {onNavigateSignUp && (
              <button
                onClick={onNavigateSignUp}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors hidden sm:flex items-center gap-1.5 ${
                  activeTab === 'signup'
                    ? 'bg-indigo-700 text-white font-bold'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/80'
                }`}
              >
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>Sign Up</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
