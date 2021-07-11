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
const int LIT_UNKNOWN = 2;
const int LIT_TRUE = 0;
const int LIT_FALSE = 1;

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
  Solver() : new_variable(0) {}

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
                              vector<int>(hole_internal_points.size(), 0));

    for (int i = 0; i < hole_internal_points.size(); i++) {
      pll xy1 = hole_internal_points[i];
      for (int j = i + 1; j < hole_internal_points.size(); j++) {
        pll xy2 = hole_internal_points[j];
        for (int k = 0; k < hole_points.size(); k++) {
          int l = (k + 1) % hole_points.size();
          pll xy3 = hole_points[k];
          pll xy4 = hole_points[l];
          if (is_intersect(mp(xy1, xy2), mp(xy3, xy4))) {
            intersected_points[i][j] = 1;
            intersected_points[j][i] = 1;
            break;
          }
        }    
      }
    }
    
    cerr << "Preprocess Done!! " << __func__ << endl;
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
  void add_edge_constraints() {
    // 辺の制約を作成
    for (int i = 0; i < hole_internal_points.size(); i++) {
      for (int j = 0; j < figure_points.size(); j++) {
        for (int k : neighbor_figs[j]) {
          ll previous_dist = calc_dist(figure_points[j], figure_points[k]);
          vector<int> clause;
          clause.push_back(
              -sat_index_from_fig_and_point(j, hole_internal_points[i]));
          for (int l = 0; l < hole_internal_points.size(); l++) {
            if (intersected_points[i][l]) {
              continue;
            }
            ll new_dist =
                calc_dist(hole_internal_points[i], hole_internal_points[l]);
            ll left_value = abs(new_dist - previous_dist) * THRESHOLD;
            ll right_value = epsilon * previous_dist;
            // 辺の長さがイプシロン以内
            if (left_value <= right_value) {
              clause.push_back(
                  sat_index_from_fig_and_point(k, hole_internal_points[l]));
            }
          }
          assert(!clause.empty());
          sat_clauses.push_back(clause);
        }
      }
      cerr << "Edge constraint!! " << i + 1 << "/"
           << hole_internal_points.size() << endl;
    }
  }

  int bucket_cnt() { return sqrt(hole_internal_points.size()) + 1; }
  int get_bucket_id(pll xy) {
    assert(point_to_index[xy.first][xy.second] != -1);
    assert(bucket_cnt() >= 1);
    return point_to_index[xy.first][xy.second] / bucket_cnt();
  }
  void construct_fig_and_bucket() {
    bucket_to_points.resize(bucket_cnt());
    for (int i = 0; i < figure_num; i++) {
      for (int j = 0; j < bucket_cnt(); j++) {
        new_variable++;
        fig_and_bucket_to_sat_index[mp(i, j)] = variable_num();
      }
    }
    for (int i = 0; i < hole_internal_points.size(); i++) {
      int bucket_id = get_bucket_id(hole_internal_points[i]);
      bucket_to_points[bucket_id].push_back(hole_internal_points[i]);
    }
  }
  int get_sat_index_from_fig_and_bucket(int fig, int bucket) {
    assert(fig_and_bucket_to_sat_index.count(mp(fig, bucket)) > 0);
    return fig_and_bucket_to_sat_index[mp(fig, bucket)];
  }
  void add_node_constraints() {
    //前処理
    construct_fig_and_bucket();

    // 頂点 + バケットに対して制約の追加
    assert(figure_num == figure_points.size());
    for (int i = 0; i < figure_points.size(); i++) {
      // 頂点はどれか一つのバケットに属する
      {
        vector<int> clause;
        for (int j = 0; j < bucket_cnt(); j++) {
          clause.push_back(get_sat_index_from_fig_and_bucket(i, j));
        }
        sat_clauses.push_back(clause);
      }

      // 頂点は唯一つのバケットに属する
      for (int j = 0; j < bucket_cnt(); j++) {
        int x = get_sat_index_from_fig_and_bucket(i, j);
        for (int k = j + 1; k < bucket_cnt(); k++) {
          int y = get_sat_index_from_fig_and_bucket(i, k);
          assert(x != y);
          bin_clauses.push_back(mp(-x, -y));
        }
      }

      // 内点とバケットについての制約を追加
      for (int j = 0; j < bucket_cnt(); j++) {
        if (bucket_to_points[j].empty()) {
          continue;
        }
        int bucket_sat_index = get_sat_index_from_fig_and_bucket(i, j);
        vector<int> clause;

        // figは同じバケット内に属する点はただ一つ
        for (int k = 0; k < bucket_to_points[j].size(); k++) {
          int x = sat_index_from_fig_and_point(i, bucket_to_points[j][k]);
          for (int k2 = k + 1; k2 < bucket_to_points[j].size(); k2++) {
            int y = sat_index_from_fig_and_point(i, bucket_to_points[j][k2]);
            bin_clauses.push_back(mp(-x, -y));
          }
        }

        // スーパー頂点はバケット内に頂点が存在する時だけ真
        for (const auto &point : bucket_to_points[j]) {
          clause.push_back(sat_index_from_fig_and_point(i, point));
          bin_clauses.push_back(
              mp(-sat_index_from_fig_and_point(i, point), bucket_sat_index));
        }
        assert(!clause.empty());
        if (!clause.empty()) {
          clause.push_back(-bucket_sat_index);
          sat_clauses.push_back(clause);
        }
        // 頂点が対応する内点はただ一つ?
      }
      cerr << "Node constraints: " << (i + 1) << "/" << figure_points.size()
           << endl;
    }
  }
  void add_segment_conflict_constraints() {
    // 超頂点を作成
    vector<int> index_to_super_node;
    for (int i = 0; i < hole_internal_points.size(); i++) {
      new_variable++;
      vector<int> clause;
      for (int j = 0; j < figure_points.size(); j++) {
        int sat_index1 =
            sat_index_from_fig_and_point(j, hole_internal_points[i]);
        int sat_index2 = variable_num();
        bin_clauses.push_back(mp(-sat_index1, sat_index2));
        clause.push_back(sat_index1);
      }
      clause.push_back(-variable_num());
      sat_clauses.push_back(clause);
      index_to_super_node.push_back(variable_num());
    }

    for (int i = 0; i < hole_internal_points.size(); i++) {
      for (int j = i + 1; j < hole_internal_points.size(); j++) {
        if (intersected_points[i][j]) {
          bin_clauses.push_back(
              mp(-index_to_super_node[i], -index_to_super_node[j]));
        }
      }
      cerr << "Intersect constraint!!" << i + 1 << "/"
           << hole_internal_points.size() << endl;
    }
  }

  void add_at_least_one_point_on_node_constraints() {
    for (int i = 0; i < hole_points.size(); i++) {
      // (x_0_i or x_1_i or x_2_i or x_3_i or ... x_n_i)
      vector<int> clause;
      for (int j = 0; j < figure_points.size(); j++) {
        clause.push_back(sat_index_from_fig_and_point(j, hole_points[i]));
      }
      sat_clauses.push_back(clause);
    }
  }
  void solve(const std::string &input_file_name,
             const std::string &internal_file_name,
             const std::string &output_file_name) {

    input(input_file_name);
    // 内点全列挙
    input_internal_points(internal_file_name);
    preprocess();

    add_edge_constraints();
    add_node_constraints();
    add_segment_conflict_constraints();
    output_cnf(output_file_name);
  }

  void reduce_internal_points(const string &internal_file_name) {
    vector<pii> new_hole_internal_points;
    set<pll> hole_point_set(hole_points.begin(), hole_points.end());
    for (const auto &point : hole_internal_points) {

      if (hole_point_set.count(point) ||
          (point.first % 1 == 0 && point.second % 1 == 0)) {
        new_hole_internal_points.push_back(point);
      }
    }
    hole_internal_points = new_hole_internal_points;
    // 差っ引いたinternalポイントをファイルに保存しておく
    const string output_file_name = internal_file_name + "_reduced.txt";
    ofstream os(output_file_name, ios::out | ios::binary);
    os << hole_internal_points.size() << "\n";
    for (auto &point : hole_internal_points) {
      os << point.first << " " << point.second << "\n";
    }
    os.close();
  }

  void solve_zero_dislikes(const std::string &input_file_name,
                           const std::string &internal_file_name,
                           const std::string &output_file_name) {

    input(input_file_name);
    // 内点全列挙
    input_internal_points(internal_file_name);
    // reduce_internal_points(internal_file_name);

    preprocess();

    add_edge_constraints();
    add_node_constraints();
    add_segment_conflict_constraints();
    add_at_least_one_point_on_node_constraints();
    output_cnf(output_file_name);
  }

  int variable_num() {
    return figure_num * hole_internal_points.size() + new_variable + 1;
  }
  void output_cnf(std::string output_file_name) {
    ofstream os(output_file_name, ios::out | ios::binary);
    int clause_num = sat_clauses.size() + bin_clauses.size();
    os << "p cnf " << variable_num() << " " << clause_num << "\n";

    for (const auto &bin : bin_clauses) {
      os << bin.first << " " << bin.second << " 0\n";
    }
    for (const auto &clause : sat_clauses) {
      assert(!clause.empty());
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
  vector<pii> bin_clauses;
  vector<vector<int>> intersected_points;
  // vector<int> assignments;
  int new_variable;
  map<pair<int, int>, int> fig_and_bucket_to_sat_index;
  vector<vector<pii>> bucket_to_points;
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
  s.solve_zero_dislikes(argv[1], argv[2], argv[3]);

  return 0;
}
