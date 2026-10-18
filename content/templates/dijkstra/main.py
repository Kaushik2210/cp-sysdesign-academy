import heapq
import sys

INF = float("inf")


def dijkstra(n, adj, src):
    """Shortest distances from src with non-negative weights in O((V + E) log V)."""
    dist = [INF] * (n + 1)
    dist[src] = 0
    heap = [(0, src)]
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            continue                    # stale entry: u was already settled with a smaller distance
        for v, w in adj[u]:
            nd = d + w
            if nd < dist[v]:
                dist[v] = nd
                heapq.heappush(heap, (nd, v))
    return dist


def main():
    data = sys.stdin.read().split()
    n, m, s = int(data[0]), int(data[1]), int(data[2])
    adj = [[] for _ in range(n + 1)]
    for i in range(m):
        u, v, w = int(data[3 + 3 * i]), int(data[4 + 3 * i]), int(data[5 + 3 * i])
        adj[u].append((v, w))
        adj[v].append((u, w))           # undirected graph
    dist = dijkstra(n, adj, s)
    print(" ".join("-1" if dist[v] == INF else str(dist[v]) for v in range(1, n + 1)))


main()