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
};

const initialState: State = {
  problems: [{ id: 1 }, { id: 2 }],
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
  },
});

export const { updateProblems } = slice.actions;

export const store = configureStore({
  reducer: slice.reducer,
});

export type RootState = ReturnType<typeof store.getState>;
export const useSelector: TypedUseSelectorHook<RootState> = rawUseSelector;
