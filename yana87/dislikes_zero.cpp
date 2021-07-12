// -------- START : snippet -------- //

#include <bits/stdc++.h>
using namespace std;

struct IoSetup {
    IoSetup() {
        cin.tie(nullptr);
        ios::sync_with_stdio(false);
        cout << fixed << setprecision(10);
        cerr << fixed << setprecision(10);
    }
} iosetup;

// -------- START : macro -------- //

#define ll long long
#define rep(i,n) for(long long i = 0; i < (long long)(n); ++i)
#define rep1(i,n) for(long long i = 1; i <= (long long)(n); ++i)
#define len(c) (ll)c.size()
#define all(v) (v).begin(),(v).end()
#define lb(v,x) (lower_bound(all(v),x)-v.begin())
#define ub(v,x) (upper_bound(all(v),x)-v.begin())
#define has(c,x) (c.find(x) != c.end())
#define uniq(v) v.erase(unique(all(v)),v.end())
#define bit(k) (1LL<<(k))

template<typename T1, typename T2> inline bool chmax(T1 &a, T2 b) { return a < b && (a = b, true); }
template<typename T1, typename T2> inline bool chmin(T1 &a, T2 b) { return a > b && (a = b, true); }

// -------- END : macro -------- //

// -------- START : debug macro -------- //

template<class T,class U> ostream& operator<<(ostream& ost, const pair<T,U> &p) { ost << "(" << p.first << ", " << p.second << ")"; return ost; }
#define ostream_container { ost << "{"; for(const auto &t : v) { if (&t != &*v.begin()) ost << ", "; ost << t; } ost << "}"; return ost; }
template<class T> ostream& operator<<(ostream &ost, const vector<T> &v) ostream_container
template<class T> ostream& operator<<(ostream &ost, const set<T> &v) ostream_container
template<class T,class U> ostream& operator<<(ostream &ost, const map<T,U> &v) ostream_container

template<class H> void recursive_debug(string s, H h) {
    cerr << "\033[33m" << s << " = " << h << endl << "\033[m";
}
template<class H,class... T> void recursive_debug(string s, H h, T... t) {
    int comma = s.find(',');
    cerr << "\033[33m" << s.substr(0,comma) << " = " << h << ", ";
    recursive_debug(s.substr(comma+1), t...);
}
#define debug(...) recursive_debug(#__VA_ARGS__, __VA_ARGS__)

// -------- END : debug macro -------- //

/* 基本要素 */
typedef complex<double> Point;
typedef pair<Point, Point> Line;
typedef vector<Point> VP;
const double EPS = 1e-9; // 許容誤差^2
const double INF = 1e9;
const double PI = acos(-1.0);
#define X real()
#define Y imag()
#define LE(n,m) ((n) - (m) < EPS)
#define GE(n,m) (EPS > (m) - (n))
#define EQ(n,m) (abs((n)-(m)) < EPS)

// 内積　dot(a,b) = |a||b|cosθ
double dot(Point a, Point b) {
    return a.X*b.X + a.Y*b.Y;
}

// 外積　cross(a,b) = |a||b|sinθ
double cross(Point a, Point b) {
    return a.X*b.Y - a.Y*b.X;
}

// 点の進行方向
int ccw(Point a, Point b, Point c) {
    b -= a;  c -= a;
    if (cross(b,c) > +EPS) return +1;  // counter clockwise
    if (cross(b,c) < -EPS) return -1;  // clockwise
    if (dot(b,c)   < -EPS) return +2;  // c--a--b on line
    if (norm(b) < norm(c)) return -2;  // a--b--c on line or a==b
    return 0;                          // a--c--b on line or a==c or b==c
}

/* 
    交差判定　直線・線分は縮退してはならない。
    接する場合は交差するとみなす。
    縮退している := 2つのものが区別付かない状態(?)
    isec = intersect
    L = Line
    P = Point
    S = Segment
*/

// 直線と点
bool isecLP(Point a1, Point a2, Point b) {
    return abs(ccw(a1, a2, b)) != 1;
    // return EQ(cross(a2-a1, b-a1), 0); と等価
}

// 直線と直線
bool isecLL(Point a1, Point a2, Point b1, Point b2) {
    return !isecLP(a2-a1, b2-b1, 0) || isecLP(a1, b1, b2);
}

// 直線と線分
bool isecLS(Point a1, Point a2, Point b1, Point b2) {
    return cross(a2-a1, b1-a1) * 
           cross(a2-a1, b2-a1) < EPS;
}

// 線分と線分
bool isecSS(Point a1, Point a2, Point b1, Point b2) {
    return ccw(a1, a2, b1)*ccw(a1, a2, b2) <= 0 &&
           ccw(b1, b2, a1)*ccw(b1, b2, a2) <= 0;
}

// 線分と点
bool isecSP(Point a1, Point a2, Point b) {
    return !ccw(a1, a2, b);
}


/* 距離　各直線・線分は縮退してはならない */

// 点pの直線aへの射影点を返す
Point proj(Point a1, Point a2, Point p) {
    return a1 + dot(a2-a1, p-a1)/norm(a2-a1) * (a2-a1);
}

// 点pの直線aへの反射点を返す
Point reflection(Point a1, Point a2, Point p) {
    return 2.0*proj(a1, a2, p) - p;
}

//点aと点bの距離は abs(a-b)
//#define distPP(p1,p2) abs(p1-p2)

double distLP(Point a1, Point a2, Point p) {
    return abs(proj(a1, a2, p) - p);
}

double distLL(Point a1, Point a2, Point b1, Point b2) {
    return isecLL(a1, a2, b1, b2) ? 0 : distLP(a1, a2, b1);
}

double distLS(Point a1, Point a2, Point b1, Point b2) {
    return isecLS(a1, a2, b1, b2) ? 0 : min(distLP(a1, a2, b1), distLP(a1, a2, b2));
}

double distSP(Point a1, Point a2, Point p) {
    Point r = proj(a1, a2, p);
    if (isecSP(a1, a2, r)) return abs(r-p);
    //= !ccw(a1, a2, r)
    return min(abs(a1-p), abs(a2-p));
}

double distSS(Point a1, Point a2, Point b1, Point b2) {
    if (isecSS(a1, a2, b1, b2)) return 0;
    return min({
        distSP(a1, a2, b1),
        distSP(a1, a2, b2),
        distSP(b1, b2, a1),
        distSP(b1, b2, a2)});
}

// 2直線の交点
Point crosspointLL(Point a1, Point a2, Point b1, Point b2) {
    double d1 = cross(b2-b1, b1-a1);
    double d2 = cross(b2-b1, a2-a1);
    if (EQ(d1, 0) && EQ(d2, 0)) return a1;  // same line
    assert(!EQ(d2, 0)); // 交点がない
    return a1 + d1/d2 * (a2-a1);
}

/* 多角形 */

// 頂点の順序（sortやmax_elementに必要）
namespace std {
    bool operator<(const Point a, const Point b) {
        return a.X != b.X ? a.X < b.X : a.Y < b.Y;
    }
}

//多角形PSのi番目の辺
#define ps_edge(PS,i) PS[i],PS[(i+1)%PS.size()]

// 凸包
// 入力1個 -> 空
// 2個以上の全て同じ点 -> 同じもの2つ
VP convexHull(VP ps) {  // 元の点集合がソートされていいならVP&に
    int n = ps.size(), k = 0;
    sort(ps.begin(), ps.end());
    VP ch(2*n);
    for (int i = 0; i < n; ch[k++] = ps[i++]) // lower-hull
        while (k >= 2 && ccw(ch[k-2], ch[k-1], ps[i]) <= 0) --k;  // 余計な点も含むなら == -1 とする
    for (int i = n-2, t = k+1; i >= 0; ch[k++] = ps[i--]) // upper-hull
        while (k >= t && ccw(ch[k-2], ch[k-1], ps[i]) <= 0) --k;
    ch.resize(k-1);
    return ch;
}

// 凸判定。縮退を認めないならccwの判定部分を != 1 とする
// 反時計か分からなければreverse(ps)も試す（コピー渡し）
bool isCcwConvex(const VP& ps) {
    int n = ps.size();
    rep(i,n) if (ccw(ps[i], ps[(i+1) % n], ps[(i+2) % n]) == -1) return false;
    return true;
}

// 凸多角形の内部判定　O(n)
// 点が領域内部なら1、境界上なら2、外部なら0を返す
int inConvex(Point p, const VP& ps) {
    int n = ps.size();
    int dir = ccw(ps[0], ps[1], p);
    rep (i, n) {
        int ccwc = ccw(ps[i], ps[(i + 1) % n], p);
        if (!ccwc) return 2;  // 線分上に存在
        if (ccwc != dir) return 0;
    }
    return 1;
}

// 凸多角形の内部判定　O(logn)
// 点が領域内部なら1、境界上なら2、外部なら0を返す
int inCcwConvex(const VP& ps, Point p) {
    int n = ps.size();
    Point g = (ps[0] + ps[n / 3] + ps[n*2 / 3]) / 3.0;
    if (g == p) return 1;
    Point gp = p - g;

    int l = 0, r = n;
    while (l + 1 < r) {
        int mid = (l + r) / 2;
        Point gl = ps[l] - g;
        Point gm = ps[mid] - g;
        if (cross(gl, gm) > 0) {
            if (cross(gl, gp) >= 0 && cross(gm, gp) <= 0) r = mid;
            else l = mid;
        }
        else {
            if (cross(gl, gp) <= 0 && cross(gm, gp) >= 0) l = mid;
            else r = mid;
        }
    }
    r %= n;
    double cr = cross(ps[l] - p, ps[r] - p);
    return EQ(cr, 0) ? 2 : cr < 0 ? 0 : 1;
}

// 多角形の内部判定
// 点が領域内部なら1、境界上なら2、外部なら0を返す
int inPolygon(const VP& ps, Point p) {
    int n = ps.size();
    bool in = false;
    rep (i, n) {
        Point a = ps[i] - p;
        Point b = ps[(i + 1) % n] - p;
        if (EQ(cross(a,b), 0) && LE(dot(a,b), 0)) return 2;
        if (a.Y > b.Y) swap(a,b);
        if ((a.Y*b.Y < 0 || (a.Y*b.Y < EPS && b.Y > EPS)) && LE(cross(a, b), 0)) in = !in;
    }
    return in;
}


bool inPolygon(Point p,VP& ps){
    int n = ps.size();
    double sumAngle=0;
    rep(i,n){
        double t = arg(ps[(i+1)%n]-p)-arg(ps[i]-p);
        while(t > +PI) t -= 2*PI;
        while(t < -PI) t += 2*PI;
        sumAngle += t;
    }
    return (abs(sumAngle) > 0.1);
}


//ベクトル(a1->a2)で凸多角形psを切断したときの
//ベクトルの左側の凸多角形を返す
//参考 http://judge.u-aizu.ac.jp/onlinejudge/description.jsp?id=CGL_4_C

// 凸多角形クリッピング
VP convexCut(const VP& ps, Point a1, Point a2) {
    int n = ps.size();
    VP ret;
    rep(i,n) {
        int ccwc = ccw(a1, a2, ps[i]);
        if (ccwc != -1) ret.push_back(ps[i]);
        int ccwn = ccw(a1, a2, ps[(i + 1) % n]);
        if (ccwc * ccwn == -1) ret.push_back(crosspointLL(a1, a2, ps[i], ps[(i + 1) % n]));
    }
    return ret;
}

// 凸多角形の直径（最遠点対）
pair<int, int> convexDiameter(const VP& ps) {
    int n = ps.size();
    int i = min_element(ps.begin(), ps.end()) - ps.begin();
    int j = max_element(ps.begin(), ps.end()) - ps.begin();
    int maxI, maxJ;
    double maxD = 0;
    rep(_, 2*n) {
        if (maxD < norm(ps[i]-ps[j])) {
            maxD = norm(ps[i]-ps[j]);
            maxI = i;
            maxJ = j;
        }
        if (cross(ps[i]-ps[(i+1) % n], ps[(j+1) % n]-ps[j]) <= 0) j = (j+1) % n;
        else                                                      i = (i+1) % n;
    }
    return make_pair(maxI, maxJ);
}


// aからbへの回転角（中心(0,0)）[-pi,+pi]
double angle(Point a,Point b){
    double t = arg(b)-arg(a);
    while(t > +PI) t -= 2*PI;
    while(t < -PI) t += 2*PI;
    return t;
}

// 多角形の符号付面積
double area(const VP& ps) {
    double a = 0;
    rep (i, ps.size()) a += cross(ps[i], ps[(i+1) % ps.size()]);
    return a / 2;
}

double areaCC(Point a, double ar, Point b, double br) {
    double d = abs(a-b);
    if (ar + br - d <= EPS) {
        return 0.0;
    } else if (d - abs(ar-br)<= EPS) {
        double r = min(ar,br);
        return r * r * PI;
    } else {
        double rc = (d*d + ar*ar - br*br) / (2*d);
        double theta = acos(rc / ar);
        double phi = acos((d - rc) / br);
        return ar*ar*theta + br*br*phi - d*ar*sin(theta);
    }
}

/* -------------最近点対の距離------------ */
bool compX(const Point a, const Point b) {
    return (a.X!=b.X ? a.X<b.X : a.Y<b.Y);
}

bool compY(const Point a, const Point b) {
    return (a.Y!=b.Y ? a.Y<b.Y : a.X<b.X);
}

double closestPair(VP& a,int l,int r) {
    if(r-l<=1) return INF;
    int m = (l+r)/2;
    double x = a[m].X;
    double d = min(closestPair(a,l,m),closestPair(a,m,r));
    inplace_merge(a.begin()+l, a.begin()+m, a.begin()+r, compY);

    VP b;
    for(int i=l;i<r;i++){
        if(abs(a[i].X - x)>=d)continue;
        for(int j=b.size()-1;j>=0;j--){
            if((a[i]-b[j]).Y>=d)break;
            d = min(d,abs(a[i]-b[j]));
        }
        b.push_back(a[i]);
    }
    return d;
}

double closestPair(VP ps){
    sort(ps.begin(),ps.end(),compX);
    return closestPair(ps,0,ps.size());
}
/* ------------------------------------- */


// 多角形の幾何学的重心
Point centroid(const VP& ps) {
    int n = ps.size();
    double aSum = 0;
    Point c;
    rep (i, n) {
        double a = cross(ps[i], ps[(i+1) % n]);
        aSum += a;
        c += (ps[i] + ps[(i+1) % n]) * a;
    }
    return 1 / aSum / 3 * c;
}

// ボロノイ領域
VP voronoiCell(Point p, const VP& ps, const VP& outer) {
    VP cl = outer;
    rep (i, ps.size()) {
        if (EQ(norm(ps[i]-p), 0)) continue;
        Point h = (p+ps[i])*0.5;
        cl = convexCut(cl, h, h + (ps[i]-h)*Point(0,1) );
    }
    return cl;
}

/* 幾何グラフ */

struct Edge {
    int from, to;
    double cost;
    Edge(int from_, int to_, double cost_) : from(from_), to(to_), cost(cost_) {}
};
struct Graph {
    int n;
    vector<vector<Edge> > edges;
    Graph(int n_) : n(n_), edges(n_) {}
    void addEdge(Edge e) {
        edges[e.from].push_back(e);
        edges[e.to].push_back(Edge(e.to, e.from, e.cost));
    }
};

// -------- END : snippet -------- //
int H; // holeの数
int E; // edgesの数
int V; // verticesの数
int epsilon;
vector<Point> holes, vertices;
vector<vector<int>> graph;
vector<vector<bool>> is_connected;

void read_input() {
    cin >> H;
    rep(i,H) {
        double x, y;
        cin >> x >> y;
        holes.push_back(Point(x,y));
    }

    cin >> E;
    graph.resize(10000);
    rep(i,E) {
        int a, b;
        cin >> a >> b;
        graph[a].push_back(b);
        graph[b].push_back(a);
    }

    cin >> V;
    rep(i,V) {
        double x, y;
        cin >> x >> y;
        vertices.push_back(Point(x,y));
    }
    graph.resize(V);

    cin >> epsilon;

    is_connected.resize(V);
    rep(v,V){
        is_connected[v].resize(V);
        for (int nxt : graph[v]) {
            is_connected[v][nxt] = true;
        }
    }
}


vector<vector<double>> shortest_path;
void calc_shortest_path() {
    shortest_path.resize(V);
    rep(i,V){
        shortest_path[i] = vector<double>(V, INF);
        shortest_path[i][i] = 0;
    }
    rep(i,V){
        for (int to : graph[i]){
            shortest_path[i][to] = norm(vertices[i] - vertices[to]);
        }
    }
    rep(k,V)rep(i,V)rep(j,V){
        shortest_path[i][j] = min(shortest_path[i][j], shortest_path[i][k] + shortest_path[k][j]);
    }
}

bool valid_length(int v1, int v2, Point p1, Point p2) {
    double org_dist = norm(vertices[v1] - vertices[v2]);
    double new_dist = norm(p1 - p2);
    return abs(new_dist/org_dist - 1.0) <= epsilon/1e6 + EPS;
}


// holes[h] - holes[(h+1)%H]: {vertices[v1] - vertices[v2], ... }
vector<vector<pair<int,int>>> cand_edges; // cand_edges[h] = {{v1,v2}, ...}
map<int,bool> cand_edges_is_zero;
void check_edge_along_hole() {
    cand_edges.resize(H);
    rep(v,V) {
        for (int to : graph[v]) {
            rep(h,H) {
                if (valid_length(v,to, holes[h], holes[(h+1)%H])) {
                    cand_edges[h].push_back({v,to});
                }
            }
        }
    }
    rep(h,H) {
        debug(h, cand_edges[h].size());
        debug(cand_edges[h]);
        if (cand_edges[h].size() == 0) {
            cand_edges_is_zero[h] = true;
        }
    }
}



int rem_not_along_edge;

vector<vector<int>> cand_h2v;
vector<bool> used_vertices;
// h_depth: 0 .. H で h2v を埋めていく。
void dfs2(int h_depth, vector<int> &h2v, int pre_v) {
    // debug(h2v);
    if (h_depth == H) {
        cand_h2v.push_back(h2v);
        debug(cand_h2v.size(), h2v);
        return;
    }

    // holesの辺に沿えない
    if (cand_edges_is_zero[(h_depth+H-1)%H]) {
        // 使っていないv
        rep(v,V) if (!used_vertices[v]) {
            // 最短経路の長さよりもユークリッド距離が長いのはおかしい
            // すでに決定している点との関係だけ見る
            bool ng = false;
            rep(pre_h,h_depth) {
                double s_path = shortest_path[h2v[pre_h]][v];
                double dist = norm(holes[pre_h] - holes[h_depth]); 
                if (pow(s_path, 2) * (1.0 + epsilon/1e6) + EPS < dist) {
                    ng = true;
                    break;
                }
            }
            if (ng) continue;

            h2v[h_depth] = v;
            used_vertices[v] = true;
            dfs2(h_depth+1, h2v, v);
            h2v[h_depth] = -1;
            used_vertices[v] = false;
        }
    } else {
        for (pair<int,int> pr : cand_edges[(h_depth+H-1)%H]) {
            if (pre_v != -1 && pr.first != pre_v) {
                continue;
            }
            int v = pr.second;

            // 最短経路の長さよりもユークリッド距離が長いのはおかしい
            // すでに決定している点との関係だけ見る
            bool ng = false;
            // rep(pre_h,h_depth) {
            //     double s_path = shortest_path[h2v[pre_h]][v];
            //     double dist = norm(holes[pre_h] - holes[h_depth]); 
            //     if (s_path*(1.0 + epsilon/1e6) + EPS < dist) {
            //         ng = true;
            //         break;
            //     }
            // }
            // if (ng) continue;

            h2v[h_depth] = v;
            used_vertices[v] = true;
            dfs2(h_depth+1, h2v, v);
            h2v[h_depth] = -1;
            used_vertices[v] = false;
        }
    }
}


int main(void) {
    read_input();
    calc_shortest_path();
    used_vertices.resize(V);
    check_edge_along_hole();
    debug(cand_edges_is_zero);
    rem_not_along_edge = cand_edges_is_zero.size();

    vector<int> h2v(H, -1);
    dfs2(0, h2v, -1);

    return 0;
}
