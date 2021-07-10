#!/bin/bash
set -eux
num=$1
cat ../../problems_txt/$num.txt ../../hori1991/innerpoint/${num}_innerpoint.txt | ./a.out > $num.cnf
