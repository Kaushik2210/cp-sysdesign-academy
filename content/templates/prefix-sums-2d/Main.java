import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        StreamTokenizer in = new StreamTokenizer(new BufferedInputStream(System.in));
        in.nextToken();
        int r = (int) in.nval;
        in.nextToken();
        int c = (int) in.nval;
        in.nextToken();
        int q = (int) in.nval;
        // P[i][j] = sum of the first i rows and first j columns (extra zero row/column).
        long[][] P = new long[r + 1][c + 1];
        for (int i = 1; i <= r; i++) {
            for (int j = 1; j <= c; j++) {
                in.nextToken();
                P[i][j] = (long) in.nval + P[i - 1][j] + P[i][j - 1] - P[i - 1][j - 1];
            }
        }
        StringBuilder sb = new StringBuilder();
        while (q-- > 0) {
            in.nextToken();
            int r1 = (int) in.nval;
            in.nextToken();
            int c1 = (int) in.nval;
            in.nextToken();
            int r2 = (int) in.nval;
            in.nextToken();
            int c2 = (int) in.nval;
            sb.append(P[r2][c2] - P[r1 - 1][c2] - P[r2][c1 - 1] + P[r1 - 1][c1 - 1]).append('\n');
        }
        System.out.print(sb);
    }
}