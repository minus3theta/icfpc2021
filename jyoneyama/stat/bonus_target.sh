#!/bin/bash -e

echo 'digraph G {' > bonus.dot

paste -d "" <(seq 106) \
  <(seq 106 | xargs printf "../../problems/%d.json\n" | xargs -n1 \
  jq -r '"->"+([.bonuses[]|.problem|tostring]|join(","))+";"')\
  >> bonus.dot

echo '}' >> bonus.dot

# problems with no bonuses are not handled correctly
# manually commenting out "104->;" and "105->;"
