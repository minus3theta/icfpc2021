import json
import argparse
from collections import defaultdict

def parse_sat(file):
    with open(file, 'r') as f:
        status = f.readline().rstrip()
        assert status == "SAT"
        variables = list(map(int, f.readline().rstrip().split()))
        return variables[:-1]

def parse_problem(file):
    with open(file, 'r') as f:
        line = f.readline().rstrip()
        hole_num = int(line)
        for i in range(hole_num):
            line = f.readline().rstrip()
            x, y = map(int, line.split())
        edge_num = int(f.readline().rstrip())
        for i in range(edge_num):
            line = f.readline().rstrip()
            a, b = map(int, line.split())
        fig_num = int(f.readline().rstrip())
        for i in range(fig_num):
            line = f.readline().rstrip()
            x, y = map(int, line.split())
        eps = f.readline().rstrip()
        return fig_num

def parse_internal(file):
    index_to_point = []
    with open(file, 'r') as f:
        line = f.readline().rstrip()
        internal_point_num = int(line)
        for i in range(internal_point_num):
            line = f.readline().rstrip()
            x, y = map(int, line.split())
            index_to_point.append((x, y))
        return index_to_point

def parse_kissat(file):
    variables = []
    with open(file, 'r') as f:
        status = f.readline().rstrip()
        assert status == "s SATISFIABLE"
        for line in f:
            tmps = map(int, line.rstrip().split()[1:])
            for v in tmps:
                if v != 0:
                    variables.append(v)
        #variables = list(map(int, f.readline().rstrip().split()))
        #return variables[:-1]
    return variables
if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="SAT result to answer")
    parser.add_argument('--sat', required=True)
    parser.add_argument('--problem', required=True)
    parser.add_argument('--internal', required=True)
    parser.add_argument('--kiss', action=argparse.BooleanOptionalAction)
    args = parser.parse_args()
    if args.kiss:
        variables = parse_kissat(args.sat)
    else:
        variables = parse_sat(args.sat)
    fig_num = parse_problem(args.problem)
    index_to_point = parse_internal(args.internal)
    vertices = []
    for (i, v) in enumerate(variables):
        if v > 0:
            (x, y) = index_to_point[i % len(index_to_point)]
            vertices.append((x, y))
        if len(vertices) >= fig_num:
            break
    results = {'vertices': vertices}
    print(json.dumps(results))
