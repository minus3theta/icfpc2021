#!/bin/bash
set -eux
num=$1
./a.out ../../problems_txt/$num.txt ../../hori1991/innerpoint/${num}_innerpoint.txt $num.cnf
