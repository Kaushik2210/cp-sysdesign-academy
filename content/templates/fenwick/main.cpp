#include <bits/stdc++.h>
using namespace std;

struct Fenwick {
    int n;
    vector<long long> t;
    explicit Fenwick(int n) : n(n), t(n + 1, 0) {}

    void add(int i, long long delta) {
        for (; i <= n; i += i & -i) t[i] += delta; // next node that covers i
    }

    long long prefix(int i) const {
        long long s = 0;
        for (; i > 0; i -= i & -i) s += t[i]; // drop the lowest set bit
        return s;
    }

    long long range_sum(int l, int r) const { return prefix(r) - prefix(l - 1); }
};

int main() {
    int n, q;
    scanf("%d %d", &n, &q);
    Fenwick fw(n);
    for (int i = 1; i <= n; i++) {
        long long x;
        scanf("%lld", &x);
        fw.add(i, x);
    }
    while (q--) {
        int type, a;
        long long b;
        scanf("%d %d %lld", &type, &a, &b);
        if (type == 1) fw.add(a, b);
        else printf("%lld\n", fw.range_sum(a, (int)b));
    }
    return 0;
}