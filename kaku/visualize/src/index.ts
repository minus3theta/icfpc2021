import {width, height} from './config';
import {Figure, Point, setOrigLen, State} from './state';
import {updateState} from './drawState';
import { bane, figure2graph, graph2vertices } from './graph';

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
    ],
    "orig_len": []
  }
}

// state = {"hole":[[0,4],[11,0],[21,12],[27,0],[41,1],[56,0],[104,0],[104,25],[93,29],[97,41],[104,53],[82,57],[67,57],[58,49],[40,57],[25,57],[12,53],[0,56]],"epsilon":29340,"figure":{"orig_len": [],"edges":[[0,1],[0,3],[1,2],[2,4],[2,5],[3,5],[4,6],[5,7],[6,7],[6,8],[7,9],[8,10],[8,11],[9,10],[10,11]],"vertices":[[26,37],[22,12],[2,20],[4,21],[5,0],[24,29],[25,12],[2,19],[5,23],[20,34],[0,46],[20,40]]}}
// state = {"hole":[[80,125],[70,155],[5,155],[5,80],[45,70],[5,60],[5,5],[75,5],[85,35],[95,5],[155,5],[155,60],[120,75],[155,80],[155,155],[90,155]],"epsilon":375000,"figure":{"orig_len": [],"edges":[[19,28],[28,26],[26,17],[17,16],[16,19],[19,21],[64,57],[57,52],[52,53],[53,67],[67,70],[70,57],[21,64],[64,77],[77,76],[76,63],[63,44],[44,40],[40,25],[25,13],[13,14],[14,15],[15,21],[15,12],[12,11],[11,14],[12,7],[7,5],[5,10],[10,8],[8,3],[3,1],[1,11],[8,11],[10,12],[13,6],[6,9],[9,2],[2,0],[0,4],[4,6],[25,24],[24,29],[29,23],[23,18],[18,24],[40,39],[39,43],[43,44],[43,46],[46,35],[35,34],[34,39],[63,65],[65,73],[73,71],[71,58],[58,65],[77,81],[81,89],[89,91],[91,93],[93,92],[92,89],[84,85],[85,88],[88,87],[87,84],[84,81],[81,78],[78,82],[82,81],[76,83],[83,90],[90,95],[95,94],[94,86],[86,80],[80,75],[75,79],[79,83],[83,86],[22,72],[72,74],[74,20],[20,22],[30,36],[36,37],[37,31],[31,30],[36,41],[41,42],[42,37],[41,49],[49,50],[50,42],[49,54],[54,55],[55,50],[54,61],[61,62],[62,55],[61,68],[68,69],[69,62],[31,20],[69,74],[38,33],[33,27],[27,32],[32,38],[38,45],[45,47],[47,51],[51,48],[48,45],[51,56],[56,60],[60,66],[66,59],[59,56],[66,72],[27,22],[48,49],[74,77],[20,14],[22,25],[72,63]],"vertices":[[1,93],[6,118],[8,103],[8,123],[9,80],[9,128],[13,86],[13,131],[17,119],[19,94],[20,121],[22,115],[25,118],[33,69],[37,98],[42,102],[46,145],[48,152],[54,12],[54,143],[56,92],[58,109],[60,55],[61,7],[61,18],[61,32],[64,152],[65,64],[67,143],[68,13],[69,74],[69,82],[71,71],[72,57],[74,24],[75,21],[75,74],[75,82],[77,65],[78,24],[78,33],[81,74],[81,82],[82,24],[82,34],[82,66],[85,23],[85,63],[85,70],[87,74],[87,82],[88,66],[89,147],[91,152],[93,74],[93,81],[94,65],[95,146],[98,14],[98,70],[99,59],[99,74],[99,80],[101,41],[102,108],[103,22],[103,65],[104,152],[105,74],[105,79],[105,144],[106,12],[111,58],[112,20],[114,87],[125,25],[125,70],[125,85],[129,105],[130,43],[133,26],[133,91],[133,105],[138,47],[138,98],[138,104],[140,43],[144,98],[144,104],[145,89],[148,48],[148,85],[149,92],[152,89],[154,33],[159,36]]}}

setOrigLen(state.figure);
updateState(state, ctx);

const state_text_area = document.getElementById("state") as HTMLTextAreaElement;
const update_button = document.getElementById("update") as HTMLButtonElement;

state_text_area.value = JSON.stringify(state, null, 4);
update_button.addEventListener('click', (_ev: MouseEvent) => {
  const new_state = JSON.parse(state_text_area.value) as State;
  let moved = -1;
  for (let i = 0; i < state.figure.vertices.length; i++) {
    const v = state.figure.vertices[i]!;
    const new_v = new_state.figure.vertices[i]!;
    if (v[0] !== new_v[0] || v[1] !== new_v[1]) {
      moved = i;
      break;
    }
  }
  state = new_state;
  console.log(moved);
  updateState(state, ctx);
  setTimeout(() => {
    const graph = figure2graph(state.figure);
    bane(graph, state.epsilon, moved);
    const v = graph2vertices(graph);
    state.figure.vertices = v;
    updateState(state, ctx);
    state_text_area.value = JSON.stringify(state, null, 4);
  }, 100);
});