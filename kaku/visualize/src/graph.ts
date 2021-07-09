import { Point } from './state'

export function dist(p: Point, q: Point): number {
  const [x0, y0] = p;
  const [x1, y1] = q;
  return (x0-x1)**2 + (y0-y1)**2;
}

