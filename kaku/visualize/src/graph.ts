import { Figure, Point, State } from './state'

export function dist(p: Point, q: Point): number {
  const [x0, y0] = p;
  const [x1, y1] = q;
  return (x0-x1)**2 + (y0-y1)**2;
}

type GNode = {
  p: Point,
  edges: number[]
}

type Graph = {
  nodes: GNode[],
  orig_len: number[][]
}

export function figure2graph(figure: Figure): Graph {
  const n_node = figure.vertices.length
  const graph = {
    nodes: [] as GNode[],
    orig_len: (new Array(n_node)) as number[][]
  }
  for (let i = 0; i < n_node; i++) {
    graph.orig_len[i] = [];
    for (let j = 0; j < n_node; j++) {
      graph.orig_len[i]?.push(0);
    }
  }
  figure.vertices.forEach(node => {
    graph.nodes.push({
      p: node,
      edges: []
    })
  });
  figure.edges.forEach(([p, q], i) => {
    graph.nodes[p]?.edges.push(q);
    graph.nodes[q]?.edges.push(p);
    graph.orig_len[p]![q] = figure.orig_len[i]!;
    graph.orig_len[q]![p] = figure.orig_len[i]!;
  });
  return graph;
}

export function splitPwr(n1: Point, n2: Point): Point {
  // n1 -> n2 vector
  const d = dist(n1, n2);
  return [(n2[0]-n1[0])/d, (n2[1]-n1[1])/d]
}

export function bane(graph: Graph, epsilon: number, moved: number) {
  const min_e = 0;
  const k = 1.0;
  const dt = 1;
  const dc = 0.9;
  const n_node = graph.nodes.length;
  const sp = new Array(n_node) as Point[];
  for (let i = 0; i < sp.length; i++) {
    sp[i] = [0, 0];
  }
  for (let i = 0; i < 10000; i++) {
    let total_e = 0;
    graph.nodes.forEach((n1, s) => {
      if (s == moved) { return; }
      const p = [0, 0];
      for (const t of n1.edges) {
        const n2 = graph.nodes[t]!;
        const orig_d = graph.orig_len[s]![t]!;
        const new_d = dist(n1.p, n2.p);
        let pwr = 0;
        if (Math.abs(new_d/orig_d - 1) > (epsilon/1000000)) {
          pwr = k * (Math.sqrt(new_d) - Math.sqrt(orig_d));
        }
        const [x, y] = splitPwr(n1.p, n2.p);
        p[0] += pwr * x;
        p[1] += pwr * y;
      }
      sp[s]![0] += p[0]! * dt;
      sp[s]![0] *= dc;
      sp[s]![1] += p[1]! * dt;
      sp[s]![1] *= dc;
    });
    sp.forEach((speed, node) => {
      let [x, y] = graph.nodes[node]!.p;
      x = Math.round(x + speed[0]);
      y = Math.round(y + speed[1]);
      graph.nodes[node]!.p = [x, y];
      total_e += dist(speed, [0, 0]);
    });
    if (total_e < min_e) break;
  }
}

export function graph2vertices(graph: Graph): Point[] {
  const vertices = [] as Point[];
  graph.nodes.forEach(node => {
    vertices.push(node.p);
  });
  return vertices
}