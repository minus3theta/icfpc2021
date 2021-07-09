#!/bin/bash -eux

# Usage
# $ ./submit.sh 1 my-solution.json

curl -H "Authorization: Bearer $GTF_API_KEY" --data @$2 "https://poses.live/api/problems/$1/solutions"

user_name=`git config user.name`
curl -X POST -H "Content-Type: application/json" --data @$2 http://34.146.27.136/api/problems/$1/solutions/$user_name
