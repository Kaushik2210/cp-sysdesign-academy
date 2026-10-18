#include <bits/stdc++.h>
using namespace std;

struct DSU {
    vector<int> parent, sz;
    explicit DSU(int n) : parent(n), sz(n, 1) { iota(parent.begin(), parent.end(), 0); }

    int find(int x) {
        int root = x;
        while (parent[root] != root) root = parent[root];
        while (parent[x] != root) { // path compression
            int next = parent[x];
            parent[x] = root;
            x = next;
        }
        return root;
    }

    bool unite(int a, int b) {
        a = find(a);
        b = find(b);
        if (a == b) return false;
        if (sz[a] < sz[b]) swap(a, b);
        parent[b] = a;
        sz[a] += sz[b];
        return true;
    }
};

int main() {
    int n, q;
    scanf("%d %d", &n, &q);
    DSU dsu(n + 1);
    while (q--) {
        int t, a, b;
        scanf("%d %d %d", &t, &a, &b);
        if (t == 1) dsu.unite(a, b);
        else puts(dsu.find(a) == dsu.find(b) ? "YES" : "NO");
    }
    return 0;
}