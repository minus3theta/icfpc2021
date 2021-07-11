# How to Use

頂点を左クリックで選ぶと引っ張れます。右クリックで頂点を固定でき、もう一度クリックすると固定を解除できます。
頂点がホール内に収まるようにする力、頂点間の距離が制約を満たすようにする力をかけることで、物理シミュレーションにより制約をみたす配置を見つけることを目指しますが、残念ながら線分の当たりはサポートされていません。

# GUI

* Readボタン : 左隣のテキストボックスに問題番号を入れると該当するファイルを読みます
* Read Solutionボタン : 頂点配置が書かれたJSONファイルを読み込みます
* Write Solutionボタン : 現在の頂点配置をJSONファイルに書き出します
* スライダー1 : フレーム単位の速度減衰率です。
* スライダー2 : 距離制約に対する力の強さです。
* スライダー3 : 頂点をホール内に収めようとする力の強さです。
* Write Hint: SATソルバー向けに各頂点の配置位置候補を書き出します
* スライダー4 : 上記において候補とする頂点のチェビシェフ距離