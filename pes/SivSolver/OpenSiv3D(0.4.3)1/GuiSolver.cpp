
# include <Siv3D.hpp> // OpenSiv3D v0.4.3
#include <vector>
#include <cmath>

#include "GuiSolver.h"

constexpr double cScale = 4.0;
constexpr double cOffset = 10.0;
constexpr int cRepeatNum = 4;
constexpr int cFrame = 60;

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

GuiSolver::GuiSolver(const FilePath& file)
    : GuiSolver()
{
    TextReader reader(file);
    String line;

    if (!reader.readLine(line)) throw Error(U"Failed to read size of hole");
    int32 hole_size = Parse<int32>(line);

    Array<Vec2> hole_point(hole_size);
    for (int32 i = 0; i < hole_size; i++) {
        if (!reader.readLine(line)) throw Error(U"Failed to read vertex of hole");
        auto v = line.split(' ');
        if (v.size() != 2) throw Error(U"Invalid format of vertex");
        hole_point[i].x = cScale * Parse<double>(v[0]) + cOffset;
        hole_point[i].y = cScale * Parse<double>(v[1]) + cOffset;
    }
    for (int32 i = 0; i < hole_size; i++) {
        m_edge_line.emplace_back(hole_point[i], hole_point[(i + 1) % hole_size]);
    }
    m_hole = Polygon(hole_point);

    if (!reader.readLine(line)) throw Error(U"Failed to read number of edge");
    int32 edge_num = Parse<int32>(line);
    for (int32 i = 0; i < edge_num; i++) {
        if (!reader.readLine(line)) throw Error(U"Failed to read edge");
        auto v = line.split(' ');
        if (v.size() != 2) throw Error(U"Invalid format of edge");
        m_edge.emplace_back(Parse<double>(v[0]), Parse<double>(v[1]));
    }

    if (!reader.readLine(line)) throw Error(U"Failed to read number of vertex");
    int32 vertex_num = Parse<int32>(line);
    for (int32 i = 0; i < vertex_num; i++) {
        if (!reader.readLine(line)) throw Error(U"Failed to read edge");
        auto v = line.split(' ');
        if (v.size() != 2) throw Error(U"Invalid format of vertex");
        m_pos.emplace_back(cScale * Parse<double>(v[0]) + cOffset, cScale * Parse<double>(v[1] + cOffset));
    }
    // (x-x')*(x-x')+(y-y')*(y-y')
    for (auto& e : m_edge) {
        const auto& src = m_pos[e.x];
        const auto& dst = m_pos[e.y];
        m_default_len.emplace_back(src.distanceFromSq(dst));
    }

    m_vel.assign(vertex_num, Vec2(0.0, 0.0));
    m_move.assign(vertex_num, true);

    if (!reader.readLine(line)) throw Error(U"Failed to read epsilon");
    m_epsilon = 0.95 * 1e-6 * Parse<int32>(line);
}

GuiSolver::GuiSolver()
    : m_vel_reduce(0.99)
    , m_len_fix(0.1)
    , m_col_fix(0.2)
    , m_selected(-1)
{}

void GuiSolver::write(const FilePath& file) {
    TextWriter writer(file);
    writer << m_pos.size();
    for (auto& p : m_pos) {
        writer << p.x << U" " << p.y;
    }
}

void GuiSolver::update() {
    {
        SimpleGUI::Slider(U"{:.3f}"_fmt(m_vel_reduce), m_vel_reduce, 0.0, 1.0, Vec2(800, 260), 60, 150);
        SimpleGUI::Slider(U"{:.3f}"_fmt(m_len_fix), m_len_fix, 0.0, 1.0, Vec2(800, 340), 60, 150);
        SimpleGUI::Slider(U"{:.3f}"_fmt(m_col_fix), m_col_fix, 0.0, 1.0, Vec2(800, 420), 60, 150);
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
        // 掴んでる点がホール内にあって、マウスカーソルがホール外に出たら選択解除
        // if (m_hole.contains(m_pos[m_selected]) && !m_hole.contains(Cursor::PosF())) m_selected = -1;
    } else {
        m_selected = -1;
    }

    if (!MouseL.down() && MouseR.down()) {
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
        for(int i=0;i<m_edge.size();i++){
            const auto& e = m_edge[i];
            if (!m_move[e.x] && !m_move[e.y]) continue;
            const auto& src = m_pos[e.x];
            const auto& dst = m_pos[e.y];
            auto line = Line(src, dst);
            // 枠内に収める処理。バグってる？
            /*
            if (lineInHold(line)) {
                for (auto& l : m_edge_line) {
                    Vec2 closest_src = l.closest(src);
                    Vec2 closest_dst = src;
                    double min_dist = src.distanceFromSq(closest_src);
                    {
                        auto p = l.closest(dst);
                        double cur_dist = dst.distanceFromSq(p);
                        if (cur_dist < min_dist) {
                            min_dist = cur_dist;
                            closest_src = p;
                            closest_dst = dst;
                        }
                    }
                    {
                        auto p = line.closest(l.begin);
                        double cur_dist = p.distanceFromSq(l.begin);
                        if (cur_dist < min_dist) {
                            min_dist = cur_dist;
                            closest_src = l.begin;
                            closest_dst = p;
                        }
                    }
                    {
                        auto p = line.closest(l.end);
                        double cur_dist = p.distanceFromSq(l.end);
                        if (cur_dist < min_dist) {
                            min_dist = cur_dist;
                            closest_src = l.end;
                            closest_dst = p;
                        }
                    }
                    if (1e-4 < min_dist && min_dist < 0.04) {
                        Vec2 dir = closest_dst - closest_src;
                        double depth = sqrt(min_dist);
                        dir.normalize();
                        if (dir.dot(m_vel[e.x]) <= 0.0 && m_move[e.x]) {
                            m_vel_dif[e.x].update(dir, m_col_fix * depth);
                        }
                        if (dir.dot(m_vel[e.y]) <= 0.0 && m_move[e.x]) {
                            m_vel_dif[e.y].update(dir, m_col_fix * depth);
                        }
                    }
                }
            }
            */
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
        bool contain = m_hole.contains(src);
        for (auto& l : m_edge_line) {
            if (!contain) break;
            if (line.intersectsAt(l)) contain = false;
        }
        const double cur_dist = line.lengthSq();
        const double min_dist = m_default_len[i] * (1 - m_epsilon);
        const double max_dist = m_default_len[i] * (1 + m_epsilon);
        line.draw(1.0, !contain ? Palette::Red : min_dist <= cur_dist && cur_dist <= max_dist ? Palette::Blue : Palette::Orange);
    }
    for (int i = 0; i < m_pos.size(); i++) {
        if (!m_move[i]) Circle(m_pos[i], 1.5).draw(Palette::Skyblue);
    }
    if (m_selected != -1) {
        Circle(m_pos[m_selected], 2.5).draw(Palette::Black);
    }
}
