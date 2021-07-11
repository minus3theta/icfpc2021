import React, { useEffect, useState } from 'react';
import { Problem, updateProblem, useSelector, store } from '../app/store';
import { width, height } from '../app/config';
import { updateBoard } from '../app/drawBoard';
import { useDispatch } from 'react-redux';

export default function ProblemCanvas() {
  const { problem, problem_id, need_fetch_problem, selectedIdx } = useSelector((state) => {
    return {
      problem: state.problems[state.selected]?.problem,
      problem_id: state.problems[state.selected]?.id,
      need_fetch_problem: state.problems[state.selected]?.need_fetch_problem,
      selectedIdx: state.selected,
    };
  });
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const dispatch = useDispatch();
  useEffect(() => {
    console.log("1")
    if (need_fetch_problem) {
      const f = async () => {
        const res = await fetch(
          location.origin + '/api/problems/' + problem_id
        );
        const json = (await res.json()) as Problem;
        dispatch(
          updateProblem({
            ...store.getState().problems[selectedIdx]!,
            problem: json,
            need_fetch_problem: false,
          })
        );
      };
      f();
      dispatch(
        updateProblem({
          ...store.getState().problems[selectedIdx]!,
          need_fetch_problem: false,
        })
      );
    }
    if (context === null) {
      const canvas = document.getElementById('canvas') as HTMLCanvasElement;
      canvas.width = width;
      canvas.height = height;
      const canvasContext = canvas.getContext('2d');
      setContext(canvasContext);
    }
  }, [problem]);
  useEffect(() => {
    console.log("2")
    if (context !== null) {
      setTimeout(() => {
        updateBoard(problem!, context);
      }, 100);
    }
  }, [context, problem]);

  return <canvas id="canvas"></canvas>;
}
