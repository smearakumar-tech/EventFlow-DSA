import React, { useState, useMemo } from 'react';
import {
  Building2,
  Users,
  Clock,
  AlertTriangle,
  Plus,
  CheckCircle2,
  Calendar,
  Sparkles,
  Search,
  Filter,
  Monitor,
  Mic,
  Wifi,
  ChevronRight,
  Info,
  Maximize2
} from 'lucide-react';
import { EventItem, VenueConflictPair } from '../types/event';
import { VENUE_LIST } from '../utils/sampleData';
import { timeToMinutes } from '../utils/conflictDetector';

interface VenuesViewProps {
  events: EventItem[];
  conflicts: VenueConflictPair[];
  onOpenNewEvent: (prefillDate?: string, prefillVenue?: string) => void;
  onSelectEvent: (event: EventItem) => void;
  onNavigateConflicts: () => void;
}

interface VenueMetadata {
  name: string;
  building: string;
  floor: string;
  capacity: number;
  type: string;
  amenities: string[];
  description: string;
}

export const VENUE_DETAILS: Record<string, VenueMetadata> = {
  'Auditorium A': {
    name: 'Auditorium A',
    building: 'Main Academic Block',
    floor: 'Ground Floor, East Wing',
    capacity: 500,
    type: 'Keynote & Plenary Hall',
    amenities: ['Dual 4K Laser Projection', 'Line-Array PA System', 'Livestream Studio', 'Motorized Stage'],
    description: 'Premier university auditorium equipped for distinguished keynotes, opening ceremonies, and large conferences.'
  },
  'Seminar Hall B': {
    name: 'Seminar Hall B',
    building: 'CS & IT Complex',
    floor: '2nd Floor, Room 204',
    capacity: 150,
    type: 'Symposium & Lecture Hall',
    amenities: ['Ultra-HD Smart Board', 'Lapel & Podium Mics', 'Tiered Acoustic Seating', 'High-Speed Wi-Fi 6'],
    description: 'Tiered acoustic lecture hall designed for technical research presentations, panel discussions, and guest lectures.'
  },
  'Tech Lab 102': {
    name: 'Tech Lab 102',
    building: 'Turing Technology Tower',
    floor: '1st Floor, Room 102',
    capacity: 60,
    type: 'Workstation Laboratory',
    amenities: ['60 Dual-Monitor Workstations', 'Gigabit Ethernet', 'Isolated Server Rack', 'Smart Whiteboard'],
    description: 'Hands-on computing laboratory configured for cloud architecture workshops, coding bootcamps, and competitive sprints.'
  },
  'Innovation Hub': {
    name: 'Innovation Hub',
    building: 'Student Activity & Research Centre',
    floor: '3rd Floor Open Atrium',
    capacity: 120,
    type: 'Makerspace & Hackathon Bay',
    amenities: ['Modular Workbench Pods', 'Continuous 24/7 Power Backup', 'Rapid Prototyping Tools', 'Breakout Lounge'],
    description: 'Collaborative, flexible hackathon and incubation space with reconfigurable pods and high-density power outlets.'
  },
  'Amphitheatre': {
    name: 'Amphitheatre',
    building: 'Central Campus Quadrangle',
    floor: 'Open-Air Plaza',
    capacity: 400,
    type: 'Outdoor Cultural Pavilion',
    amenities: ['Natural Stone Stepped Seating', 'Stage Floodlighting', 'Weather-Resistant Sound System', 'Green Room'],
    description: 'Picturesque open-air venue ideal for cultural galas, acoustic musical performances, and evening symposium social mixers.'
  },
  'Main Sports Complex': {
    name: 'Main Sports Complex',
    building: 'University Athletic Arena',
    floor: 'Indoor Arena & Field',
    capacity: 600,
    type: 'Multi-Sport Indoor Arena',
    amenities: ['Hardwood Court', 'Electronic Scoreboard', 'Spectator Bleachers', 'First Aid Station'],
    description: 'Full-size multipurpose sports arena hosting inter-collegiate esports, campus tournaments, and university sports meets.'
  }
};

export const VenuesView: React.FC<VenuesViewProps> = ({
  events,
  conflicts,
  onOpenNewEvent,
  onSelectEvent,
  onNavigateConflicts
}) => {
  // Date selector for utilization (defaults to symposium date or current day)
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-26');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedVenueModal, setSelectedVenueModal] = useState<string | null>(null);

  // Available dates in event dataset
  const availableDates = useMemo(() => {
    const dates = Array.from(new Set(events.map(e => e.date))).sort();
    if (!dates.includes('2026-10-26')) dates.unshift('2026-10-26');
    return dates;
  }, [events]);

  // Venue analytics calculation
  const venueStats = useMemo(() => {
    const OPERATIONAL_MINUTES = 720; // 12-hour day (08:00 - 20:00)

    return VENUE_LIST.map(venueName => {
      const meta = VENUE_DETAILS[venueName] || {
        name: venueName,
        building: 'Campus Building',
        floor: 'Level 1',
        capacity: 100,
        type: 'General Venue',
        amenities: ['Projector', 'Wi-Fi'],
        description: 'Multi-purpose campus scheduling venue.'
      };

      // Events in this venue on selected date
      const dateEvents = events
        .filter(e => e.venue === venueName && e.date === selectedDate && e.status !== 'Cancelled')
        .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

      // Non-overlapping interval merging for strict utilization
      const rawIntervals: Array<[number, number]> = dateEvents
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

      // Check conflicts for this venue and date
      const venueConflicts = conflicts.filter(
        c => c.venue === venueName && c.date === selectedDate
      );

      // Total lifetime events in this venue
      const totalLifetimeEvents = events.filter(e => e.venue === venueName).length;

      return {
        ...meta,
        dateEvents,
        bookedMinutes,
        bookedHours: (bookedMinutes / 60).toFixed(1),
        bookedPercentage,
        conflicts: venueConflicts,
        hasConflict: venueConflicts.length > 0,
        totalLifetimeEvents
      };
    });
  }, [events, conflicts, selectedDate]);

  // Filtered venue stats
  const filteredVenues = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return venueStats;
    return venueStats.filter(
      v =>
        v.name.toLowerCase().includes(q) ||
        v.building.toLowerCase().includes(q) ||
        v.type.toLowerCase().includes(q) ||
        v.amenities.some(a => a.toLowerCase().includes(q))
    );
  }, [venueStats, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Building2 className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">Campus Venues & Facilities</h2>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-xl">
            Real-time venue occupancy tracking, equipment specifications, and interval conflict monitoring across all campus halls.
          </p>
        </div>

        {/* Date Selector & Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold text-slate-600">Inspection Date:</span>
            <select
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-transparent font-bold text-slate-900 focus:outline-hidden"
            >
              {availableDates.map(d => (
                <option key={d} value={d}>
                  {d} {d === '2026-10-26' ? '(Symposium Day 1)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search venues..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <button
            onClick={() => onOpenNewEvent(selectedDate)}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Book Venue</span>
          </button>
        </div>
      </div>

      {/* Conflicts Alert Banner if any conflict on selected date */}
      {conflicts.filter(c => c.date === selectedDate).length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Venue Overlap Alert:</strong> There are active double-bookings detected on {selectedDate}.
            </span>
          </div>
          <button
            onClick={onNavigateConflicts}
            className="px-3 py-1 bg-amber-200/80 hover:bg-amber-300 text-amber-900 font-bold rounded-md transition-colors"
          >
            View Conflicts & Resolutions
          </button>
        </div>
      )}

      {/* Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVenues.map(venue => {
          return (
            <div
              key={venue.name}
              className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${
                venue.hasConflict
                  ? 'border-amber-300 bg-amber-50/15'
                  : 'border-slate-200/80 hover:border-indigo-300'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">{venue.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{venue.type}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      venue.hasConflict
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : venue.bookedPercentage > 75
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : venue.bookedPercentage > 0
                        ? 'bg-teal-50 text-teal-700 border-teal-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {venue.hasConflict
                      ? 'Conflict Alert'
                      : venue.bookedPercentage > 0
                      ? `${venue.bookedPercentage}% Booked`
                      : 'Available'}
                  </span>
                </div>

                {/* Building & Specs */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Cap: <strong>{venue.capacity}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-500" />
                    <span>Booked: <strong>{venue.bookedHours} hrs</strong></span>
                  </div>
                  <div className="col-span-2 text-[11px] text-slate-500 truncate">
                    {venue.building} • {venue.floor}
                  </div>
                </div>

                {/* Utilization Progress Bar */}
                <div className="mt-4 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-slate-500">Day Utilization (08:00–20:00)</span>
                    <span className="font-mono font-bold text-slate-800">{venue.bookedPercentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        venue.hasConflict
                          ? 'bg-amber-500'
                          : venue.bookedPercentage > 75
                          ? 'bg-purple-600'
                          : 'bg-teal-500'
                      }`}
                      style={{ width: `${venue.bookedPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Scheduled Events on Selected Date */}
                <div className="mt-4 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Schedule for {selectedDate} ({venue.dateEvents.length})
                  </div>
                  {venue.dateEvents.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">
                      No sessions scheduled for this date.
                    </p>
                  ) : (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {venue.dateEvents.map(ev => {
                        const isConflictEvent = venue.conflicts.some(
                          c => c.eventA.id === ev.id || c.eventB.id === ev.id
                        );
                        return (
                          <div
                            key={ev.id}
                            onClick={() => onSelectEvent(ev)}
                            className={`p-2 rounded-lg border text-xs cursor-pointer transition-colors flex items-center justify-between gap-2 ${
                              isConflictEvent
                                ? 'bg-amber-100/70 border-amber-300 text-amber-950 font-semibold'
                                : 'bg-slate-50 hover:bg-indigo-50/50 border-slate-200 text-slate-800'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="truncate font-medium">{ev.title}</div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {ev.startTime} – {ev.endTime}
                              </div>
                            </div>
                            {isConflictEvent && (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Amenities Tags */}
                <div className="mt-4 flex flex-wrap gap-1">
                  {venue.amenities.map(am => (
                    <span
                      key={am}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/60"
                    >
                      {am}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {venue.totalLifetimeEvents} total bookings
                </span>
                <button
                  onClick={() => onOpenNewEvent(selectedDate, venue.name)}
                  className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Book Slot</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
