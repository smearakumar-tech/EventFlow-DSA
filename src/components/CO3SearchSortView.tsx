import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Layers,
  Sparkles,
  Zap
} from 'lucide-react';
import { EventItem, SearchStep, SortStep } from '../types/event';
import {
  runLinearSearch,
  runBinarySearch,
  runBubbleSort,
  runSelectionSort,
  runMergeSort,
  SortField,
  SortDirection,
  isArraySorted,
  SearchExecutionResult,
  SortExecutionResult
} from '../algorithms/co3SearchSort';

interface CO3SearchSortViewProps {
  events: EventItem[];
}

export const CO3SearchSortView: React.FC<CO3SearchSortViewProps> = ({ events }) => {
  const [activeTab, setActiveTab] = useState<'search' | 'sort'>('sort');

  // ------------------------------------
  // SEARCH STATE
  // ------------------------------------
  const [searchAlgo, setSearchAlgo] = useState<'linear' | 'binary'>('linear');
  const [searchField, setSearchField] = useState<'id' | 'title' | 'venue'>('id');
  const [searchTarget, setSearchTarget] = useState<string>('107');
  const [searchResult, setSearchResult] = useState<SearchExecutionResult | (SearchExecutionResult & { errorNotSorted?: boolean }) | null>(null);
  const [searchStepIdx, setSearchStepIdx] = useState<number>(0);
  const [isSearchPlaying, setIsSearchPlaying] = useState<boolean>(false);
  const [searchPlaybackSpeed, setSearchPlaybackSpeed] = useState<number>(600); // ms per step

  // ------------------------------------
  // SORT STATE
  // ------------------------------------
  const [sortAlgo, setSortAlgo] = useState<'bubble' | 'selection' | 'merge'>('bubble');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [sortResult, setSortResult] = useState<SortExecutionResult | null>(null);
  const [sortStepIdx, setSortStepIdx] = useState<number>(0);
  const [isSortPlaying, setIsSortPlaying] = useState<boolean>(false);
  const [sortPlaybackSpeed, setSortPlaybackSpeed] = useState<number>(300); // ms per step

  // Timer refs for animated playback
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sortTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize sort execution whenever algo/field/direction or events change
  useEffect(() => {
    executeSort();
  }, [sortAlgo, sortField, sortDirection, events]);

  // Execute Search
  const executeSearch = () => {
    setIsSearchPlaying(false);
    if (searchTimerRef.current) clearInterval(searchTimerRef.current);

    if (searchAlgo === 'linear') {
      const res = runLinearSearch(events, searchField, searchTarget);
      setSearchResult(res);
      setSearchStepIdx(0);
    } else {
      // Binary search
      const res = runBinarySearch(events, searchField as 'id' | 'title', searchTarget);
      setSearchResult(res);
      setSearchStepIdx(0);
    }
  };

  // Helper to pre-sort array for binary search if user clicks
  const sortDataForBinarySearch = () => {
    // Binary search expects sorted by searchField
    const sorted = [...events].sort((a, b) => {
      if (searchField === 'id') return a.id - b.id;
      return a.title.localeCompare(b.title);
    });
    // Run binary search directly on sorted array
    const res = runBinarySearch(sorted, searchField as 'id' | 'title', searchTarget);
    setSearchResult(res);
    setSearchStepIdx(0);
  };

  // Execute Sort
  const executeSort = () => {
    setIsSortPlaying(false);
    if (sortTimerRef.current) clearInterval(sortTimerRef.current);

    let res: SortExecutionResult;
    if (sortAlgo === 'bubble') {
      res = runBubbleSort(events, sortField, sortDirection);
    } else if (sortAlgo === 'selection') {
      res = runSelectionSort(events, sortField, sortDirection);
    } else {
      res = runMergeSort(events, sortField, sortDirection);
    }
    setSortResult(res);
    setSortStepIdx(0);
  };

  // Search playback timer
  useEffect(() => {
    if (isSearchPlaying && searchResult && searchResult.steps.length > 0) {
      searchTimerRef.current = setInterval(() => {
        setSearchStepIdx(prev => {
          if (prev >= searchResult.steps.length - 1) {
            setIsSearchPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, searchPlaybackSpeed);
    } else {
      if (searchTimerRef.current) clearInterval(searchTimerRef.current);
    }
    return () => {
      if (searchTimerRef.current) clearInterval(searchTimerRef.current);
    };
  }, [isSearchPlaying, searchResult, searchPlaybackSpeed]);

  // Sort playback timer
  useEffect(() => {
    if (isSortPlaying && sortResult && sortResult.steps.length > 0) {
      sortTimerRef.current = setInterval(() => {
        setSortStepIdx(prev => {
          if (prev >= sortResult.steps.length - 1) {
            setIsSortPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, sortPlaybackSpeed);
    } else {
      if (sortTimerRef.current) clearInterval(sortTimerRef.current);
    }
    return () => {
      if (sortTimerRef.current) clearInterval(sortTimerRef.current);
    };
  }, [isSortPlaying, sortResult, sortPlaybackSpeed]);

  // Active step objects
  const currentSearchStep = searchResult && searchResult.steps.length > 0 ? searchResult.steps[searchStepIdx] : null;
  const currentSortStep = sortResult && sortResult.steps.length > 0 ? sortResult.steps[sortStepIdx] : null;

  // Current display array for sorting visualization
  const currentSortArray = currentSortStep ? currentSortStep.arraySnapshot : events;

  // Metrics comparison across all 3 sort algorithms on the current input
  const allSortComparisons = useMemo(() => {
    const bubble = runBubbleSort(events, sortField, sortDirection);
    const select = runSelectionSort(events, sortField, sortDirection);
    const merge = runMergeSort(events, sortField, sortDirection);
    return { bubble, select, merge };
  }, [events, sortField, sortDirection]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Switcher */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab('sort')}
            className={`px-4 py-2 rounded-md text-xs md:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'sort'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUpDown className="w-4 h-4 text-indigo-600" />
            Sorting Algorithms (Bubble, Selection, Merge)
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 rounded-md text-xs md:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'search'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Search className="w-4 h-4 text-indigo-600" />
            Searching Algorithms (Linear vs Binary)
          </button>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Input Dataset: <strong>{events.length} actual records</strong>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SORTING TAB */}
      {/* ======================================================== */}
      {activeTab === 'sort' && (
        <div className="space-y-5">
          {/* Controls Bar */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Algorithm Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Algorithm:
                </span>
                {(['bubble', 'selection', 'merge'] as const).map(algo => (
                  <button
                    key={algo}
                    onClick={() => setSortAlgo(algo)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                      sortAlgo === algo
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {algo} Sort
                  </button>
                ))}
              </div>

              {/* Field & Direction */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-500">Key:</span>
                  <select
                    value={sortField}
                    onChange={e => setSortField(e.target.value as SortField)}
                    className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 font-medium"
                  >
                    <option value="id">Event ID (#Numeric)</option>
                    <option value="title">Event Title (Alphabetical)</option>
                    <option value="date">Date &amp; Start Time</option>
                    <option value="priority">Priority (High → Low)</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-500">Order:</span>
                  <select
                    value={sortDirection}
                    onChange={e => setSortDirection(e.target.value as SortDirection)}
                    className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 font-medium"
                  >
                    <option value="asc">Ascending (↑)</option>
                    <option value="desc">Descending (↓)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Playback & Step Slider */}
            {sortResult && (
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsSortPlaying(!isSortPlaying)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors ${
                      isSortPlaying
                        ? 'bg-amber-500 hover:bg-amber-600 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {isSortPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    {isSortPlaying ? 'Pause' : 'Auto Play'}
                  </button>

                  <button
                    disabled={sortStepIdx >= sortResult.steps.length - 1}
                    onClick={() => setSortStepIdx(idx => Math.min(sortResult.steps.length - 1, idx + 1))}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 flex items-center gap-1"
                  >
                    <SkipForward className="w-3.5 h-3.5" /> Step Next
                  </button>

                  <button
                    onClick={() => {
                      setIsSortPlaying(false);
                      setSortStepIdx(0);
                    }}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600"
                    title="Reset to beginning"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  {/* Speed slider */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-2">
                    <span>Speed:</span>
                    <input
                      type="range"
                      min={50}
                      max={1000}
                      step={50}
                      value={1050 - sortPlaybackSpeed}
                      onChange={e => setSortPlaybackSpeed(1050 - parseInt(e.target.value, 10))}
                      className="w-20 cursor-pointer accent-indigo-600"
                    />
                  </div>
                </div>

                {/* Progress Stats */}
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="text-slate-600">
                    Step: <strong>{sortStepIdx + 1}</strong> / {sortResult.steps.length}
                  </span>
                  <span className="text-indigo-600 font-bold">
                    Comps: {currentSortStep ? currentSortStep.comparisonsCount : 0}
                  </span>
                  <span className="text-amber-600 font-bold">
                    Swaps/Merges: {currentSortStep ? currentSortStep.swapsCount : 0}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Current Step Explanation Box */}
          {currentSortStep && (
            <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm border border-slate-800 flex items-start gap-3">
              <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                    Execution Trace • Step #{currentSortStep.stepNumber} {currentSortStep.pass ? `(Pass ${currentSortStep.pass})` : ''}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Complexity: {sortResult?.timeComplexity}
                  </span>
                </div>
                <p className="text-sm font-mono text-slate-200 mt-1">
                  {currentSortStep.explanation}
                </p>
              </div>
            </div>
          )}

          {/* Array Visualizer (Active Event Cards) */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Memory State: Event Array [{currentSortArray.length} items]
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {currentSortArray.map((ev, index) => {
                const isComparing = (currentSortStep?.comparingIndices as number[] | undefined)?.includes(index);
                const isSwapped = (currentSortStep?.swappedIndices as number[] | undefined)?.includes(index);
                const isMerged = currentSortStep?.mergedIndices?.includes(index);

                let cardBorder = 'border-slate-200 bg-white';
                if (isSwapped) {
                  cardBorder = 'border-amber-400 bg-amber-50/80 ring-2 ring-amber-400/40';
                } else if (isComparing) {
                  cardBorder = 'border-indigo-500 bg-indigo-50/80 ring-2 ring-indigo-500/40';
                } else if (isMerged) {
                  cardBorder = 'border-teal-400 bg-teal-50/60';
                }

                return (
                  <div
                    key={ev.id}
                    className={`p-3 rounded-xl border transition-all relative ${cardBorder} shadow-2xs`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        Index [{index}]
                      </span>
                      <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                        ID #{ev.id}
                      </span>
                    </div>

                    <h5 className="text-xs font-bold text-slate-900 mt-1.5 truncate" title={ev.title}>
                      {ev.title}
                    </h5>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{ev.date}</span>
                      <span className="font-semibold text-slate-700">{ev.startTime}</span>
                    </div>

                    {isComparing && (
                      <span className="absolute -top-2.5 right-2 px-1.5 py-0.2 bg-indigo-600 text-white font-bold text-[9px] rounded uppercase shadow-xs">
                        Comparing
                      </span>
                    )}
                    {isSwapped && (
                      <span className="absolute -top-2.5 right-2 px-1.5 py-0.2 bg-amber-500 text-white font-bold text-[9px] rounded uppercase shadow-xs">
                        Swapped
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Benchmark & Comparison Matrix Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 mb-1">
              Empirical vs Theoretical Algorithm Comparison Matrix
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Real execution metrics benchmarked on the active {events.length}-event dataset:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-2.5 px-3">Algorithm</th>
                    <th className="py-2.5 px-3">Empirical Comparisons</th>
                    <th className="py-2.5 px-3">Empirical Swaps/Merges</th>
                    <th className="py-2.5 px-3">Best Time</th>
                    <th className="py-2.5 px-3">Worst Time</th>
                    <th className="py-2.5 px-3">Space Complexity</th>
                    <th className="py-2.5 px-3">Stability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className={sortAlgo === 'bubble' ? 'bg-indigo-50/50 font-semibold' : ''}>
                    <td className="py-2.5 px-3">Bubble Sort</td>
                    <td className="py-2.5 px-3 font-mono text-indigo-700 font-bold">
                      {allSortComparisons.bubble.totalComparisons}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-amber-700">
                      {allSortComparisons.bubble.totalSwaps}
                    </td>
                    <td className="py-2.5 px-3 font-mono">O(N)</td>
                    <td className="py-2.5 px-3 font-mono">O(N²)</td>
                    <td className="py-2.5 px-3 font-mono">O(1) In-Place</td>
                    <td className="py-2.5 px-3 text-emerald-600">Stable</td>
                  </tr>

                  <tr className={sortAlgo === 'selection' ? 'bg-indigo-50/50 font-semibold' : ''}>
                    <td className="py-2.5 px-3">Selection Sort</td>
                    <td className="py-2.5 px-3 font-mono text-indigo-700 font-bold">
                      {allSortComparisons.select.totalComparisons}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-amber-700">
                      {allSortComparisons.select.totalSwaps}
                    </td>
                    <td className="py-2.5 px-3 font-mono">O(N²)</td>
                    <td className="py-2.5 px-3 font-mono">O(N²)</td>
                    <td className="py-2.5 px-3 font-mono">O(1) In-Place</td>
                    <td className="py-2.5 px-3 text-red-600">Unstable</td>
                  </tr>

                  <tr className={sortAlgo === 'merge' ? 'bg-indigo-50/50 font-semibold' : ''}>
                    <td className="py-2.5 px-3">Merge Sort</td>
                    <td className="py-2.5 px-3 font-mono text-indigo-700 font-bold">
                      {allSortComparisons.merge.totalComparisons}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-amber-700">
                      {allSortComparisons.merge.totalSwaps}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-emerald-700">O(N log N)</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-700">O(N log N)</td>
                    <td className="py-2.5 px-3 font-mono">O(N) Auxiliary</td>
                    <td className="py-2.5 px-3 text-emerald-600">Stable</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SEARCHING TAB */}
      {/* ======================================================== */}
      {activeTab === 'search' && (
        <div className="space-y-5">
          {/* Controls Bar */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Algorithm Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Search Algorithm:
                </span>
                <button
                  onClick={() => setSearchAlgo('linear')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    searchAlgo === 'linear'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Linear Search (O(N))
                </button>
                <button
                  onClick={() => setSearchAlgo('binary')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    searchAlgo === 'binary'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Binary Search (O(log N))
                </button>
              </div>

              {/* Search target input */}
              <div className="flex items-center gap-2">
                <select
                  value={searchField}
                  onChange={e => setSearchField(e.target.value as 'id' | 'title' | 'venue')}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-xs font-semibold"
                >
                  <option value="id">By ID (Numeric)</option>
                  <option value="title">By Title</option>
                  {searchAlgo === 'linear' && <option value="venue">By Venue</option>}
                </select>

                <input
                  type="text"
                  placeholder="Target query (e.g. 107 or AI)..."
                  value={searchTarget}
                  onChange={e => setSearchTarget(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />

                <button
                  onClick={executeSearch}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  Run Search
                </button>
              </div>
            </div>

            {/* Binary Search Unsorted Alert */}
            {searchAlgo === 'binary' && searchResult && 'errorNotSorted' in searchResult && searchResult.errorNotSorted && (
              <div className="p-3 bg-red-50 border border-red-300 rounded-xl text-xs text-red-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold">Algorithmic Pre-condition Failed:</span>
                  <p>
                    Binary Search requires the array to be monotonically sorted on the search key.
                    The current event collection is unsorted by "{searchField}".
                  </p>
                  <button
                    onClick={sortDataForBinarySearch}
                    className="mt-1 px-3 py-1 bg-red-600 text-white rounded-md text-xs font-semibold hover:bg-red-700 transition-colors"
                  >
                    Auto-Sort Dataset &amp; Re-run Binary Search
                  </button>
                </div>
              </div>
            )}

            {/* Step Controls */}
            {searchResult && searchResult.steps.length > 0 && (
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsSearchPlaying(!isSearchPlaying)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors ${
                      isSearchPlaying
                        ? 'bg-amber-500 hover:bg-amber-600 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {isSearchPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    {isSearchPlaying ? 'Pause' : 'Auto Play'}
                  </button>

                  <button
                    disabled={searchStepIdx >= searchResult.steps.length - 1}
                    onClick={() => setSearchStepIdx(idx => Math.min(searchResult.steps.length - 1, idx + 1))}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 flex items-center gap-1"
                  >
                    <SkipForward className="w-3.5 h-3.5" /> Step Next
                  </button>

                  <button
                    onClick={() => {
                      setIsSearchPlaying(false);
                      setSearchStepIdx(0);
                    }}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <span>
                    Step: <strong>{searchStepIdx + 1}</strong> / {searchResult.steps.length}
                  </span>
                  <span className="text-indigo-600 font-bold">
                    Total Comparisons: {searchResult.totalComparisons}
                  </span>
                  <span className={searchResult.foundIndex !== -1 ? 'text-emerald-600 font-bold' : 'text-red-500'}>
                    Result: {searchResult.foundIndex !== -1 ? `Found at index [${searchResult.foundIndex}]` : 'Not Found'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Current Step Trace */}
          {currentSearchStep && (
            <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-teal-400">
                  Step #{currentSearchStep.stepNumber}: Examining Record [Index {currentSearchStep.currentIndex}]
                </span>
                <span className="font-mono text-slate-400">
                  {searchAlgo === 'binary' && currentSearchStep.lowIndex !== undefined
                    ? `Low: ${currentSearchStep.lowIndex} | Mid: ${currentSearchStep.midIndex} | High: ${currentSearchStep.highIndex}`
                    : 'Sequential scan'}
                </span>
              </div>
              <p className="text-sm font-mono text-slate-200">
                {currentSearchStep.comparisonMade}
              </p>
              <p className={`text-xs font-medium ${currentSearchStep.isMatch ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                {currentSearchStep.explanation}
              </p>
            </div>
          )}

          {/* Search Cards Visualization */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Array Elements under Search Inspection
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {events.map((ev, index) => {
                const isCurrent = currentSearchStep?.currentIndex === index;
                const isMatch = isCurrent && currentSearchStep?.isMatch;

                let cardStyle = 'border-slate-200 bg-white opacity-80';
                if (isMatch) {
                  cardStyle = 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/50 opacity-100 shadow-md';
                } else if (isCurrent) {
                  cardStyle = 'border-indigo-500 bg-indigo-50/80 ring-2 ring-indigo-500/50 opacity-100 shadow-md';
                }

                return (
                  <div
                    key={ev.id}
                    className={`p-3 rounded-xl border transition-all ${cardStyle}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-500">
                        Index [{index}]
                      </span>
                      <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                        #{ev.id}
                      </span>
                    </div>

                    <h5 className="text-xs font-bold text-slate-900 mt-1 truncate">
                      {ev.title}
                    </h5>

                    <p className="text-[11px] text-slate-500 mt-1 truncate">
                      {ev.venue}
                    </p>

                    {isCurrent && (
                      <span
                        className={`mt-2 block text-center text-[10px] font-bold py-0.5 rounded uppercase ${
                          isMatch ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'
                        }`}
                      >
                        {isMatch ? 'Match Found!' : 'Inspecting Pointer'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
