import { createSlice, configureStore, PayloadAction } from '@reduxjs/toolkit';
import {
  useSelector as rawUseSelector,
  TypedUseSelectorHook,
} from 'react-redux';
import { n_problem } from './config';

export type Pair = [number, number];

export type Bonus = {
  bonus: string;
  problem: number;
  position: Pair;
};

export type Figure = {
  edges: Pair[];
  vertices: Pair[];
};

export type Hole = Pair[];

export type Problem = {
  hole: Hole;
  epsilon: number;
  figure: Figure;
  bonuses: Bonus[];
};

export type Solution = {
  pose: {
    bonus?: string;
    edge?: Pair;
    problem?: number;
    vertices: Pair[];
  };
  dislike: number;
  solutionId: string;
};

export type ProblemStatus = {
  id: number;
  problem: Problem;
  need_fetch_problem: boolean;
  solutions: Solution[];
  need_fetch_solution: boolean;
};

export type State = {
  problems: ProblemStatus[];
  selected: number;
};

const initialProblem = (): Problem => {
  return {
    bonuses: [] as Bonus[],
    hole: [] as Hole,
    epsilon: 0,
    figure: { edges: [], vertices: [] } as Figure,
  };
};

const initialState: State = {
  problems: [],
  selected: 0,
};

for (let i = 0; i < n_problem; i++) {
  initialState.problems.push({
    id: i + 1,
    problem: initialProblem(),
    need_fetch_problem: true,
    solutions: [] as Solution[],
    need_fetch_solution: true,
  });
}

const slice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    updateProblem: (state, action: PayloadAction<ProblemStatus>) => ({
      ...state,
      problems: state.problems.map((p) => {
        if (p.id !== action.payload.id) {
          return p;
        } else {
          return action.payload;
        }
      }),
    }),
    setSelected: (state, action: PayloadAction<number>) => ({
      ...state,
      selected: action.payload,
    }),
  },
});

export const { updateProblem, setSelected } = slice.actions;

export const store = configureStore({
  reducer: slice.reducer,
});

export type RootState = ReturnType<typeof store.getState>;
export const useSelector: TypedUseSelectorHook<RootState> = rawUseSelector;
