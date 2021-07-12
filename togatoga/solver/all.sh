#!/bin/bash
set -ux

./gen_cnf.sh $1
./solve.sh $1
./gen_sol_json.sh $1
