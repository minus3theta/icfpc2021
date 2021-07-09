#!/bin/bash

if [ -z $1 ]; then
    echo "Usage: ./tester.sh ./main"
    exit 1
fi

solveCommand=$@

idx=0
scoreSum=0
inputIds=()
for i in ` seq 1 59`
do
    id=`printf %d ${i}`
    inputIds+=(${id})
done    
for inputId in ${inputIds[@]}; do
    $solveCommand < ../../problems/${inputId}.json 1> ../../problems_txt/${inputId}.txt
    idx=$(($idx+1))
done

