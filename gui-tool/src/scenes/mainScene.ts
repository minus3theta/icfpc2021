import {canvasSize} from "../main";

const geta = 2;
let displayRate = 5;
let displayStretchRateFlag = false;

class Vertex {
  public x;
  public y;
  public edges;
  public circle;
  public graphics;

  constructor(x: number, y: number, scene: Phaser.Scene) {
    this.x = x;
    this.y = y;
    this.graphics = scene.add.graphics({ fillStyle: { color: 0x00ff00 } })
    this.graphics.setAlpha(0);
    this.edges = [];

    this.resetCircle();
  }

  resetCircle(): void {
    this.graphics.clear();
    this.circle = new Phaser.Geom.Circle(this.x * displayRate, this.y * displayRate, 10);
    this.graphics.fillCircleShape(this.circle);
  }

  activateCircle(): void {
    this.graphics.setAlpha(1);
    for (const e of this.edges) {
      e.drawRateFlag = true;
    }
  }

  deactivateCircle(): void {
    this.graphics.setAlpha(0);
  }
}

class Edge {
  public v;
  public graphics;

  constructor(v1: Vertex, v2: Vertex) {
    this.v = [v1, v2];
  }

  draw(): void {
    this.graphics.clear();
    const line = new Phaser.Geom.Line(this.v[0].x * displayRate,
                                      this.v[0].y * displayRate,
                                      this.v[1].x * displayRate,
                                      this.v[1].y * displayRate);
    this.graphics.strokeLineShape(line);
  }
}

class HoleEdge extends Edge {
  constructor(v1: Vertex, v2: Vertex, scene: Phaser.Scene) {
    super(v1, v2);
    this.graphics = scene.add.graphics({ lineStyle: { width: 2, color: 0x000000 }});
    this.draw();
  }
}

class FigureEdge extends Edge {
  public baseLength;
  public minLength;
  public maxLength;
  public textElem;
  public scene;
  public drawRateFlag = false;

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
    document.getElementById('stretch-rate-wrapper').appendChild(this.textElem);
  }

  draw(): void {
    super.draw();

    if (this.drawRateFlag) {
      this.textElem.innerText = String(this.calcStretchRate());
      this.textElem.style.left = (String)((this.v[0].x + this.v[1].x) / 2 * displayRate) + 'px';
      this.textElem.style.top = (String)((this.v[0].y + this.v[1].y) / 2 * displayRate) + 'px';
      const len = this.calcLength();
      if (len < this.minLength || this.maxLength < len) {
        this.textElem.style.color = '#CC0000';
        this.textElem.style.fontWeight = 'bold';
      } else {
        this.textElem.style.color = '';
        this.textElem.style.fontWeight = '';
      }
    } else {
      this.textElem.innerText = '';
    }
  }

  calcLength(): number {
    const dx = this.v[0].x - this.v[1].x;
    const dy = this.v[0].y - this.v[1].y;
    return dx*dx + dy*dy;
  }

  calcStretchRate(): number {
    const len = this.calcLength();
    return Math.floor(len / this.baseLength * 100) / 100;
  }

  isValidLength(): boolean {
    const len = this.calcLength();
    return this.minLength <= len && len <= this.maxLength;
  }

  updateLineStyle(scene: Phaser.Scene): void {
    this.graphics.clear();
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

    this.graphics = scene.add.graphics({ lineStyle: { width: width, color: color, alpha: alpha } });
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

  private dragging = false;
  private draggingVertex;
  private processing = false;

  create(data): void {
    this.initDisplayRate(data.problemInfo);
    this.drawLattice();

    if (data.problemInfo === undefined) return;
    this.filename = data.filename;
    this.problemInfo = data.problemInfo;

    this.applyGeta();
    this.displayEpsilon();
    this.updateSaveButton();

    this.initHole();
    this.initVerticesAndEdges();
    this.drawFigure();
    this.drawHole();
    this.displayDislikes();

    const that = this;
    this.input.on('pointermove', function(pointer) {
      if (that.dragging) {
        if (!that.processing) {
          that.processing = true;
          const roundX = Math.round(pointer.x / displayRate);
          const roundY = Math.round(pointer.y / displayRate);
          const v = that.draggingVertex;
          v.x = roundX;
          v.y = roundY;
          that.drawHole();
          v.resetCircle();
          that.drawFigure();
          that.displayDislikes();
          that.manageSaveButton();
          that.processing = false;
        }
      } else {
        for (const e of that.edges) {
          e.drawRateFlag = false;
        }
        for (const v of that.vertices) {
          if (v.circle.contains(pointer.x, pointer.y)) {
            v.activateCircle();
          } else {
            v.deactivateCircle();
          }
        }
        that.drawFigure();
      }
    });

    this.input.on('pointerdown', function(pointer) {
      if (that.dragging) return;
      for (const v of that.vertices) {
        if (v.circle.contains(pointer.x, pointer.y)) {
          that.dragging = true;
          that.draggingVertex = v;
          break;
        }
      }
    });

    this.input.on('pointerup', function(pointer) {
      that.dragging = false;
    })
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
                                    this));
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

  drawLattice(): void {
    const latticeGraphics = this.add.graphics({ lineStyle: { width: 1, color: 0xDDDDDD } });
    for (let i = 0; i <= canvasSize; i += displayRate) {
      const line1 = new Phaser.Geom.Line(0, i, canvasSize, i);
      const line2 = new Phaser.Geom.Line(i, 0, i, canvasSize);
      latticeGraphics.strokeLineShape(line1);
      latticeGraphics.strokeLineShape(line2);
    }
  }

  initDisplayRate(problemInfo): void {
    if (problemInfo === undefined) return;

    let maxValue = 0;
    for (const v of problemInfo.hole) {
      maxValue = Math.max(maxValue, v[0]);
      maxValue = Math.max(maxValue, v[1]);
    }
    for (const v of problemInfo.figure.vertices) {
      maxValue = Math.max(maxValue, v[0]);
      maxValue = Math.max(maxValue, v[1]);
    }
    displayRate = canvasSize / (maxValue + 5);
  }

  initHole(): void {
    const hole = this.problemInfo.hole;

    this.holeVertices = [];
    for (let i = 0; i < hole.length; i++) {
      this.holeVertices.push(new Vertex(hole[i][0], hole[i][1], this));
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
      edge.updateLineStyle(this);
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
    for (const holeEdge of this.holeEdges) {
      for (const figureEdge of this.edges) {
        if (this.isIntersect(holeEdge, figureEdge)) {
          return false;
        }
      }
    }
    for (const edge of this.edges) {
      if (!edge.isValidLength()) {
        return false;
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
    const answer = { vertices: [] };
    for (const v of this.vertices) {
      // @ts-ignore
      answer.vertices.push([v.x - geta, v.y - geta]);
    }

    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(answer)], { type: 'text/json' }));
    a.download = this.filename.substr(0, this.filename.indexOf('.')) + '_output.json';

    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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

  displayEpsilon(): void {
    const epsilonText = document.getElementById('epsilon-text');
    // @ts-ignore
    epsilonText.innerHTML = this.problemInfo.epsilon;
  }
}
