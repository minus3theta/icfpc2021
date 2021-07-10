#!/bin/bash -e

echo 'id,holes,edges,vertices,epsilon,bonus_bonus,bonus_problem,bonus_position' > stat.csv
paste -d , <(seq 88) \
  <(seq 88 | xargs printf "../../problems/%d.json\n" | xargs -n1 \
  jq -r '[(.hole|length),(.figure.edges|length),(.figure.vertices|length),.epsilon,.bonuses[0].bonus,.bonuses[0].problem,.bonuses[0].position|tostring]|@csv')\
  >> stat.csv
