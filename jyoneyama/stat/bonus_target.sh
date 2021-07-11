#!/bin/bash -e

echo 'digraph G {' > bonus.dot

paste -d "" <(seq 132) \
  <(seq 132 | xargs printf "../../problems/%d.json\n" | xargs -n1 \
  jq -r '"->"+([.bonuses[]|.problem|tostring]|join(","))+";"')\
  >> bonus.dot

echo '}' >> bonus.dot
