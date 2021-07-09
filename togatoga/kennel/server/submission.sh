#!/bin/bash -eu
user_name=`git config user.name`

curl -X POST -H "Content-Type: application/json" --data @$2 http://localhost:1323/api/problems/$1/solutions/$user_name
