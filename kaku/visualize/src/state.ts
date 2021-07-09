export type Pair = [number, number];
export type Point = Pair;

export type Figure = {
  "edges": Pair[],
  "vertices": Point[]
}
export type State = {
  "hole": Point[],
  "epsilon": number,
  "figure": Figure
}
