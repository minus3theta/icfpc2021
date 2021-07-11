import React, { useEffect } from 'react';
import { MinimalDislike, store, updateProblem, useSelector } from '../app/store';
import { useDispatch } from 'react-redux';
import { createStyles, List, ListItem, ListItemText, makeStyles, Paper, Theme, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      margin: theme.spacing(1, 0, 2),
      padding: theme.spacing(1, 2, 2),
    },
    demo: {
      backgroundColor: theme.palette.background.paper,
    },
    title: {
      margin: theme.spacing(4, 0, 2),
    },
  }),
);

export default function ProblemProperties() {
  const classes = useStyles();
  const { problem, selectedIdx } = useSelector((state) => {
    return {
      problem: state.problems[state.selected],
      selectedIdx: state.selected,
    };
  });
  const dispatch = useDispatch();
  const fetchMinimal = async () => {
    const res = await fetch(
      location.origin + '/api/minimal'
    );
    const json = (await res.json()) as MinimalDislike[];
    json.forEach(e => {
      const p = store.getState().problems[e.problem_id-1]!;
      dispatch(
        updateProblem({
          ...p,
          minimal_dislike: e
        })
      );
    });
  }

  useEffect(() => {
    if (problem?.solutions.length === 0) {
      fetchMinimal();
    }
  }, [selectedIdx]);

  return (
    <Paper className={classes.root}>
      <Typography variant="h6" className={classes.title}>
        Problem {selectedIdx + 1}
      </Typography>
      <div className={classes.demo}>
        <List dense={true}>
          <ListItem key="minimal_dislike">
            <ListItemText
              primary={"Minimal Dislike: " + problem?.minimal_dislike?.minimal_dislike}
            />
          </ListItem>
          <ListItem key="epsilon">
            <ListItemText
              primary={"Epsilon: " + problem?.problem.epsilon + "  (" + problem?.problem?.epsilon! / 1000000 + ")"}
            />
          </ListItem>
          <ListItem key="holes">
            <ListItemText
              primary={"Holes: " + problem?.problem.hole.length}
            />
          </ListItem>
          <ListItem key="edges">
            <ListItemText
              primary={"Edges: " + problem?.problem.figure.edges.length}
            />
          </ListItem>
          <ListItem key="vertices">
            <ListItemText
              primary={"Vertices: " + problem?.problem.figure.vertices.length}
            />
          </ListItem>
          {problem?.problem?.bonuses?.map((bonus, i) => {
            return (
              <ListItem key={"bonus" + i}>
                <ListItemText
                  primary={JSON.stringify(bonus)}
                />
              </ListItem>
            )
          })}
        </List>
      </div>
    </Paper>
  );
}
