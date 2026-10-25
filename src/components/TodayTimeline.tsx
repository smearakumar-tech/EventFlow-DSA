import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Plus,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Radio,
  User,
  Tag,
  Flag,
  Search,
  X
} from 'lucide-react';
import { EventItem, VenueConflictPair } from '../types/event';
import { timeToMinutes } from '../utils/conflictDetector';

interface TodayTimelineProps {
  events: EventItem[];
  conflicts: VenueConflictPair[];
  onSelectEvent: (event: EventItem) => void;
  onOpenNewEvent: (prefillDate?: string) => void;
}

export const TodayTimeline: React.FC<TodayTimelineProps> = ({
  events,
  conflicts,
  onSelectEvent,
  onOpenNewEvent
}) => {
  // Current time state with 30-second interval refresh to maintain real-time accuracy
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Compute today's date string in local timezone (YYYY-MM-DD)
  const todayDateStr = useMemo(() => {
    const year = currentTime.getFullYear();
    const month = String(currentTime.getMonth() + 1).padStart(2, '0');
    const day = String(currentTime.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, [currentTime]);

  // Selected date filter (defaults strictly to todayDateStr)
  const [selectedDate, setSelectedDate] = useState<string>(todayDateStr);

  // Sync selectedDate if todayDateStr changes
  useEffect(() => {
    setSelectedDate(todayDateStr);
  }, [todayDateStr]);

  const isViewingToday = selectedDate === todayDateStr;

  // Current time in minutes from midnight
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  // Formatted display date in user's local timezone
  const formattedDisplayDate = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, (m || 1) - 1, d || 1);
    return dateObj.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }, [selectedDate]);

  // Text input search filter for name, organizer, or venue
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Clear search filter when switching dates
  useEffect(() => {
    setSearchFilter('');
  }, [selectedDate]);

  // Filter events strictly for the selected date and sort from earliest to latest
  const dateEvents = useMemo(() => {
    return events
      .filter(e => e.date === selectedDate)
      .sort((a, b) => {
        const startDiff = timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
        if (startDiff !== 0) return startDiff;
        return timeToMinutes(a.endTime) - timeToMinutes(b.endTime);
      });
  }, [events, selectedDate]);

  // Real-time filter across name (title), organizer, or venue
  const filteredTimelineEvents = useMemo(() => {
    const q = searchFilter.toLowerCase().trim();
    if (!q) return dateEvents;
    return dateEvents.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.organizer.toLowerCase().includes(q) ||
      e.venue.toLowerCase().includes(q)
    );
  }, [dateEvents, searchFilter]);

  // Category color styling mapping
  const categoryStyles: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    Technical: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
    Workshop: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', dot: 'bg-teal-500' },
    Cultural: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
    Hackathon: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
    Academic: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-600' },
    Sports: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' }
  };

  // Helper to format remaining time
  const formatTimeDifference = (diffMinutes: number) => {
    if (diffMinutes <= 0) return '0m';
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-5">
      {/* Timeline Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>{isViewingToday ? "Today's Schedule Timeline" : "Day Schedule Timeline"}</span>
                {isViewingToday && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Timeline
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {formattedDisplayDate} • {dateEvents.length} session{dateEvents.length === 1 ? '' : 's'} scheduled
              </p>
            </div>
          </div>
        </div>

        {/* Date Selector & Add Action */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Date Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setSelectedDate(todayDateStr)}
              className={`px-2.5 py-1 rounded-md transition-all ${
                isViewingToday
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setSelectedDate('2026-10-26')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedDate === '2026-10-26'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Oct 26
            </button>
            <button
              onClick={() => setSelectedDate('2026-10-27')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedDate === '2026-10-27'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Oct 27
            </button>
            <button
              onClick={() => setSelectedDate('2026-10-28')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedDate === '2026-10-28'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Oct 28
            </button>
          </div>

          <button
            onClick={() => onOpenNewEvent(selectedDate)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Real-time Search Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter timeline by event name, organizer, or venue in real-time..."
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 text-xs md:text-sm bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
          />
          {searchFilter && (
            <button
              onClick={() => setSearchFilter('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
              title="Clear search filter"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Counter indicator */}
        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-mono text-slate-500 shrink-0 px-1">
          {searchFilter ? (
            <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-semibold">
              Showing {filteredTimelineEvents.length} of {dateEvents.length}
            </span>
          ) : (
            <span>{dateEvents.length} session{dateEvents.length === 1 ? '' : 's'} on date</span>
          )}
        </div>
      </div>

      {/* Main Content: Vertical Timeline or Helpful Empty State */}
      {dateEvents.length === 0 ? (
        /* Empty State */
        <div className="py-12 px-4 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 border border-indigo-100">
            <Calendar className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">
            No Events Scheduled for {isViewingToday ? 'Today' : formattedDisplayDate}
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
            There are zero sessions or lab activities currently registered on this date.
            Add an event to begin tracking time progress and venue occupancy.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => onOpenNewEvent(selectedDate)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Event for {isViewingToday ? 'Today' : selectedDate}</span>
            </button>
            {!isViewingToday && (
              <button
                onClick={() => setSelectedDate(todayDateStr)}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium transition-colors"
              >
                Return to Today
              </button>
            )}
          </div>
        </div>
      ) : filteredTimelineEvents.length === 0 ? (
        /* Filter Empty State (when search query matches nothing) */
        <div className="py-10 px-4 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-800">
            No events match "{searchFilter}"
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            No scheduled sessions found matching this name, organizer, or venue for {isViewingToday ? 'today' : formattedDisplayDate}.
          </p>
          <button
            onClick={() => setSearchFilter('')}
            className="mt-3 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-xs transition-colors"
          >
            Clear Search Filter
          </button>
        </div>
      ) : (
        /* Vertical Timeline Track */
        <div className="relative pl-2 sm:pl-4 py-2">
          {/* Continuous Vertical Guide Line */}
          <div
            className="absolute left-[19px] sm:left-[27px] top-4 bottom-4 w-0.5 bg-slate-200"
            aria-hidden="true"
          />

          <div className="space-y-6">
            {filteredTimelineEvents.map((event, index) => {
              const startMin = timeToMinutes(event.startTime);
              const endMin = timeToMinutes(event.endTime);
              const durationMin = endMin - startMin;

              // Temporal Status evaluation based on current local time
              let temporalStatus: 'ongoing' | 'upcoming' | 'completed' = 'upcoming';

              if (isViewingToday) {
                if (currentMinutes >= startMin && currentMinutes < endMin) {
                  temporalStatus = 'ongoing';
                } else if (currentMinutes >= endMin || event.status === 'Completed') {
                  temporalStatus = 'completed';
                } else {
                  temporalStatus = 'upcoming';
                }
              } else if (selectedDate < todayDateStr) {
                temporalStatus = 'completed';
              } else {
                temporalStatus = 'upcoming';
              }

              // Check for venue conflict
              const matchingConflicts = conflicts.filter(
                c => c.eventA.id === event.id || c.eventB.id === event.id
              );
              const hasConflict = matchingConflicts.length > 0;

              const style = categoryStyles[event.category] || {
                bg: 'bg-slate-50',
                text: 'text-slate-700',
                border: 'border-slate-200',
                dot: 'bg-slate-500'
              };

              return (
                <div
                  key={event.id}
                  className="relative flex items-start gap-4 sm:gap-6 group"
                >
                  {/* Timeline Node Column */}
                  <div className="relative z-10 flex items-center justify-center shrink-0 mt-1">
                    {hasConflict ? (
                      /* Conflicted Node */
                      <div
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-amber-50 border-2 border-amber-500 text-amber-600 flex items-center justify-center shadow-xs ring-4 ring-white"
                        title="Venue Overlap Collision Detected"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    ) : temporalStatus === 'ongoing' ? (
                      /* In Progress / Ongoing Node (Glowing & Radiating) */
                      <div className="relative flex items-center justify-center">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30 ring-4 ring-white">
                          <Radio className="w-4 h-4 animate-pulse" />
                        </div>
                        <span className="absolute -inset-1 rounded-full border-2 border-emerald-500 animate-ping opacity-60 pointer-events-none" />
                      </div>
                    ) : temporalStatus === 'completed' ? (
                      /* Completed Node */
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 border-2 border-slate-300 text-slate-500 flex items-center justify-center shadow-2xs ring-4 ring-white">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                    ) : (
                      /* Upcoming Node */
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-indigo-50 border-2 border-indigo-500 text-indigo-600 flex items-center justify-center shadow-2xs ring-4 ring-white">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                      </div>
                    )}
                  </div>

                  {/* Event Detail Card */}
                  <div
                    onClick={() => onSelectEvent(event)}
                    className={`flex-1 rounded-xl border p-4 transition-all duration-200 cursor-pointer ${
                      hasConflict
                        ? 'bg-amber-50/40 border-amber-300 hover:border-amber-400 hover:shadow-md'
                        : temporalStatus === 'ongoing'
                        ? 'bg-gradient-to-r from-emerald-50/50 via-white to-white border-emerald-300 hover:border-emerald-400 hover:shadow-md ring-1 ring-emerald-400/20'
                        : temporalStatus === 'completed'
                        ? 'bg-slate-50/60 border-slate-200 hover:bg-white hover:border-slate-300 hover:shadow-xs'
                        : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'
                    }`}
                  >
                    {/* Card Top Row: Timing, Duration, and Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Time Interval */}
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 font-mono">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {event.startTime} - {event.endTime}
                          </span>
                        </div>

                        {/* Duration Pill */}
                        <span className="text-[11px] font-mono text-slate-500 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                          {durationMin > 0 ? formatTimeDifference(durationMin) : '0m'}
                        </span>

                        {/* Live Temporal Progress Badge */}
                        {isViewingToday && temporalStatus === 'ongoing' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            Happening Now (Ends in {formatTimeDifference(endMin - currentMinutes)})
                          </span>
                        )}

                        {isViewingToday && temporalStatus === 'upcoming' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Starts in {formatTimeDifference(startMin - currentMinutes)}
                          </span>
                        )}

                        {temporalStatus === 'completed' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                            Concluded
                          </span>
                        )}
                      </div>

                      {/* Right Metadata Badges */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          #{event.id}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            event.priority === 'High'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : event.priority === 'Medium'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {event.priority}
                        </span>
                      </div>
                    </div>

                    {/* Event Title */}
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                      {event.title}
                    </h4>

                    {/* Venue & Organizer Details */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-2">
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        {event.venue}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${style.bg} ${style.text} ${style.border}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                        {event.category}
                      </span>
                      <span className="text-slate-300 hidden sm:inline">•</span>
                      <span className="text-slate-500 truncate max-w-xs hidden sm:inline">
                        {event.organizer}
                      </span>
                    </div>

                    {/* Optional Description */}
                    {event.description && (
                      <p className="text-xs text-slate-500 mt-2 line-clamp-1">
                        {event.description}
                      </p>
                    )}

                    {/* Venue Conflict Warning Box */}
                    {hasConflict && (
                      <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-300 flex items-start gap-2 text-xs text-amber-900">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block">
                            Venue Collision Warning:
                          </span>
                          {matchingConflicts.map(c => {
                            const collidingWith = c.eventA.id === event.id ? c.eventB : c.eventA;
                            return (
                              <p key={c.id} className="text-amber-800 mt-0.5">
                                Overlaps with <strong>"{collidingWith.title}"</strong> ({c.overlapStart} - {c.overlapEnd}) at {c.venue}.
                              </p>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
