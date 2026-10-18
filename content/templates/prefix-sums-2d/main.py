import sys


def build(grid, r, c):
    """P[i][j] = sum of grid[0..i-1][0..j-1]; P has an extra zero row and column."""
    P = [[0] * (c + 1) for _ in range(r + 1)]
    for i in range(1, r + 1):
        for j in range(1, c + 1):
            P[i][j] = grid[i - 1][j - 1] + P[i - 1][j] + P[i][j - 1] - P[i - 1][j - 1]
    return P


def rect_sum(P, r1, c1, r2, c2):
    """Sum of the rectangle with 1-indexed inclusive corners (r1, c1) to (r2, c2) in O(1)."""
    return P[r2][c2] - P[r1 - 1][c2] - P[r2][c1 - 1] + P[r1 - 1][c1 - 1]


def main():
    data = sys.stdin.read().split()
    r, c, q = int(data[0]), int(data[1]), int(data[2])
    vals = list(map(int, data[3:3 + r * c]))
    grid = [vals[i * c:(i + 1) * c] for i in range(r)]
    P = build(grid, r, c)
    out = []
    pos = 3 + r * c
    for _ in range(q):
        r1, c1, r2, c2 = map(int, data[pos:pos + 4])
        pos += 4
        out.append(str(rect_sum(P, r1, c1, r2, c2)))
    print("\n".join(out))


main()