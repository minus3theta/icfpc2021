import 'phaser';
import { fetchProblem } from './scenes/fetch_problem';
import {MainScene} from "./scenes/mainScene";

export const fps: number = 12;
export const canvasSize = 800;

const config: Phaser.Types.Core.GameConfig = {
  title: 'gui-tool',
  version: '1.0.0',
  width: canvasSize,
  height: canvasSize,
  parent: 'game',
  type: Phaser.AUTO,
  backgroundColor: 0xF9F9FF,
  scene: [
    MainScene
  ],
  fps: { target: fps, forceSetTimeOut: true },
  dom: {
    createContainer: true
  },
};

export class Game extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
  }
}

const game = new Game(config);

const problemIdSelectBox = <HTMLSelectElement>document.getElementById('problem-id-select-box');
for (let i = 1; i <= 132; i++) {
  const elem = document.createElement('option');
  elem.value = String(i);
  elem.innerText = String(i);
  problemIdSelectBox.appendChild(elem);
}

// @ts-ignore
document.getElementById('upload-button').addEventListener('change', function(event) {
  const input = event.target;
  // @ts-ignore
  if (input.files.length === 0) return;
  // @ts-ignore
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = function() {
    if (typeof reader.result === "string") {
      game.scene.start('mainScene', { filename: file.name, problemInfo: JSON.parse(reader.result) });
    }
  }
  reader.readAsText(file);
});

const fetchButton = document.getElementById('fetch-button') as HTMLButtonElement;
fetchButton.addEventListener('click', async () => {
  const selectBox = document.getElementById('problem-id-select-box') as HTMLSelectElement;
  const problemId = + selectBox.value;
  const problem_json = await fetchProblem(problemId);
  game.scene.start('mainScene', { filename: 'problem' + problemId, problemInfo: problem_json });
});


const onLoad = async () => {
  if (location.hash === "") {
    return;
  }
  const q = JSON.parse(decodeURIComponent(location.hash).substr(1))
  const problemId = q["problemId"];
  const problem_json = await fetchProblem(problemId);
  game.scene.start('mainScene', { filename: 'problem' + problemId + '.json', problemInfo: problem_json });

  const pose = q["pose"];
  if (pose != null) {
    setTimeout(() => {
      const answer_button = document.getElementById('answer-upload-button') as HTMLInputElement;
      const answer_file = new File([JSON.stringify(pose)], "output" + problemId + ".json", {type: "application/json"})
      const dt = new DataTransfer();
      dt.items.add(answer_file);
      answer_button.files = dt.files;
      const ev = new Event("change");
      answer_button.dispatchEvent(ev);
    }, 1000);
  }
}

window.addEventListener("load", onLoad);