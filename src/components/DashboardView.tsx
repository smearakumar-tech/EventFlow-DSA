import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  MapPin,
  ArrowRight,
  Sparkles,
  Search,
  Binary,
  Network,
  Tag,
  ShieldCheck,
  Building2,
  Activity,
  Plus,
  Compass,
  CheckCircle
} from 'lucide-react';
import { EventItem, VenueConflictPair } from '../types/event';
import { ActiveTab } from './Sidebar';
import { TodayTimeline } from './TodayTimeline';
import { VENUE_LIST } from '../utils/sampleData';
import { timeToMinutes } from '../utils/conflictDetector';

interface DashboardViewProps {
  events: EventItem[];
  conflicts: VenueConflictPair[];
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenNewEvent: (prefillDate?: string) => void;
  onSelectEvent: (event: EventItem) => void;
  onOpenSearch?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  events,
  conflicts,
  onNavigateTab,
  onOpenNewEvent,
  onSelectEvent,
  onOpenSearch
}) => {
  const totalCount = events.length;
  const upcomingCount = events.filter(e => e.status === 'Upcoming').length;
  const ongoingCount = events.filter(e => e.status === 'Ongoing').length;
  const completedCount = events.filter(e => e.status === 'Completed').length;
  const conflictCount = conflicts.length;

  // Category counts calculated from real dataset
  const categoryCounts: Record<string, number> = {};
  for (const e of events) {
    categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
  }

  // Priority counts
  const highPriorityCount = events.filter(e => e.priority === 'High').length;
  const mediumPriorityCount = events.filter(e => e.priority === 'Medium').length;
  const lowPriorityCount = events.filter(e => e.priority === 'Low').length;

  // Current local time greeting & date
  const now = new Date();
  const currentHour = now.getHours();
  const greeting =
    currentHour < 12
      ? 'Good morning'
      : currentHour < 17
      ? 'Good afternoon'
      : 'Good evening';

  const formattedLocalDate = now.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Today's date string in local timezone (YYYY-MM-DD)
  const todayDateStr = useMemo(() => {
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const [utilizationDate, setUtilizationDate] = useState<string>(todayDateStr);
  const isUtilizationToday = utilizationDate === todayDateStr;

  // Venue utilization computation: strictly calculates non-overlapping occupied minutes / 720 minutes
  const venueUtilizationList = useMemo(() => {
    const OPERATIONAL_MINUTES = 720; // 12-hour day (08:00 - 20:00)

    return VENUE_LIST.map(venueName => {
      const venueEvents = events.filter(
        e => e.date === utilizationDate && e.venue === venueName && e.status !== 'Cancelled'
      );

      const rawIntervals: Array<[number, number]> = venueEvents
        .map(e => [timeToMinutes(e.startTime), timeToMinutes(e.endTime)] as [number, number])
        .sort((a, b) => a[0] - b[0]);

      const mergedIntervals: Array<[number, number]> = [];
      for (const interval of rawIntervals) {
        if (mergedIntervals.length === 0 || mergedIntervals[mergedIntervals.length - 1][1] < interval[0]) {
          mergedIntervals.push([...interval]);
        } else {
          mergedIntervals[mergedIntervals.length - 1][1] = Math.max(
            mergedIntervals[mergedIntervals.length - 1][1],
            interval[1]
          );
        }
      }

      const bookedMinutes = mergedIntervals.reduce((sum, [s, e]) => sum + (e - s), 0);
      const bookedPercentage = Math.min(100, Math.round((bookedMinutes / OPERATIONAL_MINUTES) * 100));

      const hasConflict = conflicts.some(
        c => c.venue === venueName && c.date === utilizationDate
      );

      return {
        venue: venueName,
        bookedMinutes,
        bookedHours: (bookedMinutes / 60).toFixed(1),
        percentage: bookedPercentage,
        eventCount: venueEvents.length,
        hasConflict
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [events, conflicts, utilizationDate]);

  // Sorted upcoming events (chronologically, next 5 eligible)
  const upcomingSchedule = useMemo(() => {
    return [...events]
      .filter(e => e.status !== 'Cancelled')
      .sort((a, b) => {
        const dateCmp = a.date.localeCompare(b.date);
        if (dateCmp !== 0) return dateCmp;
        return a.startTime.localeCompare(b.startTime);
      })
      .slice(0, 5);
  }, [events]);

  const categoryColors: Record<string, { bg: string; text: string; bar: string }> = {
    Technical: { bg: 'bg-indigo-50 text-indigo-700', text: 'text-indigo-700', bar: 'bg-indigo-600' },
    Workshop: { bg: 'bg-teal-50 text-teal-700', text: 'text-teal-700', bar: 'bg-teal-500' },
    Cultural: { bg: 'bg-purple-50 text-purple-700', text: 'text-purple-700', bar: 'bg-purple-500' },
    Hackathon: { bg: 'bg-amber-50 text-amber-700', text: 'text-amber-700', bar: 'bg-amber-500' },
    Academic: { bg: 'bg-blue-50 text-blue-700', text: 'text-blue-700', bar: 'bg-blue-600' },
    Sports: { bg: 'bg-emerald-50 text-emerald-700', text: 'text-emerald-700', bar: 'bg-emerald-500' }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ======================================================== */}
      {/* 1. WELCOME HEADER (Linear / Stripe inspired SaaS Banner) */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        {/* Subtle decorative gradient glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-br from-indigo-100/50 via-teal-50/30 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                {greeting}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {formattedLocalDate}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Your events, beautifully organized.
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
              Plan schedules, manage venues, and keep every event running smoothly.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onOpenSearch && (
              <button
                onClick={onOpenSearch}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 shadow-2xs transition-all flex items-center gap-2"
              >
                <Search className="w-4 h-4 text-slate-500" />
                <span>Search</span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white rounded border border-slate-300 text-slate-500 shadow-3xs">
                  ⌘K
                </kbd>
              </button>
            )}

            <button
              onClick={() => onNavigateTab('events')}
              className="px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold border border-slate-300 shadow-2xs transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>View Calendar</span>
            </button>

            <button
              onClick={() => onOpenNewEvent()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all hover:shadow-indigo-500/25 active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Event</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SUMMARY CARDS (4 Premium SaaS metric cards)           */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Events */}
        <div
          onClick={() => onNavigateTab('events')}
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Events
              </span>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{totalCount}</span>
              <span className="text-xs font-medium text-slate-500">records</span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>High: {highPriorityCount} • Med: {mediumPriorityCount} • Low: {lowPriorityCount}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
        </div>

        {/* Card 2: Upcoming Events */}
        <div
          onClick={() => onNavigateTab('events')}
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Upcoming Events
              </span>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{upcomingCount}</span>
              <span className="text-xs font-semibold text-blue-600">Active</span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Ongoing: {ongoingCount} in progress</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
        </div>

        {/* Card 3: Completed Events */}
        <div
          onClick={() => onNavigateTab('events')}
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Completed Events
              </span>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{completedCount}</span>
              <span className="text-xs font-medium text-slate-500">Concluded</span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Completion: {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </div>
        </div>

        {/* Card 4: Venue Conflicts */}
        <div
          onClick={() => onNavigateTab('conflicts')}
          className={`cursor-pointer rounded-xl p-5 border transition-all flex flex-col justify-between group ${
            conflictCount > 0
              ? 'bg-amber-50/40 border-amber-300 shadow-xs hover:border-amber-400 hover:shadow-md'
              : 'bg-white border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Venue Conflicts
              </span>
              <div
                className={`p-2.5 rounded-xl group-hover:scale-105 transition-transform ${
                  conflictCount > 0
                    ? 'bg-amber-100 text-amber-700 animate-pulse'
                    : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span
                className={`text-3xl font-extrabold ${
                  conflictCount > 0 ? 'text-amber-800' : 'text-slate-900'
                }`}
              >
                {conflictCount}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {conflictCount > 0 ? 'Overlaps detected' : 'Zero collisions'}
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
            <span
              className={
                conflictCount > 0
                  ? 'text-amber-700 font-semibold'
                  : 'text-emerald-700 font-semibold'
              }
            >
              {conflictCount > 0 ? 'Inspect & resolve' : 'All halls clear'}
            </span>
            <ArrowRight
              className={`w-3.5 h-3.5 ${
                conflictCount > 0 ? 'text-amber-600' : 'text-slate-400 group-hover:text-emerald-600'
              } transition-colors`}
            />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. VENUE CONFLICT ALERT PANEL (Warning or Success)       */}
      {/* ======================================================== */}
      {conflictCount > 0 ? (
        <div className="bg-white rounded-xl border border-amber-300 p-4 shadow-xs border-l-4 border-l-amber-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">
                  {conflictCount} Venue Conflict{conflictCount > 1 ? 's' : ''} Detected
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Overlap: <strong>"{conflicts[0].eventA.title}"</strong> and{' '}
                <strong>"{conflicts[0].eventB.title}"</strong> are double-booked in{' '}
                <strong>{conflicts[0].venue}</strong> on {conflicts[0].date} ({conflicts[0].overlapMinutes} minutes collision from {conflicts[0].overlapStart} to {conflicts[0].overlapEnd}).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateTab('conflicts')}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              Resolve Conflicts
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-emerald-200 p-3.5 shadow-2xs border-l-4 border-l-emerald-500 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold text-emerald-950">
              Optimal Schedule Validation Invariant Satisfied: All venues partitioned with zero overlaps.
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('conflicts')}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold shrink-0"
          >
            Check Validator
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. TODAY'S CHRONOLOGICAL VERTICAL TIMELINE               */}
      {/* ======================================================== */}
      <TodayTimeline
        events={events}
        conflicts={conflicts}
        onSelectEvent={onSelectEvent}
        onOpenNewEvent={onOpenNewEvent}
      />

      {/* ======================================================== */}
      {/* 5. MAIN CONTENT SPLIT: Upcoming Events & Analytics       */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Schedule (2 cols on large screen) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Upcoming Events</h3>
                <p className="text-xs text-slate-500">Next 5 eligible sessions ordered chronologically</p>
              </div>
              <button
                onClick={() => onNavigateTab('events')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                View all events <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {upcomingSchedule.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl p-6">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No events scheduled</p>
                <p className="text-xs text-slate-400 mt-1">Get started by scheduling your first event.</p>
                <button
                  onClick={() => onOpenNewEvent()}
                  className="mt-3 px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
                >
                  Create Event
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {upcomingSchedule.map(item => {
                  const isConflicted = conflicts.some(
                    c => c.eventA.id === item.id || c.eventB.id === item.id
                  );
                  const style = categoryColors[item.category] || {
                    bg: 'bg-slate-100 text-slate-700',
                    text: 'text-slate-700',
                    bar: 'bg-slate-500'
                  };

                  return (
                    <div
                      key={item.id}
                      onClick={() => onSelectEvent(item)}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-lg transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="text-center px-2.5 py-1.5 bg-slate-100 rounded-lg border border-slate-200 shrink-0">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">
                            {new Date(item.date).toLocaleDateString(undefined, { month: 'short' })}
                          </span>
                          <span className="text-base font-black text-slate-800 block leading-tight">
                            {new Date(item.date).toLocaleDateString(undefined, { day: '2-digit' })}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold font-mono text-indigo-600">
                              #{item.id}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                              {item.title}
                            </h4>
                            {isConflicted && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                                Conflict
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {item.startTime} – {item.endTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {item.venue}
                            </span>
                            <span className="hidden sm:inline-block text-slate-400">•</span>
                            <span className="hidden sm:inline-block truncate max-w-[160px] text-slate-500">
                              {item.organizer}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border border-slate-200/60 ${style.bg}`}
                        >
                          {item.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            item.priority === 'High'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : item.priority === 'Medium'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.priority}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Showing next 5 upcoming sessions</span>
            <button
              onClick={() => onNavigateTab('events')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Manage Full Schedule
            </button>
          </div>
        </div>

        {/* Right Column: Venue Utilization, Category Distribution & Quick Links */}
        <div className="space-y-6">
          {/* Venue Utilization Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Venue Utilization</h3>
                  <p className="text-[11px] text-slate-500">
                    {isUtilizationToday
                      ? "Today's booked time (12h window)"
                      : `${utilizationDate} booked time`}
                  </p>
                </div>
              </div>

              {/* Date Switcher */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
                <button
                  onClick={() => setUtilizationDate(todayDateStr)}
                  className={`px-2 py-0.5 rounded transition-all ${
                    isUtilizationToday
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setUtilizationDate('2026-10-26')}
                  className={`px-2 py-0.5 rounded transition-all ${
                    utilizationDate === '2026-10-26'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Oct 26
                </button>
              </div>
            </div>

            {/* Venues Progress List */}
            <div className="space-y-3 pt-1">
              {venueUtilizationList.map(item => {
                let barColor = 'bg-teal-500';
                let textColor = 'text-teal-700';
                let loadBadge = 'Available';
                let badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';

                if (item.hasConflict) {
                  barColor = 'bg-amber-500';
                  textColor = 'text-amber-700';
                  loadBadge = 'Conflict';
                  badgeStyle = 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse';
                } else if (item.percentage >= 75) {
                  barColor = 'bg-red-500';
                  textColor = 'text-red-700';
                  loadBadge = 'High Load';
                  badgeStyle = 'bg-red-50 text-red-700 border-red-200';
                } else if (item.percentage >= 40) {
                  barColor = 'bg-indigo-600';
                  textColor = 'text-indigo-700';
                  loadBadge = 'Optimal';
                  badgeStyle = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                } else if (item.percentage > 0) {
                  barColor = 'bg-teal-500';
                  textColor = 'text-teal-700';
                  loadBadge = 'Moderate';
                  badgeStyle = 'bg-teal-50 text-teal-700 border-teal-200';
                }

                return (
                  <div key={item.venue} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-800 truncate" title={item.venue}>
                          {item.venue}
                        </span>
                        {item.eventCount > 0 && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({item.eventCount} ev)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${badgeStyle}`}>
                          {loadBadge}
                        </span>
                        <span className={`font-mono font-bold text-xs ${textColor}`}>
                          {item.percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar Track */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex items-center">
                      <div
                        className={`h-full ${barColor} rounded-full transition-all duration-500`}
                        style={{
                          width: `${Math.max(item.percentage > 0 ? 3 : 0, item.percentage)}%`
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{item.bookedMinutes > 0 ? `${item.bookedHours} hrs booked` : '0 hrs booked'}</span>
                      <span>
                        {item.bookedMinutes > 0
                          ? `${Math.max(0, 12 - Number(item.bookedHours)).toFixed(1)} hrs free`
                          : '12 hrs free'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-indigo-500" />
                <span>Base: 08:00–20:00 (720m)</span>
              </span>
              <button
                onClick={() => onNavigateTab('events')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
              >
                Inspect All <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900">Category Breakdown</h3>
              <Tag className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-3">
              {Object.entries(categoryCounts).map(([cat, count]) => {
                const percent = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                const style = categoryColors[cat] || {
                  bg: 'bg-slate-100 text-slate-700',
                  text: 'text-slate-700',
                  bar: 'bg-slate-600'
                };
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{cat}</span>
                      <span className="font-mono text-slate-500">
                        {count} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${style.bar} rounded-full transition-all duration-500`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Workspaces Access */}
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Core Workspaces
              </h4>
              <Compass className="w-4 h-4 text-teal-400" />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Explore schedule algorithms, search/sort efficiency benchmarks, and topological dependency graphs:
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => onNavigateTab('co3')}
                className="w-full text-left px-3 py-2 bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Search &amp; Sort Engine</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigateTab('co4')}
                className="w-full text-left px-3 py-2 bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Binary className="w-3.5 h-3.5 text-teal-400" />
                  <span>Tree Explorer (BST)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigateTab('co5')}
                className="w-full text-left px-3 py-2 bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Network className="w-3.5 h-3.5 text-amber-400" />
                  <span>Event Network (Graph)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
