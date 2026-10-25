import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Tag, Flag, User, AlertCircle, Sparkles } from 'lucide-react';
import { EventItem, EventCategory, EventPriority, EventStatus } from '../types/event';
import { CATEGORY_LIST, VENUE_LIST } from '../utils/sampleData';
import { checkEventHasConflict } from '../utils/conflictDetector';

interface EventModalProps {
  isOpen: boolean;
  eventToEdit: EventItem | null;
  allEvents: EventItem[];
  defaultDate?: string;
  onSave: (event: EventItem) => void;
  onClose: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  eventToEdit,
  allEvents,
  defaultDate,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState<Partial<EventItem>>({
    title: '',
    description: '',
    date: defaultDate || new Date().toISOString().slice(0, 10),
    startTime: '10:00',
    endTime: '12:00',
    venue: VENUE_LIST[0],
    category: 'Technical',
    organizer: '',
    priority: 'Medium',
    status: 'Upcoming',
    maxParticipants: 100
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (eventToEdit) {
      setFormData(eventToEdit);
    } else {
      // Find next sequential numeric ID
      const maxId = allEvents.reduce((max, ev) => Math.max(max, ev.id), 100);
      setFormData({
        id: maxId + 1,
        title: '',
        description: '',
        date: defaultDate || new Date().toISOString().slice(0, 10),
        startTime: '10:00',
        endTime: '12:00',
        venue: VENUE_LIST[0],
        category: 'Technical',
        organizer: 'Dept. of Computer Science & Engg',
        priority: 'Medium',
        status: 'Upcoming',
        maxParticipants: 100
      });
    }
    setErrors({});
  }, [eventToEdit, isOpen, allEvents, defaultDate]);

  if (!isOpen) return null;

  // Real-time conflict inspection on current form state
  const candidateEvent: EventItem = {
    id: formData.id || 9999,
    title: formData.title || 'Draft Event',
    description: formData.description || '',
    date: formData.date || '',
    startTime: formData.startTime || '00:00',
    endTime: formData.endTime || '00:00',
    venue: formData.venue || '',
    category: (formData.category || 'Technical') as EventCategory,
    organizer: formData.organizer || '',
    priority: (formData.priority || 'Medium') as EventPriority,
    status: (formData.status || 'Upcoming') as EventStatus,
    maxParticipants: formData.maxParticipants || 100
  };

  const detectedConflicts = checkEventHasConflict(candidateEvent, allEvents);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Event title is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }
    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'End time must be after start time';
    }
    if (!formData.venue?.trim()) {
      newErrors.venue = 'Venue is required';
    }
    if (!formData.organizer?.trim()) {
      newErrors.organizer = 'Organizer is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(candidateEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8 animate-in fade-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300 border border-indigo-400/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {eventToEdit ? `Edit Event #${eventToEdit.id}` : 'Create New Event'}
              </h2>
              <p className="text-xs text-slate-300">
                {eventToEdit ? 'Modify event parameters and verify venue availability' : 'Define new event schedule, venue, and metadata'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Live Conflict Warning Banner */}
          {detectedConflicts.length > 0 && (
            <div className="bg-amber-50 border border-amber-300/80 rounded-xl p-3.5 flex items-start gap-3 text-amber-900 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-semibold text-amber-900 text-sm block">
                  Venue Conflict Detected! ({detectedConflicts.length})
                </span>
                {detectedConflicts.map(c => (
                  <p key={c.id} className="text-amber-800">
                    Overlaps with <strong>"{c.eventA.id === candidateEvent.id ? c.eventB.title : c.eventA.title}"</strong> ({c.overlapStart} - {c.overlapEnd}) at <strong>{c.venue}</strong>.
                  </p>
                ))}
                <span className="text-amber-700 italic block mt-1">
                  Tip: Change start/end time or select an alternate hall to eliminate this conflict.
                </span>
              </div>
            </div>
          )}

          {/* Title & Numeric ID */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Event ID (Numeric)
              </label>
              <input
                type="number"
                disabled={!!eventToEdit}
                value={formData.id || ''}
                onChange={e => setFormData({ ...formData, id: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 text-sm bg-slate-100 border border-slate-300 rounded-lg font-mono text-slate-700 focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-500">Key for BST / Graph</span>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Event Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Next-Gen Autonomous AI Systems Keynote"
                value={formData.title || ''}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-hidden ${
                  errors.title ? 'border-red-500 bg-red-50/50' : 'border-slate-300'
                }`}
              />
              {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Brief agenda, track highlights, or speaker details..."
              value={formData.description || ''}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-hidden"
            />
          </div>

          {/* Date, Start Time, End Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Date *
              </label>
              <input
                type="date"
                value={formData.date || ''}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-hidden ${
                  errors.date ? 'border-red-500 bg-red-50' : 'border-slate-300'
                }`}
              />
              {errors.date && <p className="text-xs text-red-600 mt-1">{errors.date}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" /> Start Time *
              </label>
              <input
                type="time"
                value={formData.startTime || ''}
                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-hidden ${
                  errors.startTime ? 'border-red-500 bg-red-50' : 'border-slate-300'
                }`}
              />
              {errors.startTime && <p className="text-xs text-red-600 mt-1">{errors.startTime}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" /> End Time *
              </label>
              <input
                type="time"
                value={formData.endTime || ''}
                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-hidden ${
                  errors.endTime ? 'border-red-500 bg-red-50' : 'border-slate-300'
                }`}
              />
              {errors.endTime && <p className="text-xs text-red-600 mt-1">{errors.endTime}</p>}
            </div>
          </div>

          {/* Venue & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" /> Venue *
              </label>
              <select
                value={formData.venue || VENUE_LIST[0]}
                onChange={e => setFormData({ ...formData, venue: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-hidden bg-white"
              >
                {VENUE_LIST.map(v => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
              {errors.venue && <p className="text-xs text-red-600 mt-1">{errors.venue}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-600" /> Category *
              </label>
              <select
                value={formData.category || 'Technical'}
                onChange={e => setFormData({ ...formData, category: e.target.value as EventCategory })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-hidden bg-white"
              >
                {CATEGORY_LIST.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Organizer, Priority, Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" /> Organizer *
              </label>
              <input
                type="text"
                placeholder="e.g. ACM Student Chapter"
                value={formData.organizer || ''}
                onChange={e => setFormData({ ...formData, organizer: e.target.value })}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-hidden ${
                  errors.organizer ? 'border-red-500 bg-red-50' : 'border-slate-300'
                }`}
              />
              {errors.organizer && <p className="text-xs text-red-600 mt-1">{errors.organizer}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-indigo-600" /> Priority
              </label>
              <select
                value={formData.priority || 'Medium'}
                onChange={e => setFormData({ ...formData, priority: e.target.value as EventPriority })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden bg-white"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={formData.status || 'Upcoming'}
                onChange={e => setFormData({ ...formData, status: e.target.value as EventStatus })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden bg-white"
              >
                <option value="Upcoming">Upcoming</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Max Participants */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Estimated Capacity / Max Participants
            </label>
            <input
              type="number"
              min={1}
              value={formData.maxParticipants || 100}
              onChange={e => setFormData({ ...formData, maxParticipants: parseInt(e.target.value, 10) || 100 })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              * Required fields. All changes update local state and DSA structures.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                {eventToEdit ? 'Save Changes' : 'Create Event'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
