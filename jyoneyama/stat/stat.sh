#!/bin/bash -e

echo 'id,holes,edges,vertices,epsilon,bonus_0_bonus,bonus_0_problem,bonus_1_bonus,bonus_1_problem' > stat.csv
paste -d , <(seq 106) \
  <(seq 106 | xargs printf "../../problems/%d.json\n" | xargs -n1 \
  jq -r '[(.hole|length),(.figure.edges|length),(.figure.vertices|length),.epsilon,.bonuses[0].bonus,.bonuses[0].problem,.bonuses[1].bonus,.bonuses[1].problem]|@csv')\
  >> stat.csv
