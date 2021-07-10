import React, { useEffect, useState } from 'react';
import { Problem, updateProblem, useSelector } from '../app/store';
import { width, height } from '../app/config';
import { updateBoard } from '../app/drawBoard';
import { useDispatch } from 'react-redux';

export default function ProblemDetail() {
  const { problem, selectedIdx } = useSelector((state) => {
    return {
      problem: state.problems[state.selected],
      selectedIdx: state.selected,
    };
  });
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const dispatch = useDispatch();
  useEffect(() => {
    if (problem?.need_fetch) {
      const f = async () => {
        const res = await fetch(location.origin + '/api/problems/' + problem.id);
        const json = await res.json() as Problem;
        dispatch(updateProblem({id: problem.id, problem: json, need_fetch: false}))
      }
      f();
    }
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    canvas.width = width;
    canvas.height = height;
    const canvasContext = canvas.getContext('2d');
    setContext(canvasContext);
  }, [selectedIdx]);
  useEffect(() => {
    if (context !== null) {
      updateBoard(problem?.problem!, context);
    }
  }, [context, selectedIdx, problem]);

  return (
    <React.Fragment>
      <canvas id="canvas"></canvas>
    </React.Fragment>
  );
}