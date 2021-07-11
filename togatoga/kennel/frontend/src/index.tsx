import React from 'react';
import ReactDOM from 'react-dom';
import { store, updateName, resetStateExceptName, useSelector } from './app/store';
import { Provider, useDispatch } from 'react-redux';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import ProblemList from './components/problemList';
import ProblemDetail from './components/problemDetail';
import { Button, TextField, Typography } from '@material-ui/core';
import CachedIcon from '@material-ui/icons/Cached';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore } from 'redux-persist';

const persistor = persistStore(store);

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
    title: {
      margin: theme.spacing(4, 0, 2),
      fontSize: 30,
      width: '200px',
      float: "left"
    },
    name_form: {
      float: "right",
      '& > *': {
        margin: theme.spacing(1),
        width: '25ch',
      },
    }
  })
);

const App = () => {
  const classes = useStyles();
  const { user_name } = useSelector((state) => {
    return {
      user_name: state.user_name,
    };
  });
  const dispatch = useDispatch();
  const onChangeName =  (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateName(e.target.value));
  };

  const purge = () => {
    dispatch(resetStateExceptName(user_name));
  }

  return (
    <React.Fragment>
      <div>
        <Typography variant="h1" className={classes.title}>
          Gon the Fox
          <Button onClick={purge}><CachedIcon/></Button>
        </Typography>
        <form className={classes.name_form} noValidate autoComplete="off">
          <TextField id="outlined-basic" label="UserName" variant="outlined" value={user_name} onChange={onChangeName} />
        </form>
      </div>
      <div className={classes.root}>
        <Grid container spacing={3}>
          <Grid item xs={2} key="problem_list">
            <ProblemList />
          </Grid>
          <Grid item xs={10} key="problem_detail">
            <ProblemDetail />
          </Grid>
        </Grid>
      </div>
    </React.Fragment>
  );
};

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>,
  document.getElementById('app')
);
