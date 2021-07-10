import React from 'react';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem, { ListItemProps } from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { useSelector, setSelected } from '../app/store';
import { useDispatch } from 'react-redux';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: theme.palette.background.paper,
    },
  }),
);

function ListItemLink(props: ListItemProps<'a', { button?: true }>) {
  return <ListItem button component="a" {...props} />;
}

export default function ProblemList() {
  const classes = useStyles();
  const { problems, selectedIdx } = useSelector((state) => {
    return { problems: state.problems, selectedIdx: state.selected };
  });
  const dispatch = useDispatch();
  const handleListClick = (i: number) => {
    dispatch(setSelected(i));
  };

  return (
    <div className={classes.root}>
      <List component="nav" aria-label="main mailbox folders">
        { problems.map((p, i) => {
          return (
            <ListItem
              button
              selected={selectedIdx === i}
              onClick={(e) => handleListClick(i)}
            >
              <ListItemText primary={"Problem" + p.id} />
            </ListItem>
          )
        })}
      </List>
    </div>
  );
}