#!/bin/bash -e

seq 59 | xargs printf "%d.json\n" | xargs -n1 jq -r '[(.hole|length),(.figure.edges|length),(.figure.vertices|length),.epsilon]|@csv' > stat.csv
