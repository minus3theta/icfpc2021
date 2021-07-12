#!/bin/bash
set -x

problem_num=$1
hint_file=$2

./gen_cnf.sh $problem_num $hint
./solve.sh $1
./gen_hint_sol_json.sh $1
