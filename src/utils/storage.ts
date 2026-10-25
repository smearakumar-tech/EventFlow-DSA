import { EventItem, ActivityLogItem, ActivityActionType } from '../types/event';
import { SAMPLE_EVENTS } from './sampleData';

const STORAGE_KEY = 'eventflow_scheduled_events_v2';
const STORAGE_KEY_ACTIVITY = 'eventflow_activity_history_v1';

export function loadActivityHistory(): ActivityLogItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVITY);
    if (!raw) {
      const initialLogs: ActivityLogItem[] = [
        {
          id: 'log-init-1',
          action: 'CREATE',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          details: 'Initialized EventFlow symposium schedule with sample dataset'
        }
      ];
      saveActivityHistory(initialLogs);
      return initialLogs;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load activity history:', err);
    return [];
  }
}

export function saveActivityHistory(logs: ActivityLogItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVITY, JSON.stringify(logs.slice(0, 100))); // keep latest 100 entries
  } catch (err) {
    console.error('Failed to save activity history:', err);
  }
}

export function recordActivity(
  action: ActivityActionType,
  details: string,
  eventId?: number,
  eventTitle?: string
): ActivityLogItem[] {
  const current = loadActivityHistory();
  const newLog: ActivityLogItem = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    action,
    eventId,
    eventTitle,
    timestamp: new Date().toISOString(),
    details
  };
  const updated = [newLog, ...current];
  saveActivityHistory(updated);
  return updated;
}

export function clearActivityHistory(): ActivityLogItem[] {
  try {
    localStorage.removeItem(STORAGE_KEY_ACTIVITY);
  } catch (err) {
    console.error('Failed to clear activity history:', err);
  }
  return [];
}

export function loadEventsFromStorage(): EventItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveEventsToStorage(SAMPLE_EVENTS);
      return SAMPLE_EVENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return SAMPLE_EVENTS;
  } catch (err) {
    console.error('Failed to load events from localStorage:', err);
    return SAMPLE_EVENTS;
  }
}

export function saveEventsToStorage(events: EventItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (err) {
    console.error('Failed to save events to localStorage:', err);
  }
}

export function resetEventsStorage(): EventItem[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_EVENTS));
    return SAMPLE_EVENTS;
  } catch (err) {
    console.error('Failed to reset storage:', err);
    return SAMPLE_EVENTS;
  }
}

export function exportEventsToCSV(events: EventItem[]): void {
  const headers = [
    'ID',
    'Title',
    'Date',
    'StartTime',
    'EndTime',
    'Venue',
    'Category',
    'Organizer',
    'Priority',
    'Status',
    'MaxParticipants',
    'Description'
  ];

  const escapeCSV = (val: string | number | undefined) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = events.map(e => [
    escapeCSV(e.id),
    escapeCSV(e.title),
    escapeCSV(e.date),
    escapeCSV(e.startTime),
    escapeCSV(e.endTime),
    escapeCSV(e.venue),
    escapeCSV(e.category),
    escapeCSV(e.organizer),
    escapeCSV(e.priority),
    escapeCSV(e.status),
    escapeCSV(e.maxParticipants ?? ''),
    escapeCSV(e.description)
  ].join(','));

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `EventFlow_Schedule_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportEventsToJSON(events: EventItem[]): void {
  const jsonContent = JSON.stringify(events, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `EventFlow_Schedule_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
