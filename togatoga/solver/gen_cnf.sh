#!/bin/bash
set -ex
num=$1
minimum_dislike=$2
./a.out ../../problems_txt/$num.txt ../../hori1991/innerpoint/${num}_innerpoint.txt $num.cnf $minimum_dislike
