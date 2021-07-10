import { Vertex, FigureEdge } from './mainScene'

export function baneOptimize(vertices: Vertex[], moved: Vertex[]) {
  const graph = vertices2graph(vertices)
  const m: number[] = moved.map(v=>{return v.id});
  bane(graph, m);
  graph.nodes.forEach((node, i) => {
    vertices[i].x = node.p[0];
    vertices[i].y = node.p[1];
    vertices[i].resetCircle();
  });
}

function dist(p0: Point, p1: Point) {
  const [x0, y0] = p0;
  const [x1, y1] = p1;
  return (x0-x1)**2 + (y0-y1)**2;
}

export function splitPwr(n1: Point, n2: Point): Point {
  // n1 -> n2 vector
  const d = dist(n1, n2);
  return [(n2[0]-n1[0])/d, (n2[1]-n1[1])/d]
}

function vertices2graph(vertices: Vertex[]): Graph {
  const g = [] as Gnode[];
  for (const v of vertices) {
    const n = {
      p: [v.x, v.y] as Point,
      edges: [] as Edge[]
    }
    g.push(n);
  }
  vertices.forEach((v, i) => {
    for (const e of v.edges as FigureEdge[]) {
      const to = (i === e.v[0].id) ? e.v[1].id : e.v[0].id;
      const edge: Edge = {
        v: to,
        baseLen: e.baseLength,
        minLen: e.minLength,
        maxLen: e.maxLength
      }
      g[i].edges.push(edge);
    }
  })
  return {nodes: g}
}

export type Point = [number, number];

type Edge = {
  v: number,
  baseLen: number,
  minLen: number,
  maxLen: number
}

type Gnode = {
  p: Point,
  edges: Edge[]
}

type Graph = {
  nodes: Gnode[]
}

export function bane(graph: Graph, moved: number[]) {
  const n_iter = 10000;
  const min_e = 0;
  const k = 1.0;
  const dt = 1;
  const dc = 0.9;
  const n_node = graph.nodes.length;

  // 速度の初期化
  const speed = new Array(n_node) as Point[];
  for (let i = 0; i < speed.length; i++) {
    speed[i] = [0, 0];
  }

  // main loop
  for (let step = 0; step < n_iter; step++) {
    let total_e = 0;
    graph.nodes.forEach((n1, s) => {
      if (moved.includes(s)) { return; }
      const pwr: Point = [0, 0];   // 頂点にかかる力
      for (const edge of n1.edges) {
        const n2 = graph.nodes[edge.v]!;
        const new_d = dist(n1.p, n2.p);
        let k_pwr = 0;  // 頂点にかかる力の大きさ（スカラー）
        if (new_d < edge.minLen || new_d > edge.maxLen) {
          k_pwr = k * (Math.sqrt(new_d) - Math.sqrt(edge.baseLen))
        }
        const [x, y] = splitPwr(n1.p, n2.p);
        pwr[0] += k_pwr * x;
        pwr[1] += k_pwr * y;
      }
      speed[s]![0] += pwr[0] * dt;
      speed[s]![0] *= dc;
      speed[s]![1] += pwr[1] * dt;
      speed[s]![1] *= dc;
    });
    speed.forEach((sp, node) => {
      let [x, y] = graph.nodes[node]!.p;
      x = Math.round(x + sp[0]);
      y = Math.round(y + sp[1]);
      graph.nodes[node]!.p = [x, y];
      total_e += dist(sp, [0, 0]);
    });
    if (total_e < min_e) break;
  }
}
