import sys


def sieve(n):
    """Return is_prime[0..n] using the Sieve of Eratosthenes in O(n log log n)."""
    is_prime = bytearray([1]) * (n + 1)
    is_prime[0] = 0
    if n >= 1:
        is_prime[1] = 0
    i = 2
    while i * i <= n:
        if is_prime[i]:
            # Every composite is crossed out first by its smallest prime factor.
            is_prime[i * i::i] = bytearray(len(range(i * i, n + 1, i)))
        i += 1
    return is_prime


def main():
    data = sys.stdin.read().split()
    n, q = int(data[0]), int(data[1])
    is_prime = sieve(n)
    out = ["YES" if is_prime[int(x)] else "NO" for x in data[2:2 + q]]
    print("\n".join(out))


main()