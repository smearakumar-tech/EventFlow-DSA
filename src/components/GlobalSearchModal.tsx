import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Calendar,
  Clock,
  MapPin,
  Tag,
  AlertTriangle,
  ArrowRight,
  Filter,
  Layers,
  Sparkles
} from 'lucide-react';
import { EventItem, VenueConflictPair, EventCategory } from '../types/event';
import { CATEGORY_LIST, VENUE_LIST } from '../utils/sampleData';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: EventItem[];
  conflicts: VenueConflictPair[];
  onSelectEvent: (event: EventItem) => void;
  onNavigateConflicts?: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  events,
  conflicts,
  onSelectEvent,
  onNavigateConflicts
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedVenue, setSelectedVenue] = useState<string>('ALL');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setSelectedCategory('ALL');
      setSelectedVenue('ALL');
    }
  }, [isOpen]);

  // Keyboard shortcut listener for Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered results
  const filteredResults = useMemo(() => {
    const q = query.toLowerCase().trim();

    return events.filter(e => {
      // Category filter
      if (selectedCategory !== 'ALL' && e.category !== selectedCategory) {
        return false;
      }

      // Venue filter
      if (selectedVenue !== 'ALL' && e.venue !== selectedVenue) {
        return false;
      }

      // Search query across ID, Title, Venue, Organizer, Description, Category
      if (!q) return true;

      const idMatch = String(e.id).includes(q.replace('#', ''));
      const titleMatch = e.title.toLowerCase().includes(q);
      const venueMatch = e.venue.toLowerCase().includes(q);
      const organizerMatch = e.organizer.toLowerCase().includes(q);
      const categoryMatch = e.category.toLowerCase().includes(q);
      const descMatch = e.description.toLowerCase().includes(q);

      return idMatch || titleMatch || venueMatch || organizerMatch || categoryMatch || descMatch;
    }).sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
  }, [events, query, selectedCategory, selectedVenue]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-12 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Input Bar */}
        <div className="p-4 border-b border-slate-200/80 bg-slate-50/50 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search events by title, ID (e.g. 104), venue, organizer, or topic..."
            className="w-full bg-transparent text-sm md:text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-slate-200/60 rounded border border-slate-300">
            ESC
          </kbd>
        </div>

        {/* Filter Chips Bar */}
        <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-semibold mr-1 text-[11px] uppercase tracking-wider">
            Filter:
          </span>

          {/* Category Chips */}
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              selectedCategory === 'ALL'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {CATEGORY_LIST.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(prev => (prev === cat ? 'ALL' : cat))}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}

          {/* Venue Dropdown */}
          <select
            value={selectedVenue}
            onChange={e => setSelectedVenue(e.target.value)}
            className="ml-auto px-2 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 focus:outline-hidden"
          >
            <option value="ALL">All Venues</option>
            {VENUE_LIST.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-slate-100">
          {filteredResults.length === 0 ? (
            <div className="py-16 text-center">
              <Search className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800">No matching events found</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No scheduled sessions matched "{query}". Try checking for spelling errors, clearing category filters, or searching by venue.
              </p>
              {(query || selectedCategory !== 'ALL' || selectedVenue !== 'ALL') && (
                <button
                  onClick={() => {
                    setQuery('');
                    setSelectedCategory('ALL');
                    setSelectedVenue('ALL');
                  }}
                  className="mt-3.5 px-3.5 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition-colors"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          ) : (
            filteredResults.map(ev => {
              const hasConflict = conflicts.some(c => c.eventA.id === ev.id || c.eventB.id === ev.id);

              return (
                <div
                  key={ev.id}
                  onClick={() => {
                    onSelectEvent(ev);
                    onClose();
                  }}
                  className="pt-2.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl hover:bg-indigo-50/50 cursor-pointer transition-colors group border border-transparent hover:border-indigo-200"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="text-center px-2 py-1 bg-slate-100 rounded-lg shrink-0 border border-slate-200 font-mono">
                      <span className="text-[10px] text-slate-500 font-semibold block">ID</span>
                      <span className="text-xs font-bold text-indigo-700 block">#{ev.id}</span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                          {ev.title}
                        </h5>
                        {hasConflict && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                            Conflict
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1 font-mono text-slate-700">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {ev.date}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-slate-700">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {ev.startTime} - {ev.endTime}
                        </span>
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <MapPin className="w-3 h-3 text-indigo-500" />
                          {ev.venue}
                        </span>
                        <span className="text-slate-400 hidden md:inline">•</span>
                        <span className="text-slate-500 truncate max-w-[140px] hidden md:inline">
                          {ev.organizer}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {ev.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        ev.priority === 'High'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : ev.priority === 'Medium'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {ev.priority}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors hidden sm:block ml-1" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>{filteredResults.length} of {events.length} sessions matched</span>
          <span>Click any session to inspect or edit</span>
        </div>
      </div>
    </div>
  );
};
