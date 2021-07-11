import React, { useEffect } from 'react';
import { Solution, updateProblem, useSelector } from '../app/store';
import { useDispatch } from 'react-redux';

import EnhancedTable from './enhancedTable';
import ProblemCanvas from './problemCanvas';
import { Button } from '@material-ui/core';
import CachedIcon from '@material-ui/icons/Cached';

export default function SolutionTable() {
  const { problem, selectedIdx } = useSelector((state) => {
    return {
      problem: state.problems[state.selected],
      selectedIdx: state.selected,
    };
  });
  const dispatch = useDispatch();
  useEffect(() => {
    if (problem?.need_fetch_solution) {
      const f = async () => {
        const res = await fetch(
          location.origin + '/api/problems/' + problem.id + '/solutions'
        );
        const json = (await res.json()) as Solution[];
        dispatch(
          updateProblem({
            ...problem,
            solutions: json,
            need_fetch_solution: false,
          })
        );
      };
      f();
      dispatch(
        updateProblem({
          ...problem,
          need_fetch_solution: false,
        })
      );
    }
  }, [problem]);

  const reload = () => {
    dispatch(
      updateProblem({
        ...problem!,
        need_fetch_solution: true,
      })
    );
  };

  return (
    <React.Fragment>
      <div>
        <Button onClick={reload}>
          <CachedIcon />
        </Button>
      </div>
      {problem?.solutions === null ? (
        <div></div>
      ) : (
        <EnhancedTable
          rows={problem?.solutions!}
          minimal_dislike={problem?.minimal_dislike?.minimal_dislike!}
          k={
            1000 *
            Math.log2(
              (problem?.problem.figure.vertices.length! *
                problem?.problem.figure.edges.length! *
                problem?.problem.hole.length!) /
                6
            )
          }
        />
      )}
    </React.Fragment>
  );
}
