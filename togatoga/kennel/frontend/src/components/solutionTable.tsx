import React, { useEffect } from 'react';
import { Solution, updateProblem, useSelector } from '../app/store';
import { useDispatch } from 'react-redux';

import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles({
  table: {
    minWidth: 450,
  },
});

export default function SolutionTable() {
  const classes = useStyles();
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
  }, [selectedIdx]);

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Solution ID</TableCell>
            <TableCell align="right">Dislike</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {problem?.solutions.map((sol) => (
            <TableRow key={sol.solutionId}>
              <TableCell component="th" scope="row">
                {sol.solutionId}
              </TableCell>
              <TableCell align="right">{sol.dislike}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
