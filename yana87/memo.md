GTF_API_KEY="99065f1a-259a-42cc-a9d5-bbf56deae0ac"

# TODO

## dislikesの合計が0になる問題でholeの点にvertexを割り当てていく
-> 全ての点をholeに割り当てるものと思って失敗

一応そのうちのコードの断片を残しておく。

```cpp
// すでに置かれている点との整合性
for (int nxt : graph[v]) {
    // nxt はまだ置かれていない
    if (v2h[nxt] == -1) continue;

    // 伸縮誤差をチェック
    double org_dist = abs(vertices[v] - vertices[nxt]);
    double new_dist = abs(holes[h] - holes[v2h[nxt]]);
    if (!(abs(new_dist/org_dist - 1.0) <= epsilon/1e6 + EPS)) {
        v2h[v] = -1;
        return false;
    }
}

// 線分に200個等間隔で点をうち、それぞれが穴の外部にないかチェック
for (int nxt : graph[v]) {
    // nxt はまだ置かれていない
    if (v2h[nxt] == -1) continue;
    rep(k,200) {
        double m1 = k, m2 = 200-k;
        Point idp = (holes[h] * m1 + holes[v2h[nxt]] * m2) / (m1 + m2);
        if (inPolygon(idp, holes) == 0) {
            v2h[v] = -1;
            return false;
        }
    }
}
```

### 84
0:6
1:4
2:1
3:8
4: -1
5:16
6:31
7:33
8:30
9:27
10:25
11:26
12:32
13:29
14:14
15:2

### それぞれのedgeがholeの辺に重ねられるか検証


## 平行移動, 回転, 反転 でValidな解を投げる

### 68
111 24 -> 284 162
+173, +138

## Problem

### 12
1辺正方形をくの字にする
d(p,q) = 800

```json
"hole":[[28,0],[56,4],[0,4]]
```

```json
{"vertices":[[0,20],[20,0],[20,40],[40,20]]}
```

```json
{"vertices":[[0,4],[28,0],[28,0],[56,4]]}
```

AC!