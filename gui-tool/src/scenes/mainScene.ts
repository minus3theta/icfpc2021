const displayRate = 5;

class Vertice {
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
  public baseLength;
  public minLength;
  public maxLength;
  public graphics;

  constructor(v1: Vertice, v2: Vertice, epsilon: number, scene: Phaser.Scene) {
    this.v = [v1, v2];
    this.baseLength = this.calcLength();
    this.graphics = scene.add.graphics({ lineStyle: { width: 4, color: 0xff0000 } })

    // TODO: calc minLength, maxLength
  }

  calcLength(): number {
    const dx = this.v[0].x - this.v[1].x;
    const dy = this.v[0].y - this.v[1].y;
    return dx*dx + dy*dy;
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

export class MainScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'mainScene'
    });
  }

  private problemInfo = {
    "hole":[
      [45,80],[35,95],[5,95],[35,50],[5,5],[35,5],[95,95],[65,95],[55,80]
    ],
    "epsilon":150000,
    "figure":{
      "edges":[[2,5],[5,4],[4,1],[1,0],[0,8],[8,3],[3,7],[7,11],[11,13],[13,12],[12,18],[18,19],[19,14],[14,15],[15,17],[17,16],[16,10],[10,6],[6,2],[8,12],[7,9],[9,3],[8,9],[9,12],[13,9],[9,11],[4,8],[12,14],[5,10],[10,15]],
      "vertices":[[20,30],[20,40],[30,95],[40,15],[40,35],[40,65],[40,95],[45,5],[45,25],[50,15],[50,70],[55,5],[55,25],[60,15],[60,35],[60,65],[60,95],[70,95],[80,30],[80,40]]
    }
  }

  private vertices;
  private edges;
  private holeEdges;

  private dragging = false;
  private draggingVertice;

  create(): void {
    this.drawLattice();
    this.drawHole();
    this.initVerticesAndEdges();
    this.drawFigure();

    const that = this;
    this.input.on('pointermove', function(pointer) {
      if (that.dragging) {
        const roundX = Math.round(pointer.x / displayRate);
        const roundY = Math.round(pointer.y / displayRate);
        const v = that.draggingVertice;
        v.x = roundX;
        v.y = roundY;
        v.resetCircle();
        that.drawFigure();
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
          that.draggingVertice = v;
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
      this.vertices.push(new Vertice(origVertices[i][0],
                                     origVertices[i][1],
                                     this));
    }

    this.edges = [];
    for (let i = 0; i < origEdges.length; i++) {
      this.edges.push(new Edge(this.vertices[origEdges[i][0]],
        this.vertices[origEdges[i][1]],
        this.problemInfo.epsilon,
        this));
    }
  }

  drawLattice(): void {
    const latticeGraphics = this.add.graphics({ lineStyle: { width: 1, color: 0xDDDDDD } });
    for (let i = 0; i <= 500; i += displayRate) {
      const line1 = new Phaser.Geom.Line(0, i, 500, i);
      const line2 = new Phaser.Geom.Line(i, 0, i, 500);
      latticeGraphics.strokeLineShape(line1);
      latticeGraphics.strokeLineShape(line2);
    }
  }

  drawHole(): void {
    const holeGraphics = this.add.graphics({ lineStyle: { width: 2, color: 0x000000 }});
    const holes = this.problemInfo.hole;
    for (let i = 0; i < holes.length; i++) {
      const p1 = holes[i];
      const p2 = holes[(i+1) % holes.length];
      const line = new Phaser.Geom.Line(p1[0] * displayRate,
        p1[1] * displayRate,
        p2[0] * displayRate,
        p2[1] * displayRate);
      holeGraphics.strokeLineShape(line);
    }
  }

  drawFigure(): void {
    for (const edge of this.edges) edge.draw();
  }
}
