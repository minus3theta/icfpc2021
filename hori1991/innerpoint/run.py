from shapely.geometry import Point, Polygon
import json
import sys

print(sys.argv[1])
with open(sys.argv[1], 'r') as f:
    data = json.load(f)

hole = data["hole"]
poly = Polygon(hole)
maxX = hole[0][0]
maxY = hole[0][1]
for p in hole:
    maxX = max(maxX, p[0])
    maxY = max(maxY, p[1])

ans = []
for i in range(0, maxX + 1):
    for j in range(0, maxY + 1):
        p = Point(i, j)
        if p.within(poly):
            ans.append(p)
        else:
            for k in range(0, len(hole)):
                l = (k + 1) % len(hole)
                p1 = Point(hole[k])
                p2 = Point(hole[l])
                q = Point(p1.x-p2.x, p1.y-p2.y)
                r = Point(p1.x-p.x, p1.y-p.y)
                s = Point(p2.x-p.x, p2.y-p.y)
                cross_prod = q.x * r.y - q.y * r.x
                inner_prod1 = q.x*r.x + q.y*r.y
                inner_prod2 = q.x*s.x + q.y*s.y
                if cross_prod == 0 and (inner_prod1 * inner_prod2) <= 0:
                    ans.append(p)
                    break

print(sys.argv[2])
with open(sys.argv[2], 'w') as f:
    f.write(str(len(ans)))
    f.write('\n')
    for p in ans:
        f.write("{} {}\n".format(int(p.x), int(p.y)))
