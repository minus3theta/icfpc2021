#!/bin/bash
set -x

problem_num=$1
hint=$2

./gen_hint_cnf.sh $problem_num $hint
./solve.sh $problem_num
./gen_hint_sol_json.sh $problem_num
