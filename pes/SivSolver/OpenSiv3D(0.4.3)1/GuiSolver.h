#pragma once

# include <Siv3D.hpp> // OpenSiv3D v0.4.3
#include <set>

class GuiSolver {
public:
	explicit GuiSolver();
	~GuiSolver() {}
	bool read(const FilePath& file);
	void readSolution(const FilePath& file);
	void write(const FilePath& file, bool to_int = false);
	void writeHint(const FilePath& file, const FilePath& inner_file, int32 hint_dist) const;
	double getDislike() const;
	void update();
private:
	Polygon m_hole;
	Array<Vector2D<int32>> m_edge;
	std::vector<std::set<int32>> m_adj;
	Array<Line> m_edge_line;
	Array<double> m_default_len;
	double m_epsilon;
	Array<Vec2> m_pos;
	Array<Vec2> m_vel;
	Array<bool> m_move;
	double m_vel_reduce;
	double m_len_fix;
	double m_col_fix;
	double m_edge_col_fix;
	double m_coulomb;
	double m_scale;
	int32 m_selected;
};
