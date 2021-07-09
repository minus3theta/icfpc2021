const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = 1200;
canvas.height = 1200;
const ctx = canvas.getContext('2d')!;

type Pair = [number, number];
type Point = Pair;

type Figure = {
  "edges": Pair[],
  "vertices": Point[]
}
type State = {
  "hole": Point[],
  "epsilon": number,
  "figure": Figure
}

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

function convertCoord(x: number, y: number): [number, number] {
  const a = 10;
  const b = 100;
  return [x*a+b, y*a+b];
}

function drawGrid(ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = 'rgb(1,1,1,0.3)'; 
  for (let i = 0; i <= 100; i++) {
    ctx.beginPath();
    let [x, y] = convertCoord(0, i);
    ctx.moveTo(x, y);
    [x, y] = convertCoord(100, i);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    [x, y] = convertCoord(i, 0);
    ctx.moveTo(x, y);
    [x, y] = convertCoord(i, 100);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
}

function drawFigure(figure: Figure, ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = 'rgb(00,00,255)'; 
  ctx.fillStyle = 'rgb(00,00,255)';
  figure["vertices"].forEach(co => {
    ctx.beginPath();
    const [x, y] = convertCoord(co[0]!, co[1]!);
    ctx.arc(x, y, 3, 0, Math.PI*2, false);
    ctx.fill();
  });

  figure["edges"].forEach(e => {
    const from = figure["vertices"][e[0]!]!;
    const to = figure["vertices"][e[1]!]!;
    ctx.beginPath();
    let [x, y] = convertCoord(from[0]!, from[1]!);
    ctx.moveTo(x, y);
    [x, y] = convertCoord(to[0]!, to[1]!);
    ctx.lineTo(x, y);
    ctx.stroke();
  });
}

function drawHole(hole: Point[], ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = 'rgb(255,00,00)'; 
  ctx.fillStyle = 'rgb(255,00,00)';
  hole.forEach(co => {
    ctx.beginPath();
    const [x, y] = convertCoord(co[0]!, co[1]!);
    ctx.arc(x, y, 3, 0, Math.PI*2, false);
    ctx.fill();
  });

  for (let i = 0; i < hole.length; i++) {
    const from = hole[i]!;
    const to = hole[(i+1)%hole.length]!;
    ctx.beginPath();
    let [x, y] = convertCoord(from[0]!, from[1]!);
    ctx.moveTo(x, y);
    [x, y] = convertCoord(to[0]!, to[1]!);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
}

drawGrid(ctx);
drawHole(state["hole"], ctx);
drawFigure(state["figure"], ctx);