import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
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
  Activity
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
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  events,
  conflicts,
  onNavigateTab,
  onOpenNewEvent,
  onSelectEvent
}) => {
  const totalCount = events.length;
  const upcomingCount = events.filter(e => e.status === 'Upcoming').length;
  const ongoingCount = events.filter(e => e.status === 'Ongoing').length;
  const completedCount = events.filter(e => e.status === 'Completed').length;
  const conflictCount = conflicts.length;

  // Category counts
  const categoryCounts: Record<string, number> = {};
  for (const e of events) {
    categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
  }

  // Priority counts
  const highPriorityCount = events.filter(e => e.priority === 'High').length;
  const mediumPriorityCount = events.filter(e => e.priority === 'Medium').length;
  const lowPriorityCount = events.filter(e => e.priority === 'Low').length;

  // Today's date string in local timezone
  const todayDateStr = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const [utilizationDate, setUtilizationDate] = useState<string>(todayDateStr);
  const isUtilizationToday = utilizationDate === todayDateStr;

  // Venue utilization computation
  const venueUtilizationList = useMemo(() => {
    const OPERATIONAL_MINUTES = 720; // Standard 12-hour day (08:00 - 20:00)

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

  // Sorted upcoming events (chronologically)
  const upcomingSchedule = [...events]
    .filter(e => e.status !== 'Cancelled')
    .sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date);
      if (dateCmp !== 0) return dateCmp;
      return a.startTime.localeCompare(b.startTime);
    })
    .slice(0, 5);

  const categoryColors: Record<string, { bg: string; text: string; bar: string }> = {
    Technical: { bg: 'bg-indigo-50', text: 'text-indigo-700', bar: 'bg-indigo-600' },
    Workshop: { bg: 'bg-teal-50', text: 'text-teal-700', bar: 'bg-teal-500' },
    Cultural: { bg: 'bg-purple-50', text: 'text-purple-700', bar: 'bg-purple-500' },
    Hackathon: { bg: 'bg-amber-50', text: 'text-amber-700', bar: 'bg-amber-500' },
    Academic: { bg: 'bg-blue-50', text: 'text-blue-700', bar: 'bg-blue-600' },
    Sports: { bg: 'bg-emerald-50', text: 'text-emerald-700', bar: 'bg-emerald-500' }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Academic Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span>B.Tech CSE Micro-Project • Semester Lab Demonstration</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            EventFlow — Real-Time Event Scheduling System
          </h1>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            Engineered with core Computer Science data structures: interval conflict detection,
            CO3 searching/sorting pipelines, CO4 Binary Search Trees, and CO5 Graph-based relationship models.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('co3')}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs border border-white/15 transition-all flex items-center gap-2"
            >
              <Search className="w-3.5 h-3.5 text-teal-300" />
              CO3 Search & Sort
            </button>
            <button
              onClick={() => onNavigateTab('co4')}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs border border-white/15 transition-all flex items-center gap-2"
            >
              <Binary className="w-3.5 h-3.5 text-indigo-300" />
              CO4 BST Visualizer
            </button>
            <button
              onClick={() => onNavigateTab('co5')}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs border border-white/15 transition-all flex items-center gap-2"
            >
              <Network className="w-3.5 h-3.5 text-amber-300" />
              CO5 Graph Explorer
            </button>
            <button
              onClick={() => onNavigateTab('tests')}
              className="px-3.5 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 text-xs font-semibold border border-teal-400/30 transition-all flex items-center gap-2"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
              Run Self-Test Suite
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Events */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Events
            </span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{totalCount}</span>
            <span className="text-xs font-medium text-slate-500">Scheduled records</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>High: {highPriorityCount} • Med: {mediumPriorityCount} • Low: {lowPriorityCount}</span>
          </div>
        </div>

        {/* Upcoming */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Upcoming
            </span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{upcomingCount}</span>
            <span className="text-xs font-medium text-emerald-600 font-semibold">Active Pipeline</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Ongoing sessions: {ongoingCount}</span>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Completed
            </span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{completedCount}</span>
            <span className="text-xs font-medium text-slate-500">Concluded</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Completion rate: {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%</span>
          </div>
        </div>

        {/* Venue Conflicts */}
        <div
          onClick={() => onNavigateTab('conflicts')}
          className={`cursor-pointer rounded-xl p-5 border transition-all ${
            conflictCount > 0
              ? 'bg-amber-50/50 border-amber-300 shadow-xs hover:shadow-md hover:border-amber-400'
              : 'bg-white border-slate-200/80 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Venue Conflicts
            </span>
            <div
              className={`p-2.5 rounded-xl ${
                conflictCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-600'
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
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
            <span className={conflictCount > 0 ? 'text-amber-700 font-semibold' : 'text-emerald-600 font-semibold'}>
              {conflictCount > 0 ? 'Click to inspect & resolve' : 'All venues clear'}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Intentional Conflict Alert Banner (if any) */}
      {conflictCount > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-500 rounded-r-xl p-4 bg-white shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Action Required: {conflictCount} Concurrent Venue Conflict{conflictCount > 1 ? 's' : ''} Detected
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Example overlap: "{conflicts[0].eventA.title}" and "{conflicts[0].eventB.title}" in{' '}
                <strong>{conflicts[0].venue}</strong> ({conflicts[0].overlapMinutes} minutes collision).
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
      )}

      {/* Today's Events Chronological Vertical Timeline */}
      <TodayTimeline
        events={events}
        conflicts={conflicts}
        onSelectEvent={onSelectEvent}
        onOpenNewEvent={onOpenNewEvent}
      />

      {/* Main Content Split: Upcoming Schedule + Categories & Priority */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Schedule (2 cols on large screen) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Chronological Schedule Agenda</h3>
              <p className="text-xs text-slate-500">Upcoming sessions ordered by date and start interval</p>
            </div>
            <button
              onClick={() => onNavigateTab('events')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View Full Table <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {upcomingSchedule.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No events found</p>
              <p className="text-xs text-slate-400 mt-1">Get started by creating your first symposium event.</p>
              <button
                onClick={() => onOpenNewEvent()}
                className="mt-3 px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
              >
                + Add Event
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {upcomingSchedule.map(item => {
                const isConflicted = conflicts.some(c => c.eventA.id === item.id || c.eventB.id === item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectEvent(item)}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-lg transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="text-center px-2.5 py-1.5 bg-slate-100 rounded-lg border border-slate-200 shrink-0">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">
                          {new Date(item.date).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-base font-black text-slate-800 block leading-tight">
                          {new Date(item.date).toLocaleDateString('en-US', { day: '2-digit' })}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono text-indigo-600">#{item.id}</span>
                          <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                            {item.title}
                          </h4>
                          {isConflicted && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                              Conflict
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {item.startTime} - {item.endTime}
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
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                          categoryColors[item.category]?.bg || 'bg-slate-100'
                        } ${categoryColors[item.category]?.text || 'text-slate-700'}`}
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

        {/* Right Column: Venue Utilization, Category Distribution & Quick Lab Access */}
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
                    {isUtilizationToday ? "Today's booked time (12h window)" : `${utilizationDate} booked time`}
                  </p>
                </div>
              </div>

              {/* Quick Date Switcher */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
                <button
                  onClick={() => setUtilizationDate(todayDateStr)}
                  className={`px-2 py-0.5 rounded transition-all ${
                    isUtilizationToday ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setUtilizationDate('2026-10-26')}
                  className={`px-2 py-0.5 rounded transition-all ${
                    utilizationDate === '2026-10-26' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
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
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${badgeStyle}`}>
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
                        style={{ width: `${Math.max(item.percentage > 0 ? 3 : 0, item.percentage)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{item.bookedMinutes > 0 ? `${item.bookedHours} hrs booked` : '0 hrs booked'}</span>
                      <span>{item.bookedMinutes > 0 ? `${Math.max(0, 12 - Number(item.bookedHours)).toFixed(1)} hrs free` : '12 hrs free'}</span>
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
                const style = categoryColors[cat] || { bg: 'bg-slate-100', text: 'text-slate-700', bar: 'bg-slate-600' };
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

          {/* DSA Project Quick Links */}
          <div className="bg-gradient-to-br from-indigo-50/60 to-teal-50/40 rounded-xl border border-indigo-100 p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-2">
              Academic Lab Quick Test
            </h4>
            <p className="text-xs text-indigo-950/80 mb-3.5 leading-relaxed">
              Verify your Course Outcome implementations live with interactive step-by-step playback:
            </p>

            <div className="space-y-2">
              <button
                onClick={() => onNavigateTab('co3')}
                className="w-full text-left px-3 py-2 bg-white rounded-lg border border-indigo-200/70 text-xs font-semibold text-slate-800 hover:border-indigo-400 hover:text-indigo-600 flex items-center justify-between transition-colors shadow-2xs"
              >
                <span>CO3: Compare Sort Algorithms</span>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
              </button>
              <button
                onClick={() => onNavigateTab('co4')}
                className="w-full text-left px-3 py-2 bg-white rounded-lg border border-indigo-200/70 text-xs font-semibold text-slate-800 hover:border-indigo-400 hover:text-indigo-600 flex items-center justify-between transition-colors shadow-2xs"
              >
                <span>CO4: In-Order Traversal Invariant</span>
                <ArrowRight className="w-3.5 h-3.5 text-teal-600" />
              </button>
              <button
                onClick={() => onNavigateTab('co5')}
                className="w-full text-left px-3 py-2 bg-white rounded-lg border border-indigo-200/70 text-xs font-semibold text-slate-800 hover:border-indigo-400 hover:text-indigo-600 flex items-center justify-between transition-colors shadow-2xs"
              >
                <span>CO5: BFS Queue vs DFS Stack</span>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
