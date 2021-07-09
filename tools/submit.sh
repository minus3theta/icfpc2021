#!/bin/bash -eu

# Usage
# $ ./submit.sh 1 my-solution.json

curl -H "Authorization: Bearer $GTF_API_KEY" --data @$2 "https://poses.live/api/problems/$1/solutions"
