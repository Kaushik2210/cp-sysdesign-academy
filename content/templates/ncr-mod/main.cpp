#include <bits/stdc++.h>
using namespace std;

const long long MOD = 1000000007LL;

long long power(long long a, long long b) {
    long long r = 1;
    a %= MOD;
    while (b > 0) {
        if (b & 1) r = r * a % MOD;
        a = a * a % MOD;
        b >>= 1;
    }
    return r;
}

int main() {
    int q;
    scanf("%d", &q);
    vector<int> ns(q), ks(q);
    int n_max = 1;
    for (int i = 0; i < q; i++) {
        scanf("%d %d", &ns[i], &ks[i]);
        n_max = max(n_max, ns[i]);
    }
    vector<long long> fact(n_max + 1), inv_fact(n_max + 1);
    fact[0] = 1;
    for (int i = 1; i <= n_max; i++) fact[i] = fact[i - 1] * i % MOD;
    inv_fact[n_max] = power(fact[n_max], MOD - 2); // Fermat's little theorem
    for (int i = n_max; i > 0; i--) inv_fact[i - 1] = inv_fact[i] * i % MOD;
    for (int i = 0; i < q; i++) {
        int n = ns[i], k = ks[i];
        if (k < 0 || k > n) puts("0");
        else printf("%lld\n", fact[n] * inv_fact[k] % MOD * inv_fact[n - k] % MOD);
    }
    return 0;
}