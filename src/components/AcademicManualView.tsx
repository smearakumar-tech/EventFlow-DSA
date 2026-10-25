import React from 'react';
import {
  GraduationCap,
  BookOpen,
  Search,
  Binary,
  Network,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Code2,
  Cpu
} from 'lucide-react';

export const AcademicManualView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Header Profile Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-indigo-900/40">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-400/30 w-fit mb-3">
          <GraduationCap className="w-4 h-4" />
          <span>Department of Computer Science &amp; Engineering • Micro-Project Report</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          EventFlow — Academic Lab Manual &amp; Course Outcomes
        </h1>
        <p className="text-slate-300 text-xs md:text-sm mt-2 leading-relaxed">
          Course Outcome (CO) mapping, algorithmic proofs, time and space complexity matrices,
          and data structure invariant specifications for academic laboratory evaluation.
        </p>
      </div>

      {/* CO Mapping Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-600 mb-2 font-bold text-sm">
            <Search className="w-4 h-4" />
            <span>CO3: Searching &amp; Sorting</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Apply linear and divide-and-conquer searching and sorting techniques to real-world dataset records.
            Analyze worst, average, and best-case computational time complexities.
          </p>
          <div className="mt-3 text-[11px] font-mono text-indigo-700 bg-indigo-50 p-2 rounded-lg">
            Linear, Binary Search • Bubble, Selection, Merge Sort
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center gap-2 text-teal-600 mb-2 font-bold text-sm">
            <Binary className="w-4 h-4" />
            <span>CO4: Hierarchical Trees</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Construct, balance, and traverse Binary Search Trees (BST).
            Implement insertion, deletion with in-order successors, and prove that In-Order traversal guarantees sorted output.
          </p>
          <div className="mt-3 text-[11px] font-mono text-teal-700 bg-teal-50 p-2 rounded-lg">
            BST Property • In, Pre, Post, Level-Order Traversals
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center gap-2 text-amber-600 mb-2 font-bold text-sm">
            <Network className="w-4 h-4" />
            <span>CO5: Graph Algorithms</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Model relational entities as vertices and dependency/shared-venue links as edges.
            Implement Breadth-First Search (Queue) and Depth-First Search (Stack) with asymptotic $O(V + E)$ runtime.
          </p>
          <div className="mt-3 text-[11px] font-mono text-amber-700 bg-amber-50 p-2 rounded-lg">
            Adjacency List/Matrix • BFS (FIFO) • DFS (LIFO)
          </div>
        </div>
      </div>

      {/* Section 1: Venue Conflict Detection */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
          <Clock className="w-5 h-5 text-indigo-600" />
          <span>1. Venue Conflict Detection Algorithm</span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          A fundamental micro-scheduling challenge is preventing double-booking of physical halls.
          Two events $E_1$ and $E_2$ present a physical collision if and only if:
        </p>

        <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs space-y-2">
          <div className="text-amber-400 font-bold">// Formal Intersection Condition:</div>
          <div>Condition 1: Venue(E₁) === Venue(E₂)</div>
          <div>Condition 2: Date(E₁) === Date(E₂)</div>
          <div>Condition 3: [Start₁, End₁) ∩ [Start₂, End₂) ≠ ∅</div>
          <div className="text-emerald-400">Equivalent Boolean Evaluation: (Start₁ &lt; End₂) &amp;&amp; (End₁ &gt; Start₂)</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-800 block">Boundary Edge Case:</span>
            <p className="text-slate-600 mt-1">
              If Event A ends at 11:30 and Event B starts at 11:30 in the same hall, $11:30 &lt; 11:30$ evaluates to False.
              Hence, contiguous back-to-back events are non-conflicting.
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-800 block">Collision Duration Formula:</span>
            <p className="text-slate-600 mt-1">
              Overlap Window: $[\max(Start_A, Start_B), \min(End_A, End_B)]$.
              Overlap Duration: $\min(End_A, End_B) - \max(Start_A, Start_B)$ in minutes.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: CO3 Algorithms & Big-O Complexity Matrix */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
          <Code2 className="w-5 h-5 text-indigo-600" />
          <span>2. CO3: Searching &amp; Sorting Complexity Matrix</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <th className="py-2.5 px-3">Algorithm</th>
                <th className="py-2.5 px-3">Best Case Time</th>
                <th className="py-2.5 px-3">Average Case Time</th>
                <th className="py-2.5 px-3">Worst Case Time</th>
                <th className="py-2.5 px-3">Worst Case Space</th>
                <th className="py-2.5 px-3">Stability</th>
                <th className="py-2.5 px-3">In-Place</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              <tr>
                <td className="py-2.5 px-3 font-sans font-bold text-slate-900">Linear Search</td>
                <td className="py-2.5 px-3 text-emerald-600">O(1)</td>
                <td className="py-2.5 px-3">O(N)</td>
                <td className="py-2.5 px-3 text-red-600">O(N)</td>
                <td className="py-2.5 px-3">O(1)</td>
                <td className="py-2.5 px-3 font-sans">N/A</td>
                <td className="py-2.5 px-3 font-sans text-emerald-600">Yes</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-bold text-slate-900">Binary Search</td>
                <td className="py-2.5 px-3 text-emerald-600">O(1)</td>
                <td className="py-2.5 px-3 text-emerald-600">O(log N)</td>
                <td className="py-2.5 px-3 text-emerald-600">O(log N)</td>
                <td className="py-2.5 px-3">O(1) Iterative</td>
                <td className="py-2.5 px-3 font-sans">N/A</td>
                <td className="py-2.5 px-3 font-sans text-emerald-600">Yes</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-bold text-slate-900">Bubble Sort</td>
                <td className="py-2.5 px-3 text-emerald-600">O(N) [Flag]</td>
                <td className="py-2.5 px-3 text-red-600">O(N²)</td>
                <td className="py-2.5 px-3 text-red-600">O(N²)</td>
                <td className="py-2.5 px-3">O(1)</td>
                <td className="py-2.5 px-3 font-sans text-emerald-600">Stable</td>
                <td className="py-2.5 px-3 font-sans text-emerald-600">Yes</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-bold text-slate-900">Selection Sort</td>
                <td className="py-2.5 px-3 text-red-600">O(N²)</td>
                <td className="py-2.5 px-3 text-red-600">O(N²)</td>
                <td className="py-2.5 px-3 text-red-600">O(N²)</td>
                <td className="py-2.5 px-3">O(1)</td>
                <td className="py-2.5 px-3 font-sans text-red-600">Unstable</td>
                <td className="py-2.5 px-3 font-sans text-emerald-600">Yes</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-bold text-slate-900">Merge Sort</td>
                <td className="py-2.5 px-3 text-emerald-600">O(N log N)</td>
                <td className="py-2.5 px-3 text-emerald-600">O(N log N)</td>
                <td className="py-2.5 px-3 text-emerald-600">O(N log N)</td>
                <td className="py-2.5 px-3 text-amber-600">O(N) Auxiliary</td>
                <td className="py-2.5 px-3 font-sans text-emerald-600">Stable</td>
                <td className="py-2.5 px-3 font-sans text-red-600">No</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="text-xs text-slate-600 space-y-2">
          <p>
            <strong>Merge Sort Recurrence Relation:</strong> $T(N) = 2T(N/2) + \Theta(N)$.
            By the Master Theorem (Case 2: $a = 2, b = 2, c = 1 \implies \log_b a = 1 = c$), the runtime is strictly $\Theta(N \log N)$ regardless of initial ordering.
          </p>
        </div>
      </div>

      {/* Section 3: CO4 Binary Search Tree Theory */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
          <Binary className="w-5 h-5 text-teal-600" />
          <span>3. CO4: Binary Search Tree Invariants &amp; Traversals</span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          A Binary Search Tree is a rooted binary tree where each vertex $u$ maintains key $K(u)$.
          For any sub-node $v$ in $u$'s left subtree, $K(v) &lt; K(u)$; and for any $w$ in the right subtree, $K(w) &gt; K(u)$.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900">Why In-Order Traversal yields Sorted Order:</span>
            <p className="text-slate-600">
              In-Order visits recursively: Left Subtree &rarr; Root Node &rarr; Right Subtree.
              By induction, all elements smaller than Root are output first, followed by Root, followed by all elements larger.
              Thus, the output is guaranteed to be strictly ascending.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900">Deletion Case 3 (Two Children):</span>
            <p className="text-slate-600">
              When removing a node with two subtrees, we find the <strong>In-Order Successor</strong> (the smallest node in the right subtree: min(Right Subtree)).
              We copy the successor's data into the target node, then delete the duplicate successor leaf.
            </p>
          </div>
        </div>
      </div>

      {/* Section 4: CO5 Graph Traversal Theory */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
          <Network className="w-5 h-5 text-amber-600" />
          <span>4. CO5: Graph Data Structures &amp; Traversals</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900">Breadth-First Search (BFS):</span>
            <p className="text-slate-600">
              Explores vertices in concentric layers using a FIFO Queue.
              Guarantees the shortest path in unweighted graphs.
              Total time: $O(V + E)$, Auxiliary space: $O(V)$ for Queue and Visited Bitset.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900">Depth-First Search (DFS):</span>
            <p className="text-slate-600">
              Explores edges deeply along a single path before backtracking, using an execution Stack / Recursion.
              Useful for cycle detection, topological sorting, and connected components.
              Total time: $O(V + E)$, Space: $O(V)$.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
