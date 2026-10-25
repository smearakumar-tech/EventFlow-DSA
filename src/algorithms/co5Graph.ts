import { EventItem, GraphTraversalStep } from '../types/event';

export interface GraphEdgeItem {
  sourceId: number;
  targetId: number;
  type: 'Shared Venue' | 'Prerequisite' | 'Track Dependency';
  label: string;
}

export interface GraphNodeLayout {
  id: number;
  event: EventItem;
  x: number;
  y: number;
  degree: number;
}

export class EventGraph {
  vertices: Map<number, EventItem> = new Map();
  adjacencyList: Map<number, Array<{ targetId: number; type: string; label: string }>> = new Map();
  edges: GraphEdgeItem[] = [];

  constructor(events: EventItem[]) {
    this.buildGraph(events);
  }

  buildGraph(events: EventItem[]) {
    this.vertices.clear();
    this.adjacencyList.clear();
    this.edges = [];

    // Register vertices
    for (const ev of events) {
      this.vertices.set(ev.id, ev);
      this.adjacencyList.set(ev.id, []);
    }

    const eventList = Array.from(this.vertices.values());

    // 1. Meaningful Sequence & Prerequisite Dependencies:
    // 101 (Inaugural) -> 102 (AI Keynote)
    // 101 -> 103 (Cloud Workshop)
    // 105 (Hackathon Round 1) -> 110 (Hackathon Finale)
    // 106 (CTF) -> 107 (Algorithms Lecture)
    // 110 (Finale) -> 112 (Valedictory)
    // 108 (Cultural) -> 112 (Valedictory)
    const explicitDependencies: Array<[number, number, string]> = [
      [101, 102, 'Opening Keynote precedes Main Lectures'],
      [101, 103, 'Inaugural opening unlocks parallel tracks'],
      [105, 110, 'Round 1 Qualifiers advance to Grand Finale'],
      [106, 107, 'CTF participants attend Security & Algorithms Talk'],
      [110, 112, 'Hackathon Winners announced at Valedictory'],
      [108, 112, 'Cultural night leads to final symposium awards'],
      [102, 104, 'Shared Venue transition / turnaround conflict in Auditorium A'],
      [103, 106, 'Tech Lab 102 hardware handoff session']
    ];

    for (const [src, dst, label] of explicitDependencies) {
      if (this.vertices.has(src) && this.vertices.has(dst)) {
        this.addEdge(src, dst, 'Prerequisite', label);
      }
    }

    // 2. Add Shared Venue edges for same venue on same date
    for (let i = 0; i < eventList.length; i++) {
      for (let j = i + 1; j < eventList.length; j++) {
        const a = eventList[i];
        const b = eventList[j];
        if (a.venue === b.venue && a.date === b.date) {
          // Avoid duplicate edge if already connected
          const alreadyConnected = this.adjacencyList.get(a.id)?.some(e => e.targetId === b.id);
          if (!alreadyConnected) {
            this.addEdge(a.id, b.id, 'Shared Venue', `Same Venue: ${a.venue}`);
          }
        }
      }
    }
  }

  addEdge(sourceId: number, targetId: number, type: GraphEdgeItem['type'], label: string) {
    // Directed graph representation (for prerequisites) with symmetric presence for shared venues
    this.adjacencyList.get(sourceId)?.push({ targetId, type, label });
    this.edges.push({ sourceId, targetId, type, label });

    if (type === 'Shared Venue') {
      this.adjacencyList.get(targetId)?.push({ targetId: sourceId, type, label });
      this.edges.push({ sourceId: targetId, targetId: sourceId, type, label });
    }
  }

  // ---------------- BFS (Breadth-First Search) ----------------
  runBFS(startNodeId: number): {
    traversalOrder: number[];
    steps: GraphTraversalStep[];
    timeComplexity: string;
    spaceComplexity: string;
  } {
    if (!this.vertices.has(startNodeId)) {
      return { traversalOrder: [], steps: [], timeComplexity: 'O(V + E)', spaceComplexity: 'O(V)' };
    }

    const steps: GraphTraversalStep[] = [];
    const visited = new Set<number>();
    const queue: number[] = [startNodeId];
    const traversalOrder: number[] = [];

    visited.add(startNodeId);

    steps.push({
      stepNumber: 1,
      currentNodeId: startNodeId,
      queueOrStackState: [...queue],
      visitedNodes: Array.from(visited),
      actionDescription: `Initialized BFS queue with starting Event #${startNodeId} ("${this.vertices.get(startNodeId)?.title}").`
    });

    while (queue.length > 0) {
      const current = queue.shift()!;
      traversalOrder.push(current);

      const neighbors = this.adjacencyList.get(current) || [];
      const unvisitedNeighbors = neighbors.filter(n => !visited.has(n.targetId));

      steps.push({
        stepNumber: steps.length + 1,
        currentNodeId: current,
        queueOrStackState: [...queue],
        visitedNodes: Array.from(visited),
        actionDescription: `Dequeued Event #${current}. Exploring adjacent edges (${neighbors.length} connected).`
      });

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.targetId)) {
          visited.add(neighbor.targetId);
          queue.push(neighbor.targetId);

          steps.push({
            stepNumber: steps.length + 1,
            currentNodeId: current,
            currentEdge: [current, neighbor.targetId],
            queueOrStackState: [...queue],
            visitedNodes: Array.from(visited),
            actionDescription: `Discovered unvisited neighbor Event #${neighbor.targetId} via [${neighbor.type}]. Enqueued #${neighbor.targetId}.`
          });
        }
      }
    }

    return {
      traversalOrder,
      steps,
      timeComplexity: 'O(V + E) where V = Vertices (Events), E = Edges (Relationships)',
      spaceComplexity: 'O(V) for Queue and Visited Set'
    };
  }

  // ---------------- DFS (Depth-First Search) ----------------
  runDFS(startNodeId: number): {
    traversalOrder: number[];
    steps: GraphTraversalStep[];
    timeComplexity: string;
    spaceComplexity: string;
  } {
    if (!this.vertices.has(startNodeId)) {
      return { traversalOrder: [], steps: [], timeComplexity: 'O(V + E)', spaceComplexity: 'O(V)' };
    }

    const steps: GraphTraversalStep[] = [];
    const visited = new Set<number>();
    const traversalOrder: number[] = [];
    const callStack: number[] = [startNodeId];

    steps.push({
      stepNumber: 1,
      currentNodeId: startNodeId,
      queueOrStackState: [...callStack],
      visitedNodes: Array.from(visited),
      actionDescription: `Initialized DFS recursion stack with starting Event #${startNodeId} ("${this.vertices.get(startNodeId)?.title}").`
    });

    const dfsRecursive = (u: number) => {
      visited.add(u);
      traversalOrder.push(u);

      steps.push({
        stepNumber: steps.length + 1,
        currentNodeId: u,
        queueOrStackState: [...callStack],
        visitedNodes: Array.from(visited),
        actionDescription: `Visiting Event #${u} ("${this.vertices.get(u)?.title}"). Pushed to active execution stack.`
      });

      const neighbors = this.adjacencyList.get(u) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.targetId)) {
          callStack.push(neighbor.targetId);
          steps.push({
            stepNumber: steps.length + 1,
            currentNodeId: u,
            currentEdge: [u, neighbor.targetId],
            queueOrStackState: [...callStack],
            visitedNodes: Array.from(visited),
            actionDescription: `Traversing deeper via edge #${u} -> #${neighbor.targetId} (${neighbor.type}).`
          });

          dfsRecursive(neighbor.targetId);
          callStack.pop();

          steps.push({
            stepNumber: steps.length + 1,
            currentNodeId: u,
            queueOrStackState: [...callStack],
            visitedNodes: Array.from(visited),
            actionDescription: `Backtracked to Event #${u} after exploring branch.`
          });
        }
      }
    };

    dfsRecursive(startNodeId);

    return {
      traversalOrder,
      steps,
      timeComplexity: 'O(V + E) where V = Vertices, E = Edges',
      spaceComplexity: 'O(V) for Recursion Stack / Call Trace'
    };
  }

  // ---------------- Adjacency Matrix ----------------
  getAdjacencyMatrix(): {
    matrix: number[][];
    nodeIds: number[];
  } {
    const nodeIds = Array.from(this.vertices.keys()).sort((a, b) => a - b);
    const n = nodeIds.length;
    const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

    const idToIndex = new Map<number, number>();
    nodeIds.forEach((id, idx) => idToIndex.set(id, idx));

    for (const [src, neighbors] of this.adjacencyList.entries()) {
      const srcIdx = idToIndex.get(src);
      if (srcIdx === undefined) continue;
      for (const neighbor of neighbors) {
        const dstIdx = idToIndex.get(neighbor.targetId);
        if (dstIdx !== undefined) {
          matrix[srcIdx][dstIdx] = 1;
        }
      }
    }

    return { matrix, nodeIds };
  }

  // ---------------- Compute 2D Circular / Force Layout ----------------
  computeGraphLayout(width = 800, height = 520): GraphNodeLayout[] {
    const nodes = Array.from(this.vertices.values());
    const count = nodes.length;
    if (count === 0) return [];

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.38;

    return nodes.map((ev, index) => {
      const angle = (2 * Math.PI * index) / count - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      const degree = (this.adjacencyList.get(ev.id) || []).length;
      return {
        id: ev.id,
        event: ev,
        x,
        y,
        degree
      };
    });
  }
}
