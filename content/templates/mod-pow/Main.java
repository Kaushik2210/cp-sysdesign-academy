import java.io.*;
import java.util.*;

public class Main {
    // a^b mod m by binary exponentiation. Requires m <= about 3*10^9 so products fit in a long.
    static long modPow(long a, long b, long m) {
        a %= m;
        long result = 1 % m; // 1 % m handles m == 1
        while (b > 0) {
            if ((b & 1) == 1) result = result * a % m;
            a = a * a % m;
            b >>= 1;
        }
        return result;
    }

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int t = Integer.parseInt(br.readLine().trim());
        StringBuilder sb = new StringBuilder();
        while (t-- > 0) {
            StringTokenizer st = new StringTokenizer(br.readLine());
            long a = Long.parseLong(st.nextToken());
            long b = Long.parseLong(st.nextToken());
            long m = Long.parseLong(st.nextToken());
            sb.append(modPow(a, b, m)).append('\n');
        }
        System.out.print(sb);
    }
}