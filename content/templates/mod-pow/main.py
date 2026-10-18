import sys


def mod_pow(a, b, m):
    """a^b mod m by binary exponentiation: O(log b) multiplications."""
    a %= m
    result = 1 % m          # 1 % m handles m == 1
    while b > 0:
        if b & 1:
            result = result * a % m
        a = a * a % m
        b >>= 1
    return result


def main():
    data = sys.stdin.read().split()
    t = int(data[0])
    out = []
    for i in range(t):
        a, b, m = (int(x) for x in data[1 + 3 * i: 4 + 3 * i])
        out.append(str(mod_pow(a, b, m)))
    print("\n".join(out))


main()