#!/bin/bash
set -eux
./kissat/build/kissat -q $1.cnf > ${1}_sat.txt
