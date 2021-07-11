import React, { useEffect } from 'react';
import ProblemCanvas from './problemCanvas';
import SolutionTable from './solutionTable';
import ProblemProperties from './problemProperties';
import {
  MinimalDislike,
  store,
  updateProblem,
  useSelector,
} from '../app/store';
import { useDispatch } from 'react-redux';
import {
  createStyles,
  List,
  ListItem,
  ListItemText,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';

export default function ProblemDetail() {
  return (
    <React.Fragment>
      <ProblemProperties />
      <div style={{ display: 'flex' }}>
        <ProblemCanvas />
        <SolutionTable />
      </div>
    </React.Fragment>
  );
}
