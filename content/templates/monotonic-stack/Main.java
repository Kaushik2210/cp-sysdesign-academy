import java.io.*;
import java.util.*;

public class Main {
    // res[i] = first value to the right of i that is strictly greater than a[i], or -1.
    static long[] nextGreater(long[] a) {
        int n = a.length;
        long[] res = new long[n];
        Arrays.fill(res, -1);
        int[] stack = new int[n]; // indices whose answer is unknown; values are non-increasing
        int top = 0;
        for (int i = 0; i < n; i++) {
            while (top > 0 && a[stack[top - 1]] < a[i]) res[stack[--top]] = a[i];
            stack[top++] = i;
        }
        return res;
    }

    public static void main(String[] args) throws IOException {
        StreamTokenizer in = new StreamTokenizer(new BufferedInputStream(System.in));
        in.nextToken();
        int n = (int) in.nval;
        long[] a = new long[n];
        for (int i = 0; i < n; i++) {
            in.nextToken();
            a[i] = (long) in.nval;
        }
        long[] res = nextGreater(a);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) sb.append(i > 0 ? " " : "").append(res[i]);
        System.out.println(sb);
    }
}