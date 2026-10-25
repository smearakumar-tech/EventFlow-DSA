import { EventItem, SearchStep, SortStep } from '../types/event';
import { timeToMinutes } from '../utils/conflictDetector';

export type SortField = 'id' | 'title' | 'date' | 'startTime' | 'priority';
export type SortDirection = 'asc' | 'desc';

const PRIORITY_ORDER: Record<string, number> = {
  High: 3,
  Medium: 2,
  Low: 1
};

export function compareEvents(
  a: EventItem,
  b: EventItem,
  field: SortField,
  direction: SortDirection = 'asc'
): number {
  let diff = 0;
  if (field === 'id') {
    diff = a.id - b.id;
  } else if (field === 'title') {
    diff = a.title.localeCompare(b.title);
  } else if (field === 'date') {
    diff = a.date.localeCompare(b.date);
    if (diff === 0) {
      diff = timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    }
  } else if (field === 'startTime') {
    diff = timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
  } else if (field === 'priority') {
    diff = (PRIORITY_ORDER[a.priority] || 0) - (PRIORITY_ORDER[b.priority] || 0);
  }
  return direction === 'asc' ? diff : -diff;
}

export function isArraySorted(
  arr: EventItem[],
  field: SortField,
  direction: SortDirection = 'asc'
): boolean {
  for (let i = 0; i < arr.length - 1; i++) {
    if (compareEvents(arr[i], arr[i + 1], field, direction) > 0) {
      return false;
    }
  }
  return true;
}

// ----------------------------------------------------
// LINEAR SEARCH
// ----------------------------------------------------
export interface SearchExecutionResult {
  steps: SearchStep<EventItem>[];
  foundIndex: number;
  totalComparisons: number;
  timeComplexity: string;
  spaceComplexity: string;
}

export function runLinearSearch(
  arr: EventItem[],
  field: 'id' | 'title' | 'venue',
  query: string | number
): SearchExecutionResult {
  const steps: SearchStep<EventItem>[] = [];
  let foundIndex = -1;
  let comparisons = 0;

  const normalizedQuery = typeof query === 'string' ? query.trim().toLowerCase() : query;

  for (let i = 0; i < arr.length; i++) {
    comparisons++;
    const current = arr[i];
    let isMatch = false;
    let comparisonStr = '';

    if (field === 'id') {
      const targetId = Number(normalizedQuery);
      comparisonStr = `Comparing target ID ${targetId} === record[${i}].id (${current.id})`;
      isMatch = current.id === targetId;
    } else if (field === 'title') {
      const currentTitle = current.title.toLowerCase();
      comparisonStr = `Comparing target "${normalizedQuery}" with record[${i}].title ("${current.title}")`;
      isMatch = currentTitle.includes(String(normalizedQuery));
    } else if (field === 'venue') {
      const currentVenue = current.venue.toLowerCase();
      comparisonStr = `Comparing target "${normalizedQuery}" with record[${i}].venue ("${current.venue}")`;
      isMatch = currentVenue.includes(String(normalizedQuery));
    }

    steps.push({
      stepNumber: steps.length + 1,
      currentIndex: i,
      elementExamined: current,
      comparisonMade: comparisonStr,
      isMatch,
      explanation: isMatch
        ? `Match found at index ${i}! Event "${current.title}" satisfies query.`
        : `Index ${i} does not match. Advancing search pointer to ${i + 1}.`
    });

    if (isMatch) {
      foundIndex = i;
      break;
    }
  }

  return {
    steps,
    foundIndex,
    totalComparisons: comparisons,
    timeComplexity: 'Best: O(1) | Worst: O(N) | Average: O(N)',
    spaceComplexity: 'O(1) Auxiliary Space'
  };
}

// ----------------------------------------------------
// BINARY SEARCH
// ----------------------------------------------------
export function runBinarySearch(
  arr: EventItem[],
  field: 'id' | 'title',
  query: string | number
): SearchExecutionResult & { errorNotSorted?: boolean } {
  // Binary search strictly requires sorted data
  const sorted = isArraySorted(arr, field, 'asc');
  if (!sorted) {
    return {
      steps: [],
      foundIndex: -1,
      totalComparisons: 0,
      timeComplexity: 'O(log N) requires sorted array',
      spaceComplexity: 'O(1)',
      errorNotSorted: true
    };
  }

  const steps: SearchStep<EventItem>[] = [];
  let low = 0;
  let high = arr.length - 1;
  let foundIndex = -1;
  let comparisons = 0;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midItem = arr[mid];
    comparisons++;

    let cmp = 0;
    let comparisonStr = '';

    if (field === 'id') {
      const targetId = Number(query);
      cmp = targetId - midItem.id;
      comparisonStr = `Target ID ${targetId} vs Mid record[${mid}].id (${midItem.id})`;
    } else {
      const targetTitle = String(query).toLowerCase();
      const midTitle = midItem.title.toLowerCase();
      cmp = targetTitle.localeCompare(midTitle);
      comparisonStr = `Target "${targetTitle}" vs Mid record[${mid}].title ("${midItem.title}")`;
    }

    if (cmp === 0) {
      steps.push({
        stepNumber: steps.length + 1,
        currentIndex: mid,
        lowIndex: low,
        highIndex: high,
        midIndex: mid,
        elementExamined: midItem,
        comparisonMade: comparisonStr,
        isMatch: true,
        explanation: `Key matches! Found event "${midItem.title}" at mid index ${mid}.`
      });
      foundIndex = mid;
      break;
    } else if (cmp < 0) {
      steps.push({
        stepNumber: steps.length + 1,
        currentIndex: mid,
        lowIndex: low,
        highIndex: high,
        midIndex: mid,
        elementExamined: midItem,
        comparisonMade: `${comparisonStr} (Target < Mid)`,
        isMatch: false,
        explanation: `Target is smaller than mid. Discarding right half [${mid}..${high}]. Next search range: [${low}..${mid - 1}].`
      });
      high = mid - 1;
    } else {
      steps.push({
        stepNumber: steps.length + 1,
        currentIndex: mid,
        lowIndex: low,
        highIndex: high,
        midIndex: mid,
        elementExamined: midItem,
        comparisonMade: `${comparisonStr} (Target > Mid)`,
        isMatch: false,
        explanation: `Target is greater than mid. Discarding left half [${low}..${mid}]. Next search range: [${mid + 1}..${high}].`
      });
      low = mid + 1;
    }
  }

  return {
    steps,
    foundIndex,
    totalComparisons: comparisons,
    timeComplexity: 'Best: O(1) | Worst: O(log2 N) | Average: O(log2 N)',
    spaceComplexity: 'O(1) Iterative Space'
  };
}

// ----------------------------------------------------
// BUBBLE SORT
// ----------------------------------------------------
export interface SortExecutionResult {
  steps: SortStep<EventItem>[];
  sortedArray: EventItem[];
  totalComparisons: number;
  totalSwaps: number;
  timeComplexity: string;
  spaceComplexity: string;
  isStable: boolean;
}

export function runBubbleSort(
  input: EventItem[],
  field: SortField,
  direction: SortDirection = 'asc'
): SortExecutionResult {
  const arr = [...input];
  const steps: SortStep<EventItem>[] = [];
  let comparisons = 0;
  let swaps = 0;
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let swappedInPass = false;
    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;
      const cmp = compareEvents(arr[j], arr[j + 1], field, direction);
      const shouldSwap = cmp > 0;

      if (shouldSwap) {
        swaps++;
        swappedInPass = true;
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;

        steps.push({
          stepNumber: steps.length + 1,
          pass: i + 1,
          arraySnapshot: [...arr],
          comparingIndices: [j, j + 1],
          swappedIndices: [j, j + 1],
          comparisonsCount: comparisons,
          swapsCount: swaps,
          explanation: `Pass ${i + 1}: ${arr[j + 1].title} out of order with ${arr[j].title}. Swapped positions ${j} and ${j + 1}.`
        });
      } else {
        steps.push({
          stepNumber: steps.length + 1,
          pass: i + 1,
          arraySnapshot: [...arr],
          comparingIndices: [j, j + 1],
          comparisonsCount: comparisons,
          swapsCount: swaps,
          explanation: `Pass ${i + 1}: Compared indices ${j} and ${j + 1}. Already in sorted relative order, no swap.`
        });
      }
    }

    if (!swappedInPass) {
      steps.push({
        stepNumber: steps.length + 1,
        pass: i + 1,
        arraySnapshot: [...arr],
        comparingIndices: [],
        comparisonsCount: comparisons,
        swapsCount: swaps,
        explanation: `Early termination: Pass ${i + 1} completed with zero swaps. Array is fully sorted!`
      });
      break;
    }
  }

  return {
    steps,
    sortedArray: arr,
    totalComparisons: comparisons,
    totalSwaps: swaps,
    timeComplexity: 'Best: O(N) | Worst: O(N²) | Average: O(N²)',
    spaceComplexity: 'O(1) In-Place',
    isStable: true
  };
}

// ----------------------------------------------------
// SELECTION SORT
// ----------------------------------------------------
export function runSelectionSort(
  input: EventItem[],
  field: SortField,
  direction: SortDirection = 'asc'
): SortExecutionResult {
  const arr = [...input];
  const steps: SortStep<EventItem>[] = [];
  let comparisons = 0;
  let swaps = 0;
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    for (let j = i + 1; j < n; j++) {
      comparisons++;
      if (compareEvents(arr[j], arr[minIdx], field, direction) < 0) {
        minIdx = j;
      }
      steps.push({
        stepNumber: steps.length + 1,
        pass: i + 1,
        arraySnapshot: [...arr],
        comparingIndices: [j, minIdx],
        comparisonsCount: comparisons,
        swapsCount: swaps,
        explanation: `Pass ${i + 1}: Scanning index ${j}. Current minimum candidate is index ${minIdx} ("${arr[minIdx].title}").`
      });
    }

    if (minIdx !== i) {
      swaps++;
      const temp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = temp;

      steps.push({
        stepNumber: steps.length + 1,
        pass: i + 1,
        arraySnapshot: [...arr],
        comparingIndices: [],
        swappedIndices: [i, minIdx],
        comparisonsCount: comparisons,
        swapsCount: swaps,
        explanation: `Pass ${i + 1} complete: Swapped discovered minimum "${arr[i].title}" (index ${minIdx}) into position ${i}.`
      });
    } else {
      steps.push({
        stepNumber: steps.length + 1,
        pass: i + 1,
        arraySnapshot: [...arr],
        comparingIndices: [],
        comparisonsCount: comparisons,
        swapsCount: swaps,
        explanation: `Pass ${i + 1} complete: Element at index ${i} ("${arr[i].title}") was already the minimum in unsorted slice.`
      });
    }
  }

  return {
    steps,
    sortedArray: arr,
    totalComparisons: comparisons,
    totalSwaps: swaps,
    timeComplexity: 'Best: O(N²) | Worst: O(N²) | Average: O(N²)',
    spaceComplexity: 'O(1) In-Place',
    isStable: false
  };
}

// ----------------------------------------------------
// MERGE SORT
// ----------------------------------------------------
export function runMergeSort(
  input: EventItem[],
  field: SortField,
  direction: SortDirection = 'asc'
): SortExecutionResult {
  const arr = [...input];
  const steps: SortStep<EventItem>[] = [];
  let comparisons = 0;
  let mergeOperations = 0;

  function merge(left: number, mid: number, right: number) {
    const leftPart = arr.slice(left, mid + 1);
    const rightPart = arr.slice(mid + 1, right + 1);
    let i = 0;
    let j = 0;
    let k = left;

    const mergedIndices: number[] = [];

    while (i < leftPart.length && j < rightPart.length) {
      comparisons++;
      const cmp = compareEvents(leftPart[i], rightPart[j], field, direction);
      if (cmp <= 0) {
        arr[k] = leftPart[i];
        i++;
      } else {
        arr[k] = rightPart[j];
        j++;
      }
      mergedIndices.push(k);
      steps.push({
        stepNumber: steps.length + 1,
        arraySnapshot: [...arr],
        comparingIndices: [left + i, mid + 1 + j],
        mergedIndices: [...mergedIndices],
        comparisonsCount: comparisons,
        swapsCount: mergeOperations,
        explanation: `Merging subarrays [${left}..${mid}] and [${mid + 1}..${right}]: Placed "${arr[k].title}" at index ${k}.`
      });
      k++;
    }

    while (i < leftPart.length) {
      arr[k] = leftPart[i];
      mergedIndices.push(k);
      i++;
      k++;
    }

    while (j < rightPart.length) {
      arr[k] = rightPart[j];
      mergedIndices.push(k);
      j++;
      k++;
    }

    mergeOperations++;
    steps.push({
      stepNumber: steps.length + 1,
      arraySnapshot: [...arr],
      comparingIndices: [],
      mergedIndices: Array.from({ length: right - left + 1 }, (_, idx) => left + idx),
      comparisonsCount: comparisons,
      swapsCount: mergeOperations,
      explanation: `Subarrays merged successfully into sorted block [${left}..${right}].`
    });
  }

  function divideAndConquer(left: number, right: number) {
    if (left >= right) return;
    const mid = Math.floor((left + right) / 2);

    steps.push({
      stepNumber: steps.length + 1,
      arraySnapshot: [...arr],
      comparingIndices: [left, right],
      comparisonsCount: comparisons,
      swapsCount: mergeOperations,
      explanation: `Divide step: Splitting range [${left}..${right}] into [${left}..${mid}] and [${mid + 1}..${right}].`
    });

    divideAndConquer(left, mid);
    divideAndConquer(mid + 1, right);
    merge(left, mid, right);
  }

  divideAndConquer(0, arr.length - 1);

  return {
    steps,
    sortedArray: arr,
    totalComparisons: comparisons,
    totalSwaps: mergeOperations,
    timeComplexity: 'Best: O(N log N) | Worst: O(N log N) | Average: O(N log N)',
    spaceComplexity: 'O(N) Auxiliary Memory',
    isStable: true
  };
}
