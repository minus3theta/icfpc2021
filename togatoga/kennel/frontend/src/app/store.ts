import { createSlice, configureStore, PayloadAction } from '@reduxjs/toolkit';
import {
  useSelector as rawUseSelector,
  TypedUseSelectorHook,
} from 'react-redux';

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

export type State = {
  problems: {id: number, problem: Problem, need_fetch: boolean}[];
  selected: number;
};

const initialProblem = (): Problem => {
  return {
    bonuses: [] as Bonus[],
    hole: [] as Hole,
    epsilon: 0,
    figure: {edges: [], vertices: []} as Figure
  }
}

const initialState: State = {
  problems: [
    {
      id: 1,
      problem: initialProblem(),
      need_fetch: true
    },
    {
      id: 2,
      problem: initialProblem(),
      need_fetch: true
    },
  ],
  selected: 0,
};

const slice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    updateProblem: (
      state,
      action: PayloadAction<{ id: number, problem: Problem, need_fetch: boolean }>
    ) => ({
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
