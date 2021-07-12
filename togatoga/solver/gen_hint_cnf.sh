#!/bin/bash
set -eux

num=$1
hint_file=$2

./a.out ../../problems_txt/$num.txt ../../hori1991/innerpoint/${num}_innerpoint.txt $hint_file $num.cnf
