import {
  width,
  height,
  convertCoord,
  grid_color,
  figure_color,
  hole_color,
  figure_alert_color,
  grid_row,
  grid_col,
} from './config';
import { Figure, Hole, Problem } from './store';

export function drawGrid(ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = grid_color;
  for (let i = 0; i <= grid_row; i++) {
    ctx.beginPath();
    let [x, y] = convertCoord(0, i);
    ctx.moveTo(x, y);
    [x, y] = convertCoord(grid_col, i);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  for (let i = 0; i <= grid_col; i++) {
    ctx.beginPath();
    let [x, y] = convertCoord(i, 0);
    ctx.moveTo(x, y);
    [x, y] = convertCoord(i, grid_row);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
}

export function drawFigure(
  figure: Figure,
  epsilon: number,
  ctx: CanvasRenderingContext2D
): void {
  ctx.strokeStyle = figure_color;
  ctx.fillStyle = figure_color;
  figure.vertices.forEach((co) => {
    ctx.beginPath();
    const [x, y] = convertCoord(co[0]!, co[1]!);
    ctx.arc(x, y, 3, 0, Math.PI * 2, false);
    ctx.fill();
  });

  figure.edges.forEach((e, i) => {
    const from = figure.vertices[e[0]]!;
    const to = figure.vertices[e[1]]!;
    // const d = dist(from, to);
    // if (Math.abs(d/figure.orig_len[i]! - 1) > (epsilon/1000000)) {
    //   ctx.strokeStyle = figure_alert_color;
    // }
    ctx.beginPath();
    let [x, y] = convertCoord(from[0], from[1]);
    ctx.moveTo(x, y);
    [x, y] = convertCoord(to[0], to[1]);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.strokeStyle = figure_color;
  });
}

export function drawHole(hole: Hole, ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = hole_color;
  ctx.fillStyle = hole_color;
  hole.forEach((co) => {
    ctx.beginPath();
    const [x, y] = convertCoord(co[0]!, co[1]!);
    ctx.arc(x, y, 3, 0, Math.PI * 2, false);
    ctx.fill();
  });

  for (let i = 0; i < hole.length; i++) {
    const from = hole[i]!;
    const to = hole[(i + 1) % hole.length]!;
    ctx.beginPath();
    let [x, y] = convertCoord(from[0]!, from[1]!);
    ctx.moveTo(x, y);
    [x, y] = convertCoord(to[0]!, to[1]!);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
}

export function updateBoard(
  problem: Problem,
  ctx: CanvasRenderingContext2D
): void {
  ctx.clearRect(0, 0, width, height);
  drawGrid(ctx);
  drawHole(problem.hole, ctx);
  drawFigure(problem.figure, problem.epsilon, ctx);
}