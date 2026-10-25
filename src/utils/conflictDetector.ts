import { EventItem, VenueConflictPair } from '../types/event';

export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
}

export function minutesToTime(mins: number): string {
  const normalized = Math.max(0, Math.min(mins, 24 * 60));
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Checks if two events conflict.
 * Two events conflict ONLY when:
 * 1. Their venue is identical (case-insensitive trim)
 * 2. Their date is the same
 * 3. Their time intervals overlap: (startA < endB) && (endA > startB)
 * 4. Neither event is 'Cancelled'
 */
export function areEventsInConflict(eventA: EventItem, eventB: EventItem): VenueConflictPair | null {
  if (eventA.id === eventB.id) return null;
  if (eventA.status === 'Cancelled' || eventB.status === 'Cancelled') return null;

  const venueA = eventA.venue.trim().toLowerCase();
  const venueB = eventB.venue.trim().toLowerCase();
  if (venueA !== venueB) return null;

  if (eventA.date !== eventB.date) return null;

  const startA = timeToMinutes(eventA.startTime);
  const endA = timeToMinutes(eventA.endTime);
  const startB = timeToMinutes(eventB.startTime);
  const endB = timeToMinutes(eventB.endTime);

  // Interval overlap: [startA, endA) and [startB, endB)
  const isOverlapping = startA < endB && endA > startB;

  if (!isOverlapping) return null;

  const overlapStartMin = Math.max(startA, startB);
  const overlapEndMin = Math.min(endA, endB);
  const overlapMinutes = overlapEndMin - overlapStartMin;

  const overlapStart = minutesToTime(overlapStartMin);
  const overlapEnd = minutesToTime(overlapEndMin);

  // Canonical pair ordering by ID so we don't duplicate pairs
  const [first, second] = eventA.id < eventB.id ? [eventA, eventB] : [eventB, eventA];

  return {
    id: `conflict-${first.id}-${second.id}`,
    eventA: first,
    eventB: second,
    venue: first.venue,
    date: first.date,
    overlapStart,
    overlapEnd,
    overlapMinutes,
    explanation: `Both "${first.title}" (${first.startTime} - ${first.endTime}) and "${second.title}" (${second.startTime} - ${second.endTime}) are scheduled in ${first.venue} on ${first.date}, causing an overlap of ${overlapMinutes} minutes between ${overlapStart} and ${overlapEnd}.`
  };
}

/**
 * Detects all unique pairwise venue conflicts across an event collection.
 * Uses an efficient pairwise comparison (or bucketed by date & venue).
 */
export function detectAllConflicts(events: EventItem[]): VenueConflictPair[] {
  const conflicts: VenueConflictPair[] = [];
  const seenPairIds = new Set<string>();

  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const conflict = areEventsInConflict(events[i], events[j]);
      if (conflict && !seenPairIds.has(conflict.id)) {
        seenPairIds.add(conflict.id);
        conflicts.push(conflict);
      }
    }
  }

  return conflicts;
}

/**
 * Checks if a candidate event would cause any conflict with existing events
 */
export function checkEventHasConflict(candidate: EventItem, allEvents: EventItem[]): VenueConflictPair[] {
  const matches: VenueConflictPair[] = [];
  for (const existing of allEvents) {
    if (existing.id === candidate.id) continue;
    const conflict = areEventsInConflict(candidate, existing);
    if (conflict) {
      matches.push(conflict);
    }
  }
  return matches;
}

/**
 * Finds alternative venues for an event on the same date and time that are strictly verified to be free.
 */
export function findAvailableAlternativeVenues(
  targetEvent: EventItem,
  allEvents: EventItem[],
  candidateVenues: string[]
): string[] {
  const available: string[] = [];
  for (const venue of candidateVenues) {
    if (venue.trim().toLowerCase() === targetEvent.venue.trim().toLowerCase()) continue;
    const candidate: EventItem = { ...targetEvent, venue };
    const conflicts = checkEventHasConflict(candidate, allEvents);
    if (conflicts.length === 0) {
      available.push(venue);
    }
  }
  return available;
}

/**
 * Finds verified available time slots on the same date and venue for an event.
 * Tries slots immediately after conflicting event, and subsequent 30-min offsets.
 */
export function findAvailableShiftSlots(
  targetEvent: EventItem,
  conflictingEvent: EventItem,
  allEvents: EventItem[]
): Array<{ startTime: string; endTime: string }> {
  const durationMin = timeToMinutes(targetEvent.endTime) - timeToMinutes(targetEvent.startTime);
  const confEndMin = timeToMinutes(conflictingEvent.endTime);
  const availableSlots: Array<{ startTime: string; endTime: string }> = [];

  // Try slot right after conflicting event (with a 15 min buffer)
  const candidateStarts = [
    confEndMin,
    confEndMin + 15,
    confEndMin + 30,
    confEndMin + 60,
    timeToMinutes(conflictingEvent.startTime) - durationMin - 15
  ];

  for (const startMin of candidateStarts) {
    if (startMin < 8 * 60 || startMin + durationMin > 23 * 60) continue; // between 08:00 and 23:00
    const startStr = minutesToTime(startMin);
    const endStr = minutesToTime(startMin + durationMin);

    const testEvent: EventItem = {
      ...targetEvent,
      startTime: startStr,
      endTime: endStr
    };

    const conflicts = checkEventHasConflict(testEvent, allEvents);
    if (conflicts.length === 0) {
      availableSlots.push({ startTime: startStr, endTime: endStr });
      if (availableSlots.length >= 2) break;
    }
  }

  return availableSlots;
}
