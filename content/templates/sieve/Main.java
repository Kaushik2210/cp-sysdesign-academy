import java.io.*;
import java.util.*;

public class Main {
    // composite[i] is true when i is not prime (for i >= 2). O(n log log n).
    static boolean[] sieve(int n) {
        boolean[] composite = new boolean[n + 1];
        for (long i = 2; i * i <= n; i++) {
            if (!composite[(int) i]) {
                for (long j = i * i; j <= n; j += i) composite[(int) j] = true;
            }
        }
        return composite;
    }

    public static void main(String[] args) throws IOException {
        StreamTokenizer in = new StreamTokenizer(new BufferedInputStream(System.in));
        in.nextToken();
        int n = (int) in.nval;
        in.nextToken();
        int q = (int) in.nval;
        boolean[] composite = sieve(n);
        StringBuilder sb = new StringBuilder();
        while (q-- > 0) {
            in.nextToken();
            int x = (int) in.nval;
            sb.append(x >= 2 && !composite[x] ? "YES" : "NO").append('\n');
        }
        System.out.print(sb);
    }
}