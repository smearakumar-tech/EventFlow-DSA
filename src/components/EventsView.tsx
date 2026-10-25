import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Table as TableIcon,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Clock,
  MapPin,
  Tag,
  AlertTriangle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle,
  X
} from 'lucide-react';
import { EventItem, EventCategory, EventPriority, EventStatus, VenueConflictPair } from '../types/event';
import { CATEGORY_LIST, VENUE_LIST } from '../utils/sampleData';
import { timeToMinutes } from '../utils/conflictDetector';

interface EventsViewProps {
  events: EventItem[];
  conflicts: VenueConflictPair[];
  onOpenNewEvent: () => void;
  onEditEvent: (event: EventItem) => void;
  onDeleteEvent: (event: EventItem) => void;
}

export const EventsView: React.FC<EventsViewProps> = ({
  events,
  conflicts,
  onOpenNewEvent,
  onEditEvent,
  onDeleteEvent
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [venueFilter, setVenueFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Sorting state
  const [sortField, setSortField] = useState<keyof EventItem>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Calendar month state (defaults to October 2026 based on symposium schedule)
  const [calendarYear, setCalendarYear] = useState(2026);
  const [calendarMonth, setCalendarMonth] = useState(9); // 0-indexed: 9 = October

  // Detailed event inspection modal
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  const handleSort = (field: keyof EventItem) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.organizer.toLowerCase().includes(q) ||
        String(e.id) === q;

      if (!matchSearch) return false;

      // Category filter
      if (categoryFilter !== 'ALL' && e.category !== categoryFilter) return false;

      // Venue filter
      if (venueFilter !== 'ALL' && e.venue !== venueFilter) return false;

      // Priority filter
      if (priorityFilter !== 'ALL' && e.priority !== priorityFilter) return false;

      // Status filter
      if (statusFilter !== 'ALL' && e.status !== statusFilter) return false;

      return true;
    }).sort((a, b) => {
      let diff = 0;
      if (sortField === 'id') {
        diff = a.id - b.id;
      } else if (sortField === 'title') {
        diff = a.title.localeCompare(b.title);
      } else if (sortField === 'date') {
        diff = a.date.localeCompare(b.date);
        if (diff === 0) {
          diff = timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
        }
      } else if (sortField === 'startTime') {
        diff = timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
      } else if (sortField === 'venue') {
        diff = a.venue.localeCompare(b.venue);
      } else if (sortField === 'category') {
        diff = a.category.localeCompare(b.category);
      } else if (sortField === 'priority') {
        const pOrder: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
        diff = (pOrder[a.priority] || 0) - (pOrder[b.priority] || 0);
      } else if (sortField === 'status') {
        diff = a.status.localeCompare(b.status);
      }
      return sortDirection === 'asc' ? diff : -diff;
    });
  }, [events, searchQuery, categoryFilter, venueFilter, priorityFilter, statusFilter, sortField, sortDirection]);

  // Calendar day calculation
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1).getDay(); // 0 = Sun
    const totalDaysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();

    const days: Array<{ dayNumber: number; dateString: string; events: EventItem[] }> = [];

    // Preceding empty slots
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ dayNumber: 0, dateString: '', events: [] });
    }

    // Days in current month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const monthStr = (calendarMonth + 1).toString().padStart(2, '0');
      const dayStr = d.toString().padStart(2, '0');
      const dateString = `${calendarYear}-${monthStr}-${dayStr}`;

      const matchedEvents = events.filter(e => e.date === dateString);
      days.push({
        dayNumber: d,
        dateString,
        events: matchedEvents
      });
    }

    return days;
  }, [calendarYear, calendarMonth, events]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(y => y - 1);
    } else {
      setCalendarMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(y => y + 1);
    } else {
      setCalendarMonth(m => m + 1);
    }
  };

  const categoryStyles: Record<string, { bg: string; text: string; dot: string }> = {
    Technical: { bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700', dot: 'bg-indigo-500' },
    Workshop: { bg: 'bg-teal-50 border-teal-200', text: 'text-teal-700', dot: 'bg-teal-500' },
    Cultural: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', dot: 'bg-purple-500' },
    Hackathon: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
    Academic: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', dot: 'bg-blue-600' },
    Sports: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Controls Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, venue, organizer, or ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs md:text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View Switcher & Action */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              Table View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              Calendar View
            </button>
          </div>

          <button
            onClick={onOpenNewEvent}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs md:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-xs flex flex-wrap items-center gap-2.5 text-xs">
        <div className="flex items-center gap-1 text-slate-500 font-semibold uppercase text-[11px] mr-1">
          <Filter className="w-3.5 h-3.5 text-indigo-600" />
          <span>Filters:</span>
        </div>

        {/* Category */}
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-hidden"
        >
          <option value="ALL">All Categories</option>
          {CATEGORY_LIST.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Venue */}
        <select
          value={venueFilter}
          onChange={e => setVenueFilter(e.target.value)}
          className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-hidden"
        >
          <option value="ALL">All Venues</option>
          {VENUE_LIST.map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>

        {/* Priority */}
        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-hidden"
        >
          <option value="ALL">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-hidden"
        >
          <option value="ALL">All Statuses</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        {(categoryFilter !== 'ALL' || venueFilter !== 'ALL' || priorityFilter !== 'ALL' || statusFilter !== 'ALL' || searchQuery) && (
          <button
            onClick={() => {
              setCategoryFilter('ALL');
              setVenueFilter('ALL');
              setPriorityFilter('ALL');
              setStatusFilter('ALL');
              setSearchQuery('');
            }}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-2 py-1 underline"
          >
            Reset Filters
          </button>
        )}

        <div className="ml-auto text-slate-500 font-mono text-[11px]">
          Showing {filteredEvents.length} of {events.length} records
        </div>
      </div>

      {/* Main Content: Table or Calendar */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-semibold select-none">
                  <th
                    onClick={() => handleSort('id')}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors w-20"
                  >
                    <div className="flex items-center gap-1">
                      <span>ID</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('title')}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Event Title</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('date')}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Date & Time</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('venue')}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Venue</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('category')}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Category</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('priority')}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors w-24"
                  >
                    <div className="flex items-center gap-1">
                      <span>Priority</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('status')}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors w-24"
                  >
                    <div className="flex items-center gap-1">
                      <span>Status</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <CalendarIcon className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">No events match your criteria</p>
                      <p className="text-xs text-slate-400 mt-1">Try clearing search queries or adjusting filters.</p>
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map(item => {
                    const hasConflict = conflicts.some(c => c.eventA.id === item.id || c.eventB.id === item.id);
                    const style = categoryStyles[item.category] || { bg: 'bg-slate-50', text: 'text-slate-700', dot: 'bg-slate-400' };

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          hasConflict ? 'bg-amber-50/30' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">
                          #{item.id}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              onClick={() => setSelectedEvent(item)}
                              className="font-bold text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors"
                            >
                              {item.title}
                            </span>
                            {hasConflict && (
                              <span
                                title="Venue Conflict Detected"
                                className="p-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center"
                              >
                                <AlertTriangle className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 block truncate max-w-xs mt-0.5">
                            {item.organizer}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                          <div className="font-medium">{item.date}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {item.startTime} - {item.endTime}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          <span className="flex items-center gap-1 whitespace-nowrap">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {item.venue}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style.bg} ${style.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase ${
                              item.priority === 'High'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : item.priority === 'Medium'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {item.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                              item.status === 'Upcoming'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : item.status === 'Ongoing'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse'
                                : item.status === 'Completed'
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-red-50 text-red-600'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setSelectedEvent(item)}
                              title="View Event Details"
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                            >
                              <Info className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onEditEvent(item)}
                              title="Edit Event"
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteEvent(item)}
                              title="Delete Event"
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Calendar View */
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                {monthNames[calendarMonth]} {calendarYear}
              </h3>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={handlePrevMonth}
                className="p-1 text-slate-600 hover:text-slate-900 rounded-md hover:bg-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setCalendarYear(2026);
                  setCalendarMonth(9);
                }}
                className="px-2 py-0.5 text-xs font-semibold text-slate-700 hover:bg-white rounded-md transition-colors"
              >
                Symposium (Oct 2026)
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1 text-slate-600 hover:text-slate-900 rounded-md hover:bg-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((cell, idx) => {
              if (cell.dayNumber === 0) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="min-h-[100px] bg-slate-50/50 rounded-lg border border-slate-100"
                  />
                );
              }

              const hasConflict = cell.events.some(e =>
                conflicts.some(c => c.eventA.id === e.id || c.eventB.id === e.id)
              );

              return (
                <div
                  key={`day-${cell.dayNumber}`}
                  className={`min-h-[110px] p-2 rounded-xl border transition-all flex flex-col justify-between ${
                    cell.events.length > 0
                      ? 'bg-white border-slate-200 hover:border-indigo-300 shadow-2xs'
                      : 'bg-white/60 border-slate-100'
                  } ${hasConflict ? 'border-amber-300 bg-amber-50/20' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-extrabold px-1.5 py-0.5 rounded-md ${
                        cell.events.length > 0
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>
                    {cell.events.length > 0 && (
                      <span className="text-[10px] font-mono text-slate-500 font-bold">
                        {cell.events.length} ev
                      </span>
                    )}
                  </div>

                  {/* Day Events Stack */}
                  <div className="mt-1.5 space-y-1 flex-1 overflow-y-auto max-h-[85px]">
                    {cell.events.map(ev => {
                      const isConflicted = conflicts.some(c => c.eventA.id === ev.id || c.eventB.id === ev.id);
                      return (
                        <div
                          key={ev.id}
                          onClick={() => setSelectedEvent(ev)}
                          className={`text-[10px] font-semibold px-1.5 py-1 rounded border truncate cursor-pointer transition-transform hover:scale-[1.02] ${
                            isConflicted
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                          }`}
                          title={`${ev.title} (${ev.startTime}-${ev.endTime} @ ${ev.venue})`}
                        >
                          <span className="font-mono">#{ev.id}</span> {ev.title}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      ID #{selectedEvent.id}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {selectedEvent.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-2">
                    {selectedEvent.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                {selectedEvent.description || 'No detailed description provided.'}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block font-medium">Date & Time</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">
                    {selectedEvent.date}
                  </span>
                  <span className="text-indigo-600 font-mono text-[11px]">
                    {selectedEvent.startTime} - {selectedEvent.endTime}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block font-medium">Venue Location</span>
                  <span className="font-bold text-slate-800 mt-0.5 block truncate">
                    {selectedEvent.venue}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Max Cap: {selectedEvent.maxParticipants || 100}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block font-medium">Organizing Body</span>
                  <span className="font-bold text-slate-800 mt-0.5 block truncate">
                    {selectedEvent.organizer}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block font-medium">Priority & Status</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-bold text-slate-800">{selectedEvent.priority}</span>
                    <span>•</span>
                    <span className="font-medium text-indigo-600">{selectedEvent.status}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  const ev = selectedEvent;
                  setSelectedEvent(null);
                  onDeleteEvent(ev);
                }}
                className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const ev = selectedEvent;
                    setSelectedEvent(null);
                    onEditEvent(ev);
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
