#!/usr/bin/env python

import json
import sys
import argparse
from io import IOBase


def problem_from_json(input: IOBase):
    problem = json.load(input)

    print(len(problem['hole']))
    for [x, y] in problem['hole']:
        print(f'{x} {y}')

    figure = problem['figure']
    print(len(figure['edges']))
    for [a, b] in figure['edges']:
        print(f'{a} {b}')
    print(len(figure['vertices']))
    for [x, y] in figure['vertices']:
        print(f'{x} {y}')

    print(problem['epsilon'])


def solution_from_json(input: IOBase):
    solution = json.load(input)

    print(len(solution['vertices']))
    for [x, y] in solution['vertices']:
        print(f'{x} {y}')


def read_pairs(input: IOBase):
    v = []
    for _ in range(int(input.readline())):
        v.append(list(map(int, input.readline().split())))
    return v


def problem_to_json(input: IOBase):
    obj = {}

    obj['hole'] = read_pairs(input)

    figure = {}
    figure['edges'] = read_pairs(input)
    figure['vertices'] = read_pairs(input)
    obj['figure'] = figure

    epsilon = int(input.readline())
    obj['epsilon'] = epsilon

    print(json.dumps(obj))


def solution_to_json(input: IOBase):
    obj = {}
    obj['vertices'] = read_pairs(input)

    print(json.dumps(obj))


def main():
    parser = argparse.ArgumentParser(
        description='''Problem/solution conversion tool.
        By default, converts problem JSON into problem text.''')
    parser.add_argument('-s', '--solution', action='store_true',
                        help='Convert solution instead of problem')
    parser.add_argument('-t', '--text', action='store_true',
                        help='Convert text into JSON insetad of the opposite')

    args = parser.parse_args()

    if args.solution:
        if args.text:
            solution_to_json(sys.stdin)
        else:
            solution_from_json(sys.stdin)
    else:
        if args.text:
            problem_to_json(sys.stdin)
        else:
            problem_from_json(sys.stdin)


if __name__ == '__main__':
    main()
