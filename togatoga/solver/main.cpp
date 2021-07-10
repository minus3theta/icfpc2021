#include <algorithm>
#include <bits/types/FILE.h>
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
#include <future>
#include <iomanip>
#include <iostream>
#include <list>
#include <map>
#include <memory>
#include <numeric>
#include <ostream>
#include <queue>
#include <set>
#include <sstream>
#include <stack>
#include <string>
#include <thread>
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
static bool is_intersect(const pair<pll, pll> &e1, const pair<pll, pll> &e2) {
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

class Solver {
public:
  Solver() {}

  void preprocess() {
    int max_x = 0;
    int max_y = 0;
    for (int i = 0; i < hole_internal_points.size(); i++) {
      int x, y;
      tie(x, y) = hole_internal_points[i];
      max_x = max(max_x, x);
      max_y = max(max_y, y);
    }
    point_to_index.resize(max_x + 1, vector<int>(max_y + 1, -1));
    for (int i = 0; i < hole_internal_points.size(); i++) {
      int x, y;
      tie(x, y) = hole_internal_points[i];
      point_to_index[x][y] = i;
    }

    assert(point_num() == hole_internal_points.size());
    neighbor_figs.resize(figure_num);
    for (const auto &edge : edges) {
      int a = edge.first;
      int b = edge.second;

      neighbor_figs[a].push_back(b);
      neighbor_figs[b].push_back(a);
    }
    intersected_points.resize(hole_internal_points.size(),
                              vector<char>(hole_internal_points.size(), 0));
    vector<future<vector<tuple<int, int, bool>>>> futures;
    for (int i = 0; i < hole_internal_points.size(); i++) {
      futures.push_back(std::async([&, i] {
        pll xy1 = hole_internal_points[i];
        vector<tuple<int, int, bool>> results;
        for (int j = i + 1; j < hole_internal_points.size(); j++) {
          pll xy2 = hole_internal_points[j];
          bool intersect = false;
          for (int k = 0; k < hole_points.size(); k++) {
            int l = (k + 1) % hole_points.size();
            pll xy3 = hole_points[k];
            pll xy4 = hole_points[l];
            if (is_intersect(mp(xy1, xy2), mp(xy3, xy4))) {
              intersect = true;
              break;
            }
          }
          results.push_back(mt(i, j, intersect));
        }
        return results;
      }));
    }
    for (auto &future : futures) {
      for (const auto &result : future.get()) {
        int i, j, k;
        tie(i, j, k) = result;
        intersected_points[i][j] = k;
        intersected_points[j][i] = k;
      }
    }
    cerr << "Done!! " << __func__ << endl;
  }

  int point_num() { return hole_internal_points.size(); }
  int sat_index_from_fig_and_point(int fig_idx, pii xy) {
    // cout << fig_idx << " " << xy.first << " " << xy.second << endl;
    assert(point_to_index[xy.first][xy.second] >= 0);
    int idx = point_to_index[xy.first][xy.second];
    int sat_index = fig_idx * point_num() + idx + 1;
    assert(sat_index != 0);
    return sat_index;
  }

  int calc_dist(pii xy1, pii xy2) {
    int d1 = (xy1.first - xy2.first) * (xy1.first - xy2.first);
    int d2 = (xy1.second - xy2.second) * (xy1.second - xy2.second);
    return d1 + d2;
  }

  void input_internal_points(const string &file_name) {
    ifstream ifs(file_name);
    int internal_point_num;
    ifs >> internal_point_num;

    hole_internal_points.resize(internal_point_num);
    for (auto &point : hole_internal_points) {
      ifs >> point.first >> point.second;
    }
    ifs.close();
    cerr << "Done!! " << __func__ << endl;
  }

  void solve(const std::string &input_file_name,
             const std::string &internal_file_name,
             const std::string &output_file_name) {
    cout << input_file_name << " " << internal_file_name << " "
         << output_file_name << endl;
    input(input_file_name);
    // 内点全列挙
    input_internal_points(internal_file_name);
    preprocess();

    // 制約を生成
    // cerr << figure_num << " " << hole_internal_points.size() << endl;
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
      cerr << "Done!! " << i + 1 << "/" << figure_num << " "
           << sat_clauses.size() << endl;
    }

    for (int i = 0; i < hole_internal_points.size(); i++) {
      pii xy1 = hole_internal_points[i];
      for (int j = i; j < hole_internal_points.size(); j++) {
        pii xy2 = hole_internal_points[j];
        bool ok = true;
        if (intersected_points[i][j]) {
          ok = false;
        }
        ll new_dist = calc_dist(xy1, xy2);
        for (int k = 0; k < figure_num; k++) {
          pii xy3 = figure_points[k];
          for (int l : neighbor_figs[k]) {
            pii xy4 = figure_points[l];

            if (!ok) {
              int sat_index1 = sat_index_from_fig_and_point(k, xy1);
              int sat_index2 = sat_index_from_fig_and_point(l, xy2);
              vector<int> bin_clause;
              bin_clause.push_back(-sat_index1);
              bin_clause.push_back(-sat_index2);
              sat_clauses.push_back(bin_clause);
              continue;
            }
            ll previous_dist = calc_dist(xy3, xy4);

            ll left_value = abs(new_dist - previous_dist) * THRESHOLD;
            ll right_value = epsilon * previous_dist;
            // 辺の長さが超える
            if (left_value > right_value) {
              int sat_index1 = sat_index_from_fig_and_point(k, xy1);
              int sat_index2 = sat_index_from_fig_and_point(l, xy2);
              vector<int> bin_clause;
              bin_clause.push_back(-sat_index1);
              bin_clause.push_back(-sat_index2);
              sat_clauses.push_back(bin_clause);
            }
          }
        }
      }
      cerr << "Hole Internal Done!! " << i + 1 << "/"
           << hole_internal_points.size() << endl;
    }
    // cerr << sat_clauses.size() << endl;
    output_cnf(output_file_name);
  }

  void output_cnf(std::string output_file_name) {
    ofstream os(output_file_name, ios::out | ios::binary);

    os << "p cnf " << figure_num * point_num() + 1 << " " << sat_clauses.size()
       << "\n";

    for (const auto &clause : sat_clauses) {
      for (int v : clause) {
        os << v << " ";
      }
      os << "0\n";
    }
  }

  void input(const std::string &file_name) {
    ifstream ifs(file_name, std::ios::in);
    ifs >> hole_num;
    hole_points.resize(hole_num);

    for (auto &point : hole_points) {
      ifs >> point.first >> point.second;
    }

    ifs >> edge_num;
    edges.resize(edge_num);
    for (auto &edge : edges) {
      ifs >> edge.first >> edge.second;
    }
    ifs >> figure_num;
    figure_points.resize(figure_num);
    for (auto &point : figure_points) {
      ifs >> point.first >> point.second;
    }
    ifs >> epsilon;
    cerr << "Done!! " << __func__ << endl;
    ifs.close();
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
  vector<vector<int>> point_to_index;
  vector<vector<int>> sat_clauses;
  vector<vector<char>> intersected_points;
};
void print_usage() {
  std::cout << "usage: ./a.out <problem.txt> <internal.txt> <output.cnf>"
            << std::endl;
}
int main(int argc, char *argv[]) {

  Solver s = Solver();
  if (argc != 4) {
    print_usage();
    exit(1);
  }
  s.solve(argv[1], argv[2], argv[3]);

  return 0;
}
