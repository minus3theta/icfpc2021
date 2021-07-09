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

export function setOrigLen(state: State): void {
  const orig_len = [];
  for (const e of state.figure.edges) {
    orig_len.push(dist(state.figure.vertices[e[0]]!, state.figure.vertices[e[1]]!));
  }
  state.figure.orig_len = orig_len;
}
