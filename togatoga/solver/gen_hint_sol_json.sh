#!/bin/bash
set -eux
num=$1
python3 parse.py --kiss --sat ${num}_sat.txt --problem ../../problems_txt/$num.txt --internal ../../hori1991/innerpoint/${num}_innerpoint.txt --hint ../../hori1991/innerpoint/${num}_innerpoint.txt_hint_points.txt > ${num}_out.json
