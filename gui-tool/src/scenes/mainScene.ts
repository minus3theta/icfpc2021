import {canvasSize} from "../main";
import { baneOptimize } from "./kaku";

const geta = 2;
let displayRate = 5;
let maxValue = 0;
let globalist = false;

export class Vertex {
  public x;
  public y;
  public prevX;
  public prevY;
  public edges;
  public circle;
  public graphics;
  public id;
  public textElem;
  public selected;

  constructor(x: number, y: number, scene: Phaser.Scene, id: number) {
    this.x = x;
    this.y = y;
    this.id = id;
    this.edges = [];
    this.graphics = scene.add.graphics({ fillStyle: { color: 0x00ff00 } })
    this.graphics.setAlpha(0);
    this.edges = [];

    this.resetCircle();

    this.textElem = document.createElement('span');
    this.textElem.style.position = 'absolute';
    this.textElem.style.left = String(this.x * displayRate) + 'px';
    this.textElem.style.top = String(this.y * displayRate) + 'px';
    this.textElem.style['pointer-events'] = 'none';
    this.textElem.innerHTML = String(this.id);

    // @ts-ignore
    document.getElementById('absolute-text-wrapper').appendChild(this.textElem);
  }

  resetCircle(): void {
    this.graphics.clear();
    this.x = Math.max(Math.min(this.x, maxValue + geta), 0);
    this.y = Math.max(Math.min(this.y, maxValue + geta), 0);
    this.circle = new Phaser.Geom.Circle(this.x * displayRate, this.y * displayRate, 10);
    this.graphics.fillCircleShape(this.circle);

    if (this.textElem) {
      this.textElem.style.left = String(this.x * displayRate) + 'px';
      this.textElem.style.top = String(this.y * displayRate) + 'px';
    }
  }

  drawConnectedEdges(): void {
    for (const e of this.edges) {
      e.updateLineStyle();
      e.draw();
    }
  }

  select(): void {
    this.selected = true;
    this.prevX = this.x;
    this.prevY = this.y;
    this.graphics.setAlpha(1);
    for (const e of this.edges) {
      e.drawRateFlag = true;
    }
  }

  unselect(): void {
    this.selected = false;
    this.graphics.setAlpha(0);
  }
}

class BonusVertex {
  public x;
  public y;
  public bonus;
  public problem;
  public graphics;
  public unlocked;
  public scene;

  constructor(x: number, y: number, bonus: string, problem: number, scene: Phaser.Scene) {
    this.x = x;
    this.y = y;
    this.bonus = bonus;
    this.problem = problem;
    this.scene = scene;
    this.graphics = scene.add.graphics({ fillStyle: { color: 0xFFFF00, alpha: 0.7 } });
  }

  draw(): void {
    if (this.unlocked) {
      this.graphics.defaultFillColor = 0xFFA500;
    } else {
      this.graphics.defaultFillColor = 0xFFFF00;
    }
    this.graphics.clear();
    const circle = new Phaser.Geom.Circle(this.x * displayRate, this.y * displayRate, 30);
    this.graphics.fillCircleShape(circle);
  }
}

class Edge {
  public v;
  public graphics;
  public line;

  constructor(v1: Vertex, v2: Vertex) {
    this.v = [v1, v2];
  }

  calcLength(): number {
    const dx = this.v[0].x - this.v[1].x;
    const dy = this.v[0].y - this.v[1].y;
    return dx*dx + dy*dy;
  }

  updateLine(): void {
    this.line = new Phaser.Geom.Line(this.v[0].x * displayRate,
                                     this.v[0].y * displayRate,
                                     this.v[1].x * displayRate,
                                     this.v[1].y * displayRate);
  }

  draw(): void {
    this.graphics.clear();
    this.graphics.strokeLineShape(this.line);
  }
}

class HoleEdge extends Edge {
  constructor(v1: Vertex, v2: Vertex, scene: Phaser.Scene) {
    super(v1, v2);
    this.updateLine();
    this.graphics = scene.add.graphics({ lineStyle: { width: 2, color: 0x000000 }});
    this.draw();
  }
}

export class FigureEdge extends Edge {
  public baseLength;
  public minLength;
  public maxLength;
  public textElem;
  public scene;
  public drawRateFlag = false;
  public drawLength = 0;

  constructor(v1: Vertex, v2: Vertex, epsilon: number, scene: Phaser.Scene) {
    super(v1, v2);
    this.baseLength = this.calcLength();
    this.graphics = scene.add.graphics({ lineStyle: { width: 4, color: 0xff0000 } })
    this.maxLength = this.baseLength * (1 + epsilon / 1000000);
    this.minLength = this.baseLength * (1 - epsilon / 1000000);
    this.scene = scene;

    this.textElem = document.createElement('span');
    this.textElem.style.position = 'absolute';
    this.textElem.style['pointer-events'] = 'none';
    this.textElem.innerHTML = 'hoge';

    // @ts-ignore
    document.getElementById('absolute-text-wrapper').appendChild(this.textElem);
  }

  draw(): void {
    super.draw();

    if (this.drawRateFlag || this.drawLength > 0) {
      const len = this.drawRateFlag ? this.calcLength() : this.drawLength;
      this.textElem.innerText = String(this.calcStretchRate(len));
      this.textElem.style.left = (String)((this.v[0].x + this.v[1].x) / 2 * displayRate) + 'px';
      this.textElem.style.top = (String)((this.v[0].y + this.v[1].y) / 2 * displayRate) + 'px';
      if (!globalist && (len < this.minLength || this.maxLength < len)) {
        this.textElem.style.color = this.drawRateFlag ? '#CC0000' : '';
        this.textElem.style.fontWeight = this.drawRateFlag ? 'bold' : '';
      } else {
        this.textElem.style.color = this.drawRateFlag ? '' : '#00CC00';
        this.textElem.style.fontWeight = this.drawRateFlag ? '' : 'bold';
      }
    } else {
      this.textElem.innerText = '';
    }
  }

  calcStretchRate(len: number): number {
    return Math.floor(len / this.baseLength * 100) / 100;
  }

  isValidLength(): boolean {
    const len = this.calcLength();
    return this.minLength <= len && len <= this.maxLength;
  }

  updateLineStyle(): void {
    this.graphics.destroy();
    const len = this.calcLength();
    let width = 4;
    let color = 0xFF00FF;
    let alpha = 1;
    if (len < this.minLength) {
      width = 8;
      color = 0x0000FF;
      alpha = 0.6;
    } else if (len < this.baseLength) {
      color = 0x0000FF;
      const rate = (len - this.minLength) / (this.baseLength - this.minLength);
      color += Math.floor(0xFF * rate) * 0x10000;
    } else if (len <= this.maxLength) {
      if (this.maxLength !== this.baseLength) {
        color = 0xFF0000;
        const rate = (len - this.baseLength) / (this.maxLength - this.baseLength);
        color += 0xFF - Math.floor(0xFF * rate);
      }
    } else {
      width = 8;
      color = 0xFF0000;
      alpha = 0.6;
    }

    this.graphics = this.scene.add.graphics({ lineStyle: { width: width, color: color, alpha: alpha } });
    this.updateLine();
  }
}

export class MainScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'mainScene'
    });
  }

  private filename;
  private problemInfo;

  private vertices;
  private edges;
  private holeVertices;
  private holeEdges;
  private bonusVertices;

  private history;

  private dragging = false;
  private selectedVertices = [];
  private selecting = false;
  private areaSelected = false;
  private processing = false;

  private dragBasePoint;
  private selectBasePoint;
  private selectRectangleGraphic;

  create(data): void {
    this.history = [];

    this.cleanAbsoluteTextWrapper();
    this.initDisplayRate(data.problemInfo);
    this.drawLattice();

    if (data.problemInfo === undefined) return;
    this.filename = data.filename;
    this.problemInfo = data.problemInfo;

    this.applyGeta();
    this.displayEpsilon();
    this.updateSaveButton();
    this.updateUndoButton();
    this.updateUploadAnswerButton();
    this.updateGlobalistCheckbox();
    this.updateDisplayIdCheckbox();
    this.updateVerticalFlipButton();
    this.updateHorizontalFlipButton();
    this.manageUndoButton();
    this.optimizeButton();

    this.initHole();
    this.initVerticesAndEdges();
    this.initBonusVertices();
    this.drawFigure();
    this.drawHole();
    this.drawBonusVertices();
    this.displayDislikes();
    this.manageGlobalist();
    this.manageDisplayId();

    this.selectRectangleGraphic = this.add.graphics({
      lineStyle: { width: 4, color: 0x666666 },
      fillStyle: { color: 0xAAAAAA, alpha: 0.5 }
    });

    const that = this;
    this.input.on('pointermove', function(pointer) {
      const roundX = Math.round(pointer.x / displayRate);
      const roundY = Math.round(pointer.y / displayRate);
      that.displayPosition(roundX, roundY);

      if (that.dragging) {
        if (!that.processing) {
          that.processing = true;
          const dx = roundX - that.dragBasePoint[0];
          const dy = roundY - that.dragBasePoint[1];
          for (const v of that.selectedVertices) {
            // @ts-ignore
            v.x = v.prevX + dx;
            // @ts-ignore
            v.y = v.prevY + dy;
            // @ts-ignore
            v.resetCircle();
            // @ts-ignore
            v.drawConnectedEdges();
          }
          that.drawHole();
          that.drawBonusVertices();
          that.displayDislikes();
          that.manageSaveButton();
          that.processing = false;
        }
      } else if (that.selecting) {
        that.selectRectangleGraphic.clear();
        const position = [roundX * displayRate, roundY * displayRate];
        const rect = Phaser.Geom.Rectangle.FromPoints([position, that.selectBasePoint]);
        that.selectRectangleGraphic.strokeRectShape(rect);
        that.selectRectangleGraphic.fillRectShape(rect);

        for (const v of that.vertices) {
          if (rect.contains(v.x * displayRate, v.y * displayRate)) {
            v.select();
          } else {
            v.unselect();
          }
        }
      } else {
        for (const e of that.edges) {
          e.drawRateFlag = false;
          e.drawLength = 0;
        }
        let hit = false;
        if (!that.areaSelected) {
          for (const v of that.vertices) {
            if (v.circle.contains(pointer.x, pointer.y)) {
              v.select();
              hit = true;
            } else {
              v.unselect();
            }
          }
        }
        if (!hit) {
          for (const e of that.holeEdges) {
            if (Phaser.Geom.Intersects.PointToLine(pointer, e.line, 5)) {
              const len = e.calcLength();
              for (const e2 of that.edges) {
                e2.drawLength = len;
              }
              break;
            }
          }
        }
        that.drawFigure();
      }
    });

    this.input.on('pointerdown', function(pointer) {
      if (that.dragging || that.selecting) return;
      for (const v of that.vertices) {
        if (v.circle.contains(pointer.x, pointer.y) && v.selected) {
          that.dragging = true;
          if (!that.areaSelected) {
            // @ts-ignore
            that.selectedVertices.push(v);
          }
        }
      }
      if (that.dragging) {
        const roundX = Math.round(pointer.x / displayRate);
        const roundY = Math.round(pointer.y / displayRate);
        that.dragBasePoint = [roundX, roundY];
        that.pushHistory();
      }
      if (!that.dragging && !that.selecting) {
        that.areaSelected = false;
        that.selectedVertices = [];
        for (const v of that.vertices) v.unselect();

        const roundX = Math.round(pointer.x / displayRate);
        const roundY = Math.round(pointer.y / displayRate);
        that.selecting = true;
        that.selectBasePoint = [roundX * displayRate, roundY * displayRate];
      }
      that.manageFlipButtons();
    });

    this.input.on('pointerup', function(pointer) {
      if (that.dragging) {
        that.dragging = false;
        for (const v of that.selectedVertices) {
          // @ts-ignore
          v.select();
        }
        if (!that.areaSelected) {
          that.selectedVertices = [];
        }
      }
      if (that.selecting) {
        that.selecting = false;
        that.selectRectangleGraphic.clear();
        for (const v of that.vertices) {
          if (v.selected) {
            that.areaSelected = true;
            // @ts-ignore
            that.selectedVertices.push(v);
          }
        }
        that.manageFlipButtons();
      }
    });
  }

  applyGeta(): void {
    for (const e of this.problemInfo.hole) {
      e[0] += geta;
      e[1] += geta;
    }
    for (const e of this.problemInfo.figure.vertices) {
      e[0] += geta;
      e[1] += geta;
    }
  }

  initVerticesAndEdges(): void {
    const origVertices = this.problemInfo.figure.vertices;
    const origEdges = this.problemInfo.figure.edges;

    this.vertices = [];
    for (let i = 0; i < origVertices.length; i++) {
      this.vertices.push(new Vertex(origVertices[i][0],
                                    origVertices[i][1],
                                    this, i));
    }

    this.edges = [];
    for (let i = 0; i < origEdges.length; i++) {
      const edge = new FigureEdge(this.vertices[origEdges[i][0]],
                                  this.vertices[origEdges[i][1]],
                                  this.problemInfo.epsilon,
                                  this);
      this.edges.push(edge);
      this.vertices[origEdges[i][0]].edges.push(edge);
      this.vertices[origEdges[i][1]].edges.push(edge);
    }
  }

  initBonusVertices(): void {
    this.bonusVertices = [];
    if (!this.problemInfo.bonuses) return;

    for (const bonus of this.problemInfo.bonuses) {
      console.log(bonus);
      this.bonusVertices.push(new BonusVertex(bonus.position[0], bonus.position[1], bonus.bonus, bonus.problem, this));
    }
  }

  drawLattice(): void {
    const latticeGraphics = this.add.graphics({ lineStyle: { width: 1, color: 0xDDDDDD } });
    for (let i = 0; i <= canvasSize; i += displayRate) {
      const line1 = new Phaser.Geom.Line(0, i, canvasSize, i);
      const line2 = new Phaser.Geom.Line(i, 0, i, canvasSize);
      latticeGraphics.strokeLineShape(line1);
      latticeGraphics.strokeLineShape(line2);
    }
  }

  drawBonusVertices(): void {
    for (const bonusVertex of this.bonusVertices) {
      bonusVertex.unlocked = false;
      for (const v of this.vertices) {
        if (bonusVertex.x === v.x && bonusVertex.y === v.y) {
          bonusVertex.unlocked = true;
          break;
        }
      }
      bonusVertex.draw();
    }
  }

  initDisplayRate(problemInfo): void {
    if (problemInfo === undefined) return;

    maxValue = 0;
    for (const v of problemInfo.hole) {
      maxValue = Math.max(maxValue, v[0]);
      maxValue = Math.max(maxValue, v[1]);
    }
    for (const v of problemInfo.figure.vertices) {
      maxValue = Math.max(maxValue, v[0]);
      maxValue = Math.max(maxValue, v[1]);
    }
    displayRate = canvasSize / (maxValue + geta * 2);
  }

  initHole(): void {
    const hole = this.problemInfo.hole;

    this.holeVertices = [];
    for (let i = 0; i < hole.length; i++) {
      this.holeVertices.push(new Vertex(hole[i][0], hole[i][1], this, i));
    }

    this.holeEdges = [];
    for (let i = 0; i < hole.length; i++) {
      this.holeEdges.push(new HoleEdge(this.holeVertices[i],
                                       this.holeVertices[(i+1) % hole.length],
                                       this));
    }
  }

  drawFigure(): void {
    for (const edge of this.edges) {
      edge.updateLineStyle();
      edge.draw();
    }
  }

  drawHole(): void {
    for (const holeEdge of this.holeEdges) {
      let intersect = false;
      for (const figureEdge of this.edges) {
        if (this.isIntersect(holeEdge, figureEdge)) {
          intersect = true;
          break;
        }
      }
      holeEdge.graphics.clear();
      if (intersect) {
        holeEdge.graphics = this.add.graphics({ lineStyle: { width: 2, color: 0xDD9999 } })
      } else {
        holeEdge.graphics = this.add.graphics({ lineStyle: { width: 2, color: 0x000000 } })
      }
      holeEdge.draw();
    }
  }

  isValidAnswer(): boolean {
    if (globalist) {
      let sum = 0;
      for (const edge of this.edges) {
        sum += Math.abs(edge.calcLength() / edge.baseLength - 1);
      }
      sum *= 1000000;
      const limit = this.edges.length * this.problemInfo.epsilon;
      const elem = <HTMLSpanElement>document.getElementById('globalist-text');
      elem.innerText = String(Math.ceil(sum)) + " / " + String(limit);
      if (sum > limit) {
        elem.style.color = '#CC0000';
        elem.style.fontWeight = 'bold';
        return false;
      }
      elem.style.color = '';
      elem.style.fontWeight = '';
    } else {
      for (const edge of this.edges) {
        if (!edge.isValidLength()) {
          return false;
        }
      }
    }
    for (const holeEdge of this.holeEdges) {
      for (const figureEdge of this.edges) {
        if (this.isIntersect(holeEdge, figureEdge)) {
          return false;
        }
      }
    }
    return true;
  }

  isIntersect(e1: Edge, e2: Edge): boolean {
    const x1 = e1.v[0].x;
    const y1 = e1.v[0].y;
    const x2 = e1.v[1].x;
    const y2 = e1.v[1].y;
    const x3 = e2.v[0].x;
    const y3 = e2.v[0].y;
    const x4 = e2.v[1].x;
    const y4 = e2.v[1].y;
    const ta = (x3-x4)*(y1-y3)+(y3-y4)*(x3-x1)
    const tb = (x3-x4)*(y2-y3)+(y3-y4)*(x3-x2)
    const tc = (x1-x2)*(y3-y1)+(y1-y2)*(x1-x3);
    const td = (x1-x2)*(y4-y1)+(y1-y2)*(x1-x4);
    return ta * tb < 0 && tc * td < 0;
  }

  calcDistance(v1: Vertex, v2: Vertex): number {
    const dx = v1.x - v2.x;
    const dy = v1.y - v2.y;
    return dx*dx + dy*dy;
  }

  calcDislikes(): number {
    let dislikes = 0;
    for (const holeVertex of this.holeVertices) {
      let minDist = Infinity;
      for (const figureVertex of this.vertices) {
        minDist = Math.min(minDist, this.calcDistance(holeVertex, figureVertex));
      }
      dislikes += minDist;
    }
    return dislikes;
  }

  displayDislikes(): void {
    const elem = <HTMLSpanElement>document.getElementById('dislikes-text');
    const dislikes = this.calcDislikes();
    elem.innerText = String(dislikes);
  }

  saveAnswer(): void {
    const answer = { vertices: [], bonuses: [] };
    for (const v of this.vertices) {
      // @ts-ignore
      answer.vertices.push([v.x - geta, v.y - geta]);
    }
    if (globalist) {
      // @ts-ignore
      answer.bonuses.push({ bonus: "GLOBALIST", problem: (<HTMLInputElement>document.getElementById('globalist-problem')).valueAsNumber });
    }

    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(answer)], { type: 'text/json' }));
    a.download = this.filename.substr(0, this.filename.indexOf('.')) + '_output.json';

    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  optimize(): void {
    this.pushHistory();
    const selectedVertices: Vertex[] = [];
    for (const v of this.vertices) {
      if (v.selected) {
        selectedVertices.push(v);
      }
    }
    baneOptimize(this.vertices, selectedVertices);
    this.drawFigure();
    this.manageSaveButton();
  }

  pushHistory(): void {
    const arr = [];
    for (let i = 0; i < this.vertices.length; i++) {
      // @ts-ignore
      arr.push([this.vertices[i].x, this.vertices[i].y]);
    }
    // @ts-ignore
    this.history.push(arr);

    if (this.history.length > 30) {
      this.history.shift();
    }
    this.manageUndoButton();
  }

  verticalFlip(): void {
    if (this.selectedVertices.length <= 1) return;
    let minY = 10000;
    let maxY = -10000;
    for (const v of this.selectedVertices) {
      // @ts-ignore
      minY = Math.min(minY, v.y);
      // @ts-ignore
      maxY = Math.max(maxY, v.y);
    }
    for (const v of this.selectedVertices) {
      // @ts-ignore
      v.y = maxY - (v.y - minY)
      // @ts-ignore
      v.select();
      // @ts-ignore
      v.resetCircle();
    }
    this.drawFigure();
    this.drawBonusVertices();
  }

  horizontalFlip(): void {
    if (this.selectedVertices.length <= 1) return;
    let minX = 10000;
    let maxX = -10000;
    for (const v of this.selectedVertices) {
      // @ts-ignore
      minX = Math.min(minX, v.x);
      // @ts-ignore
      maxX = Math.max(maxX, v.x);
    }
    for (const v of this.selectedVertices) {
      // @ts-ignore
      v.x = maxX - (v.x - minX)
      // @ts-ignore
      v.select();
      // @ts-ignore
      v.resetCircle();
    }
    this.drawFigure();
    this.drawBonusVertices();
  }

  undo(): void {
    const arr = this.history.pop();
    if (!arr) return;
    for (let i = 0; i < this.vertices.length; i++) {
      this.vertices[i].x = arr[i][0];
      this.vertices[i].y = arr[i][1];
    }
    this.drawFigure();
    for (const v of this.vertices) {
      v.resetCircle();
    }
    this.drawHole();
    this.displayDislikes();
    this.manageUndoButton();
  }

  uploadAnswer(event): void {
    const input = event.target;
    // @ts-ignore
    if (input.files.length === 0) return;
    // @ts-ignore
    const file = input.files[0];
    const reader = new FileReader();
    const that = this;
    reader.onload = function() {
      if (typeof reader.result === "string") {
        const json = JSON.parse(reader.result);
        const vertices = json.vertices;
        // @ts-ignore
        if (that.vertices.length !== vertices.length) {
          alert('invalid answer');
        } else {
          for (let i = 0; i < vertices.length; i++) {
            // @ts-ignore
            that.vertices[i].x = vertices[i][0] + geta;
            // @ts-ignore
            that.vertices[i].y = vertices[i][1] + geta;
            that.vertices[i].resetCircle();
          }
          // @ts-ignore
          that.drawFigure();
        }
      }
    }
    reader.readAsText(file);
  }

  manageFlipButtons(): void {
    const buttons = [
      <HTMLInputElement>document.getElementById('vertical-flip-button'),
      <HTMLInputElement>document.getElementById('horizontal-flip-button')
    ];
    for (const button of buttons) button.disabled = !this.areaSelected;
  }

  manageSaveButton(): void {
    const saveButton = document.getElementById('save-button');
    if (this.isValidAnswer()) {
      // @ts-ignore
      saveButton.disabled = false;
    } else {
      // @ts-ignore
      saveButton.disabled = true;
    }
  }

  manageUndoButton(): void {
    const undoButton = document.getElementById('undo-button');
    if (this.history.length) {
      // @ts-ignore
      undoButton.disabled = false;
    } else {
      // @ts-ignore
      undoButton.disabled = true;
    }
  }

  manageGlobalist(): void {
    const checkbox = <HTMLInputElement>document.getElementById('globalist-checkbox');
    globalist = checkbox.checked;
    if (!globalist) {
      const elem = <HTMLSpanElement>document.getElementById('globalist-text');
      elem.innerText = "-";
      elem.style.color = '';
      elem.style.fontWeight = '';
    }
    this.manageSaveButton();
  }

  manageDisplayId(): void {
    const checkbox = <HTMLInputElement>document.getElementById('display-id-checkbox');
    if (checkbox.checked) {
      for (const v of this.vertices) {
        v.textElem.innerText = String(v.id);
      }
      for (const v of this.holeVertices) {
        v.textElem.innerText = String(v.id);
      }
    } else {
      for (const v of this.vertices) {
        v.textElem.innerText = '';
      }
      for (const v of this.holeVertices) {
        v.textElem.innerText = '';
      }
    }
  }

  updateVerticalFlipButton(): void {
    const verticalFlipButtonWrapper = document.getElementById('vertical-flip-button-wrapper');
    const verticalFlipButton = document.getElementById('vertical-flip-button');

    // @ts-ignore
    verticalFlipButtonWrapper.removeChild(verticalFlipButton);

    const newVerticalFlipButton = document.createElement('input');
    newVerticalFlipButton.id = 'vertical-flip-button';
    newVerticalFlipButton.type = 'button';
    newVerticalFlipButton.value = '縦反転';
    // @ts-ignore
    verticalFlipButtonWrapper.appendChild(newVerticalFlipButton);

    // @ts-ignore
    verticalFlipButtonWrapper.appendChild(newVerticalFlipButton);

    // @ts-ignore
    newVerticalFlipButton.addEventListener('click', this.verticalFlip.bind(this));
  }

  updateHorizontalFlipButton(): void {
    const horizontalFlipButtonWrapper = document.getElementById('horizontal-flip-button-wrapper');
    const horizontalFlipButton = document.getElementById('horizontal-flip-button');

    // @ts-ignore
    horizontalFlipButtonWrapper.removeChild(horizontalFlipButton);

    const newHorizontalFlipButton = document.createElement('input');
    newHorizontalFlipButton.id = 'horizontal-flip-button';
    newHorizontalFlipButton.type = 'button';
    newHorizontalFlipButton.value = '縦反転';
    // @ts-ignore
    horizontalFlipButtonWrapper.appendChild(newHorizontalFlipButton);

    // @ts-ignore
    horizontalFlipButtonWrapper.appendChild(newHorizontalFlipButton);

    // @ts-ignore
    newHorizontalFlipButton.addEventListener('click', this.horizontalFlip.bind(this));
  }

  updateSaveButton(): void {
    const saveButtonWrapper = document.getElementById('save-button-wrapper');
    const saveButton = document.getElementById('save-button');

    // @ts-ignore
    saveButtonWrapper.removeChild(saveButton);

    const newSaveButton = document.createElement('input');
    newSaveButton.id = 'save-button';
    newSaveButton.type = 'button';
    newSaveButton.value = 'Save Answer';
    newSaveButton.disabled = true;
    // @ts-ignore
    saveButtonWrapper.appendChild(newSaveButton);

    // @ts-ignore
    newSaveButton.addEventListener('click', this.saveAnswer.bind(this));
  }

  updateUndoButton(): void {
    const undoButtonWrapper = document.getElementById('undo-button-wrapper');
    const undoButton = document.getElementById('undo-button');

    // @ts-ignore
    undoButtonWrapper.removeChild(undoButton);

    const newUndoButton = document.createElement('input');
    newUndoButton.id = 'undo-button';
    newUndoButton.type = 'button';
    newUndoButton.value = 'Undo';
    // @ts-ignore
    undoButtonWrapper.appendChild(newUndoButton);

    // @ts-ignore
    undoButtonWrapper.appendChild(newUndoButton);

    // @ts-ignore
    newUndoButton.addEventListener('click', this.undo.bind(this));
  }

  updateUploadAnswerButton(): void {
    const uploadAnswerButtonWrapper = document.getElementById('answer-upload-button-wrapper');
    const uploadAnswerButton = document.getElementById('answer-upload-button');

    // @ts-ignore
    uploadAnswerButtonWrapper.removeChild(uploadAnswerButton);

    const newUploadAnswerButton = document.createElement('input');
    newUploadAnswerButton.id = 'answer-upload-button';
    newUploadAnswerButton.type = 'file';
    // @ts-ignore
    uploadAnswerButtonWrapper.appendChild(newUploadAnswerButton);

    // @ts-ignore
    uploadAnswerButtonWrapper.appendChild(newUploadAnswerButton);

    // @ts-ignore
    newUploadAnswerButton.addEventListener('change', this.uploadAnswer.bind(this));
  }

  updateGlobalistCheckbox(): void {
    const globalistCheckbox = <HTMLInputElement>document.getElementById('globalist-checkbox');

    globalistCheckbox.addEventListener('change', this.manageGlobalist.bind(this));
  }

  updateDisplayIdCheckbox(): void {
    const displayIdCheckboxWrapper = document.getElementById('display-id-checkbox-wrapper');
    const displayIdCheckbox = document.getElementById('display-id-checkbox');
    const displayIdLabel = document.getElementById('display-id-label');

    // @ts-ignore
    displayIdCheckboxWrapper.removeChild(displayIdCheckbox);
    // @ts-ignore
    displayIdCheckboxWrapper.removeChild(displayIdLabel);

    const newDisplayIdCheckbox = document.createElement('input');
    newDisplayIdCheckbox.id = 'display-id-checkbox';
    newDisplayIdCheckbox.type = 'checkbox';
    // @ts-ignore
    displayIdCheckboxWrapper.appendChild(newDisplayIdCheckbox);

    const newDisplayIdLabel = document.createElement('label');
    newDisplayIdLabel.id = 'display-id-label';
    newDisplayIdLabel.innerText = 'Display vertex id';
    // @ts-ignore
    displayIdCheckboxWrapper.appendChild(newDisplayIdLabel);

    // @ts-ignore
    newDisplayIdCheckbox.addEventListener('change', this.manageDisplayId.bind(this));
  }

  optimizeButton(): void {
    const optimizeButtonWrapper = document.getElementById('optimize-button-wrapper') as HTMLSpanElement;
    const optimizeButton = document.getElementById('optimize-button') as HTMLButtonElement;

    optimizeButtonWrapper.removeChild(optimizeButton);

    const newOptimizeButton = document.createElement('input') as HTMLButtonElement;
    newOptimizeButton.id = 'optimize-button';
    newOptimizeButton.type = 'button';
    newOptimizeButton.value = 'Optimize!!';
    newOptimizeButton.disabled = false;
    optimizeButtonWrapper.appendChild(newOptimizeButton);

    newOptimizeButton.addEventListener('click', this.optimize.bind(this));
  }

  displayEpsilon(): void {
    const epsilonText = document.getElementById('epsilon-text');
    // @ts-ignore
    epsilonText.innerHTML = this.problemInfo.epsilon;
  }

  displayPosition(x: number, y: number): void {
    const xText = document.getElementById('x-text');
    const yText = document.getElementById('y-text');
    // @ts-ignore
    xText.innerHTML = String(x - geta);
    // @ts-ignore
    yText.innerHTML = String(y - geta);
  }

  cleanAbsoluteTextWrapper(): void {
    const wrapper = <HTMLElement>document.getElementById('absolute-text-wrapper');
    while (wrapper.hasChildNodes()) {
      // @ts-ignore
      wrapper.removeChild(wrapper.childNodes[0]);
    }
  }
}
