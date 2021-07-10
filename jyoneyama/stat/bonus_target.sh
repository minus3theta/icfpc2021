#!/bin/bash -e

echo 'digraph G {' > bonus.dot

paste -d "" <(seq 88) \
  <(seq 88 | xargs printf "../../problems/%d.json\n" | xargs -n1 \
  jq -r '"->"+(.bonuses[0].problem|tostring)+";"')\
  >> bonus.dot

echo '}' >> bonus.dot
