import React from 'react';
import {
  Plus,
  AlertTriangle,
  CheckCircle2,
  Menu,
  Clock,
  Sparkles
} from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface HeaderProps {
  activeTab: ActiveTab;
  conflictCount: number;
  onOpenNewEvent: () => void;
  onOpenSelfTest: () => void;
  onNavigateConflicts: () => void;
  onToggleMobileSidebar: () => void;
  testPassCount?: number;
  totalTestsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  conflictCount,
  onOpenNewEvent,
  onOpenSelfTest,
  onNavigateConflicts,
  onToggleMobileSidebar,
  testPassCount = 6,
  totalTestsCount = 6
}) => {
  const getTabTitle = (tab: ActiveTab) => {
    switch (tab) {
      case 'dashboard':
        return { title: 'Dashboard Overview', subtitle: 'Symposium schedule metrics, upcoming timeline & venue conflict status' };
      case 'events':
        return { title: 'Events & Calendar', subtitle: 'Searchable database, filterable grid, and interactive monthly calendar' };
      case 'conflicts':
        return { title: 'Venue Conflict Detector', subtitle: 'Interval overlap analysis (startA < endB && endA > startB) for shared venues' };
      case 'co3':
        return { title: 'CO3: Search & Sort Lab', subtitle: 'Step-by-step Linear Search, Binary Search, Bubble, Selection & Merge Sort' };
      case 'co4':
        return { title: 'CO4: BST Visualizer', subtitle: 'Binary Search Tree construction, In-Order/Pre-Order/Post-Order/BFS traversals' };
      case 'co5':
        return { title: 'CO5: Graph Explorer', subtitle: 'Adjacency list/matrix model, Breadth-First & Depth-First Search on event relations' };
      case 'manual':
        return { title: 'Academic Lab Manual', subtitle: 'B.Tech CSE Course Outcomes, algorithmic complexity proofs & syllabus mapping' };
      case 'tests':
        return { title: 'Automated Self-Test Runner', subtitle: 'Live client-side verification of CRUD, conflict detection, sorting & tree/graph algorithms' };
    }
  };

  const { title, subtitle } = getTabTitle(activeTab);

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base md:text-lg font-bold text-slate-900 leading-tight">
            {title}
          </h2>
          <p className="text-xs text-slate-500 hidden sm:block">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Live Academic Clock Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200/60">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Symposium Week: Oct 26–28, 2026</span>
        </div>

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

        {/* Self-Test Quick Status */}
        <button
          onClick={onOpenSelfTest}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-300 hover:bg-emerald-100 transition-colors"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Tests: {testPassCount}/{totalTestsCount} Passing</span>
        </button>

        {/* New Event Button */}
        <button
          onClick={onOpenNewEvent}
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs md:text-sm font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-all hover:shadow-indigo-500/25 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Event</span>
        </button>
      </div>
    </header>
  );
};
