import {canvasSize} from "../main";
import { baneOptimize } from "./kaku";

const geta = 2;
let displayRate = 5;
let maxValue = 0;
let globalist = false;
let wallhack = false;
let superflex = false;
let physicsMode = false;
let putIntoHole = false;

export class Vertex {
  public x;
  public y;
  public vx = 0;
  public vy = 0;
  public prevX;
  public prevY;
  public edges;
  public circle;
  public graphics;
  public id;
  public textElem;
  public selected;
  public inHole;

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
    if (this.inHole) {
      this.graphics.defaultFillColor = 0x00ff00;
    } else {
      this.graphics.defaultFillColor = 0xff0000;
    }
    this.graphics.clear();
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

  select(forceDrawRate: boolean): void {
    this.selected = true;
    this.prevX = this.x;
    this.prevY = this.y;
    this.graphics.setAlpha(1);
    if (forceDrawRate) {
      for (const e of this.edges) {
        e.drawRateFlag = true;
      }
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
    if (this.bonus === 'GLOBALIST') {
      this.graphics = scene.add.graphics({
        lineStyle: { width: 3, color: 0x999900 },
        fillStyle: { color: 0xFFFF00, alpha: 0.7 }
      });
    } else if (this.bonus === 'BREAK_A_LEG') {
      this.graphics = scene.add.graphics({
        lineStyle: { width: 3, color: 0x996600 },
        fillStyle: { color: 0xFFA500, alpha: 0.7 }
      });
    } else if (this.bonus === 'WALLHACK') {
      this.graphics = scene.add.graphics({
        lineStyle: { width: 3, color: 0x000099 },
        fillStyle: { color: 0x0000FF, alpha: 0.7 }
      });
    } else if (this.bonus === 'SUPERFLEX') {
      this.graphics = scene.add.graphics({
        lineStyle: { width: 3, color: 0x009999},
        fillStyle: { color: 0x00FFFF, alpha: 0.7 }
      });
    }
  }

  draw(): void {
    this.graphics.clear();
    const circle = new Phaser.Geom.Circle(this.x * displayRate, this.y * displayRate, 30);
    this.graphics.fillCircleShape(circle);
    if (this.unlocked) {
      this.graphics.strokeCircleShape(circle);
    }
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

class HolePolygon {
  public polygon;

  constructor(vertices: Array<Vertex>) {
    let pts: Array<number> = [];
    for (const v of vertices) {
      pts.push(v.x)
      pts.push(v.y)
    }
    this.polygon = new Phaser.Geom.Polygon(pts);
  }

  contains(v: Vertex): boolean {
    const eps = 0.0000001;
    return Phaser.Geom.Polygon.Contains(this.polygon, v.x, v.y - eps)
      || Phaser.Geom.Polygon.Contains(this.polygon, v.x, v.y + eps)
      || Phaser.Geom.Polygon.Contains(this.polygon, v.x - eps, v.y - eps)
      || Phaser.Geom.Polygon.Contains(this.polygon, v.x - eps, v.y)
      || Phaser.Geom.Polygon.Contains(this.polygon, v.x - eps, v.y + eps)
      || Phaser.Geom.Polygon.Contains(this.polygon, v.x + eps, v.y - eps)
      || Phaser.Geom.Polygon.Contains(this.polygon, v.x + eps, v.y)
      || Phaser.Geom.Polygon.Contains(this.polygon, v.x + eps, v.y + eps);
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
  private holePolygon;
  private bonusVertices;

  private history;

  private dragging = false;
  private selectedVertices: Array<Vertex> = [];
  private selecting = false;
  private areaSelected = false;
  private processing = false;
  private physicsProcessing = false;

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
    this.updateWallhackCheckbox();
    this.updateSuperflexCheckbox();
    this.updateDisplayIdCheckbox();
    this.updatePhysicsModeCheckbox();
    this.updatePutIntoHoleCheckbox();
    this.updateVerticalFlipButton();
    this.updateHorizontalFlipButton();
    this.updateRotateButton();
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
    this.manageWallhack();
    this.manageSuperflex();
    this.managePutIntoHole();
    this.manageDisplayId();

    this.selectRectangleGraphic = this.add.graphics({
      lineStyle: { width: 4, color: 0x666666 },
      fillStyle: { color: 0xAAAAAA, alpha: 0.5 }
    });

    const that = this;
    this.input.on('pointermove', function(pointer) {
      const roundX = physicsMode ? pointer.x / displayRate : Math.round(pointer.x / displayRate);
      const roundY = physicsMode ? pointer.y / displayRate : Math.round(pointer.y / displayRate);
      that.displayPosition(roundX, roundY);

      if (that.dragging) {
        if (!that.processing) {
          that.processing = true;
          const dx = roundX - that.dragBasePoint[0];
          const dy = roundY - that.dragBasePoint[1];
          for (const v of that.selectedVertices) {
            that.moveTo(v, v.prevX + dx, v.prevY + dy, pointer.event.altKey);
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
          const included = that.selectedVertices.includes(v);
          const contained = rect.contains(v.x * displayRate, v.y * displayRate);
          if ((included || contained) && (!(pointer.event.ctrlKey || pointer.event.metaKey) || !(included && contained))) {
            v.select(true);
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
              v.select(true);
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
            that.selectedVertices.push(v);
            break;
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
        if (!(pointer.event.shiftKey || pointer.event.ctrlKey || pointer.event.metaKey)) {
          that.areaSelected = false;
          that.selectedVertices = [];
          for (const v of that.vertices) v.unselect();
        }

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
          v.select(true);
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
            that.selectedVertices.push(v);
          }
        }
        that.manageFlipButtons();
      }
    });
  }

  update() {
    if (physicsMode && !this.physicsProcessing) {
      this.physicsProcessing = true;
      this.attenuateVelocity();
      this.applyTension();
      this.applyRepulsion();
      this.moveByVelocity();
      if (putIntoHole) {
        this.putVerticesIntoHole();
      }
      this.drawFigure();
      this.drawHole();
      this.displayDislikes();
      this.physicsProcessing = false;
    }
  }

  putVerticesIntoHole(): void {
    for (const v of this.vertices) {
      if (v.inHole) continue;

      const pt = new Phaser.Geom.Point(v.x * displayRate, v.y * displayRate);
      let nearestDist = 10000000;
      let nearestPoint: Phaser.Geom.Point | null = null;
      for (const e of this.holeEdges) {
        const nearPt = Phaser.Geom.Line.GetNearestPoint(e.line, pt);
        const dist = Phaser.Math.Distance.BetweenPoints(pt, nearPt);
        if (Phaser.Geom.Intersects.PointToLine(nearPt, e.line) && dist < nearestDist) {
          nearestDist = dist;
          nearestPoint = nearPt;
        }
        const dist1 = Phaser.Math.Distance.BetweenPoints(pt, e.line.getPointA());
        if (dist1 < nearestDist) {
          nearestDist = dist1;
          nearestPoint = e.line.getPointA();
        }
        const dist2 = Phaser.Math.Distance.BetweenPoints(pt, e.line.getPointB());
        if (dist2 < nearestDist) {
          nearestDist = dist2;
          nearestPoint = e.line.getPointB();
        }
      }
      if (nearestPoint) {
        this.moveTo(v, nearestPoint.x / displayRate, nearestPoint.y / displayRate);
      }
    }
  }

  attenuateVelocity(): void {
    const velocityAttenuateRate = 1 - this.getVelocityAttenuateRate();
    for (const v of this.vertices) {
      v.vx *= velocityAttenuateRate;
      v.vy *= velocityAttenuateRate;
    }
  }

  getVelocityAttenuateRate(): number {
    // @ts-ignore
    return document.getElementById('attenute-rate-text').value;
  }

  getSpringRate(): number {
    // @ts-ignore
    return document.getElementById('spring-rate-text').value;
  }

  getRepulsionRate(): number {
    // @ts-ignore
    return document.getElementById('repulsion-rate-text').value;
  }

  applyTension(): void {
    for (const e of this.edges) {
      const vec = new Phaser.Math.Vector2(e.v[0].x - e.v[1].x, e.v[0].y - e.v[1].y).normalize();
      const len = e.calcLength();
      const springRate = this.getSpringRate();
      if (len < e.baseLength) {
        const overRate = 1 - len / e.baseLength;
        e.v[0].vx += overRate * vec.x * springRate;
        e.v[0].vy += overRate * vec.y * springRate;
        e.v[1].vx -= overRate * vec.x * springRate;
        e.v[1].vy -= overRate * vec.y * springRate;
      } else {
        const overRate = len / e.baseLength - 1;
        e.v[0].vx -= overRate * vec.x * springRate;
        e.v[0].vy -= overRate * vec.y * springRate;
        e.v[1].vx += overRate * vec.x * springRate;
        e.v[1].vy += overRate * vec.y * springRate;
      }
    }
  }

  applyRepulsion(): void {
    const repulsionRate = this.getRepulsionRate() * 10;
    for (let i = 0; i < this.vertices.length; i++) {
      const v1 = this.vertices[i];
      for (let j = i+1; j < this.vertices.length; j++) {
        const v2 = this.vertices[j];
        let vec = new Phaser.Math.Vector2(v1.x - v2.x, v1.y - v2.y);
        const dist = vec.length();
        vec = vec.normalize();
        if (dist > 0) {
          v1.vx += vec.x / dist / dist * repulsionRate;
          v1.vy += vec.y / dist / dist * repulsionRate;
          v2.vx -= vec.x / dist / dist * repulsionRate;
          v2.vy -= vec.y / dist / dist * repulsionRate;
        }
      }
    }
  }

  moveByVelocity(): void {
    const velocityLimit = 30;
    for (const v of this.vertices) {
      if (v.selected) continue;
      v.vx = Math.min(velocityLimit, Math.max(-velocityLimit, v.vx));
      v.vy = Math.min(velocityLimit, Math.max(-velocityLimit, v.vy));
      this.moveTo(v, v.x + v.vx, v.y + v.vy);
    }
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
      const v = new Vertex(origVertices[i][0],
                           origVertices[i][1],
                           this, i);
      v.inHole = this.holePolygon.contains(v);
      this.vertices.push(v);
      v.resetCircle();
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
      this.bonusVertices.push(new BonusVertex(bonus.position[0] + geta, bonus.position[1] + geta, bonus.bonus, bonus.problem, this));
    }
  }

  moveTo(v: Vertex, x: number, y: number, snapToHole: boolean = false) {
    v.x = Math.max(Math.min(x, maxValue + 2 * geta), 0);
    v.y = Math.max(Math.min(y, maxValue + 2 * geta), 0);
    if (snapToHole) {
      let minimum = 100 / displayRate;
      let best: Vertex | null = null;
      for (const holeVertex of this.holeVertices) {
        const dist = this.calcDistance(holeVertex, v);
        if (dist < minimum) {
          best = holeVertex;
        }
      }
      if (best != null) {
        v.x = best.x;
        v.y = best.y;
      }
    }
    v.inHole = this.holePolygon.contains(v);
    v.resetCircle();
    this.manageSaveButton();
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

    this.holePolygon = new HolePolygon(this.holeVertices);
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
      if (intersect && !physicsMode) {
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
      let invalidCount = 0;
      for (const edge of this.edges) {
        if (!edge.isValidLength()) {
          invalidCount++;
        }
        if (!superflex && invalidCount === 1
            || invalidCount === 2) return false;
      }
    }
    let outOfHoleCount = 0;
    for (const v of this.vertices) {
      if (!v.inHole) outOfHoleCount++;
      if (!wallhack && outOfHoleCount === 1
          || outOfHoleCount === 2) return false;
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

  calcDistanceArray(v1: Array<number>, v2: Array<number>): number {
    const dx = v1[0] - v2[0];
    const dy = v1[1] - v2[1];
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
    if (wallhack) {
      // @ts-ignore
      answer.bonuses.push({ bonus: "WALLHACK", problem: (<HTMLInputElement>document.getElementById('wallhack-problem')).valueAsNumber });
    }
    if (superflex) {
      // @ts-ignore
      answer.bonuses.push({ bonus: "SUPERFLEX", problem: (<HTMLInputElement>document.getElementById('superflex-problem')).valueAsNumber });
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
    this.pushHistory();
    let minY = 10000;
    let maxY = -10000;
    for (const v of this.selectedVertices) {
      minY = Math.min(minY, v.y);
      maxY = Math.max(maxY, v.y);
    }
    for (const v of this.selectedVertices) {
      this.moveTo(v, v.x, maxY - (v.y - minY));
      v.select(false);
    }
    this.drawFigure();
    this.drawBonusVertices();
  }

  horizontalFlip(): void {
    if (this.selectedVertices.length <= 1) return;
    this.pushHistory();
    let minX = 10000;
    let maxX = -10000;
    for (const v of this.selectedVertices) {
      minX = Math.min(minX, v.x);
      maxX = Math.max(maxX, v.x);
    }
    for (const v of this.selectedVertices) {
      this.moveTo(v, maxX - (v.x - minX), v.y);
      v.select(false);
    }
    this.drawFigure();
    this.drawBonusVertices();
  }

  rotate(): void {
    if (this.selectedVertices.length <= 1) return;
    let minX = 10000;
    let maxX = -10000;
    let minY = 10000;
    let maxY = -10000;
    for (const v of this.selectedVertices) {
      minX = Math.min(minX, v.x);
      maxX = Math.max(maxX, v.x);
      minY = Math.min(minY, v.y);
      maxY = Math.max(maxY, v.y);
    }
    const rot = <HTMLInputElement>document.getElementById('rotate-value');
    if (!rot) return;
    this.pushHistory();
    const rad = parseInt(rot.value) / 180 * Math.PI;
    const centerX = (maxX + minX) / 2;
    const centerY = (maxY + minY) / 2;
    for (const v of this.selectedVertices) {
      const dx = v.x - centerX;
      const dy = v.y - centerY;
      this.moveTo(v,
                  Math.round(centerX + dx*Math.cos(rad) - dy*Math.sin(rad)),
                  Math.round(centerY + dx*Math.sin(rad) + dy*Math.cos(rad)));
      v.select(false);
    }
    this.drawFigure();
    this.drawBonusVertices();
  }

  undo(): void {
    const arr = this.history.pop();
    if (!arr) return;
    for (let i = 0; i < this.vertices.length; i++) {
      this.moveTo(this.vertices[i], arr[i][0], arr[i][1]);
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
            that.moveTo(that.vertices[i], vertices[i][0] + geta, vertices[i][1] + geta);
            that.vertices[i].resetCircle();
          }
          // @ts-ignore
          that.drawFigure();
          that.displayDislikes();
          that.manageSaveButton();
        }
      }
    }
    reader.readAsText(file);
  }

  manageFlipButtons(): void {
    const buttons = [
      <HTMLInputElement>document.getElementById('vertical-flip-button'),
      <HTMLInputElement>document.getElementById('horizontal-flip-button'),
      <HTMLInputElement>document.getElementById('rotate-button')
    ];
    for (const button of buttons) button.disabled = !this.areaSelected;
  }

  manageSaveButton(): void {
    const saveButton = document.getElementById('save-button');
    if (!physicsMode && this.isValidAnswer()) {
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

  manageWallhack(): void {
    const checkbox = <HTMLInputElement>document.getElementById('wallhack-checkbox');
    wallhack = checkbox.checked;
    this.manageSaveButton();
  }

  manageSuperflex(): void {
    const checkbox = <HTMLInputElement>document.getElementById('superflex-checkbox');
    superflex = checkbox.checked;
    this.manageSaveButton();
  }

  managePhysicsMode(): void {
    const checkbox = <HTMLInputElement>document.getElementById('physics-mode-checkbox');
    physicsMode = checkbox.checked;
    if (!physicsMode) {
      for (const v of this.vertices) {
        this.moveTo(v, Math.round(v.x), Math.round(v.y));
      }
      this.drawFigure();
      this.drawHole();
      this.displayDislikes();
    }
    this.manageSaveButton();
  }

  managePutIntoHole(): void {
    const checkbox = <HTMLInputElement>document.getElementById('put-into-hole-checkbox');
    putIntoHole = checkbox.checked;
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
    newVerticalFlipButton.disabled = true;
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
    newHorizontalFlipButton.disabled = true;
    newHorizontalFlipButton.value = '横反転';
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

  updateRotateButton(): void {
    const rotateButtonWrapper = document.getElementById('rotate-button-wrapper');
    const rotateButton = document.getElementById('rotate-button');

    // @ts-ignore
    rotateButtonWrapper.removeChild(rotateButton);

    const newRotateButton = document.createElement('input');
    newRotateButton.id = 'rotate-button';
    newRotateButton.type = 'button';
    newRotateButton.disabled = true;
    newRotateButton.value = '回転';
    // @ts-ignore
    rotateButtonWrapper.appendChild(newRotateButton);

    // @ts-ignore
    rotateButtonWrapper.appendChild(newRotateButton);

    // @ts-ignore
    newRotateButton.addEventListener('click', this.rotate.bind(this));
  }

  updateGlobalistCheckbox(): void {
    const globalistCheckbox = <HTMLInputElement>document.getElementById('globalist-checkbox');

    globalistCheckbox.addEventListener('change', this.manageGlobalist.bind(this));
  }

  updateWallhackCheckbox(): void {
    const wallhackCheckbox = <HTMLInputElement>document.getElementById('wallhack-checkbox');

    wallhackCheckbox.addEventListener('change', this.manageWallhack.bind(this));
  }

  updateSuperflexCheckbox(): void {
    const superflexCheckbox = <HTMLInputElement>document.getElementById('superflex-checkbox');

    superflexCheckbox.addEventListener('change', this.manageSuperflex.bind(this));
  }

  updatePhysicsModeCheckbox(): void {
    const physicsModeCheckbox = <HTMLInputElement>document.getElementById('physics-mode-checkbox');

    physicsModeCheckbox.addEventListener('change', this.managePhysicsMode.bind(this));
  }

  updatePutIntoHoleCheckbox(): void {
    const putIntoHoleCheckbox = <HTMLInputElement>document.getElementById('put-into-hole-checkbox');

    putIntoHoleCheckbox.addEventListener('change', this.managePutIntoHole.bind(this));
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
    xText.innerHTML = String(Math.floor((x - geta) * 1000) / 1000);
    // @ts-ignore
    yText.innerHTML = String(Math.floor((y - geta) * 1000) / 1000);
  }

  cleanAbsoluteTextWrapper(): void {
    const wrapper = <HTMLElement>document.getElementById('absolute-text-wrapper');
    while (wrapper.hasChildNodes()) {
      // @ts-ignore
      wrapper.removeChild(wrapper.childNodes[0]);
    }
  }
}
