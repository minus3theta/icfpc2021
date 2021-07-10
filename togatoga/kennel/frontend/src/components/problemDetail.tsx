import React, { useEffect, useState } from 'react';
import { useSelector } from '../app/store';
import { width, height } from '../app/config';
import { updateBoard } from '../app/drawBoard';

export default function ProblemDetail() {
  const { problem, selectedIdx } = useSelector((state) => {
    return {
      problem: state.problems[state.selected],
      selectedIdx: state.selected,
    };
  });
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  useEffect(() => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    canvas.width = width;
    canvas.height = height;
    const canvasContext = canvas.getContext('2d');
    setContext(canvasContext);
  }, [selectedIdx]);
  useEffect(() => {
    if (context !== null) {
      updateBoard(problem!, context);
    }
  }, [context, selectedIdx]);
  return (
    <React.Fragment>
      <canvas id="canvas"></canvas>
    </React.Fragment>
  );
}
