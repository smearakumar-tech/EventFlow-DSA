import { EventItem, BSTNode } from '../types/event';

export interface BSTOperationStep {
  step: number;
  visitedNodeId: number;
  direction?: 'left' | 'right' | 'match';
  explanation: string;
}

export interface BSTOperationResult {
  success: boolean;
  path: number[];
  steps: BSTOperationStep[];
  node?: BSTNode;
  message: string;
}

export class BinarySearchTree {
  root: BSTNode | null = null;

  constructor(initialEvents: EventItem[] = []) {
    for (const ev of initialEvents) {
      this.insert(ev);
    }
  }

  insert(event: EventItem): BSTOperationResult {
    const key = event.id;
    const path: number[] = [];
    const steps: BSTOperationStep[] = [];

    if (!this.root) {
      this.root = {
        id: key,
        event,
        left: null,
        right: null,
        height: 1
      };
      steps.push({
        step: 1,
        visitedNodeId: key,
        direction: 'match',
        explanation: `Tree was empty. Created root node with Key (Event ID) ${key} ("${event.title}").`
      });
      return {
        success: true,
        path: [key],
        steps,
        message: `Inserted Event #${key} as root node.`
      };
    }

    let current: BSTNode | null = this.root;
    let parent: BSTNode | null = null;
    let isLeft = false;

    while (current !== null) {
      path.push(current.id);

      if (key === current.id) {
        // Duplicate key: update event record
        current.event = event;
        steps.push({
          step: steps.length + 1,
          visitedNodeId: current.id,
          direction: 'match',
          explanation: `Key ${key} already exists in BST! Updated event payload for "${event.title}".`
        });
        return {
          success: true,
          path,
          steps,
          message: `Key #${key} already exists. Record updated.`
        };
      }

      parent = current;
      if (key < current.id) {
        steps.push({
          step: steps.length + 1,
          visitedNodeId: current.id,
          direction: 'left',
          explanation: `Key ${key} < Node ${current.id}. Traversing to left subtree.`
        });
        current = current.left;
        isLeft = true;
      } else {
        steps.push({
          step: steps.length + 1,
          visitedNodeId: current.id,
          direction: 'right',
          explanation: `Key ${key} > Node ${current.id}. Traversing to right subtree.`
        });
        current = current.right;
        isLeft = false;
      }
    }

    const newNode: BSTNode = {
      id: key,
      event,
      left: null,
      right: null,
      height: 1
    };

    if (parent) {
      if (isLeft) {
        parent.left = newNode;
      } else {
        parent.right = newNode;
      }
    }

    path.push(key);
    steps.push({
      step: steps.length + 1,
      visitedNodeId: key,
      direction: 'match',
      explanation: `Reached empty position. Attached new node with Key #${key} as ${isLeft ? 'LEFT' : 'RIGHT'} child of Node #${parent?.id}.`
    });

    this.updateHeights(this.root);

    return {
      success: true,
      path,
      steps,
      message: `Successfully inserted Event #${key} into BST.`
    };
  }

  search(key: number): BSTOperationResult {
    const path: number[] = [];
    const steps: BSTOperationStep[] = [];
    let current = this.root;

    if (!current) {
      return {
        success: false,
        path: [],
        steps: [],
        message: 'Tree is completely empty.'
      };
    }

    while (current !== null) {
      path.push(current.id);

      if (key === current.id) {
        steps.push({
          step: steps.length + 1,
          visitedNodeId: current.id,
          direction: 'match',
          explanation: `Found target Key #${key} ("${current.event.title}")!`
        });
        return {
          success: true,
          path,
          steps,
          node: current,
          message: `Found Event #${key} in ${steps.length} comparisons.`
        };
      } else if (key < current.id) {
        steps.push({
          step: steps.length + 1,
          visitedNodeId: current.id,
          direction: 'left',
          explanation: `Key ${key} < Node ${current.id}. Navigating LEFT child.`
        });
        current = current.left;
      } else {
        steps.push({
          step: steps.length + 1,
          visitedNodeId: current.id,
          direction: 'right',
          explanation: `Key ${key} > Node ${current.id}. Navigating RIGHT child.`
        });
        current = current.right;
      }
    }

    steps.push({
      step: steps.length + 1,
      visitedNodeId: -1,
      explanation: `Reached null reference. Key #${key} does not exist in the BST.`
    });

    return {
      success: false,
      path,
      steps,
      message: `Key #${key} not found in BST.`
    };
  }

  delete(key: number): { success: boolean; steps: string[]; explanation: string } {
    const steps: string[] = [];
    let deleted = false;

    const deleteHelper = (node: BSTNode | null, targetKey: number): BSTNode | null => {
      if (!node) {
        steps.push(`Target key ${targetKey} not found in this branch.`);
        return null;
      }

      if (targetKey < node.id) {
        steps.push(`Target ${targetKey} < Node ${node.id}: searching left subtree.`);
        node.left = deleteHelper(node.left, targetKey);
      } else if (targetKey > node.id) {
        steps.push(`Target ${targetKey} > Node ${node.id}: searching right subtree.`);
        node.right = deleteHelper(node.right, targetKey);
      } else {
        // Node found!
        deleted = true;
        // Case 1: Leaf (no children)
        if (!node.left && !node.right) {
          steps.push(`Case 1 (Leaf Node): Node #${node.id} has 0 children. Removing node directly.`);
          return null;
        }
        // Case 2: One child (right only)
        if (!node.left) {
          steps.push(`Case 2 (Single Child): Node #${node.id} has only right child #${node.right?.id}. Replacing node with its right child.`);
          return node.right;
        }
        // Case 2: One child (left only)
        if (!node.right) {
          steps.push(`Case 2 (Single Child): Node #${node.id} has only left child #${node.left?.id}. Replacing node with its left child.`);
          return node.left;
        }

        // Case 3: Two children
        // Find in-order successor (minimum in right subtree)
        let successor = node.right;
        while (successor.left !== null) {
          successor = successor.left;
        }
        steps.push(`Case 3 (Two Children): Node #${node.id} has two subtrees. Found In-Order Successor #${successor.id} ("${successor.event.title}"). Copying successor key and deleting duplicate successor from right subtree.`);
        
        node.id = successor.id;
        node.event = successor.event;
        node.right = deleteHelper(node.right, successor.id);
      }

      return node;
    };

    this.root = deleteHelper(this.root, key);
    this.updateHeights(this.root);

    return {
      success: deleted,
      steps,
      explanation: deleted
        ? `Successfully removed Key #${key} while strictly preserving BST ordering invariants.`
        : `Key #${key} was not present in the tree.`
    };
  }

  // ---------------- Traversals ----------------
  inorder(): BSTNode[] {
    const result: BSTNode[] = [];
    const traverse = (node: BSTNode | null) => {
      if (!node) return;
      traverse(node.left);
      result.push(node);
      traverse(node.right);
    };
    traverse(this.root);
    return result;
  }

  preorder(): BSTNode[] {
    const result: BSTNode[] = [];
    const traverse = (node: BSTNode | null) => {
      if (!node) return;
      result.push(node);
      traverse(node.left);
      traverse(node.right);
    };
    traverse(this.root);
    return result;
  }

  postorder(): BSTNode[] {
    const result: BSTNode[] = [];
    const traverse = (node: BSTNode | null) => {
      if (!node) return;
      traverse(node.left);
      traverse(node.right);
      result.push(node);
    };
    traverse(this.root);
    return result;
  }

  levelOrder(): BSTNode[] {
    const result: BSTNode[] = [];
    if (!this.root) return result;
    const queue: BSTNode[] = [this.root];
    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current);
      if (current.left) queue.push(current.left);
      if (current.right) queue.push(current.right);
    }
    return result;
  }

  // ---------------- Metrics ----------------
  private updateHeights(node: BSTNode | null): number {
    if (!node) return 0;
    node.height = 1 + Math.max(this.updateHeights(node.left), this.updateHeights(node.right));
    return node.height;
  }

  getHeight(): number {
    return this.root ? this.root.height : 0;
  }

  getNodeCount(): number {
    return this.inorder().length;
  }

  isBalanced(): boolean {
    const check = (node: BSTNode | null): { balanced: boolean; height: number } => {
      if (!node) return { balanced: true, height: 0 };
      const left = check(node.left);
      const right = check(node.right);
      const balanced = left.balanced && right.balanced && Math.abs(left.height - right.height) <= 1;
      return {
        balanced,
        height: 1 + Math.max(left.height, right.height)
      };
    };
    return check(this.root).balanced;
  }

  // ---------------- SVG Layout Generation ----------------
  computeTreeLayout(containerWidth = 800, verticalSpacing = 72): BSTNode[] {
    if (!this.root) return [];

    // Clone tree nodes with x, y coordinates
    const clonedRoot = JSON.parse(JSON.stringify(this.root)) as BSTNode;

    const assignCoordinates = (
      node: BSTNode | null,
      depth: number,
      leftBound: number,
      rightBound: number
    ) => {
      if (!node) return;
      const x = (leftBound + rightBound) / 2;
      const y = 40 + depth * verticalSpacing;
      node.x = x;
      node.y = y;

      assignCoordinates(node.left, depth + 1, leftBound, x);
      assignCoordinates(node.right, depth + 1, x, rightBound);
    };

    assignCoordinates(clonedRoot, 0, 20, containerWidth - 20);

    // Flatten to list for rendering
    const nodes: BSTNode[] = [];
    const collect = (n: BSTNode | null) => {
      if (!n) return;
      nodes.push(n);
      collect(n.left);
      collect(n.right);
    };
    collect(clonedRoot);
    return nodes;
  }
}
