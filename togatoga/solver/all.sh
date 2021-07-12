#!/bin/bash
set -x

./gen_cnf.sh $1 $2
./solve.sh $1
./gen_sol_json.sh $1
