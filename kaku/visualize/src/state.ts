import { dist } from "./graph";

export type Pair = [number, number];
export type Point = Pair;

export type Figure = {
  "edges": Pair[],
  "vertices": Point[],
  "orig_len": number[]
}
export type State = {
  "hole": Point[],
  "epsilon": number,
  "figure": Figure
}

export function setOrigLen(figure: Figure): void {
  const orig_len = [];
  for (const e of figure.edges) {
    orig_len.push(dist(figure.vertices[e[0]]!, figure.vertices[e[1]]!));
  }
  figure.orig_len = orig_len;
}
