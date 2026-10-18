import java.io.*;
import java.util.*;

public class Main {
    static final long INF = Long.MAX_VALUE / 4;

    // Shortest distances from src with non-negative weights in O((V + E) log V).
    static long[] dijkstra(int n, List<long[]>[] adj, int src) {
        long[] dist = new long[n + 1];
        Arrays.fill(dist, INF);
        dist[src] = 0;
        PriorityQueue<long[]> pq = new PriorityQueue<>((x, y) -> Long.compare(x[0], y[0]));
        pq.add(new long[] {0, src});
        while (!pq.isEmpty()) {
            long[] top = pq.poll();
            long d = top[0];
            int u = (int) top[1];
            if (d > dist[u]) continue; // stale entry
            for (long[] e : adj[u]) {
                int v = (int) e[0];
                long nd = d + e[1];
                if (nd < dist[v]) {
                    dist[v] = nd;
                    pq.add(new long[] {nd, v});
                }
            }
        }
        return dist;
    }

    @SuppressWarnings("unchecked")
    public static void main(String[] args) throws IOException {
        StreamTokenizer in = new StreamTokenizer(new BufferedInputStream(System.in));
        in.nextToken();
        int n = (int) in.nval;
        in.nextToken();
        int m = (int) in.nval;
        in.nextToken();
        int s = (int) in.nval;
        List<long[]>[] adj = new List[n + 1];
        for (int i = 0; i <= n; i++) adj[i] = new ArrayList<>();
        for (int i = 0; i < m; i++) {
            in.nextToken();
            int u = (int) in.nval;
            in.nextToken();
            int v = (int) in.nval;
            in.nextToken();
            long w = (long) in.nval;
            adj[u].add(new long[] {v, w});
            adj[v].add(new long[] {u, w}); // undirected graph
        }
        long[] dist = dijkstra(n, adj, s);
        StringBuilder sb = new StringBuilder();
        for (int v = 1; v <= n; v++) sb.append(v > 1 ? " " : "").append(dist[v] >= INF ? -1 : dist[v]);
        System.out.println(sb);
    }
}