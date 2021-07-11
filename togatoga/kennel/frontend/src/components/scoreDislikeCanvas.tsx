import React, { useEffect, useState } from 'react';
import {
  Problem,
  ProblemStatus,
  updateProblem,
  useSelector,
} from '../app/store';
import { width, height } from '../app/config';
import { updateBoard } from '../app/drawBoard';
import { useDispatch } from 'react-redux';

function drawGraph(problem: ProblemStatus, ctx: CanvasRenderingContext2D) {
  const width = 500;
  const height = 300;
  ctx.clearRect(0, 0, width, height);
  const padd = 20;
  if (problem.minimal_dislike === null || problem.solutions.length === 0) {
    return;
  }
  const hole_color = 'rgb(0,0,0)';
  const best_color = 'rgb(255,0,0)';
  ctx.strokeStyle = hole_color;
  ctx.fillStyle = hole_color;

  const length = 10;
  const best_sol = problem.solutions.reduce((a, b) => {
    return a.dislike < b.dislike ? a : b;
  });
  const minimal_dislike = problem.minimal_dislike!.minimal_dislike;
  const maximal_dislike =
    minimal_dislike + (best_sol.dislike - minimal_dislike + 1) * 2;
  const n_hole = problem.problem.hole.length;
  const n_vertex = problem.problem.figure.vertices.length;
  const n_edges = problem.problem.figure.edges.length;
  const maximal_score = 1000 * Math.log2((n_hole * n_vertex * n_edges) / 6);

  const xlim = maximal_dislike;
  const xmim = Math.round(minimal_dislike * 0.9);
  const ylim = Math.round(maximal_score * 1.1);

  const convertCoord = (x: number, y: number): [number, number] => {
    const w = width - padd * 2;
    const h = height - padd * 2;
    return [((x - xmim) * w) / (xlim - xmim) + padd, h - (y * h) / ylim + padd];
  };

  // draw axis
  ctx.beginPath();
  let [x, y] = convertCoord(xmim, 0);
  ctx.moveTo(x, y);
  [x, y] = convertCoord(xlim, 0);
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  [x, y] = convertCoord(xmim, 0);
  ctx.moveTo(x, y);
  [x, y] = convertCoord(xmim, ylim);
  ctx.lineTo(x, y);
  ctx.stroke();

  // draw axis label
  [x, y] = convertCoord(xmim, 0);
  ctx.fillText((0).toString(), x - 7, y);
  ctx.fillText(xmim.toString(), x, y + 7);
  [x, y] = convertCoord(xlim, 0);
  ctx.textAlign = 'right';
  ctx.fillText(xlim.toString(), x - 3, y + 7);
  ctx.fillText('Dislike', x - 3, y - 3);
  [x, y] = convertCoord(xmim, ylim);
  ctx.textAlign = 'left';
  ctx.fillText(ylim.toString(), x, y);
  ctx.fillText('Score', x, y - 10);

  const point_and_text = (
    xo: number,
    yo: number,
    ctx: CanvasRenderingContext2D
  ) => {
    [x, y] = convertCoord(xo, yo);
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillText('(' + xo + ', ' + yo + ')', x, y);
  };

  const line = (
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    ctx: CanvasRenderingContext2D
  ) => {
    ctx.beginPath();
    let [x, y] = convertCoord(x0, y0);
    ctx.moveTo(x, y);
    [x, y] = convertCoord(x1, y1);
    ctx.lineTo(x, y);
    ctx.stroke();
    point_and_text(x1, y1, ctx);
  };

  const f = (x: number): number => {
    return Math.round(
      1000 *
        Math.log2((n_hole * n_edges * n_vertex) / 6) *
        Math.sqrt((minimal_dislike + 1) / (x + 1))
    );
  };

  const initial = xmim;
  const diff = xlim / 10;
  const X = Array.apply(null, new Array(length)).map((v, i) => {
    return Math.round(initial + i * diff);
  });
  point_and_text(X[0]!, f(X[0]!), ctx);
  X.forEach((x0, i) => {
    line(x0, f(x0), X[i + 1]!, f(X[i + 1]!), ctx);
  });

  const best_dislike = best_sol.dislike;
  [x, y] = convertCoord(best_dislike, f(best_dislike));
  ctx.strokeStyle = best_color;
  ctx.fillStyle = best_color;
  ctx.arc(x, y, 2, 0, 2 * Math.PI);
  ctx.fill();
}

export default function ScoreDislikeCanvas() {
  const { problem, selectedIdx } = useSelector((state) => {
    return {
      problem: state.problems[state.selected],
      selectedIdx: state.selected,
    };
  });
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  // const dispatch = useDispatch();
  useEffect(() => {
    if (context === null) {
      const canvas = document.getElementById(
        'dislikeCanvas'
      ) as HTMLCanvasElement;
      canvas.width = 500;
      canvas.height = 300;
      const canvasContext = canvas.getContext('2d');
      setContext(canvasContext);
    }
  }, [problem]);
  useEffect(() => {
    if (context !== null) {
      setTimeout(() => {
        // updateBoard(problem?.problem!, context);
        drawGraph(problem!, context);
      }, 100);
    }
  }, [context, problem]);

  return <canvas id="dislikeCanvas"></canvas>;
}
