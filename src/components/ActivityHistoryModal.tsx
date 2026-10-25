import React, { useState } from 'react';
import {
  History,
  X,
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle,
  RotateCcw,
  Info,
  Clock,
  Filter,
  ShieldAlert
} from 'lucide-react';
import { ActivityLogItem, ActivityActionType } from '../types/event';

interface ActivityHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ActivityLogItem[];
  onClearHistory: () => void;
}

export const ActivityHistoryModal: React.FC<ActivityHistoryModalProps> = ({
  isOpen,
  onClose,
  logs,
  onClearHistory
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  if (!isOpen) return null;

  const filteredLogs = logs.filter(l => {
    if (filterType === 'ALL') return true;
    return l.action === filterType;
  });

  const getActionBadge = (action: ActivityActionType) => {
    switch (action) {
      case 'CREATE':
        return {
          icon: PlusCircle,
          label: 'Created',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
      case 'UPDATE':
        return {
          icon: Edit,
          label: 'Updated',
          badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200'
        };
      case 'DELETE':
        return {
          icon: Trash2,
          label: 'Deleted',
          badgeClass: 'bg-red-50 text-red-700 border-red-200'
        };
      case 'CONFLICT_RESOLVED':
        return {
          icon: CheckCircle,
          label: 'Conflict Fixed',
          badgeClass: 'bg-teal-50 text-teal-700 border-teal-200'
        };
      case 'RESET':
        return {
          icon: RotateCcw,
          label: 'Data Reset',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200'
        };
      default:
        return {
          icon: History,
          label: action,
          badgeClass: 'bg-slate-100 text-slate-700 border-slate-200'
        };
    }
  };

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Local Activity History</h3>
              <p className="text-xs text-slate-500">Record of event scheduling modifications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Local Disclaimer Banner */}
        <div className="px-5 py-3 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Browser-Local Storage:</strong> Activity entries are recorded in your client's local browser memory.
            This log documents client-side mutations for testing and verification and is not a distributed multi-tenant server audit log.
          </p>
        </div>

        {/* Action Filters */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold uppercase text-[10px]">Filter:</span>
            {(['ALL', 'CREATE', 'UPDATE', 'DELETE', 'CONFLICT_RESOLVED'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  filterType === type
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {type === 'ALL' ? 'All' : type.replace('_', ' ')}
              </button>
            ))}
          </div>

          {logs.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-[11px] text-red-600 hover:text-red-800 font-semibold underline"
            >
              Clear Log History
            </button>
          )}
        </div>

        {/* Log Entries */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600">No activity recorded</p>
              <p className="text-xs text-slate-400 mt-0.5">Creating, updating, or deleting events will log entries here.</p>
            </div>
          ) : (
            filteredLogs.map(log => {
              const badge = getActionBadge(log.action);
              const Icon = badge.icon;

              return (
                <div
                  key={log.id}
                  className="p-3 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-colors flex items-start gap-3 shadow-2xs"
                >
                  <div className={`p-1.5 rounded-lg border shrink-0 mt-0.5 ${badge.badgeClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${badge.badgeClass}`}>
                          {badge.label}
                        </span>
                        {log.eventId && (
                          <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                            #{log.eventId}
                          </span>
                        )}
                        {log.eventTitle && (
                          <span className="text-xs font-bold text-slate-900 truncate max-w-xs">
                            {log.eventTitle}
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {log.details}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>{filteredLogs.length} activity records</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-sans font-semibold rounded-lg border border-slate-300 text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
