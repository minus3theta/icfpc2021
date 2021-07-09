import {canvasSize} from "../main";

const displayRate = 5;

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

    this.resetCircle();
  }

  resetCircle(): void {
    this.graphics.clear();
    this.circle = new Phaser.Geom.Circle(this.x * displayRate, this.y * displayRate, 10);
    this.graphics.fillCircleShape(this.circle);
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

  constructor(v1: Vertex, v2: Vertex, epsilon: number, scene: Phaser.Scene) {
    super(v1, v2);
    this.baseLength = this.calcLength();
    this.graphics = scene.add.graphics({ lineStyle: { width: 4, color: 0xff0000 } })
    this.maxLength = this.baseLength * (1 + epsilon / 1000000);
    this.minLength = this.baseLength * (1 - epsilon / 1000000);
  }

  calcLength(): number {
    const dx = this.v[0].x - this.v[1].x;
    const dy = this.v[0].y - this.v[1].y;
    return dx*dx + dy*dy;
  }

  updateLineStyle(scene: Phaser.Scene): void {
    this.graphics.clear();

    if (this.maxLength === this.minLength) {

      return;
    }

    let width = 4;
    let color;
    let alpha = 1;
    const len = this.calcLength();
    if (len < this.minLength) {
      width = 8;
      color = 0x0000FF;
      alpha = 0.6;
    } else if (len < this.baseLength) {
      color = 0x0000FF;
      const rate = (len - this.minLength) / (this.baseLength - this.minLength);
      color += Math.floor(0xFF * rate) * 0x10000;
    } else if (len <= this.maxLength) {
      color = 0xFF0000;
      const rate = (len - this.baseLength) / (this.maxLength - this.baseLength);
      color += 0xFF - Math.floor(0xFF * rate);
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

  private problemInfo = {"hole":[[80,125],[70,155],[5,155],[5,80],[45,70],[5,60],[5,5],[75,5],[85,35],[95,5],[155,5],[155,60],[120,75],[155,80],[155,155],[90,155]],"epsilon":375000,"figure":{"edges":[[19,28],[28,26],[26,17],[17,16],[16,19],[19,21],[64,57],[57,52],[52,53],[53,67],[67,70],[70,57],[21,64],[64,77],[77,76],[76,63],[63,44],[44,40],[40,25],[25,13],[13,14],[14,15],[15,21],[15,12],[12,11],[11,14],[12,7],[7,5],[5,10],[10,8],[8,3],[3,1],[1,11],[8,11],[10,12],[13,6],[6,9],[9,2],[2,0],[0,4],[4,6],[25,24],[24,29],[29,23],[23,18],[18,24],[40,39],[39,43],[43,44],[43,46],[46,35],[35,34],[34,39],[63,65],[65,73],[73,71],[71,58],[58,65],[77,81],[81,89],[89,91],[91,93],[93,92],[92,89],[84,85],[85,88],[88,87],[87,84],[84,81],[81,78],[78,82],[82,81],[76,83],[83,90],[90,95],[95,94],[94,86],[86,80],[80,75],[75,79],[79,83],[83,86],[22,72],[72,74],[74,20],[20,22],[30,36],[36,37],[37,31],[31,30],[36,41],[41,42],[42,37],[41,49],[49,50],[50,42],[49,54],[54,55],[55,50],[54,61],[61,62],[62,55],[61,68],[68,69],[69,62],[31,20],[69,74],[38,33],[33,27],[27,32],[32,38],[38,45],[45,47],[47,51],[51,48],[48,45],[51,56],[56,60],[60,66],[66,59],[59,56],[66,72],[27,22],[48,49],[74,77],[20,14],[22,25],[72,63]],"vertices":[[1,93],[6,118],[8,103],[8,123],[9,80],[9,128],[13,86],[13,131],[17,119],[19,94],[20,121],[22,115],[25,118],[33,69],[37,98],[42,102],[46,145],[48,152],[54,12],[54,143],[56,92],[58,109],[60,55],[61,7],[61,18],[61,32],[64,152],[65,64],[67,143],[68,13],[69,74],[69,82],[71,71],[72,57],[74,24],[75,21],[75,74],[75,82],[77,65],[78,24],[78,33],[81,74],[81,82],[82,24],[82,34],[82,66],[85,23],[85,63],[85,70],[87,74],[87,82],[88,66],[89,147],[91,152],[93,74],[93,81],[94,65],[95,146],[98,14],[98,70],[99,59],[99,74],[99,80],[101,41],[102,108],[103,22],[103,65],[104,152],[105,74],[105,79],[105,144],[106,12],[111,58],[112,20],[114,87],[125,25],[125,70],[125,85],[129,105],[130,43],[133,26],[133,91],[133,105],[138,47],[138,98],[138,104],[140,43],[144,98],[144,104],[145,89],[148,48],[148,85],[149,92],[152,89],[154,33],[159,36]]}}

  private vertices;
  private edges;
  private holeVertices;
  private holeEdges;

  private dragging = false;
  private draggingVertex;
  private processing = false;

  create(): void {
    this.drawLattice();
    this.drawHole();
    this.initVerticesAndEdges();
    this.drawFigure();
    this.checkHoleIntersect();

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
          that.checkHoleIntersect();
          v.resetCircle();
          that.drawFigure();
          that.processing = false;
        }
      } else {
        for (const v of that.vertices) {
          if (v.circle.contains(pointer.x, pointer.y)) {
            v.graphics.setAlpha(1);
          } else {
            v.graphics.setAlpha(0);
          }
        }
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

  update(): void {
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
      this.edges.push(new FigureEdge(this.vertices[origEdges[i][0]],
                                     this.vertices[origEdges[i][1]],
                                     this.problemInfo.epsilon,
                                     this));
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

  drawHole(): void {
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

  checkHoleIntersect(): void {
    for (const holeEdge of this.holeEdges) {
      let intersect = false;
      for (const figureEdge of this.edges) {
        if (this.isIntersect(holeEdge, figureEdge)) {
          intersect = true;
          break;
        }
      }
      if (intersect) {
        holeEdge.graphics = this.add.graphics({ lineStyle: { width: 2, color: 0x999999 } })
      } else {
        holeEdge.graphics = this.add.graphics({ lineStyle: { width: 2, color: 0x000000 } })
      }
      holeEdge.draw();
    }
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
}
