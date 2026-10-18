import java.io.*;
import java.util.*;

public class Main {
    static int[] parent, size;

    static int find(int x) {
        int root = x;
        while (parent[root] != root) root = parent[root];
        while (parent[x] != root) { // path compression
            int next = parent[x];
            parent[x] = root;
            x = next;
        }
        return root;
    }

    static void union(int a, int b) {
        a = find(a);
        b = find(b);
        if (a == b) return;
        if (size[a] < size[b]) { int t = a; a = b; b = t; }
        parent[b] = a;
        size[a] += size[b];
    }

    public static void main(String[] args) throws IOException {
        StreamTokenizer in = new StreamTokenizer(new BufferedInputStream(System.in));
        in.nextToken();
        int n = (int) in.nval;
        in.nextToken();
        int q = (int) in.nval;
        parent = new int[n + 1];
        size = new int[n + 1];
        for (int i = 0; i <= n; i++) { parent[i] = i; size[i] = 1; }
        StringBuilder sb = new StringBuilder();
        while (q-- > 0) {
            in.nextToken();
            int t = (int) in.nval;
            in.nextToken();
            int a = (int) in.nval;
            in.nextToken();
            int b = (int) in.nval;
            if (t == 1) union(a, b);
            else sb.append(find(a) == find(b) ? "YES" : "NO").append('\n');
        }
        System.out.print(sb);
    }
}