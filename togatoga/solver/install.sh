#!/bin/bash
git submodule update --init
cd kissat; ./configure; cd build
make -j4
cd ../../
g++ -O3 -std=c++17 main.cpp -lpthread
