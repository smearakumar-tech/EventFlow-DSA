import React from 'react';
import {
  AlertTriangle,
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Edit2,
  MoveRight
} from 'lucide-react';
import { EventItem, VenueConflictPair } from '../types/event';
import { timeToMinutes, minutesToTime } from '../utils/conflictDetector';
import { VENUE_LIST } from '../utils/sampleData';

interface ConflictsViewProps {
  conflicts: VenueConflictPair[];
  allEvents: EventItem[];
  onUpdateEvent: (updated: EventItem) => void;
  onEditEvent: (event: EventItem) => void;
}

export const ConflictsView: React.FC<ConflictsViewProps> = ({
  conflicts,
  allEvents,
  onUpdateEvent,
  onEditEvent
}) => {
  // Quick resolution: Shift event B end and start by overlapMinutes or 60 min
  const handleShiftEventB = (conflict: VenueConflictPair) => {
    const shiftMinutes = Math.max(30, conflict.overlapMinutes);
    const origStartMin = timeToMinutes(conflict.eventB.startTime);
    const origEndMin = timeToMinutes(conflict.eventB.endTime);
    const duration = origEndMin - origStartMin;

    const newStartMin = timeToMinutes(conflict.eventA.endTime) + 15; // 15 min buffer after event A
    const newEndMin = newStartMin + duration;

    const updated: EventItem = {
      ...conflict.eventB,
      startTime: minutesToTime(newStartMin),
      endTime: minutesToTime(newEndMin)
    };
    onUpdateEvent(updated);
  };

  // Quick resolution: Reassign event B to alternate venue
  const handleReassignVenue = (conflict: VenueConflictPair) => {
    const alternate = VENUE_LIST.find(v => v !== conflict.venue) || 'Tech Lab 102';
    const updated: EventItem = {
      ...conflict.eventB,
      venue: alternate
    };
    onUpdateEvent(updated);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Educational Banner */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Interval Overlap Collision Detection
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              In scheduling theory, two events $E_A$ and $E_B$ generate a spatial-temporal conflict if and only if:
            </p>
            <div className="mt-2.5 inline-block bg-slate-900 text-slate-200 px-3.5 py-1.5 rounded-lg font-mono text-xs shadow-xs">
              <code>Venue(A) == Venue(B) &amp;&amp; Date(A) == Date(B) &amp;&amp; (Start(A) &lt; End(B) &amp;&amp; End(A) &gt; Start(B))</code>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Boundary equality (where Event A finishes at the exact same minute Event B starts) is non-overlapping and permitted.
            </p>
          </div>
        </div>
      </div>

      {/* Main Conflict List or Clean State */}
      {conflicts.length === 0 ? (
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-8 text-center max-w-2xl mx-auto shadow-xs">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-extrabold text-emerald-950">
            Zero Venue Conflicts Detected!
          </h3>
          <p className="text-xs text-emerald-800 mt-1 max-w-md mx-auto">
            All {allEvents.length} scheduled events are cleanly partitioned across their respective halls and time slots with zero spatial overlap.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-emerald-800 text-xs font-semibold border border-emerald-200 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Optimal Schedule Validation Invariant Satisfied</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Active Conflicts ({conflicts.length})
            </h3>
            <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 font-semibold">
              Requires Organizer Resolution
            </span>
          </div>

          {conflicts.map((c, idx) => {
            // Timeline calculation: map from 08:00 (480m) to 20:00 (1200m)
            const baseStart = 8 * 60; // 08:00
            const baseTotal = 12 * 60; // 12 hours window

            const startAMin = timeToMinutes(c.eventA.startTime);
            const endAMin = timeToMinutes(c.eventA.endTime);
            const startBMin = timeToMinutes(c.eventB.startTime);
            const endBMin = timeToMinutes(c.eventB.endTime);

            const leftAPct = Math.max(0, Math.min(100, ((startAMin - baseStart) / baseTotal) * 100));
            const widthAPct = Math.max(2, Math.min(100 - leftAPct, ((endAMin - startAMin) / baseTotal) * 100));

            const leftBPct = Math.max(0, Math.min(100, ((startBMin - baseStart) / baseTotal) * 100));
            const widthBPct = Math.max(2, Math.min(100 - leftBPct, ((endBMin - startBMin) / baseTotal) * 100));

            const overlapStartMin = Math.max(startAMin, startBMin);
            const overlapEndMin = Math.min(endAMin, endBMin);
            const leftOverlapPct = Math.max(0, Math.min(100, ((overlapStartMin - baseStart) / baseTotal) * 100));
            const widthOverlapPct = Math.max(1, Math.min(100 - leftOverlapPct, ((overlapEndMin - overlapStartMin) / baseTotal) * 100));

            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl border-2 border-amber-300 shadow-sm overflow-hidden"
              >
                {/* Header Tag */}
                <div className="bg-amber-50 px-6 py-3 border-b border-amber-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-500 text-white">
                      <AlertTriangle className="w-4 h-4" />
                    </span>
                    <span className="font-bold text-amber-950 text-sm">
                      Conflict #{idx + 1}: {c.venue}
                    </span>
                    <span className="text-xs text-amber-800 font-medium">
                      on {c.date}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-red-600 bg-red-100/80 px-2.5 py-0.5 rounded-full border border-red-200">
                    {c.overlapMinutes} Minutes Overlap ({c.overlapStart} - {c.overlapEnd})
                  </span>
                </div>

                {/* Event Comparison Cards */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Event A */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-indigo-600">
                          Primary Event #{c.eventA.id}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                          {c.eventA.category}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{c.eventA.title}</h4>
                      <div className="text-xs text-slate-600 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold">{c.eventA.startTime} - {c.eventA.endTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.eventA.venue}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Organizer: {c.eventA.organizer}
                        </div>
                      </div>
                      <button
                        onClick={() => onEditEvent(c.eventA)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 pt-1"
                      >
                        <Edit2 className="w-3 h-3" /> Edit Schedule
                      </button>
                    </div>

                    {/* Event B */}
                    <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-amber-700">
                          Colliding Event #{c.eventB.id}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          {c.eventB.category}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{c.eventB.title}</h4>
                      <div className="text-xs text-slate-600 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span className="font-semibold text-amber-900">{c.eventB.startTime} - {c.eventB.endTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.eventB.venue}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Organizer: {c.eventB.organizer}
                        </div>
                      </div>
                      <button
                        onClick={() => onEditEvent(c.eventB)}
                        className="text-xs text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1 pt-1"
                      >
                        <Edit2 className="w-3 h-3" /> Edit Schedule
                      </button>
                    </div>
                  </div>

                  {/* Visual 24-Hour / Day Timeline Chart */}
                  <div className="mt-6 p-4 bg-slate-950 text-white rounded-xl space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Timeline Visualizer (08:00 - 20:00)</span>
                      <span className="font-mono text-amber-400">
                        Overlap Window: {c.overlapStart} - {c.overlapEnd}
                      </span>
                    </div>

                    <div className="relative h-12 bg-slate-900 rounded-lg p-1 border border-slate-800">
                      {/* Event A Bar */}
                      <div
                        className="absolute top-1 h-4 bg-indigo-500 rounded text-[9px] font-mono font-bold px-1.5 truncate text-white z-10 flex items-center shadow-xs"
                        style={{ left: `${leftAPct}%`, width: `${widthAPct}%` }}
                        title={`${c.eventA.title} (${c.eventA.startTime}-${c.eventA.endTime})`}
                      >
                        #{c.eventA.id}
                      </div>

                      {/* Event B Bar */}
                      <div
                        className="absolute bottom-1 h-4 bg-amber-500 rounded text-[9px] font-mono font-bold px-1.5 truncate text-white z-10 flex items-center shadow-xs"
                        style={{ left: `${leftBPct}%`, width: `${widthBPct}%` }}
                        title={`${c.eventB.title} (${c.eventB.startTime}-${c.eventB.endTime})`}
                      >
                        #{c.eventB.id}
                      </div>

                      {/* Overlap Highlight Strip */}
                      <div
                        className="absolute top-0 bottom-0 bg-red-500/40 border-x-2 border-red-500 z-20 pointer-events-none"
                        style={{ left: `${leftOverlapPct}%`, width: `${widthOverlapPct}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>08:00</span>
                      <span>11:00</span>
                      <span>14:00</span>
                      <span>17:00</span>
                      <span>20:00</span>
                    </div>
                  </div>

                  {/* Root-Cause Explanation & One-Click Recommendations */}
                  <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="text-xs text-slate-700 max-w-xl">
                      <span className="font-bold text-slate-900 block mb-0.5">Automated Resolution Advisor:</span>
                      {c.explanation}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleShiftEventB(c)}
                        className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:border-indigo-500 hover:text-indigo-600 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                      >
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        Shift Time After #{c.eventA.id}
                      </button>
                      <button
                        onClick={() => handleReassignVenue(c)}
                        className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        Reassign Venue
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
