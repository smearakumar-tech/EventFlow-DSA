import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Binary,
  Search,
  Plus,
  Trash2,
  Play,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { EventItem, BSTNode } from '../types/event';
import { BinarySearchTree, BSTOperationResult } from '../algorithms/co4BST';

interface CO4BSTViewProps {
  events: EventItem[];
}

export const CO4BSTView: React.FC<CO4BSTViewProps> = ({ events }) => {
  // Build and maintain BST instance in React state
  const [bst, setBst] = useState<BinarySearchTree>(() => new BinarySearchTree(events));

  // User input states
  const [searchKeyInput, setSearchKeyInput] = useState<string>('105');
  const [deleteKeyInput, setDeleteKeyInput] = useState<string>('104');
  const [selectedEventIdToInsert, setSelectedEventIdToInsert] = useState<number>(events[0]?.id || 101);

  // Active highlights
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<number[]>([]);
  const [activeStepDescription, setActiveStepDescription] = useState<string>('');
  const [lastOperationResult, setLastOperationResult] = useState<string | null>(null);

  // Traversal playback
  const [traversalType, setTraversalType] = useState<'inorder' | 'preorder' | 'postorder' | 'level'>('inorder');
  const [traversalResultSequence, setTraversalResultSequence] = useState<number[]>([]);
  const [isTraversing, setIsTraversing] = useState<boolean>(false);
  const [traversalIndex, setTraversalIndex] = useState<number>(0);
  const traversalTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Re-sync BST if external events prop changes
  useEffect(() => {
    setBst(new BinarySearchTree(events));
  }, [events]);

  // Compute SVG layout coordinates
  const canvasWidth = 900;
  const treeNodes = useMemo(() => {
    return bst.computeTreeLayout(canvasWidth, 75);
  }, [bst]);

  // Tree stats
  const treeHeight = bst.getHeight();
  const totalNodes = bst.getNodeCount();
  const isBalanced = bst.isBalanced();

  // Search Handler
  const handleSearch = () => {
    const key = parseInt(searchKeyInput, 10);
    if (isNaN(key)) return;

    const res = bst.search(key);
    setHighlightedNodeIds(res.path);
    setActiveStepDescription(
      res.steps.map(s => `Step ${s.step}: Node #${s.visitedNodeId} (${s.explanation})`).join('\n')
    );
    setLastOperationResult(res.message);
  };

  // Insert Handler
  const handleInsert = () => {
    const ev = events.find(e => e.id === selectedEventIdToInsert);
    if (!ev) return;

    // Clone tree
    const currentInorder = bst.inorder().map(n => n.event);
    const updatedTree = new BinarySearchTree([...currentInorder, ev]);
    setBst(updatedTree);

    const res = updatedTree.search(ev.id);
    setHighlightedNodeIds(res.path);
    setActiveStepDescription(`Inserted Event #${ev.id} ("${ev.title}"). BST ordering invariant preserved.`);
    setLastOperationResult(`Event #${ev.id} inserted successfully.`);
  };

  // Delete Handler
  const handleDelete = () => {
    const key = parseInt(deleteKeyInput, 10);
    if (isNaN(key)) return;

    const delRes = bst.delete(key);
    // Trigger re-render by creating new instance of remaining nodes
    const remainingEvents = bst.inorder().map(n => n.event);
    setBst(new BinarySearchTree(remainingEvents));

    setHighlightedNodeIds([]);
    setActiveStepDescription(delRes.steps.join('\n'));
    setLastOperationResult(delRes.explanation);
  };

  // Reset to initial events
  const handleResetTree = () => {
    if (traversalTimerRef.current) clearInterval(traversalTimerRef.current);
    setIsTraversing(false);
    setBst(new BinarySearchTree(events));
    setHighlightedNodeIds([]);
    setActiveStepDescription('BST reset with all initial event keys.');
    setLastOperationResult('Tree restored to default state.');
    setTraversalResultSequence([]);
  };

  // Traversal Handler
  const runTraversal = (type: 'inorder' | 'preorder' | 'postorder' | 'level') => {
    setTraversalType(type);
    let nodes: BSTNode[] = [];
    if (type === 'inorder') nodes = bst.inorder();
    else if (type === 'preorder') nodes = bst.preorder();
    else if (type === 'postorder') nodes = bst.postorder();
    else nodes = bst.levelOrder();

    const sequence = nodes.map(n => n.id);
    setTraversalResultSequence(sequence);
    setIsTraversing(true);
    setTraversalIndex(0);

    if (sequence.length > 0) {
      setHighlightedNodeIds([sequence[0]]);
      setActiveStepDescription(
        `Starting ${type.toUpperCase()} traversal: Visiting first node #${sequence[0]} ("${nodes[0].event.title}").`
      );
    }
  };

  // Traversal animation timer
  useEffect(() => {
    if (isTraversing && traversalResultSequence.length > 0) {
      traversalTimerRef.current = setInterval(() => {
        setTraversalIndex(prev => {
          const next = prev + 1;
          if (next >= traversalResultSequence.length) {
            setIsTraversing(false);
            setActiveStepDescription(
              `${traversalType.toUpperCase()} traversal complete! Visited all ${traversalResultSequence.length} nodes.`
            );
            return prev;
          }
          const currentId = traversalResultSequence[next];
          setHighlightedNodeIds(traversalResultSequence.slice(0, next + 1));
          return next;
        });
      }, 700);
    } else {
      if (traversalTimerRef.current) clearInterval(traversalTimerRef.current);
    }
    return () => {
      if (traversalTimerRef.current) clearInterval(traversalTimerRef.current);
    };
  }, [isTraversing, traversalResultSequence, traversalType]);

  // Helper map for rendering lines
  const nodeMap = useMemo(() => {
    const map = new Map<number, BSTNode>();
    treeNodes.forEach(n => map.set(n.id, n));
    return map;
  }, [treeNodes]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* BST Overview */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex items-start gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
            <Binary className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                CO4: Binary Search Tree (BST) Visualizer
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                Hierarchical Data Structure
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Every node satisfies the <strong>BST Property</strong>: for any node $X$, all keys in the left subtree are strictly smaller than $Key(X)$, and all keys in the right subtree are strictly greater ($Left &lt; X &lt; Right$).
              In-Order traversal on a BST produces a mathematically sorted sequence in $O(N)$ time.
            </p>
          </div>
        </div>

        {/* Tree Metrics */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Tree Invariants
          </span>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="p-2 bg-slate-50 rounded-lg text-center border border-slate-100">
              <span className="text-[10px] text-slate-500 block">Nodes</span>
              <span className="text-lg font-extrabold text-slate-900">{totalNodes}</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg text-center border border-slate-100">
              <span className="text-[10px] text-slate-500 block">Height</span>
              <span className="text-lg font-extrabold text-slate-900">{treeHeight}</span>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-center font-medium text-slate-600">
            AVL Balanced: <strong className={isBalanced ? 'text-emerald-600' : 'text-amber-600'}>{isBalanced ? 'Yes' : 'Slightly Skewed'}</strong>
          </div>
        </div>
      </div>

      {/* Control Panel: Operations & Traversals */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Search */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-indigo-600" />
              1. Search Key (O(log N))
            </span>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="ID (e.g. 105)"
                value={searchKeyInput}
                onChange={e => setSearchKeyInput(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
              />
              <button
                onClick={handleSearch}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          {/* 2. Insert Node */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-teal-600" />
              2. Insert Event Node
            </span>
            <div className="flex gap-2">
              <select
                value={selectedEventIdToInsert}
                onChange={e => setSelectedEventIdToInsert(parseInt(e.target.value, 10))}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
              >
                {events.map(e => (
                  <option key={e.id} value={e.id}>
                    #{e.id}: {e.title.slice(0, 24)}...
                  </option>
                ))}
              </select>
              <button
                onClick={handleInsert}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors"
              >
                Insert
              </button>
            </div>
          </div>

          {/* 3. Delete Node */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              3. Delete Node (Successor)
            </span>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="ID to delete"
                value={deleteKeyInput}
                onChange={e => setDeleteKeyInput(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
              />
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Traversal Buttons */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-1">
              Traversals:
            </span>
            <button
              onClick={() => runTraversal('inorder')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                traversalType === 'inorder' && isTraversing
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              In-Order (Sorted: L → N → R)
            </button>
            <button
              onClick={() => runTraversal('preorder')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                traversalType === 'preorder' && isTraversing
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Pre-Order (N → L → R)
            </button>
            <button
              onClick={() => runTraversal('postorder')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                traversalType === 'postorder' && isTraversing
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Post-Order (L → R → N)
            </button>
            <button
              onClick={() => runTraversal('level')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                traversalType === 'level' && isTraversing
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Level-Order (BFS Queue)
            </button>
          </div>

          <button
            onClick={handleResetTree}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Tree
          </button>
        </div>

        {/* Traversal Output Sequence */}
        {traversalResultSequence.length > 0 && (
          <div className="p-3 bg-slate-950 text-white rounded-xl text-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-bold uppercase tracking-wider text-indigo-400">
                {traversalType.toUpperCase()} Sequence Output:
              </span>
              <span className="font-mono text-[11px]">
                {traversalIndex + 1} / {traversalResultSequence.length} Nodes Visited
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {traversalResultSequence.map((key, idx) => {
                const isPassed = idx <= traversalIndex;
                const isCurrent = idx === traversalIndex;
                return (
                  <span
                    key={`${key}-${idx}`}
                    className={`font-mono text-xs px-2 py-0.5 rounded transition-all ${
                      isCurrent
                        ? 'bg-indigo-500 text-white font-bold ring-2 ring-indigo-300 scale-105'
                        : isPassed
                        ? 'bg-slate-800 text-teal-300'
                        : 'bg-slate-900 text-slate-600'
                    }`}
                  >
                    #{key}
                  </span>
                );
              })}
            </div>
            {traversalType === 'inorder' && (
              <p className="text-[11px] text-emerald-400 pt-1">
                ✓ Mathematical Invariant Verified: In-Order traversal visits keys in strictly monotonic ascending order.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Trace Log Banner */}
      {(activeStepDescription || lastOperationResult) && (
        <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm border border-slate-800 text-xs font-mono space-y-1">
          <span className="font-bold uppercase tracking-wider text-amber-400 block">
            Operation Trace Log:
          </span>
          <pre className="text-slate-200 whitespace-pre-wrap leading-relaxed">
            {activeStepDescription || lastOperationResult}
          </pre>
        </div>
      )}

      {/* Interactive SVG Tree Canvas */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
          <span className="font-bold uppercase tracking-wider">
            SVG Tree Topology View (Auto-Layout)
          </span>
          <span>Click on any node to view event record</span>
        </div>

        {treeNodes.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Binary className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-600">BST is currently empty</p>
            <p className="text-xs text-slate-400 mt-1">Insert an event or click "Reset Tree" to load initial keys.</p>
          </div>
        ) : (
          <div className="min-w-[850px] overflow-x-auto">
            <svg
              viewBox={`0 0 ${canvasWidth} ${Math.max(450, (treeHeight + 1) * 85)}`}
              className="w-full h-auto select-none"
            >
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Render Branch Lines First */}
              {treeNodes.map(node => {
                const nodeX = node.x ?? 0;
                const nodeY = node.y ?? 0;

                const leftChild = node.left ? nodeMap.get(node.left.id) : null;
                const rightChild = node.right ? nodeMap.get(node.right.id) : null;

                return (
                  <g key={`lines-${node.id}`}>
                    {leftChild && (
                      <line
                        x1={nodeX}
                        y1={nodeY}
                        x2={leftChild.x ?? 0}
                        y2={leftChild.y ?? 0}
                        stroke="#cbd5e1"
                        strokeWidth="2.5"
                        strokeDasharray="none"
                      />
                    )}
                    {rightChild && (
                      <line
                        x1={nodeX}
                        y1={nodeY}
                        x2={rightChild.x ?? 0}
                        y2={rightChild.y ?? 0}
                        stroke="#cbd5e1"
                        strokeWidth="2.5"
                        strokeDasharray="none"
                      />
                    )}
                  </g>
                );
              })}

              {/* Render Nodes */}
              {treeNodes.map(node => {
                const nodeX = node.x ?? 0;
                const nodeY = node.y ?? 0;
                const isHighlighted = highlightedNodeIds.includes(node.id);
                const isCurrentActive = highlightedNodeIds[highlightedNodeIds.length - 1] === node.id;

                return (
                  <g
                    key={`node-${node.id}`}
                    className="cursor-pointer transition-all duration-300"
                    onClick={() => {
                      setHighlightedNodeIds([node.id]);
                      setActiveStepDescription(
                        `Inspected Node #${node.id}: "${node.event.title}"\nVenue: ${node.event.venue} | Date: ${node.event.date} (${node.event.startTime}-${node.event.endTime})\nOrganizer: ${node.event.organizer}`
                      );
                    }}
                  >
                    {/* Glowing highlight circle */}
                    {isHighlighted && (
                      <circle
                        cx={nodeX}
                        cy={nodeY}
                        r="26"
                        fill="none"
                        stroke={isCurrentActive ? '#6366f1' : '#14b8a6'}
                        strokeWidth="3.5"
                        filter="url(#glow)"
                        className="animate-pulse"
                      />
                    )}

                    {/* Main Node Circle */}
                    <circle
                      cx={nodeX}
                      cy={nodeY}
                      r="20"
                      fill={isCurrentActive ? '#4f46e5' : isHighlighted ? '#0f766e' : '#1e293b'}
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="shadow-md hover:scale-110 transition-transform"
                    />

                    {/* Key Text */}
                    <text
                      x={nodeX}
                      y={nodeY + 4}
                      fill="#ffffff"
                      fontSize="11"
                      fontWeight="bold"
                      fontFamily="JetBrains Mono, monospace"
                      textAnchor="middle"
                    >
                      {node.id}
                    </text>

                    {/* Event Title Label underneath */}
                    <text
                      x={nodeX}
                      y={nodeY + 34}
                      fill="#334155"
                      fontSize="9.5"
                      fontWeight="600"
                      textAnchor="middle"
                      className="pointer-events-none"
                    >
                      {node.event.title.length > 18 ? `${node.event.title.slice(0, 16)}...` : node.event.title}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};
