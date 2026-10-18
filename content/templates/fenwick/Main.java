import java.io.*;
import java.util.*;

public class Main {
    static int n;
    static long[] t;

    static void add(int i, long delta) {
        for (; i <= n; i += i & -i) t[i] += delta; // next node that covers i
    }

    static long prefix(int i) {
        long s = 0;
        for (; i > 0; i -= i & -i) s += t[i]; // drop the lowest set bit
        return s;
    }

    public static void main(String[] args) throws IOException {
        StreamTokenizer in = new StreamTokenizer(new BufferedInputStream(System.in));
        in.nextToken();
        n = (int) in.nval;
        in.nextToken();
        int q = (int) in.nval;
        t = new long[n + 1];
        for (int i = 1; i <= n; i++) {
            in.nextToken();
            add(i, (long) in.nval);
        }
        StringBuilder sb = new StringBuilder();
        while (q-- > 0) {
            in.nextToken();
            int type = (int) in.nval;
            in.nextToken();
            int a = (int) in.nval;
            in.nextToken();
            long b = (long) in.nval;
            if (type == 1) add(a, b);
            else sb.append(prefix((int) b) - prefix(a - 1)).append('\n');
        }
        System.out.print(sb);
    }
}