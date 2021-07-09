CC = gcc
CFAGS = -lstdc++
%: %.cpp
	# $(CC) -o $@ $< -lstdc++ -std=c++17 -O2 -fsanitize=undefined,address #-Wextra
# ifstream fin("/Users/mochippttee/Desktop/programing/atcoder/Marathon/AHC/AHC003/inMD/0024.txt");
	$(CC) -o $@ $< -lstdc++ -std=c++17 -O3
clean: 
	rm -f *.o
