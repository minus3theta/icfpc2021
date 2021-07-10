import React from 'react';
import ReactDOM from 'react-dom';
import { updateProblems, store, useSelector } from './app/store';
import { Provider, useDispatch } from 'react-redux';

const App = () => {
  const { problems } = useSelector((state) => {
    return { problems: state.problems };
  });
  const dispatch = useDispatch();
  return (
    <React.Fragment>
      <h1>Gon the Fox</h1>
      <ul>
        {problems.map((p) => (
          <li key={p.id}> Problem {p.id} </li>
        ))}
      </ul>
      <button
        onClick={() => {
          dispatch(
            updateProblems({
              problems: [...problems, { id: problems.length + 1 }],
            })
          );
        }}>
        {' '}
        add problem{' '}
      </button>
    </React.Fragment>
  );
};

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app')
);
