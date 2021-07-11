import React, { useEffect } from 'react';
import { Solution, updateProblem, useSelector } from '../app/store';
import { useDispatch } from 'react-redux';

import EnhancedTable from './enhancedTable';

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
    }
  }, [selectedIdx, problem]);

  return (
    <React.Fragment>
      {problem?.solutions === null ? (
        <div></div>
      ) : (
        <EnhancedTable rows={problem?.solutions!} />
      )}
    </React.Fragment>
  );
}
