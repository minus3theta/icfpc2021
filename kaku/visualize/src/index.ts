import {width, height, convertCoord, grid_color, figure_color, hole_color} from './config';
import {Figure, Point, State} from './state';
import {updateState} from './drawState';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = width;
canvas.height = height;
const ctx = canvas.getContext('2d')!;

let state: State = {
  "hole": [
    [45,80],[35,95],[5,95],[35,50],[5,5],[35,5],[95,95],[65,95],[55,80]
  ],
  "epsilon": 150000,
  "figure": {
    "edges": [
      [2,5],[5,4],[4,1],[1,0],[0,8],[8,3],[3,7],[7,11],[11,13],
      [13,12],[12,18],[18,19],[19,14],[14,15],[15,17],[17,16],
      [16,10],[10,6],[6,2],[8,12],[7,9],[9,3],[8,9],[9,12],[13,9],
      [9,11],[4,8],[12,14],[5,10],[10,15]
    ],
    "vertices": [
      [20,30],[20,40],[30,95],[40,15],[40,35],[40,65],[40,95],
      [45,5],[45,25],[50,15],[50,70],[55,5],[55,25],[60,15],
      [60,35],[60,65],[60,95],[70,95],[80,30],[80,40]
    ]
  }
}

updateState(state, ctx);

const state_text_area = document.getElementById("state") as HTMLTextAreaElement;
const update_button = document.getElementById("update") as HTMLButtonElement;

state_text_area.value = JSON.stringify(state, null, 4);
update_button.addEventListener('click', (_ev: MouseEvent) => {
  state = JSON.parse(state_text_area.value) as State;
  updateState(state, ctx);
});