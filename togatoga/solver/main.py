from random import sample

if __name__ == '__main__':
    n = int(input())
    points = []
    for i in range(n):
        x, y = map(int, input().split())
        points.append((x, y))

    k = 1000
    print(k)
    for v in sample(points, k):
        print(v[0], v[1])
