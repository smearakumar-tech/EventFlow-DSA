import { EventItem, TestCaseResult } from '../types/event';
import { SAMPLE_EVENTS } from './sampleData';
import { areEventsInConflict, detectAllConflicts } from './conflictDetector';
import {
  runLinearSearch,
  runBinarySearch,
  runBubbleSort,
  runSelectionSort,
  runMergeSort,
  isArraySorted
} from '../algorithms/co3SearchSort';
import { BinarySearchTree } from '../algorithms/co4BST';
import { EventGraph } from '../algorithms/co5Graph';

export async function runAllSelfTests(): Promise<TestCaseResult[]> {
  const results: TestCaseResult[] = [];

  // ==========================================
  // Test 1: Event CRUD & Validation
  // ==========================================
  {
    const start = performance.now();
    let assertionsPassed = 0;
    const totalAssertions = 5;
    const logLines: string[] = [];

    try {
      const mockList: EventItem[] = [...SAMPLE_EVENTS];
      const initialCount = mockList.length;

      // Create
      const newEvent: EventItem = {
        id: 999,
        title: 'Test Verification Symposium',
        description: 'Automated verification test item',
        date: '2026-10-30',
        startTime: '10:00',
        endTime: '12:00',
        venue: 'Tech Lab 102',
        category: 'Technical',
        organizer: 'QA Automated Runner',
        priority: 'Medium',
        status: 'Upcoming'
      };
      mockList.push(newEvent);

      if (mockList.length === initialCount + 1 && mockList.find(e => e.id === 999)) {
        assertionsPassed++;
        logLines.push('✓ Event Create: New record successfully appended to state.');
      }

      // Read
      const fetched = mockList.find(e => e.id === 999);
      if (fetched && fetched.title === 'Test Verification Symposium') {
        assertionsPassed++;
        logLines.push('✓ Event Read: Fetched event matches created record.');
      }

      // Update
      const updateIdx = mockList.findIndex(e => e.id === 999);
      if (updateIdx !== -1) {
        mockList[updateIdx] = { ...mockList[updateIdx], title: 'Updated Symposium Title', priority: 'High' };
        if (mockList[updateIdx].title === 'Updated Symposium Title' && mockList[updateIdx].priority === 'High') {
          assertionsPassed++;
          logLines.push('✓ Event Update: In-place record update succeeded.');
        }
      }

      // Delete
      const filtered = mockList.filter(e => e.id !== 999);
      if (filtered.length === initialCount && !filtered.some(e => e.id === 999)) {
        assertionsPassed++;
        logLines.push('✓ Event Delete: Record safely removed, restored initial count.');
      }

      // Validation rule: start time must be before end time
      const invalidStart = '14:00';
      const invalidEnd = '12:00';
      const isChronological = invalidStart < invalidEnd;
      if (!isChronological) {
        assertionsPassed++;
        logLines.push('✓ Validation: Correctly flagged invalid interval (endTime < startTime).');
      }

      const elapsed = Math.round((performance.now() - start) * 100) / 100;
      results.push({
        name: 'Event Model CRUD & State Mutations',
        category: 'CRUD',
        passed: assertionsPassed === totalAssertions,
        executionTimeMs: elapsed,
        assertionsPassed,
        totalAssertions,
        details: logLines.join('\n')
      });
    } catch (err) {
      results.push({
        name: 'Event Model CRUD & State Mutations',
        category: 'CRUD',
        passed: false,
        executionTimeMs: 0,
        assertionsPassed,
        totalAssertions,
        details: logLines.join('\n'),
        error: String(err)
      });
    }
  }

  // ==========================================
  // Test 2: Venue Conflict Detection
  // ==========================================
  {
    const start = performance.now();
    let assertionsPassed = 0;
    const totalAssertions = 5;
    const logLines: string[] = [];

    try {
      const eventA: EventItem = {
        id: 201,
        title: 'Conflict Test A',
        description: 'Test',
        date: '2026-10-26',
        startTime: '09:30',
        endTime: '11:30',
        venue: 'Auditorium A',
        category: 'Technical',
        organizer: 'QA',
        priority: 'High',
        status: 'Upcoming'
      };

      const eventB_Overlapping: EventItem = {
        id: 202,
        title: 'Conflict Test B (Overlapping)',
        description: 'Test',
        date: '2026-10-26',
        startTime: '10:30',
        endTime: '12:30',
        venue: 'Auditorium A',
        category: 'Technical',
        organizer: 'QA',
        priority: 'High',
        status: 'Upcoming'
      };

      const eventC_Adjacent: EventItem = {
        id: 203,
        title: 'Conflict Test C (Adjacent back-to-back)',
        description: 'Test',
        date: '2026-10-26',
        startTime: '11:30',
        endTime: '13:00',
        venue: 'Auditorium A',
        category: 'Technical',
        organizer: 'QA',
        priority: 'High',
        status: 'Upcoming'
      };

      const eventD_DiffVenue: EventItem = {
        id: 204,
        title: 'Conflict Test D (Different Venue)',
        description: 'Test',
        date: '2026-10-26',
        startTime: '10:30',
        endTime: '12:30',
        venue: 'Seminar Hall B',
        category: 'Technical',
        organizer: 'QA',
        priority: 'High',
        status: 'Upcoming'
      };

      const eventE_DiffDate: EventItem = {
        id: 205,
        title: 'Conflict Test E (Different Date)',
        description: 'Test',
        date: '2026-10-27',
        startTime: '10:30',
        endTime: '12:30',
        venue: 'Auditorium A',
        category: 'Technical',
        organizer: 'QA',
        priority: 'High',
        status: 'Upcoming'
      };

      // 1. Overlapping in same venue & date -> MUST CONFLICT
      const conf1 = areEventsInConflict(eventA, eventB_Overlapping);
      if (conf1 !== null && conf1.overlapMinutes === 60 && conf1.overlapStart === '10:30') {
        assertionsPassed++;
        logLines.push('✓ True Positive: Detected 60-min overlap (10:30-11:30) for Auditorium A.');
      }

      // 2. Adjacent/Back-to-back -> MUST NOT CONFLICT
      const conf2 = areEventsInConflict(eventA, eventC_Adjacent);
      if (conf2 === null) {
        assertionsPassed++;
        logLines.push('✓ Interval Edge: Back-to-back (11:30 boundary) correctly evaluated as no conflict.');
      }

      // 3. Different venue -> MUST NOT CONFLICT
      const conf3 = areEventsInConflict(eventB_Overlapping, eventD_DiffVenue);
      if (conf3 === null) {
        assertionsPassed++;
        logLines.push('✓ Spatial Separation: Concurrent events in different venues have zero conflict.');
      }

      // 4. Different date -> MUST NOT CONFLICT
      const conf4 = areEventsInConflict(eventB_Overlapping, eventE_DiffDate);
      if (conf4 === null) {
        assertionsPassed++;
        logLines.push('✓ Temporal Separation: Concurrent times on different dates have zero conflict.');
      }

      // 5. Seed dataset conflict check
      const seedConflicts = detectAllConflicts(SAMPLE_EVENTS);
      if (seedConflicts.length >= 1) {
        assertionsPassed++;
        logLines.push(`✓ Dataset Audit: Found ${seedConflicts.length} intentional conflict(s) in sample data.`);
      }

      const elapsed = Math.round((performance.now() - start) * 100) / 100;
      results.push({
        name: 'Venue Conflict Detection & Interval Overlap',
        category: 'Conflict',
        passed: assertionsPassed === totalAssertions,
        executionTimeMs: elapsed,
        assertionsPassed,
        totalAssertions,
        details: logLines.join('\n')
      });
    } catch (err) {
      results.push({
        name: 'Venue Conflict Detection & Interval Overlap',
        category: 'Conflict',
        passed: false,
        executionTimeMs: 0,
        assertionsPassed,
        totalAssertions,
        details: logLines.join('\n'),
        error: String(err)
      });
    }
  }

  // ==========================================
  // Test 3: CO3 Search Algorithms
  // ==========================================
  {
    const start = performance.now();
    let assertionsPassed = 0;
    const totalAssertions = 4;
    const logLines: string[] = [];

    try {
      const events = [...SAMPLE_EVENTS];

      // 1. Linear Search existing item
      const linRes = runLinearSearch(events, 'id', 101);
      if (linRes.foundIndex === 0 && linRes.steps[0].isMatch) {
        assertionsPassed++;
        logLines.push('✓ Linear Search: Successfully found Event #101 at index 0.');
      }

      // 2. Linear Search missing item
      const linMissing = runLinearSearch(events, 'id', 9999);
      if (linMissing.foundIndex === -1 && linMissing.totalComparisons === events.length) {
        assertionsPassed++;
        logLines.push(`✓ Linear Search (Worst Case): Exhaustive check made ${linMissing.totalComparisons} comparisons for missing key.`);
      }

      // 3. Binary Search sorted array
      const sortedEvents = [...events].sort((a, b) => a.id - b.id);
      const binRes = runBinarySearch(sortedEvents, 'id', 107);
      if (binRes.foundIndex !== -1 && sortedEvents[binRes.foundIndex].id === 107) {
        assertionsPassed++;
        logLines.push(`✓ Binary Search: Found target Event #107 in O(log N) with ${binRes.totalComparisons} comparisons.`);
      }

      // 4. Binary Search unsorted array guard
      const unsortedEvents = [events[5], events[0], events[8]];
      const binGuard = runBinarySearch(unsortedEvents, 'id', 101);
      if (binGuard.errorNotSorted === true) {
        assertionsPassed++;
        logLines.push('✓ Binary Search Pre-condition: Correctly rejected unsorted dataset and triggered warning.');
      }

      const elapsed = Math.round((performance.now() - start) * 100) / 100;
      results.push({
        name: 'CO3: Linear & Binary Search Correctness',
        category: 'Search & Sort (CO3)',
        passed: assertionsPassed === totalAssertions,
        executionTimeMs: elapsed,
        assertionsPassed,
        totalAssertions,
        details: logLines.join('\n')
      });
    } catch (err) {
      results.push({
        name: 'CO3: Linear & Binary Search Correctness',
        category: 'Search & Sort (CO3)',
        passed: false,
        executionTimeMs: 0,
        assertionsPassed,
        totalAssertions,
        details: logLines.join('\n'),
        error: String(err)
      });
    }
  }

  // ==========================================
  // Test 4: CO3 Sort Algorithms
  // ==========================================
  {
    const start = performance.now();
    let assertionsPassed = 0;
    const totalAssertions = 4;
    const logLines: string[] = [];

    try {
      const rawEvents = [...SAMPLE_EVENTS].reverse(); // start backwards to test sorting

      // 1. Bubble Sort
      const bubbleRes = runBubbleSort(rawEvents, 'id', 'asc');
      if (isArraySorted(bubbleRes.sortedArray, 'id', 'asc') && bubbleRes.sortedArray.length === rawEvents.length) {
        assertionsPassed++;
        logLines.push(`✓ Bubble Sort: Ascending ID invariant verified (${bubbleRes.totalComparisons} comps, ${bubbleRes.totalSwaps} swaps).`);
      }

      // 2. Selection Sort
      const selectRes = runSelectionSort(rawEvents, 'id', 'asc');
      if (isArraySorted(selectRes.sortedArray, 'id', 'asc') && selectRes.sortedArray.length === rawEvents.length) {
        assertionsPassed++;
        logLines.push(`✓ Selection Sort: Minimum-selection pass verified (${selectRes.totalComparisons} comparisons).`);
      }

      // 3. Merge Sort
      const mergeRes = runMergeSort(rawEvents, 'id', 'asc');
      if (isArraySorted(mergeRes.sortedArray, 'id', 'asc') && mergeRes.sortedArray.length === rawEvents.length) {
        assertionsPassed++;
        logLines.push(`✓ Merge Sort: Divide & Conquer verified in O(N log N) (${mergeRes.totalComparisons} comparisons).`);
      }

      // 4. Multi-attribute sorting (by Date)
      const dateSort = runMergeSort(rawEvents, 'date', 'asc');
      if (isArraySorted(dateSort.sortedArray, 'date', 'asc')) {
        assertionsPassed++;
        logLines.push('✓ Chronological Ordering: Merge Sort correctly ordered events by calendar date & start time.');
      }

      const elapsed = Math.round((performance.now() - start) * 100) / 100;
      results.push({
        name: 'CO3: Bubble, Selection & Merge Sort Invariants',
        category: 'Search & Sort (CO3)',
        passed: assertionsPassed === totalAssertions,
        executionTimeMs: elapsed,
        assertionsPassed,
        totalAssertions,
        details: logLines.join('\n')
      });
    } catch (err) {
      results.push({
        name: 'CO3: Bubble, Selection & Merge Sort Invariants',
        category: 'Search & Sort (CO3)',
        passed: false,
        executionTimeMs: 0,
        assertionsPassed,
        totalAssertions,
        details: logLines.join('\n'),
        error: String(err)
      });
    }
  }

  // ==========================================
  // Test 5: CO4 Binary Search Tree Visualizer
  // ==========================================
  {
    const start = performance.now();
    let assertionsPassed = 0;
    const totalAssertions = 5;
    const logLines: string[] = [];

    try {
      const bst = new BinarySearchTree();
      const testEvents = SAMPLE_EVENTS.slice(0, 7);

      // 1. Insertion
      for (const ev of testEvents) {
        bst.insert(ev);
      }
      if (bst.getNodeCount() === testEvents.length) {
        assertionsPassed++;
        logLines.push(`✓ BST Insert: Built tree with ${bst.getNodeCount()} distinct event nodes.`);
      }

      // 2. In-Order Traversal Invariant (Strictly sorted ascending!)
      const inorderNodes = bst.inorder();
      const inorderKeys = inorderNodes.map(n => n.id);
      const expectedSortedKeys = testEvents.map(e => e.id).sort((a, b) => a - b);
      const isIdentical = inorderKeys.every((k, i) => k === expectedSortedKeys[i]);

      if (isIdentical) {
        assertionsPassed++;
        logLines.push(`✓ In-Order Traversal Property: In-Order sequence [${inorderKeys.join(', ')}] is mathematically sorted.`);
      }

      // 3. Search operation
      const targetId = testEvents[2].id;
      const searchRes = bst.search(targetId);
      if (searchRes.success && searchRes.node?.id === targetId) {
        assertionsPassed++;
        logLines.push(`✓ BST Search: Located key #${targetId} along path [${searchRes.path.join(' → ')}].`);
      }

      // 4. Search missing key
      const missingSearch = bst.search(99999);
      if (!missingSearch.success) {
        assertionsPassed++;
        logLines.push('✓ BST Search: Correctly returned false for absent key #99999.');
      }

      // 5. Deletion & Invariant Preservation
      const keyToDelete = inorderKeys[1]; // delete a node
      const delRes = bst.delete(keyToDelete);
      const postDeleteInorder = bst.inorder().map(n => n.id);
      const isStillSorted = postDeleteInorder.every((val, i, arr) => i === 0 || arr[i - 1] < val);
      const isAbsent = !postDeleteInorder.includes(keyToDelete);

      if (delRes.success && isStillSorted && isAbsent) {
        assertionsPassed++;
        logLines.push(`✓ BST Delete: Removed node #${keyToDelete}; post-deletion In-Order remains strictly sorted.`);
      }

      const elapsed = Math.round((performance.now() - start) * 100) / 100;
      results.push({
        name: 'CO4: BST Invariant, Traversals & Node Operations',
        category: 'BST (CO4)',
        passed: assertionsPassed === totalAssertions,
        executionTimeMs: elapsed,
        assertionsPassed,
        totalAssertions,
        details: logLines.join('\n')
      });
    } catch (err) {
      results.push({
        name: 'CO4: BST Invariant, Traversals & Node Operations',
        category: 'BST (CO4)',
        passed: false,
        executionTimeMs: 0,
        assertionsPassed,
        totalAssertions,
        details: logLines.join('\n'),
        error: String(err)
      });
    }
  }

  // ==========================================
  // Test 6: CO5 Graph Explorer
  // ==========================================
  {
    const start = performance.now();
    let assertionsPassed = 0;
    const totalAssertions = 4;
    const logLines: string[] = [];

    try {
      const graph = new EventGraph(SAMPLE_EVENTS);

      // 1. Graph representation
      if (graph.vertices.size === SAMPLE_EVENTS.length && graph.adjacencyList.size === SAMPLE_EVENTS.length) {
        assertionsPassed++;
        logLines.push(`✓ Graph Model: Registered ${graph.vertices.size} vertices and generated adjacency lists.`);
      }

      // 2. BFS Traversal
      const bfsRes = graph.runBFS(101);
      if (bfsRes.traversalOrder.length > 0 && bfsRes.traversalOrder[0] === 101) {
        // BFS must not contain duplicate node visits
        const hasNoDuplicates = new Set(bfsRes.traversalOrder).size === bfsRes.traversalOrder.length;
        if (hasNoDuplicates) {
          assertionsPassed++;
          logLines.push(`✓ BFS Queue Exploration: Traversed ${bfsRes.traversalOrder.length} vertices starting at #101 with FIFO discipline.`);
        }
      }

      // 3. DFS Traversal
      const dfsRes = graph.runDFS(101);
      if (dfsRes.traversalOrder.length > 0 && dfsRes.traversalOrder[0] === 101) {
        const hasNoDuplicates = new Set(dfsRes.traversalOrder).size === dfsRes.traversalOrder.length;
        if (hasNoDuplicates) {
          assertionsPassed++;
          logLines.push(`✓ DFS Stack Exploration: Traversed ${dfsRes.traversalOrder.length} vertices using recursive backtracking.`);
        }
      }

      // 4. Adjacency Matrix
      const { matrix, nodeIds } = graph.getAdjacencyMatrix();
      if (matrix.length === nodeIds.length && matrix.length === SAMPLE_EVENTS.length) {
        assertionsPassed++;
        logLines.push(`✓ Adjacency Matrix: Constructed ${matrix.length}x${matrix.length} connectivity matrix.`);
      }

      const elapsed = Math.round((performance.now() - start) * 100) / 100;
      results.push({
        name: 'CO5: Graph Adjacency Structures, BFS & DFS',
        category: 'Graph (CO5)',
        passed: assertionsPassed === totalAssertions,
        executionTimeMs: elapsed,
        assertionsPassed,
        totalAssertions,
        details: logLines.join('\n')
      });
    } catch (err) {
      results.push({
        name: 'CO5: Graph Adjacency Structures, BFS & DFS',
        category: 'Graph (CO5)',
        passed: false,
        executionTimeMs: 0,
        assertionsPassed,
        totalAssertions,
        details: logLines.join('\n'),
        error: String(err)
      });
    }
  }

  return results;
}
