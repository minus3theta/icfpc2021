#include <algorithm>
#include <cstdint>
#include <ios>
#include <sstream>
#include <string>
#include <thread>
#define PICOJSON_USE_INT64
#include "picojson.h"
#include <cassert>
#include <climits>
#include <filesystem>
#include <fstream>
#include <future>
#include <iostream>
#include <iterator>
#include <queue>
#include <vector>

struct Position {
  long long x, y;
};
Position operator+(const Position &p1, const Position &p2) {
  return Position{p1.x + p2.x, p1.y + p2.y};
}
Position operator-(const Position &p1, const Position &p2) {
  return Position{p1.x - p2.x, p1.y - p2.y};
}
long long innerProduct(const Position &p1, const Position &p2) {
  return p1.x * p2.x + p1.y * p2.y;
}
long long crossProduct(const Position &p1, const Position &p2) {
  return p1.x * p2.y - p1.y * p2.x;
}
long long squareDistance(const Position &p1, const Position &p2) {
  long long x = p1.x - p2.x;
  long long y = p1.y - p2.y;
  return x * x + y * y;
}
long long dislikes(const std::vector<Position> &hole,
                   const std::vector<Position> &vertices) {
  long long ans = 0;
  for (auto &p : hole) {
    long long min = LLONG_MAX;
    for (auto &v : vertices) {
      min = std::min(min, squareDistance(p, v));
    }
    ans += min;
  }
  return ans;
}
struct Figure {
  std::vector<std::pair<int, int>> edges;
  std::vector<Position> vertices;
};
struct InputData {
  std::vector<Position> hole;
  Figure figure;
  long long epsilon;
};
struct OutputData {
  std::vector<Position> vertices;
};

InputData load(std::istream &in) {
  std::istream_iterator<char> input(in);
  picojson::value v;
  std::string err;
  input = picojson::parse(v, input, std::istream_iterator<char>(), &err);
  InputData data;
  auto &obj = v.get<picojson::object>();
  auto &hole = obj["hole"].get<picojson::array>();
  for (auto &o : hole) {
    auto &pos = o.get<picojson::array>();
    data.hole.push_back(Position{(long long)pos[0].get<int64_t>(),
                                 (long long)pos[1].get<int64_t>()});
  }
  auto &figure = obj["figure"].get<picojson::object>();
  auto &edges = figure["edges"].get<picojson::array>();
  auto &vertices = figure["vertices"].get<picojson::array>();
  for (auto &o : edges) {
    auto &edge = o.get<picojson::array>();
    data.figure.edges.push_back(std::make_pair(
        (long long)edge[0].get<int64_t>(), (long long)edge[1].get<int64_t>()));
  }
  for (auto &o : vertices) {
    auto &v = o.get<picojson::array>();
    data.figure.vertices.push_back(Position{(long long)v[0].get<int64_t>(),
                                            (long long)v[1].get<int64_t>()});
  }
  data.epsilon = obj["epsilon"].get<int64_t>();
  return data;
}
void dump(std::ostream &out, const OutputData &data) {
  picojson::array vertices;
  for (auto &v : data.vertices) {
    picojson::array a;
    a.push_back(picojson::value(int64_t(v.x)));
    a.push_back(picojson::value(int64_t(v.y)));
    vertices.push_back(picojson::value(std::move(a)));
  }
  picojson::object obj;
  obj["vertices"] = picojson::value(std::move(vertices));
  out << picojson::value(obj);
}

bool intersectImpl(const Position &v1, const Position &v2, const Position &u1,
                   const Position &u2) {
  if (v1.x == v2.x) {
    return (u1.x < v1.x && v1.x < u2.x) || (u2.x < v1.x && v1.x < u1.x);
  } else {
    long long val1 =
        (v1.x - v2.x) * u1.y - (v1.y - v2.y) * u1.x - crossProduct(v1, v2);
    long long val2 =
        (v1.x - v2.x) * u2.y - (v1.y - v2.y) * u2.x - crossProduct(v1, v2);
    return val1 * val2 < 0;
  }
}
bool intersect(const Position &v1, const Position &v2, const Position &u1,
               const Position &u2) {
  if (crossProduct(v1 - v2, u1 - u2) == 0) {
    return false;
  }
  return intersectImpl(v1, v2, u1, u2) && intersectImpl(u1, u2, v1, v2);
}
bool isLeftSideOfVector(const Position &p, const Position &v1,
                        const Position &v2) {
  return crossProduct(v2 - v1, v1 - p) <= 0;
}
bool isOnLine(const Position &point, const Position &v1, const Position &v2) {
  auto cross = crossProduct(v2 - v1, v1 - point);
  auto inner1 = innerProduct(v2 - v1, v1 - point);
  auto inner2 = innerProduct(v2 - v1, v2 - point);
  return cross == 0 && (inner1 * inner2 <= 0);
}
bool isInHole(const Position &point, const std::vector<Position> &hole) {
  int cnt = 0;
  for (int i = 0; i < hole.size(); ++i) {
    int j = (i + 1) % hole.size();
    if (((hole[i].y <= point.y) && (hole[j].y > point.y)) ||
        ((hole[i].y > point.y) && (hole[j].y <= point.y))) {
      double vt = (point.y - hole[i].y) / (double)(hole[j].y - hole[i].y);
      if (point.x < (hole[i].x + (vt * (hole[j].x - hole[i].x)))) {
        ++cnt;
      }
    }
  }
  if (cnt % 2) {
    return true;
  }
  for (int i = 0; i < hole.size(); ++i) {
    int j = (i + 1) % hole.size();
    if (isOnLine(point, hole[i], hole[j])) {
      return true;
    }
  }
  return false;
}
std::vector<Position> getInnerPoints(const InputData &input) {
  auto &hole = input.hole;
  auto it = std::max_element(
      hole.begin(), hole.end(),
      [](const Position &p1, const Position &p2) { return p1.x < p2.x; });
  long long maxX = it->x;
  it = std::max_element(
      hole.begin(), hole.end(),
      [](const Position &p1, const Position &p2) { return p1.y < p2.y; });
  long long maxY = it->y;
  std::vector<Position> ans;
  for (int i = 0; i <= maxX; ++i) {
    for (int j = 0; j <= maxY; ++j) {
      if (isInHole(Position{i, j}, hole)) {
        ans.push_back({i, j});
      }
    }
  }
  return ans;
}
void dumpInnerPoints(std::ostream &out, const std::vector<Position> &innerPoints) {
  out << innerPoints.size() << "\n";
  for (auto &p: innerPoints) {
    out << p.x << " " << p.y << "\n";
  }
}
bool intersectHole(const Position &p1, const Position &p2,
                   const std::vector<Position> &hole) {
  for (int i = 0; i < hole.size(); ++i) {
    int j = (i + 1) % hole.size();
    auto &u1 = hole[i];
    auto &u2 = hole[j];
    if (intersect(u1, u2, p1, p2)) {
      return true;
    }
  }
  return false;
}

using VertexDistences = std::vector<std::vector<std::pair<int, long long>>>;
VertexDistences getVertexDistance(const InputData &input) {
  auto &figure = input.figure;
  VertexDistences ans(figure.vertices.size());
  for (auto &[u, v] : figure.edges) {
    auto p1 = figure.vertices[u];
    auto p2 = figure.vertices[v];
    long long d = squareDistance(p1, p2);
    ans[u].push_back(std::make_pair(v, d));
    ans[v].push_back(std::make_pair(u, d));
  }
  return ans;
}

const char *partialResultOutputDir = "output";
std::size_t numThreads = 4;

void dfs(int i, const VertexDistences &vertexDistances, const InputData &input,
         const std::vector<Position> &innerPoints, std::vector<Position> &state,
         std::vector<Position> &ans, long long &score) {
  if (i == vertexDistances.size()) {
    long long d = dislikes(input.hole, state);
    if (d < score) {
      std::stringstream ss;
      ss << partialResultOutputDir << "/" << std::this_thread::get_id() << "_"
         << d << ".json";
      std::ofstream fout(ss.str());
      OutputData output{state};
      dump(fout, output);
      score = d;
      ans = state;
    }
    return;
  }
  for (auto p : innerPoints) {
    bool ok = true;
    for (auto [v, originalDist] : vertexDistances[i]) {
      if (i <= v)
        continue;
      assert(v < state.size());
      auto q = state[v];
      long long curDist = squareDistance(p, q);
      double expansion = std::abs((double)curDist / (double)originalDist - 1);
      if (expansion > (double)input.epsilon / 1000000.0) {
        ok = false;
        break;
      }
      if (intersectHole(p, q, input.hole)) {
        ok = false;
        break;
      }
    }
    if (ok) {
      state.push_back(p);
      dfs(i + 1, vertexDistances, input, innerPoints, state, ans, score);
      state.pop_back();
    }
  }
}

OutputData solve(const InputData &input) {
  auto innerPoints = getInnerPoints(input);
  auto distances = getVertexDistance(input);
  using ResultType = std::pair<std::vector<Position>, long long>;
  auto solver = [&innerPoints, &input,
                 &distances](const Position &p) -> ResultType {
    std::vector<Position> ans, state;
    long long score = LLONG_MAX;
    state.push_back(p);
    dfs(1, distances, input, innerPoints, state, ans, score);
    return std::make_pair(std::move(ans), score);
  };
  std::queue<std::future<ResultType>> futs;
  std::vector<Position> ans;
  long long score = LLONG_MAX;
  for (auto &p : innerPoints) {
    if (futs.size() > numThreads) {
      auto x = futs.front().get();
      if (x.second < score) {
        score = x.second;
        ans = std::move(x.first);
      }
      futs.pop();
    }
    futs.push(std::async(solver, p));
  }
  while (!futs.empty()) {
    auto x = futs.front().get();
    if (x.second < score) {
      score = x.second;
      ans = std::move(x.first);
    }
    futs.pop();
  }
  return OutputData{std::move(ans)};
}

int main(int argv, const char *argc[]) {
  if (argv < 5) {
    std::cout << "./a.out ${PROBREM_JSON_FILE} ${RESULT_JSON_FILE} "
                 "${PARTIAL_RESULT_OUTPUT_DIR} ${NUM_THREADS}"
              << std::endl;
    return 0;
  }
  const char *filename = argc[1];
  const char *outputfilename = argc[2];
  partialResultOutputDir = argc[3];
  numThreads = std::stoull(argc[4]);
  std::filesystem::create_directory(partialResultOutputDir);
  std::ifstream fin(filename);
  auto input = load(fin);
  auto &hole = input.hole;

//  std::ofstream fout(outputfilename);
//  auto innerPoints = getInnerPoints(input);
//  dumpInnerPoints(fout, innerPoints);
  OutputData output = solve(input);
  std::ofstream fout(outputfilename);
  dump(fout, output);
  return 0;
}
