import React from 'react';
import ReactDOM from 'react-dom';
import { store } from './app/store';
import { Provider } from 'react-redux';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import ProblemList from './components/problemList';
import ProblemDetail from './components/problemDetail';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
  })
);

const App = () => {
  const classes = useStyles();
  return (
    <React.Fragment>
      <h1>Gon the Fox</h1>
      <div className={classes.root}>
        <Grid container spacing={3}>
          <Grid item xs={3} key="problem_list">
            <ProblemList />
          </Grid>
          <Grid item xs={9} key="problem_detail">
            <ProblemDetail />
          </Grid>
        </Grid>
      </div>
    </React.Fragment>
  );
};

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app')
);
