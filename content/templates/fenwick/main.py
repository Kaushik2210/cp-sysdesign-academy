import sys


class Fenwick:
    """Binary indexed tree over 1..n: point update and prefix sum in O(log n)."""

    def __init__(self, n):
        self.n = n
        self.t = [0] * (n + 1)

    def add(self, i, delta):
        while i <= self.n:
            self.t[i] += delta
            i += i & -i             # next node that covers i

    def prefix(self, i):
        s = 0
        while i > 0:
            s += self.t[i]
            i -= i & -i             # drop the lowest set bit
        return s

    def range_sum(self, l, r):
        return self.prefix(r) - self.prefix(l - 1)


def main():
    data = sys.stdin.read().split()
    n, q = int(data[0]), int(data[1])
    fw = Fenwick(n)
    for i in range(1, n + 1):
        fw.add(i, int(data[1 + i]))
    pos = 2 + n
    out = []
    for _ in range(q):
        t, a, b = int(data[pos]), int(data[pos + 1]), int(data[pos + 2])
        pos += 3
        if t == 1:
            fw.add(a, b)
        else:
            out.append(str(fw.range_sum(a, b)))
    print("\n".join(out))


main()