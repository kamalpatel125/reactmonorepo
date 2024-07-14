type NodeId = string;

class Node {
  id: NodeId;
  value: string;
  formula: string;
  edges: Set<Node>;

  constructor(id: NodeId) {
    this.id = id;
    this.value = '';
    this.formula = '';
    this.edges = new Set<Node>();
  }

  addEdge(targetNode: Node) {
    this.edges.add(targetNode);
  }
}

class DAG {
  nodes: Map<NodeId, Node>;

  constructor() {
    this.nodes = new Map<NodeId, Node>();
  }

  addNode(id: NodeId) {
    if (!this.nodes.has(id)) {
      const node = new Node(id);
      this.nodes.set(id, node);
    }
  }

  addEdge(fromId: NodeId, toId: NodeId) {
    this.addNode(fromId);
    this.addNode(toId);
    const fromNode = this.nodes.get(fromId)!;
    const toNode = this.nodes.get(toId)!;
    fromNode.addEdge(toNode);
  }

  evaluateNode(node: Node) {
    if (node.formula) {
      try {
        const formula = node.formula.replace(/([A-Za-z]+\d+)/g, (match) => {
          const refNode = this.nodes.get(match);
          if (refNode) {
            return refNode.value || '0';
          }
          return '0';
        });
        node.value = eval(formula).toString();
      } catch (error) {
        node.value = '#ERROR';
      }
    }
  }

  updateDependencies(startNode: Node) {
    const visited = new Set<NodeId>();
    const stack: Node[] = [startNode];

    while (stack.length > 0) {
      const node = stack.pop()!;
      if (!visited.has(node.id)) {
        visited.add(node.id);
        this.evaluateNode(node);

        for (const neighbor of node.edges) {
          stack.push(neighbor);
        }
      }
    }
  }

  setFormula(id: NodeId, formula: string) {
    this.addNode(id);
    const node = this.nodes.get(id)!;
    node.formula = formula;
    this.updateDependencies(node);
  }

  getValue(id: NodeId): string {
    const node = this.nodes.get(id);
    return node ? node.value : '';
  }
}

export default DAG;
