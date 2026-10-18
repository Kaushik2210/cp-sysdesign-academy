import sys

MOD = 10**9 + 7


def build(n_max):
    """Factorials and inverse factorials modulo a prime, O(n_max)."""
    fact = [1] * (n_max + 1)
    for i in range(1, n_max + 1):
        fact[i] = fact[i - 1] * i % MOD
    inv_fact = [1] * (n_max + 1)
    inv_fact[n_max] = pow(fact[n_max], MOD - 2, MOD)   # Fermat's little theorem
    for i in range(n_max, 0, -1):
        inv_fact[i - 1] = inv_fact[i] * i % MOD
    return fact, inv_fact


def main():
    data = sys.stdin.read().split()
    q = int(data[0])
    pairs = [(int(data[1 + 2 * i]), int(data[2 + 2 * i])) for i in range(q)]
    n_max = max([n for n, _ in pairs] + [1])
    fact, inv_fact = build(n_max)
    out = []
    for n, k in pairs:
        if k < 0 or k > n:
            out.append("0")
        else:
            out.append(str(fact[n] * inv_fact[k] % MOD * inv_fact[n - k] % MOD))
    print("\n".join(out))


main()