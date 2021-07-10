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
  id: number;
  problem: {
    hole: Hole;
    epsilon: number;
    figure: Figure;
    bonuses: Bonus[];
  };
};

export type State = {
  problems: Problem[];
  selected: number;
};

const initialState: State = {
  problems: [
    {
      id: 1,
      problem: {
        bonuses: [{ bonus: 'GLOBALIST', problem: 35, position: [62, 46] }],
        hole: [
          [45, 80],
          [35, 95],
          [5, 95],
          [35, 50],
          [5, 5],
          [35, 5],
          [95, 95],
          [65, 95],
          [55, 80],
        ],
        epsilon: 150000,
        figure: {
          edges: [
            [2, 5],
            [5, 4],
            [4, 1],
            [1, 0],
            [0, 8],
            [8, 3],
            [3, 7],
            [7, 11],
            [11, 13],
            [13, 12],
            [12, 18],
            [18, 19],
            [19, 14],
            [14, 15],
            [15, 17],
            [17, 16],
            [16, 10],
            [10, 6],
            [6, 2],
            [8, 12],
            [7, 9],
            [9, 3],
            [8, 9],
            [9, 12],
            [13, 9],
            [9, 11],
            [4, 8],
            [12, 14],
            [5, 10],
            [10, 15],
          ],
          vertices: [
            [20, 30],
            [20, 40],
            [30, 95],
            [40, 15],
            [40, 35],
            [40, 65],
            [40, 95],
            [45, 5],
            [45, 25],
            [50, 15],
            [50, 70],
            [55, 5],
            [55, 25],
            [60, 15],
            [60, 35],
            [60, 65],
            [60, 95],
            [70, 95],
            [80, 30],
            [80, 40],
          ],
        },
      },
    },
    {
      id: 2,
      problem: {
        bonuses: [{ bonus: 'BREAK_A_LEG', problem: 39, position: [75, 5] }],
        hole: [
          [15, 60],
          [15, 25],
          [5, 25],
          [5, 5],
          [15, 5],
          [15, 10],
          [25, 10],
          [25, 5],
          [35, 5],
          [35, 10],
          [45, 10],
          [45, 5],
          [55, 5],
          [55, 10],
          [65, 10],
          [65, 5],
          [75, 5],
          [75, 25],
          [65, 25],
          [65, 60],
        ],
        epsilon: 250000,
        figure: {
          edges: [
            [2, 0],
            [0, 1],
            [1, 4],
            [4, 2],
            [4, 11],
            [11, 18],
            [18, 21],
            [21, 15],
            [15, 11],
            [2, 3],
            [3, 8],
            [8, 19],
            [19, 15],
            [9, 10],
            [10, 6],
            [6, 7],
            [7, 12],
            [12, 16],
            [16, 17],
            [17, 13],
            [13, 14],
            [14, 20],
            [20, 22],
            [22, 16],
            [16, 9],
            [3, 5],
            [5, 9],
            [22, 19],
            [19, 23],
            [23, 27],
            [27, 26],
            [26, 22],
            [31, 28],
            [28, 24],
            [24, 25],
            [25, 32],
            [32, 34],
            [34, 33],
            [33, 29],
            [29, 30],
            [30, 35],
            [35, 36],
            [36, 34],
            [34, 31],
            [31, 26],
            [36, 38],
            [38, 37],
            [37, 27],
          ],
          vertices: [
            [3, 7],
            [5, 2],
            [6, 16],
            [8, 30],
            [13, 10],
            [13, 46],
            [16, 56],
            [16, 58],
            [17, 33],
            [20, 50],
            [20, 55],
            [22, 11],
            [23, 58],
            [24, 60],
            [24, 62],
            [25, 18],
            [27, 51],
            [28, 56],
            [30, 6],
            [30, 23],
            [30, 62],
            [32, 10],
            [34, 51],
            [42, 24],
            [53, 51],
            [53, 53],
            [54, 45],
            [57, 21],
            [57, 50],
            [57, 56],
            [57, 58],
            [58, 46],
            [59, 53],
            [60, 55],
            [62, 48],
            [63, 58],
            [66, 48],
            [68, 23],
            [74, 32],
          ],
        },
      },
    },
  ],
  selected: 0,
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
    setSelected: (state, action: PayloadAction<number>) => ({
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
