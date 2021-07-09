#include <bits/stdc++.h>
//from https://qiita.com/yohm/items/0f389ba5c5de4e2df9cf
#include <nlohmann/json.hpp>

// for convenience
using json = nlohmann::json;

typedef long long ll;
using namespace std;
#define rep(i,n) for(int i=0;i<(int)(n);i++)
#define rep1(i,n) for(int i=1;i<=(int)(n);i++)



void readInput(json &j){
  string s;
  cin >> s;
  j = json::parse(s);
}

void writeOutput(json &j){
  cout << j["hole"].size() << endl;
  rep(i,j["hole"].size()){
    cout << j["hole"][i][0] << " " << j["hole"][i][1]<< endl;;// <<" " << i.second << endl;
  }
  cout << j["figure"]["edges"].size() << endl;
  rep(i,j["figure"]["edges"].size()){
    cout << j["figure"]["edges"][i][0] << " " << j["figure"]["edges"][i][1]<< endl;;// <<" " << i.second << endl;
  }
  cout << j["figure"]["vertices"].size() << endl;
  rep(i,j["figure"]["vertices"].size()){
    cout << j["figure"]["vertices"][i][0] << " " << j["figure"]["vertices"][i][1]<< endl;;// <<" " << i.second << endl;
  }
  cout << j["epsilon"] << endl;
}

int main(){
  ios::sync_with_stdio(false);
  cin.tie(0);

  json j;
  readInput(j);
  writeOutput(j);

  return 0;
}




