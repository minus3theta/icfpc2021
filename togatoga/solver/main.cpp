#include <algorithm>
#include <bitset>
#include <cassert>
#include <cfloat>
#include <climits>
#include <cmath>
#include <complex>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <ctime>
#include <fstream>
#include <functional>
#include <iomanip>
#include <iostream>
#include <list>
#include <map>
#include <memory>
#include <numeric>
#include <queue>
#include <set>
#include <sstream>
#include <stack>
#include <string>
#include <utility>
#include <vector>

// c++11
#include <array>
#include <tuple>
#include <unordered_map>
#include <unordered_set>

#define mp make_pair
#define mt make_tuple
#define rep(i, n) for (int i = 0; i < (n); i++)

using namespace std;

using ll = long long;
using ull = unsigned long long;
using pii = pair<int, int>;
using pll = pair<ll, ll>;

template <class T> using max_priority_queue = priority_queue<T>;
template <class T>
using min_priority_queue = priority_queue<T, std::vector<T>, std::greater<T>>;

const int INF = 1 << 29;
const ll LL_INF = 1LL << 60;
const double EPS = 1e-9;
const ll MOD = 1000000007;

const int dx[] = {1, 0, -1, 0}, dy[] = {0, -1, 0, 1};

const ll THRESHOLD = 1000000;

class Solver {
public:
  Solver() {}

  void preprocess() {

    for (int i = 0; i < hole_internal_points.size(); i++) {
      point_to_index[hole_internal_points[i]] = i;
    }

    for (const auto &edge : edges) {
      int a = edge.first;
      int b = edge.second;
      neighbor_figs[a - 1].push_back(b - 1);
      neighbor_figs[b - 1].push_back(a - 1);
    }

    for (int i = 0; i < hole_internal_points.size(); i++) {
      pll xy1 = hole_internal_points[i];
      for (int j = i + 1; j < hole_internal_points.size(); j++) {
        pll xy2 = hole_internal_points[j];
        bool ok = true;
        for (int k = 0; k < hole_points.size(); k++) {
          int l = (k + 1) % hole_points.size();
          pll xy3 = hole_points[k];
          pll xy4 = hole_points[l];
          if (is_intersect(mp(xy1, xy2), mp(xy3, xy4))) {
            ok = false;
            break;
          }
        }
        if (!ok) {
          intersected_points.insert(mp(xy1, xy2));
          intersected_points.insert(mp(xy2, xy1));
        }
      }
    }
  }
  int sat_index_from_fig_and_point(int fig_idx, pii xy) {
    int idx = point_to_index[xy];
    int sat_index = fig_idx * point_to_index.size() + idx + 1;
    assert(sat_index != 0);
    return sat_index;
  }

  int calc_dist(pii xy1, pii xy2) {
    int d1 = (xy1.first - xy2.first) * (xy1.first - xy2.first);
    int d2 = (xy1.second - xy2.second) * (xy1.second - xy2.second);
    return d1 + d2;
  }

  bool is_intersect(pair<pll, pll> e1, pair<pll, pll> e2) {
    ll x1, y1, x2, y2, x3, y3, x4, y4;
    tie(x1, y1) = e1.first;
    tie(x2, y2) = e1.second;
    tie(x3, y3) = e2.first;
    tie(x4, y4) = e2.second;
    const ll ta = (x3 - x4) * (y1 - y3) + (y3 - y4) * (x3 - x1);
    const ll tb = (x3 - x4) * (y2 - y3) + (y3 - y4) * (x3 - x2);
    const ll tc = (x1 - x2) * (y3 - y1) + (y1 - y2) * (x1 - x3);
    const ll td = (x1 - x2) * (y4 - y1) + (y1 - y2) * (x1 - x4);
    return ta * tb < 0 && tc * td < 0;
  }
  void solve() {
    input();
    // 内点全列挙
    // hole_internal_points;
    preprocess();

    // 制約を生成
    for (int i = 0; i < figure_num; i++) {
      // figの一つの頂点が必ずどれか一つinternal_pointsに存在
      {
        vector<int> clause;

        // (x_i_0_0 or x_i_0_1 or )
        for (int j = 0; j < hole_internal_points.size(); j++) {
          clause.push_back(
              sat_index_from_fig_and_point(i, hole_internal_points[j]));
        }
        sat_clauses.push_back(clause);
      }

      // figは唯一つのinternal_pointsに属する
      /* !(x_i_0_0 and x_i_0_1) -> (!x_i_0_0 or x_i_0_1) */
      for (int j = 0; j < hole_internal_points.size(); j++) {
        pii xy1 = hole_internal_points[j];
        int sat_index1 = sat_index_from_fig_and_point(i, xy1);
        for (int k = j + 1; k < hole_internal_points.size(); k++) {
          pii xy2 = hole_internal_points[k];
          int sat_index2 = sat_index_from_fig_and_point(i, xy2);
          vector<int> bin_clause;
          bin_clause.push_back(-sat_index1);
          bin_clause.push_back(-sat_index2);
          sat_clauses.push_back(bin_clause);
        }
      }

      //隣接頂点
      for (const int j : neighbor_figs[i]) {
        //辺の長さ制約
        pii xy1 = figure_points[i];
        pii xy2 = figure_points[j];
        int previous_dist = calc_dist(xy1, xy2);
        for (int k = 0; k < hole_internal_points.size(); k++) {
          pii xy1 = figure_points[k];
          for (int l = 0; l < hole_internal_points.size(); l++) {
            pii xy2 = figure_points[l];
            bool ok = true;
            // 二頂点が既存のholeのedgeと交わる
            if (intersected_points.count(mp(xy1, xy2))) {
              ok = false;
            } else {
              int new_dist = calc_dist(xy1, xy2);
              ll left_value = abs(new_dist - previous_dist) * THRESHOLD;
              ll right_value = epsilon * previous_dist;
              // 辺の長さが超える
              if (left_value > right_value) {
                ok = false;
              }
            }
            if (!ok) {
              int sat_index1 = sat_index_from_fig_and_point(i, xy1);
              int sat_index2 = sat_index_from_fig_and_point(j, xy2);
              vector<int> bin_clause;
              bin_clause.push_back(-sat_index1);
              bin_clause.push_back(-sat_index2);
            }
          }
        }
      }
    }
  }
  void input() {
    cin >> hole_num;
    hole_points.resize(hole_num);
    for (auto &point : hole_points) {
      cin >> point.first >> point.second;
    }

    cin >> edge_num;
    edges.resize(edge_num);
    for (auto &edge : edges) {
      cin >> edge.first >> edge.second;
    }
    cin >> figure_num;
    figure_points.resize(figure_num);
    for (auto &point : figure_points) {
      cin >> point.first >> point.second;
    }
    cin >> epsilon;
  }
  // inputs
  int hole_num;
  vector<pii> hole_points;
  int figure_num;
  vector<pii> figure_points;
  int edge_num;
  vector<pii> edges; // (a, b)
  int epsilon;
  // variables
  vector<pii> hole_internal_points;
  vector<vector<int>> neighbor_figs;
  map<pii, int> point_to_index;
  vector<vector<int>> sat_clauses;
  set<pair<pll, pll>> intersected_points;
};

int main() {
  cin.tie(0);
  ios::sync_with_stdio(false);
  Solver s = Solver();
  s.solve();
  return 0;
}