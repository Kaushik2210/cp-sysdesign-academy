import sys


class DSU:
    """Disjoint set union with path compression and union by size: near-constant time per operation."""

    def __init__(self, n):
        self.parent = list(range(n))
        self.size = [1] * n

    def find(self, x):
        root = x
        while self.parent[root] != root:
            root = self.parent[root]
        while self.parent[x] != root:           # compress the path (iterative: no recursion limit)
            self.parent[x], x = root, self.parent[x]
        return root

    def union(self, a, b):
        a, b = self.find(a), self.find(b)
        if a == b:
            return False
        if self.size[a] < self.size[b]:
            a, b = b, a
        self.parent[b] = a
        self.size[a] += self.size[b]
        return True


def main():
    data = sys.stdin.read().split()
    n, q = int(data[0]), int(data[1])
    dsu = DSU(n + 1)
    out = []
    for i in range(q):
        t, a, b = int(data[2 + 3 * i]), int(data[3 + 3 * i]), int(data[4 + 3 * i])
        if t == 1:
            dsu.union(a, b)
        else:
            out.append("YES" if dsu.find(a) == dsu.find(b) else "NO")
    print("\n".join(out))


main()