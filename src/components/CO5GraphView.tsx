import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Network,
  Play,
  RotateCcw,
  SkipForward,
  Pause,
  Layers,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2,
  Grid
} from 'lucide-react';
import { EventItem, GraphTraversalStep } from '../types/event';
import { EventGraph, GraphNodeLayout, GraphEdgeItem } from '../algorithms/co5Graph';

interface CO5GraphViewProps {
  events: EventItem[];
}

export const CO5GraphView: React.FC<CO5GraphViewProps> = ({ events }) => {
  // Build and memoize graph structure
  const graph = useMemo(() => new EventGraph(events), [events]);

  // Traversal options
  const [startNodeId, setStartNodeId] = useState<number>(events[0]?.id || 101);
  const [traversalAlgo, setTraversalAlgo] = useState<'bfs' | 'dfs'>('bfs');

  // Traversal execution state
  const [traversalSteps, setTraversalSteps] = useState<GraphTraversalStep[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [traversalOrder, setTraversalOrder] = useState<number[]>([]);
  const [inspectorTab, setInspectorTab] = useState<'trace' | 'adjList' | 'matrix'>('trace');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Compute 2D node layout
  const graphWidth = 840;
  const graphHeight = 520;
  const nodeLayouts = useMemo(() => {
    return graph.computeGraphLayout(graphWidth, graphHeight);
  }, [graph]);

  const nodePosMap = useMemo(() => {
    const map = new Map<number, GraphNodeLayout>();
    nodeLayouts.forEach(n => map.set(n.id, n));
    return map;
  }, [nodeLayouts]);

  // Run or prepare traversal
  const prepareTraversal = (algo = traversalAlgo, startId = startNodeId) => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);

    if (algo === 'bfs') {
      const res = graph.runBFS(startId);
      setTraversalSteps(res.steps);
      setTraversalOrder(res.traversalOrder);
      setCurrentStepIdx(0);
    } else {
      const res = graph.runDFS(startId);
      setTraversalSteps(res.steps);
      setTraversalOrder(res.traversalOrder);
      setCurrentStepIdx(0);
    }
  };

  // Initial trigger
  useEffect(() => {
    prepareTraversal(traversalAlgo, startNodeId);
  }, [traversalAlgo, startNodeId, graph]);

  // Playback timer
  useEffect(() => {
    if (isPlaying && traversalSteps.length > 0) {
      timerRef.current = setInterval(() => {
        setCurrentStepIdx(prev => {
          if (prev >= traversalSteps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 800);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, traversalSteps]);

  const currentStep = traversalSteps[currentStepIdx] || null;
  const visitedSet = useMemo(() => {
    return new Set(currentStep?.visitedNodes || []);
  }, [currentStep]);

  // Adjacency Matrix
  const { matrix, nodeIds } = useMemo(() => graph.getAdjacencyMatrix(), [graph]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex items-start gap-4">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
          <Network className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              CO5: Non-Linear Graph Modeling &amp; Traversal Lab
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
              G = (V, E)
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            In EventFlow, symposium events are modeled as <strong>Vertices (V)</strong>.
            Directed edges represent <strong>Chronological Prerequisite Pipelines</strong> (e.g., Opening Keynote $\to$ Workshop tracks),
            while bidirectional edges represent <strong>Shared Venue Transitions</strong>.
            Traversing this topology enables dependency analysis and multi-track coordination in $O(V + E)$ time.
          </p>
        </div>
      </div>

      {/* Control Strip */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Algorithm & Start Node */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Algorithm:
              </span>
              <button
                onClick={() => setTraversalAlgo('bfs')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  traversalAlgo === 'bfs'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                BFS (Queue FIFO)
              </button>
              <button
                onClick={() => setTraversalAlgo('dfs')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  traversalAlgo === 'dfs'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                DFS (Stack LIFO / Recursion)
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-slate-500">Start Vertex:</span>
              <select
                value={startNodeId}
                onChange={e => setStartNodeId(parseInt(e.target.value, 10))}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 font-semibold"
              >
                {events.map(e => (
                  <option key={e.id} value={e.id}>
                    #{e.id}: {e.title.slice(0, 22)}...
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors ${
                isPlaying
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isPlaying ? 'Pause' : 'Auto Play'}
            </button>

            <button
              disabled={currentStepIdx >= traversalSteps.length - 1}
              onClick={() => setCurrentStepIdx(idx => Math.min(traversalSteps.length - 1, idx + 1))}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 flex items-center gap-1"
            >
              <SkipForward className="w-3.5 h-3.5" /> Next Step
            </button>

            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentStepIdx(0);
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600"
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Step Tracker Bar */}
        {currentStep && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <span className="text-slate-600">
              Step: <strong>{currentStep.stepNumber}</strong> / {traversalSteps.length}
            </span>

            {/* Dynamic Queue or Stack Inspector */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-indigo-700 uppercase">
                {traversalAlgo === 'bfs' ? 'Queue State [FIFO]:' : 'Call Stack [LIFO]:'}
              </span>
              <div className="flex items-center gap-1 bg-slate-900 text-white px-2 py-0.5 rounded text-[11px]">
                {currentStep.queueOrStackState.length === 0 ? (
                  <span className="text-slate-500">Empty</span>
                ) : (
                  currentStep.queueOrStackState.map((id, i) => (
                    <span key={`${id}-${i}`} className="bg-indigo-600/80 px-1.5 py-0.2 rounded font-bold">
                      #{id}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Visited Set Size */}
            <span className="text-emerald-700 font-bold">
              Visited Vertices: {visitedSet.size} / {events.length}
            </span>
          </div>
        )}
      </div>

      {/* Step Description Callout */}
      {currentStep && (
        <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm border border-slate-800 flex items-start gap-3">
          <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                Active Graph Exploration • Step #{currentStep.stepNumber}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Visiting Vertex #{currentStep.currentNodeId}
              </span>
            </div>
            <p className="text-sm font-mono text-slate-200 mt-1">
              {currentStep.actionDescription}
            </p>
          </div>
        </div>
      )}

      {/* Graph Visualizer Canvas */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between mb-2 text-xs text-slate-500">
          <span className="font-bold uppercase tracking-wider">
            Interactive Topology Canvas ({nodeLayouts.length} Vertices, {graph.edges.length} Edges)
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-indigo-500 inline-block" /> Prerequisite
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-teal-500 inline-block" /> Shared Venue
            </span>
          </div>
        </div>

        <div className="min-w-[780px] overflow-x-auto flex justify-center">
          <svg
            viewBox={`0 0 ${graphWidth} ${graphHeight}`}
            className="w-full max-w-4xl h-auto select-none"
          >
            <defs>
              {/* Arrowhead marker for directed prerequisite edges */}
              <marker
                id="arrowhead-prereq"
                markerWidth="8"
                markerHeight="6"
                refX="18"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#6366f1" />
              </marker>
              <marker
                id="arrowhead-active"
                markerWidth="10"
                markerHeight="7"
                refX="20"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
              </marker>
            </defs>

            {/* Render Graph Edges */}
            {graph.edges.map((edge, idx) => {
              const src = nodePosMap.get(edge.sourceId);
              const dst = nodePosMap.get(edge.targetId);
              if (!src || !dst) return null;

              const isCurrentEdge =
                currentStep?.currentEdge &&
                ((currentStep.currentEdge[0] === edge.sourceId && currentStep.currentEdge[1] === edge.targetId) ||
                 (currentStep.currentEdge[0] === edge.targetId && currentStep.currentEdge[1] === edge.sourceId));

              const isPrereq = edge.type === 'Prerequisite';

              return (
                <line
                  key={`edge-${edge.sourceId}-${edge.targetId}-${idx}`}
                  x1={src.x}
                  y1={src.y}
                  x2={dst.x}
                  y2={dst.y}
                  stroke={isCurrentEdge ? '#f59e0b' : isPrereq ? '#6366f1' : '#14b8a6'}
                  strokeWidth={isCurrentEdge ? '3.5' : isPrereq ? '2' : '1.5'}
                  strokeDasharray={edge.type === 'Shared Venue' ? '4 3' : 'none'}
                  opacity={isCurrentEdge ? 1 : 0.65}
                  markerEnd={isPrereq ? (isCurrentEdge ? 'url(#arrowhead-active)' : 'url(#arrowhead-prereq)') : undefined}
                />
              );
            })}

            {/* Render Graph Vertices */}
            {nodeLayouts.map(node => {
              const isCurrent = currentStep?.currentNodeId === node.id;
              const isVisited = visitedSet.has(node.id);
              const isStart = node.id === startNodeId;

              return (
                <g
                  key={`vertex-${node.id}`}
                  className="cursor-pointer transition-transform duration-300"
                  onClick={() => {
                    setStartNodeId(node.id);
                    prepareTraversal(traversalAlgo, node.id);
                  }}
                >
                  {/* Outer pulse for current active vertex */}
                  {isCurrent && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="28"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3"
                      className="animate-ping"
                    />
                  )}

                  {/* Node Circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="20"
                    fill={isCurrent ? '#f59e0b' : isVisited ? '#4f46e5' : isStart ? '#0f766e' : '#1e293b'}
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    className="shadow-md hover:scale-115 transition-transform"
                  />

                  {/* Vertex Key */}
                  <text
                    x={node.x}
                    y={node.y + 4}
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="JetBrains Mono, monospace"
                    textAnchor="middle"
                  >
                    {node.id}
                  </text>

                  {/* Label */}
                  <text
                    x={node.x}
                    y={node.y + 32}
                    fill="#1e293b"
                    fontSize="9.5"
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {node.event.title.length > 16 ? `${node.event.title.slice(0, 14)}...` : node.event.title}
                  </text>

                  {/* Venue Subtitle */}
                  <text
                    x={node.x}
                    y={node.y + 44}
                    fill="#64748b"
                    fontSize="8.5"
                    textAnchor="middle"
                  >
                    {node.event.venue}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Adjacency Structures Inspector Tabs */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setInspectorTab('trace')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                inspectorTab === 'trace' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              Traversal Order Sequence
            </button>
            <button
              onClick={() => setInspectorTab('adjList')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                inspectorTab === 'adjList' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              Adjacency List (Map&lt;V, List&gt;)
            </button>
            <button
              onClick={() => setInspectorTab('matrix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                inspectorTab === 'matrix' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              Adjacency Matrix (V x V)
            </button>
          </div>

          <span className="text-xs text-slate-500 font-mono">
            Complexity: <strong>O(V + E)</strong> Time | <strong>O(V)</strong> Space
          </span>
        </div>

        {/* Tab 1: Traversal Sequence */}
        {inspectorTab === 'trace' && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 block">
              Explored Node Sequence:
            </span>
            <div className="flex flex-wrap gap-2">
              {traversalOrder.map((id, index) => {
                const isCurrent = currentStep?.currentNodeId === id;
                const isVisited = visitedSet.has(id);
                return (
                  <div
                    key={`${id}-${index}`}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-2 border transition-all ${
                      isCurrent
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : isVisited
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-slate-100 text-slate-400 border-slate-200'
                    }`}
                  >
                    <span>#{id}</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      ({graph.vertices.get(id)?.title.slice(0, 16)}...)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Adjacency List */}
        {inspectorTab === 'adjList' && (
          <div className="space-y-2 max-h-64 overflow-y-auto font-mono text-xs">
            {Array.from(graph.adjacencyList.entries()).map(([vertexId, neighbors]) => {
              const ev = graph.vertices.get(vertexId);
              return (
                <div key={vertexId} className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2">
                  <span className="font-bold text-indigo-700 shrink-0">
                    Vertex #{vertexId} [{ev?.venue}]:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {neighbors.length === 0 ? (
                      <span className="text-slate-400">∅ (No outbound edges)</span>
                    ) : (
                      neighbors.map((nb, i) => (
                        <span key={i} className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">
                          → #{nb.targetId} <span className="text-slate-500 text-[10px]">({nb.type})</span>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Adjacency Matrix */}
        {inspectorTab === 'matrix' && (
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="text-[11px] font-mono border-collapse">
              <thead>
                <tr>
                  <th className="p-1.5 bg-slate-100 border border-slate-200">V</th>
                  {nodeIds.map(id => (
                    <th key={id} className="p-1.5 bg-slate-100 border border-slate-200 text-indigo-700 font-bold">
                      #{id}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row, rIdx) => (
                  <tr key={nodeIds[rIdx]}>
                    <td className="p-1.5 bg-slate-100 border border-slate-200 font-bold text-indigo-700">
                      #{nodeIds[rIdx]}
                    </td>
                    {row.map((val, cIdx) => (
                      <td
                        key={cIdx}
                        className={`p-1.5 text-center border border-slate-200 font-bold ${
                          val === 1 ? 'bg-indigo-600 text-white' : 'text-slate-300'
                        }`}
                      >
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
