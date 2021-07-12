
# include <Siv3D.hpp> // OpenSiv3D v0.4.3
#include <vector>
#include <cmath>
#include <set>
#include <complex>

#include "GuiSolver.h"

constexpr double cOffset = 10.0;
constexpr int cRepeatNum = 4;
constexpr int cFrame = 60;

constexpr double EPS = 1e-8;

inline double dot(const Vec2& a, const Vec2& b) { return a.dot(b); }
inline double cross(const Vec2& a, const Vec2& b) { return a.cross(b); }
double angle(const Vec2& a, const Vec2& b) { return atan2(a.x * b.y - a.y * b.y, a.x * b.x + a.y * b.y); }

bool ssIntersect(const Line& a, const Line& b) {
    Vec2 a_dir = a.end - a.begin;
    Vec2 b_dir = b.end - b.begin;
    if (abs(cross(a_dir, b_dir)/b_dir.lengthSq()) < EPS) return false;
    return cross(a_dir, b.begin - a.begin) * cross(a_dir, b.end - a.begin) < -EPS &&
        cross(b_dir, a.begin - b.begin) * cross(b_dir, a.end - b.begin) < -EPS;
}

bool spIntersect(const Line& l, const Vec2& p) {
    return abs(p.distanceFrom(l.begin) + p.distanceFrom(l.end) - l.length()) < EPS;
}

Vec2 ssCrosspoint(const Line& a, const Line& b) {
    Vec2 b_dir = b.end - b.begin;
    double A = cross(a.end - a.begin, b_dir);
    double B = cross(a.end - a.begin, a.end - b.begin);
    return b.begin + B / A * b_dir;
}

bool containSegment(const Polygon& poly, const Array<Line>& g, const Line& l) {
    if (!poly.contains(l.begin)) return false;
    if (!poly.contains(l.end)) return false;
    std::vector<Vec2> cp;
    for(auto& gl : g){
        if (ssIntersect(gl, l))
            cp.push_back(ssCrosspoint(gl, l));
    }
    sort(cp.begin(), cp.end(), [](const Vec2& a, const Vec2& b) {return std::make_pair(a.x, a.y) < std::make_pair(b.x, b.y); });
    for (int i = 0; i + 1 < cp.size(); i++)
        if (!poly.contains(0.5 * (cp[i] + cp[i + 1]))) return false;
    return true;
}

class MinMaxVec {
public:
    MinMaxVec()
        : m_min(0.0, 0.0)
        , m_max(0.0, 0.0)
    {}
    void update(const Vec2& v, double scale = 1.0) {
        m_min.x = std::min(m_min.x, scale * v.x);
        m_min.y = std::min(m_min.y, scale * v.y);
        m_max.x = std::max(m_max.x, scale * v.x);
        m_max.y = std::max(m_max.y, scale * v.y);
    }
    void apply(Vec2& v) const {
        v.x += m_min.x + m_max.x;
        v.y += m_min.y + m_max.y;
    }
private:
    Vec2 m_min;
    Vec2 m_max;
};

GuiSolver::GuiSolver()
    : m_vel_reduce(0.995)
    , m_len_fix(0.15)
    , m_col_fix(0.2)
    , m_edge_col_fix(0.05)
    , m_coulomb(0.0)
    , m_scale(1.0)
    , m_selected(-1)
{}

bool GuiSolver::read(const FilePath& file) {
    const JSONReader json(file);
    if (!json) return false;

    m_edge.clear();
    m_edge_line.clear();
    m_default_len.clear();
    m_pos.clear();
    m_vel.clear();
    m_move.clear();
    m_adj.clear();

    int max_coord = 0;
    for (const auto& pt : json[U"hole"].arrayView()) {
        for (const auto& v : pt.arrayView()) {
            max_coord = std::max(max_coord, v.get<int32>());
        }
    }
    for (const auto& pt : json[U"figure"][U"vertices"].arrayView()) {
        for (const auto& v : pt.arrayView()) {
            max_coord = std::max(max_coord, v.get<int32>());
        }
    }
    m_scale = 780.f / max_coord;

    Array<Vec2> hole_point;
    for (const auto& pt : json[U"hole"].arrayView()) {
        auto p = pt.getArray<double>();
        hole_point.emplace_back(m_scale * p[0] + cOffset, m_scale * p[1] + cOffset);
    }
    size_t hole_size = hole_point.size();

    for (int32 i = 0; i < hole_size; i++) {
        m_edge_line.emplace_back(hole_point[i], hole_point[(i + 1) % hole_size]);
    }
    m_hole = Polygon(hole_point);

    for (const auto& pt : json[U"figure"][U"vertices"].arrayView()) {
        auto p = pt.getArray<double>();
        m_pos.emplace_back(m_scale * p[0] + cOffset, m_scale * p[1] + cOffset);
        m_adj.emplace_back();
    }

    for (const auto& pt : json[U"figure"][U"edges"].arrayView()) {
        auto p = pt.getArray<int32>();
        m_edge.emplace_back(p[0], p[1]);
        const auto& src = m_pos[p[0]];
        const auto& dst = m_pos[p[1]];
        m_default_len.emplace_back(src.distanceFromSq(dst));
    }

    for (auto& e : m_edge) {
        m_adj[e.x].insert(e.y);
        m_adj[e.y].insert(e.x);
    }

    m_vel.assign(m_pos.size(), Vec2(0.0, 0.0));
    m_move.assign(m_pos.size(), true);

    m_epsilon = 0.95 * 1e-6 * json[U"epsilon"].get<int32>();

    return true;
}


void GuiSolver::readSolution(const FilePath& file) {
    const JSONReader json(file);
    size_t idx = 0;
    for (const auto& pt : json[U"vertices"].arrayView()) {
        auto p = pt.getArray<double>();
        m_pos[idx].x = m_scale * p[0] + cOffset;
        m_pos[idx].y = m_scale * p[1] + cOffset;
        m_vel[idx].x = 0.0;
        m_vel[idx].y = 0.0;
        m_move[idx] = true;
        ++idx;
    }
}

void GuiSolver::write(const FilePath& file, bool to_int) {
    TextWriter writer(file);
    writer << U"{";
    writer << U"    \"vertices\": [";
    for (int i = 0; i < m_pos.size(); i++) {
        if (to_int) {
            int32 x = int32((m_pos[i].x - cOffset) / m_scale + 0.5);
            int32 y = int32((m_pos[i].y - cOffset) / m_scale + 0.5);
            writer << U"        [" << x << U", " << y << (i == m_pos.size() - 1 ? U"]" : U"],");
        }
        else {
            writer << U"        [" << (m_pos[i].x - cOffset) / m_scale << U", " << (m_pos[i].y - cOffset) / m_scale << (i == m_pos.size() - 1 ? U"]" : U"],");
        }
    }
    writer << U"    ]";
    writer << U"}";
}

void GuiSolver::writeHint(const FilePath& file, const FilePath& inner_file, int32 hint_dist) const {
    TextReader reader(inner_file);
    String s;
    reader.readLine(s);
    int32 size = Parse<int32>(s);
    std::set<std::pair<int32, int32>> inner_points;
    for (int32 i = 0; i < size; i++) {
        reader.readLine(s);
        auto a = s.split(' ');
        inner_points.emplace(Parse<int32>(a[0]), Parse<int32>(a[1]));
    }
    TextWriter writer(file);
    writer << m_pos.size();
    for (auto& p : m_pos) {
        std::vector<std::pair<int32, int32>> vp;
        std::pair<int32, int32> pr;
        const int32 base_x = int32((p.x - cOffset) / m_scale) - hint_dist - 1;
        const int32 base_y = int32((p.y - cOffset) / m_scale) - hint_dist - 1;
        for (int32 i = 0; i < 2 * hint_dist; i++) {
            for (int32 j = 0; j < 2 * hint_dist; j++) {
                pr.first = base_x + i;
                pr.second = base_y + j;
                if (inner_points.count(pr)) {
                    vp.push_back(pr);
                }
            }
        }
        if (vp.empty()) {
            // 候補の頂点が見つからなかったら距離を1伸ばして再計算
            for (int32 i = 0; i < 2 * hint_dist+2; i++) {
                for (int32 j = 0; j < 2 * hint_dist+2; j++) {
                    pr.first = base_x + i - 1;
                    pr.second = base_y + j - 1;
                    if (inner_points.count(pr)) {
                        vp.push_back(pr);
                    }
                }
            }
            if (vp.empty()) {
                Print << U"no candidates for the vertex (" << p.x << U", " << p.y << U")";
            }
        }
        writer << vp.size();
        for (auto& pt : vp) writer << pt.first << U" " << pt.second;
    }
}

double GuiSolver::getDislike() const {
    double dislike = 0.0;
    for (auto& l : m_edge_line) {
        double min_dist = 1e12;
        for (auto& p : m_pos) {
            min_dist = std::min(min_dist, p.distanceFromSq(l.begin));
        }
        dislike += min_dist;
    }
    return dislike / (m_scale * m_scale);
}

void GuiSolver::update() {
    {
        SimpleGUI::Slider(U"{:.3f}"_fmt(m_vel_reduce), m_vel_reduce, 0.0, 1.0, Vec2(800, 250), 60, 150);
        SimpleGUI::Slider(U"{:.3f}"_fmt(m_len_fix), m_len_fix, 0.0, 1.0, Vec2(800, 300), 60, 150);
        SimpleGUI::Slider(U"{:.3f}"_fmt(m_col_fix), m_col_fix, 0.0, 1.0, Vec2(800, 350), 60, 150);
        SimpleGUI::Slider(U"{:.3f}"_fmt(m_edge_col_fix), m_edge_col_fix, 0.0, 1.0, Vec2(800, 400), 60, 150);
        SimpleGUI::Slider(U"{:.3f}"_fmt(m_coulomb), m_coulomb, 0.0, 5.0, Vec2(800, 450), 60, 150);
    }

    if (m_pos.empty()) return;
    if (MouseL.down()) {
        auto pos = Cursor::PosF();
        int32 nearest = -1;
        double min_dist = 1e12;
        for (int32 i = 0; i < m_pos.size(); i++) {
            if (!m_move[i]) continue;
            double d = pos.distanceFromSq(m_pos[i]);
            if (d < min_dist) {
                nearest = i;
                min_dist = d;
            }
        }
        if (min_dist < 16.0) {
            m_selected = nearest;
        }
    } else if (MouseL.pressed() && m_selected != -1) {
        m_vel[m_selected].set(cFrame * Cursor::DeltaF());

    } else {
        m_selected = -1;
    }

    if (MouseR.down()) {
        auto pos = Cursor::PosF();
        int32 nearest = -1;
        double min_dist = 1e12;
        for (int32 i = 0; i < m_pos.size(); i++) {
            double d = pos.distanceFromSq(m_pos[i]);
            if (d < min_dist) {
                nearest = i;
                min_dist = d;
            }
        }
        if (min_dist < 16.0) {
            m_move[nearest] = !m_move[nearest];
            // 選択中の頂点を固定したら選択解除
            if (nearest == m_selected) m_selected = -1;
        }
    }

    auto lineInHold = [&](const Line& line) {
        if (!m_hole.contains(line.begin)) return false;
        for (auto& l : m_edge_line) {
            if (line.intersectsAt(l)) return false;
        }
        return true;
    };

    for (int i = 0; i < m_pos.size(); i++) {
        if (m_move[i]) continue;
        m_vel[i].x = 0.0;
        m_vel[i].y = 0.0;
    }

    for (int _ = 0; _ < cRepeatNum; _++) {
        for (int i = 0; i < m_pos.size(); i++) {
            if (!m_move[i] || i == m_selected) continue;
            m_vel[i].x *= m_vel_reduce;
            m_vel[i].y *= m_vel_reduce;
        }
        Array<MinMaxVec> m_vel_dif(m_pos.size());
        // 点ごとにホール内へ押し込む
        for (int i = 0; i < m_pos.size(); i++) {
            if (m_hole.contains(m_pos[i])) continue;
            double min_depth = 1e12;
            Vec2 closest;
            for (auto& l : m_edge_line) {
                Vec2 closest_src = l.closest(m_pos[i]);
                double dist = closest_src.distanceFromSq(m_pos[i]);
                if (dist < min_depth) {
                    min_depth = dist;
                    closest = closest_src;
                }
            }
            if (min_depth < 0.01) continue;
            min_depth = sqrt(min_depth);
            Vec2 dir = closest - m_pos[i];
            dir.normalize();
            m_vel_dif[i].update(dir, m_col_fix * min_depth);
        }
        for(int i=0;i<m_edge.size();i++){
            const auto& e = m_edge[i];
            if (!m_move[e.x] && !m_move[e.y]) continue;
            const auto& src = m_pos[e.x];
            const auto& dst = m_pos[e.y];
            auto line = Line(src, dst);
            // 線分 vs ホール枠のコリジョン
            if((m_move[e.x] || m_move[e.y]) && m_edge_col_fix  > 0.0){
                std::vector<std::pair<Vec2, size_t>> col_point;
                const size_t n = m_edge_line.size();
                for (size_t j = 0; j < n; j++) {
                    if (::ssIntersect(line, m_edge_line[j])) {
                        col_point.emplace_back(::ssCrosspoint(line, m_edge_line[j]), j);
                    }
                }
                sort(col_point.begin(), col_point.end(), [](const std::pair<Vec2, size_t>& a, const std::pair<Vec2, size_t>& b) {
                    return std::make_pair(a.first.x, a.first.y) < std::make_pair(b.first.x, b.first.y);
                });
                Vec2 dir = dst - src;
                const double len = dir.length();
                dir.normalize();
                Vec2 nrm;
                nrm.x = -dir.y;
                nrm.y = dir.x;

                for (size_t j = 0; j + 1 < col_point.size(); j++) {
                    if (m_hole.contains(0.5 * (col_point[j].first + col_point[j + 1].first))) continue;
                    size_t src_idx = col_point[j].second;
                    size_t dst_idx = col_point[j + 1].second;
                    if (src_idx > dst_idx) std::swap(src_idx, dst_idx);
                    if (dst_idx - src_idx > src_idx + n - dst_idx) {
                        std::swap(src_idx, dst_idx);
                        dst_idx += n;
                    }
                    double dt = dot(nrm, m_edge_line[src_idx].end - col_point[j].first);
                    double max_dif = abs(dt);
                    double sgn = (dt > 0 ? 1 : -1);
                    Vec2 col_pt = m_edge_line[src_idx].end;
                    for (size_t k = src_idx+1; k < dst_idx; k++) {
                        auto idx = k >= n ? k - n : k;
                        dt = sgn * dot(nrm, m_edge_line[idx].end - col_point[j].first);
                        if (max_dif < dt) {
                            max_dif = dt;
                            col_pt = m_edge_line[idx].end;
                        }
                    }
                    if (!m_move[e.x]) {
                        m_vel_dif[e.y].update(nrm, m_edge_col_fix* sgn* max_dif);
                    }
                    else if (!m_move[e.y]) {
                        m_vel_dif[e.x].update(nrm, m_edge_col_fix* sgn* max_dif);
                    }
                    else {
                        double ratio = dir.dot(col_pt - src) / len;
                        ratio = std::clamp(ratio, 0.0, 1.0);
                        m_vel_dif[e.x].update(nrm, (1 - ratio) * m_edge_col_fix * sgn * max_dif);
                        m_vel_dif[e.y].update(nrm, ratio * m_edge_col_fix * sgn * max_dif);
                    }
                }
            }
            Vec2 rel_vel = m_vel[e.y] - m_vel[e.x];
            const double cur_dist = line.lengthSq();
            const double min_dist = m_default_len[i] * (1 - m_epsilon);
            const double max_dist = m_default_len[i] * (1 + m_epsilon);
            if (min_dist < cur_dist && cur_dist < max_dist) continue;
            Vec2 dir = dst - src;
            dir.normalize();
            if (cur_dist < min_dist) {
                // これあるとなんか上手く解決してくれない
//                if (rel_vel.dot(dir) <= 0) 
                {
                    double dif = sqrt(min_dist) - sqrt(cur_dist);
                    if (m_move[e.x] && m_move[e.y]) {
                        m_vel_dif[e.x].update(dir, -0.5 * dif * m_len_fix);
                        m_vel_dif[e.y].update(dir, 0.5 * dif * m_len_fix);
                    }
                    else if (m_move[e.x]) {
                        m_vel_dif[e.x].update(dir, -dif * m_len_fix);
                    }
                    else {
                        m_vel_dif[e.y].update(dir, dif * m_len_fix);
                    }
                }
            }
            else if (cur_dist > max_dist) {
//                if (rel_vel.dot(dir) >= 0)
                {
                    double dif = sqrt(cur_dist) - sqrt(max_dist);
                    if (m_move[e.x] && m_move[e.y]) {
                        m_vel_dif[e.x].update(dir, 0.5 * dif * m_len_fix);
                        m_vel_dif[e.y].update(dir, -0.5 * dif * m_len_fix);
                    }
                    else if (m_move[e.x]) {
                        m_vel_dif[e.x].update(dir, dif * m_len_fix);
                    }
                    else {
                        m_vel_dif[e.y].update(dir, -dif * m_len_fix);
                    }
                }
            }
        }
        // グラフ描画力学モデルのクーロン力
        if (m_coulomb > 0.0) {
            for (int i = 0; i < m_pos.size(); i++) {
                for (int j = i + 1; j < m_pos.size(); j++) {
                    if (!m_move[i] && !m_move[j]) continue;
                    if (m_adj[i].count(j)) continue;
                    Vec2 dir = m_pos[j] - m_pos[i];
                    double dist_sq = std::max(0.01 * m_scale * m_scale, dir.lengthSq());
                    if (dist_sq < EPS) {
                        dist_sq = 0.01 * m_scale * m_scale;
                        dir.set(1.0, 0.0);
                    }
                    dir.normalize();
                    double force = m_coulomb / dist_sq * m_scale * m_scale;
                    if (m_move[i]) {
                        m_vel[i].x -= force * dir.x;
                        m_vel[i].y -= force * dir.y;
                    }
                    if (m_move[j]) {
                        m_vel[j].x += force * dir.x;
                        m_vel[j].y += force * dir.y;
                    }
                }
            }
        }

        for (int i = 0; i < m_pos.size(); i++) {
            m_vel_dif[i].apply(m_vel[i]);
            m_pos[i].x += m_vel[i].x / (cFrame * cRepeatNum);
            m_pos[i].y += m_vel[i].y / (cFrame * cRepeatNum);
        }
    }
    m_hole.draw(Palette::Gray);
    int idx = 0;
    for (auto& e : m_edge) {
        int i = idx;
        ++idx;
        const auto& src = m_pos[e.x];
        const auto& dst = m_pos[e.y];
        auto line = Line(src, dst);
        bool contain = ::containSegment(m_hole, m_edge_line, line);
        const double cur_dist = line.lengthSq();
        const double min_dist = m_default_len[i] * (1 - m_epsilon);
        const double max_dist = m_default_len[i] * (1 + m_epsilon);
        line.draw(1.0, !contain ? Palette::Red : min_dist <= cur_dist && cur_dist <= max_dist ? Palette::Blue : Palette::Orange);
    }
    for (int i = 0; i < m_pos.size(); i++) {
        if (!m_move[i]) {
            Shape2D::Cross(6.0, 2.0, m_pos[i]).draw(Palette::Black);
        }
        else {
            Circle(m_pos[i], 4.0).draw(i == m_selected ? Palette::Black : Palette::White);
        }
    }
}
