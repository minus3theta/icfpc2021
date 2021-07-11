#!/bin/bash -e

echo 'id,holes,edges,vertices,epsilon,bonus_0_bonus,bonus_0_problem,bonus_1_bonus,bonus_1_problem,bonus_2_bonus,bonus_2_problem' > stat.csv
paste -d , <(seq 132) \
  <(seq 132 | xargs printf "../../problems/%d.json\n" | xargs -n1 \
  jq -r '[(.hole|length),(.figure.edges|length),(.figure.vertices|length),.epsilon]+([.bonuses[]|[.bonus,.problem]]|flatten)|@csv')\
  >> stat.csv
