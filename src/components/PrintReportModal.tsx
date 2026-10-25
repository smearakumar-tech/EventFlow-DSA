import React from 'react';
import {
  Printer,
  X,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Building2,
  FileText,
  Download
} from 'lucide-react';
import { EventItem, VenueConflictPair } from '../types/event';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: EventItem[];
  conflicts: VenueConflictPair[];
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  events,
  conflicts
}) => {
  if (!isOpen) return null;

  const sortedEvents = [...events].sort((a, b) =>
    a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)
  );

  const handlePrint = () => {
    window.print();
  };

  const generatedDate = new Date().toLocaleString(undefined, {
    dateStyle: 'full',
    timeStyle: 'short'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh] print-modal-container">
        {/* Action Header - Hidden when printing */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm md:text-base">
              Professional Schedule Report &amp; PDF Generator
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
              title="Download or Print PDF Document"
            >
              <Download className="w-4 h-4 text-indigo-200" />
              <span>Download Professional PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors hidden sm:flex"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-slate-900 print:p-0 print:overflow-visible">
          {/* Header Banner */}
          <div className="border-b-2 border-slate-900 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                  EventFlow Schedule Summary Report
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                  Master Event Itinerary &amp; Venue Allocation Log
                </p>
              </div>
              <div className="text-right text-xs font-mono text-slate-500">
                <div>Generated: {generatedDate}</div>
                <div>Status: Verified In-Memory Dataset</div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-4 gap-3 text-xs border border-slate-300 rounded-lg p-3 bg-slate-50 print:bg-transparent">
            <div>
              <span className="text-slate-500 block">Total Scheduled</span>
              <span className="text-base font-bold text-slate-900 font-mono">{events.length} Events</span>
            </div>
            <div>
              <span className="text-slate-500 block">Venue Overlaps</span>
              <span className={`text-base font-bold font-mono ${conflicts.length > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                {conflicts.length} {conflicts.length === 1 ? 'Conflict' : 'Conflicts'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Unique Dates</span>
              <span className="text-base font-bold text-slate-900 font-mono">
                {new Set(events.map(e => e.date)).size} Calendar Days
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Unique Venues</span>
              <span className="text-base font-bold text-slate-900 font-mono">
                {new Set(events.map(e => e.venue)).size} Halls
              </span>
            </div>
          </div>

          {/* Conflict Warning Disclaimers if any */}
          {conflicts.length > 0 && (
            <div className="p-3 border border-amber-300 rounded-lg bg-amber-50 text-xs text-amber-900 space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Attention: Active Venue Overlaps Pending Resolution
              </span>
              {conflicts.map(c => (
                <p key={c.id} className="text-amber-800 text-[11px]">
                  • #{c.eventA.id} "{c.eventA.title}" collides with #{c.eventB.id} "{c.eventB.title}" in {c.venue} on {c.date} ({c.overlapStart} - {c.overlapEnd}).
                </p>
              ))}
            </div>
          )}

          {/* Chronological Event Schedule Table */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-2">
              Chronological Session Itinerary
            </h4>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-slate-800 bg-slate-100 text-slate-800 font-bold">
                  <th className="py-2 px-2 w-12">ID</th>
                  <th className="py-2 px-2 w-24">Date</th>
                  <th className="py-2 px-2 w-28">Time</th>
                  <th className="py-2 px-2">Event Title</th>
                  <th className="py-2 px-2 w-32">Venue</th>
                  <th className="py-2 px-2 w-24">Category</th>
                  <th className="py-2 px-2 w-28">Organizer</th>
                  <th className="py-2 px-2 w-16 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sortedEvents.map(e => {
                  const hasConflict = conflicts.some(c => c.eventA.id === e.id || c.eventB.id === e.id);
                  return (
                    <tr key={e.id} className={hasConflict ? 'bg-amber-50/50' : ''}>
                      <td className="py-1.5 px-2 font-mono font-bold text-slate-700">#{e.id}</td>
                      <td className="py-1.5 px-2 font-mono">{e.date}</td>
                      <td className="py-1.5 px-2 font-mono">{e.startTime} - {e.endTime}</td>
                      <td className="py-1.5 px-2 font-semibold text-slate-900">
                        {e.title}
                        {hasConflict && <span className="ml-1 text-red-600 font-bold">[CONFLICT]</span>}
                      </td>
                      <td className="py-1.5 px-2 text-slate-700">{e.venue}</td>
                      <td className="py-1.5 px-2 text-slate-600">{e.category}</td>
                      <td className="py-1.5 px-2 text-slate-500 truncate max-w-[120px]">{e.organizer}</td>
                      <td className="py-1.5 px-2 text-right font-medium">{e.status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Signature & Verification Block */}
          <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs text-slate-600">
            <div>
              <p className="font-semibold text-slate-800">Event Coordinator Sign-Off:</p>
              <div className="mt-8 border-b border-slate-400 w-48"></div>
              <p className="text-[10px] text-slate-400 mt-1">Signature &amp; Date</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-800">Venue Operations Approval:</p>
              <div className="mt-8 border-b border-slate-400 w-48 ml-auto"></div>
              <p className="text-[10px] text-slate-400 mt-1">Authorized Seal &amp; Date</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
