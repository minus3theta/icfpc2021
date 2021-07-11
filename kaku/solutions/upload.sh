#!/bin/bash -eux

# Usage
# $ ./upload.sh

for problem_id in `seq 108 108`
do
  curl -X POST -H "Content-Type: application/json" --data @./${problem_id}.solution http://34.146.27.136/api/problems/${problem_id}/solutions/kaku
done
