import { EventItem, VenueConflictPair, ScheduleAnalytics, EventCategory } from '../types/event';
import { timeToMinutes } from './conflictDetector';
import { VENUE_LIST, CATEGORY_LIST } from './sampleData';

/**
 * Computes transparent, mathematically grounded schedule analytics
 * directly from the active event record set.
 */
export function computeScheduleAnalytics(
  events: EventItem[],
  conflicts: VenueConflictPair[]
): ScheduleAnalytics {
  const activeEvents = events.filter(e => e.status !== 'Cancelled');
  const totalEvents = events.length;

  const upcomingCount = events.filter(e => e.status === 'Upcoming').length;
  const ongoingCount = events.filter(e => e.status === 'Ongoing').length;
  const completedCount = events.filter(e => e.status === 'Completed').length;
  const cancelledCount = events.filter(e => e.status === 'Cancelled').length;

  // Total scheduled duration in minutes across all active sessions
  let totalMinutes = 0;
  for (const e of activeEvents) {
    const dur = Math.max(0, timeToMinutes(e.endTime) - timeToMinutes(e.startTime));
    totalMinutes += dur;
  }
  const totalScheduledHours = Math.round((totalMinutes / 60) * 10) / 10;
  const averageDurationMinutes = activeEvents.length > 0
    ? Math.round(totalMinutes / activeEvents.length)
    : 0;

  // Busiest Day: group active events by calendar date
  const dateMap = new Map<string, { count: number; totalMinutes: number }>();
  for (const e of activeEvents) {
    const dur = Math.max(0, timeToMinutes(e.endTime) - timeToMinutes(e.startTime));
    const current = dateMap.get(e.date) || { count: 0, totalMinutes: 0 };
    dateMap.set(e.date, {
      count: current.count + 1,
      totalMinutes: current.totalMinutes + dur
    });
  }

  let busiestDay: ScheduleAnalytics['busiestDay'] = null;
  let maxDayMinutes = -1;
  for (const [date, stats] of dateMap.entries()) {
    if (stats.totalMinutes > maxDayMinutes) {
      maxDayMinutes = stats.totalMinutes;
      const [y, m, d] = date.split('-').map(Number);
      const formattedDate = new Date(y, (m || 1) - 1, d || 1).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      busiestDay = {
        date,
        formattedDate,
        count: stats.count,
        totalMinutes: stats.totalMinutes
      };
    }
  }

  // Most-Used Venue: group active events by physical hall
  const venueMap = new Map<string, { count: number; totalMinutes: number }>();
  for (const e of activeEvents) {
    const dur = Math.max(0, timeToMinutes(e.endTime) - timeToMinutes(e.startTime));
    const current = venueMap.get(e.venue) || { count: 0, totalMinutes: 0 };
    venueMap.set(e.venue, {
      count: current.count + 1,
      totalMinutes: current.totalMinutes + dur
    });
  }

  let mostUsedVenue: ScheduleAnalytics['mostUsedVenue'] = null;
  let maxVenueMinutes = -1;
  for (const [venue, stats] of venueMap.entries()) {
    if (stats.totalMinutes > maxVenueMinutes) {
      maxVenueMinutes = stats.totalMinutes;
      mostUsedVenue = {
        venue,
        count: stats.count,
        totalMinutes: stats.totalMinutes
      };
    }
  }

  // Category Distribution
  const categoryCounts: Record<string, { count: number; minutes: number }> = {};
  for (const cat of CATEGORY_LIST) {
    categoryCounts[cat] = { count: 0, minutes: 0 };
  }
  for (const e of activeEvents) {
    const dur = Math.max(0, timeToMinutes(e.endTime) - timeToMinutes(e.startTime));
    if (!categoryCounts[e.category]) {
      categoryCounts[e.category] = { count: 0, minutes: 0 };
    }
    categoryCounts[e.category].count += 1;
    categoryCounts[e.category].minutes += dur;
  }

  const categoryDistribution = Object.entries(categoryCounts).map(([cat, stats]) => {
    const percentage = activeEvents.length > 0 ? Math.round((stats.count / activeEvents.length) * 100) : 0;
    return {
      category: cat as EventCategory,
      count: stats.count,
      percentage,
      totalHours: Math.round((stats.minutes / 60) * 10) / 10
    };
  }).sort((a, b) => b.count - a.count);

  // Peak Hour Analysis: 08:00 to 22:00
  // Check how many concurrent events are active in each 1-hour bucket
  const hourBuckets: Array<{ hour: number; hourLabel: string; count: number }> = [];
  for (let h = 8; h <= 21; h++) {
    const bucketStartMin = h * 60;
    const bucketEndMin = (h + 1) * 60;
    let concurrentCount = 0;

    for (const e of activeEvents) {
      const eStart = timeToMinutes(e.startTime);
      const eEnd = timeToMinutes(e.endTime);
      // Interval overlap with bucket
      if (eStart < bucketEndMin && eEnd > bucketStartMin) {
        concurrentCount++;
      }
    }

    const startHStr = `${h.toString().padStart(2, '0')}:00`;
    const endHStr = `${(h + 1).toString().padStart(2, '0')}:00`;
    hourBuckets.push({
      hour: h,
      hourLabel: `${startHStr} - ${endHStr}`,
      count: concurrentCount
    });
  }

  hourBuckets.sort((a, b) => b.count - a.count);
  const peakHour = hourBuckets.length > 0 && hourBuckets[0].count > 0
    ? { hourLabel: hourBuckets[0].hourLabel, count: hourBuckets[0].count }
    : null;

  // Venue Utilization List (overall active dataset)
  const venueUtilization = VENUE_LIST.map(venueName => {
    const venueEvents = activeEvents.filter(e => e.venue === venueName);
    const vMinutes = venueEvents.reduce(
      (sum, e) => sum + Math.max(0, timeToMinutes(e.endTime) - timeToMinutes(e.startTime)),
      0
    );
    const hasConflict = conflicts.some(c => c.venue === venueName);
    // Base 24h or total symposium capacity
    const percentage = Math.min(100, Math.round((vMinutes / (12 * 60 * 3)) * 100)); // over 3-day window

    return {
      venue: venueName,
      count: venueEvents.length,
      bookedMinutes: vMinutes,
      bookedHours: (vMinutes / 60).toFixed(1),
      percentage,
      hasConflict
    };
  }).sort((a, b) => b.bookedMinutes - a.bookedMinutes);

  return {
    totalEvents,
    upcomingCount,
    ongoingCount,
    completedCount,
    cancelledCount,
    totalScheduledHours,
    averageDurationMinutes,
    busiestDay,
    mostUsedVenue,
    categoryDistribution,
    venueUtilization,
    peakHour
  };
}
