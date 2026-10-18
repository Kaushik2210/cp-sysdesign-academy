#include <bits/stdc++.h>
using namespace std;

// a^b mod m by binary exponentiation. Requires m <= about 3*10^9 so products fit in long long.
long long mod_pow(long long a, long long b, long long m) {
    a %= m;
    long long result = 1 % m; // 1 % m handles m == 1
    while (b > 0) {
        if (b & 1) result = result * a % m;
        a = a * a % m;
        b >>= 1;
    }
    return result;
}

int main() {
    int t;
    scanf("%d", &t);
    while (t--) {
        long long a, b, m;
        scanf("%lld %lld %lld", &a, &b, &m);
        printf("%lld\n", mod_pow(a, b, m));
    }
    return 0;
}