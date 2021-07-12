#!/bin/bash
set -ux
./kissat/build/kissat -q $1.cnf > ${1}_sat.txt
