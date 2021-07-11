import React, { useEffect, useState } from 'react';
import {
  MinimalDislike,
  store,
  updateProblem,
  useSelector,
} from '../app/store';
import { useDispatch } from 'react-redux';
import {
  Button,
  createStyles,
  Grid,
  List,
  ListItem,
  ListItemText,
  makeStyles,
  Paper,
  TextField,
  Theme,
  Typography,
} from '@material-ui/core';

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
    input: {
      display: 'none',
    },
    button: {
      margin: theme.spacing(0, 2, 0),
    },
  })
);

export default function ProblemProperties() {
  const classes = useStyles();
  const { problem, selectedIdx } = useSelector((state) => {
    return {
      problem: state.problems[state.selected],
      selectedIdx: state.selected,
    };
  });
  const [newMinimal, setNewMinimal] = useState<string>('');
  const dispatch = useDispatch();

  const fetchMinimal = async () => {
    const res = await fetch(location.origin + '/api/minimal');
    const json = (await res.json()) as MinimalDislike[];
    json.forEach((e) => {
      const p = store.getState().problems[e.problem_id - 1]!;
      dispatch(
        updateProblem({
          ...p,
          minimal_dislike: e,
        })
      );
    });
  };

  useEffect(() => {
    if (problem?.solutions.length === 0) {
      fetchMinimal();
    }
    setNewMinimal('');
  }, [selectedIdx]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.item(0);
    if (f !== null) {
      const data = await f?.text();
      const param = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: data,
      };

      const api_path =
        '/api/problems/' +
        problem!.id +
        '/solutions/' +
        store.getState().user_name;
      const res = await fetch(location.origin + api_path, param);
      console.log(res);
      alert(JSON.stringify(await res.json()));
    }
  };

  const postMinmal = async () => {
    const data = {
      fetch_at: Date.now().toString(),
      minimal_dislike: newMinimal,
      problemId: selectedIdx + 1,
    };
    const param = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(data),
    };

    const api_path = '/api/minimal/' + problem!.id;
    store.getState().user_name;
    const res = await fetch(location.origin + api_path, param);
    console.log(res);
    alert(JSON.stringify(await res.json()));
  };

  return (
    <Paper className={classes.root}>
      <Typography variant="h6" className={classes.title}>
        Problem {selectedIdx + 1}
        <input
          accept="application/json"
          className={classes.input}
          id="contained-button-file"
          type="file"
          onChange={handleUpload}></input>
        <label htmlFor="contained-button-file">
          <Button
            variant="contained"
            color="primary"
            component="span"
            className={classes.button}>
            Upload
          </Button>
        </label>
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={4} key="problem_list">
          <div className={classes.demo}>
            <List dense={true}>
              <ListItem key="minimal_dislike">
                <ListItemText
                  primary={
                    'Minimal Dislike: ' + problem?.minimal_dislike?.minimal_dislike
                  }
                />
                <TextField
                  id="standard-basic"
                  label="New Minimal"
                  value={newMinimal}
                  onChange={(e) => {
                    setNewMinimal(e.target.value);
                  }}
                />
                <Button onClick={postMinmal} variant="contained">
                  Update
                </Button>
              </ListItem>
              <ListItem key="epsilon">
                <ListItemText
                  primary={
                    'Epsilon: ' +
                    problem?.problem.epsilon +
                    '  (' +
                    problem?.problem?.epsilon! / 1000000 +
                    ')'
                  }
                />
              </ListItem>
              <ListItem key="holes">
                <ListItemText primary={'Holes: ' + problem?.problem.hole.length} />
              </ListItem>
              <ListItem key="edges">
                <ListItemText
                  primary={'Edges: ' + problem?.problem.figure.edges.length}
                />
              </ListItem>
              <ListItem key="vertices">
                <ListItemText
                  primary={'Vertices: ' + problem?.problem.figure.vertices.length}
                />
              </ListItem>
              {problem?.problem?.bonuses?.map((bonus, i) => {
                return (
                  <ListItem key={'bonus' + i}>
                    <ListItemText primary={JSON.stringify(bonus)} />
                  </ListItem>
                );
              })}
            </List>
          </div>
        </Grid>
      </Grid>
    </Paper>
  );
}
