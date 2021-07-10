import { createSlice, configureStore, PayloadAction } from '@reduxjs/toolkit';
import {
  useSelector as rawUseSelector,
  TypedUseSelectorHook,
} from 'react-redux';

type Problem = {
  id: number;
};

type State = {
  problems: Problem[];
  selected: number;
};

const initialState: State = {
  problems: [{ id: 1 }, { id: 2 }],
  selected: 0
};

const slice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    updateProblems: (
      state,
      action: PayloadAction<{ problems: Problem[] }>
    ) => ({
      ...state,
      problems: action.payload.problems,
    }),
    setSelected: (
      state,
      action: PayloadAction<number>
    ) => ({
      ...state,
      selected: action.payload,
    }),
  },
});

export const { updateProblems, setSelected } = slice.actions;

export const store = configureStore({
  reducer: slice.reducer,
});

export type RootState = ReturnType<typeof store.getState>;
export const useSelector: TypedUseSelectorHook<RootState> = rawUseSelector;
