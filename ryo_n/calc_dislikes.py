#!/usr/bin/env python3

import json
import os


def is_intersect(ax, ay, bx, by, cx, cy, dx, dy):
    ta = (cx - dx) * (ay - cy) + (cy - dy) * (cx - ax)
    tb = (cx - dx) * (by - cy) + (cy - dy) * (cx - bx)
    tc = (ax - bx) * (cy - ay) + (ay - by) * (ax - cx)
    td = (ax - bx) * (dy - ay) + (ay - by) * (ax - dx)

    return tc * td < 0 and ta * tb < 0


def check_intersects(figure_edges, sol_vertices, hole):
    for a, b in figure_edges:
        ax = sol_vertices[a][0]
        ay = sol_vertices[a][1]
        bx = sol_vertices[b][0]
        by = sol_vertices[b][1]
        for c, d in zip(hole, hole[1:]):
            cx = c[0]
            cy = c[1]
            dx = d[0]
            dy = d[1]
            if is_intersect(ax, ay, bx, by, cx, cy, dx, dy):
                return False

    return True


def calc_distance(ax, ay, bx, by):
    return (ax - bx) ** 2 + (ay - by) ** 2


def check_length(figure_edges, figure_vertices, sol_vertices, epsilon):
    for a, b in figure_edges:
        ax = sol_vertices[a][0]
        ay = sol_vertices[a][1]
        bx = sol_vertices[b][0]
        by = sol_vertices[b][1]

        d_ab = calc_distance(ax, ay, bx, by)

        cx = figure_vertices[a][0]
        cy = figure_vertices[a][1]
        dx = figure_vertices[b][0]
        dy = figure_vertices[b][1]

        d_cd = calc_distance(cx, cy, dx, dy)

        if abs((d_cd / d_ab) - 1) > (epsilon / 1000000):
            return False

    return True


def calculate_dislikes(sol_vertices, hole):
    dislikes = 0
    for h in hole[:-1]:
        mi = float("inf")
        for v in sol_vertices:
            ax = h[0]
            ay = h[1]
            bx = v[0]
            by = v[1]

            d_ab = calc_distance(ax, ay, bx, by)
            mi = min(mi, d_ab)

        dislikes += mi

    return dislikes


def main():
    total_dislikes = 0

    for problem_no in range(1, 100):
        file_name = str(problem_no) + ".json"
        input_file_path = os.path.join("../problems/", file_name)
        solution_file_path = os.path.join("../solutions/", file_name)

        # 解答が存在しないのでskip
        if not os.path.isfile(solution_file_path):
            continue

        input_json_file = open(input_file_path, "r")
        input_json_load = json.load(input_json_file)
        hole = input_json_load["hole"]

        hole.append(hole[0])

        figure_edges = input_json_load["figure"]["edges"]
        figure_vertices = input_json_load["figure"]["vertices"]

        epsilon = input_json_load["epsilon"]

        sol_json_file = open(solution_file_path, "r")
        sol_json_load = json.load(sol_json_file)
        sol_vertices = sol_json_load["vertices"]

        if not check_intersects(figure_edges, sol_vertices, hole):
            print("Problem:", problem_no, "Dislikes:", -1, "failed check_intersects")
            continue

        if not check_length(figure_edges, figure_vertices, sol_vertices, epsilon):
            print("Problem:", problem_no, "Dislikes:", -1, "failed check_length")
            continue

        dislikes = calculate_dislikes(sol_vertices, hole)
        print("Problem:", problem_no, "Dislikes:", dislikes)
        total_dislikes += dislikes

    print("TotalDislikes:", total_dislikes)


if __name__ == '__main__':
    main()
