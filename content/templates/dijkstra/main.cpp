#include <bits/stdc++.h>
using namespace std;

const long long INF = LLONG_MAX / 4;

// Shortest distances from src with non-negative weights in O((V + E) log V).
vector<long long> dijkstra(int n, const vector<vector<pair<int, long long>>>& adj, int src) {
    vector<long long> dist(n + 1, INF);
    priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq;
    dist[src] = 0;
    pq.push({0, src});
    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();
        if (d > dist[u]) continue; // stale entry
        for (auto [v, w] : adj[u]) {
            if (d + w < dist[v]) {
                dist[v] = d + w;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}

int main() {
    int n, m, s;
    scanf("%d %d %d", &n, &m, &s);
    vector<vector<pair<int, long long>>> adj(n + 1);
    for (int i = 0; i < m; i++) {
        int u, v;
        long long w;
        scanf("%d %d %lld", &u, &v, &w);
        adj[u].push_back({v, w});
        adj[v].push_back({u, w}); // undirected graph
    }
    vector<long long> dist = dijkstra(n, adj, s);
    for (int v = 1; v <= n; v++) printf("%lld%c", dist[v] >= INF ? -1LL : dist[v], v < n ? ' ' : '\n');
    return 0;
}