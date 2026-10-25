export type EventCategory = 
  | 'Technical' 
  | 'Workshop' 
  | 'Cultural' 
  | 'Hackathon' 
  | 'Academic' 
  | 'Sports';

export type EventPriority = 'High' | 'Medium' | 'Low';

export type EventStatus = 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';

export interface EventItem {
  id: number;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM (24-hour format)
  endTime: string; // HH:MM (24-hour format)
  venue: string;
  category: EventCategory;
  organizer: string;
  priority: EventPriority;
  status: EventStatus;
  maxParticipants?: number;
}

export interface VenueConflictPair {
  id: string; // unique conflict id (e.g. "conflict-101-102")
  eventA: EventItem;
  eventB: EventItem;
  venue: string;
  date: string;
  overlapStart: string;
  overlapEnd: string;
  overlapMinutes: number;
  explanation: string;
}

export interface SearchStep<T = EventItem> {
  stepNumber: number;
  currentIndex: number;
  lowIndex?: number;
  highIndex?: number;
  midIndex?: number;
  elementExamined: T;
  comparisonMade: string;
  isMatch: boolean;
  explanation: string;
}

export interface SortStep<T = EventItem> {
  stepNumber: number;
  arraySnapshot: T[];
  comparingIndices: [number, number] | [];
  swappedIndices?: [number, number];
  pivotIndex?: number;
  mergedIndices?: number[];
  comparisonsCount: number;
  swapsCount: number;
  pass?: number;
  explanation: string;
}

export interface BSTNode {
  id: number;
  event: EventItem;
  left: BSTNode | null;
  right: BSTNode | null;
  height: number;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  sourceId: number;
  targetId: number;
  relationship: 'Shared Venue' | 'Prerequisite' | 'Track Dependency';
  description: string;
}

export interface GraphTraversalStep {
  stepNumber: number;
  currentNodeId: number;
  queueOrStackState: number[];
  visitedNodes: number[];
  currentEdge?: [number, number];
  actionDescription: string;
}

export interface TestCaseResult {
  name: string;
  category: 'CRUD' | 'Conflict' | 'Search & Sort (CO3)' | 'BST (CO4)' | 'Graph (CO5)';
  passed: boolean;
  executionTimeMs: number;
  assertionsPassed: number;
  totalAssertions: number;
  details: string;
  error?: string;
}
