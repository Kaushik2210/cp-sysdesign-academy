import java.io.*;
import java.util.*;

public class Main {
    static final long MOD = 1_000_000_007L;

    static long power(long a, long b) {
        long r = 1;
        a %= MOD;
        while (b > 0) {
            if ((b & 1) == 1) r = r * a % MOD;
            a = a * a % MOD;
            b >>= 1;
        }
        return r;
    }

    public static void main(String[] args) throws IOException {
        StreamTokenizer in = new StreamTokenizer(new BufferedInputStream(System.in));
        in.nextToken();
        int q = (int) in.nval;
        int[] ns = new int[q], ks = new int[q];
        int nMax = 1;
        for (int i = 0; i < q; i++) {
            in.nextToken();
            ns[i] = (int) in.nval;
            in.nextToken();
            ks[i] = (int) in.nval;
            nMax = Math.max(nMax, ns[i]);
        }
        long[] fact = new long[nMax + 1], invFact = new long[nMax + 1];
        fact[0] = 1;
        for (int i = 1; i <= nMax; i++) fact[i] = fact[i - 1] * i % MOD;
        invFact[nMax] = power(fact[nMax], MOD - 2); // Fermat's little theorem
        for (int i = nMax; i > 0; i--) invFact[i - 1] = invFact[i] * i % MOD;
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < q; i++) {
            int n = ns[i], k = ks[i];
            if (k < 0 || k > n) sb.append(0);
            else sb.append(fact[n] * invFact[k] % MOD * invFact[n - k] % MOD);
            sb.append('\n');
        }
        System.out.print(sb);
    }
}