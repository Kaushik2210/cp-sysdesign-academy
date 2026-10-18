import java.io.*;
import java.util.*;

public class Main {
    // pi[i] = length of the longest proper prefix of s[0..i] that is also its suffix.
    static int[] prefixFunction(String s) {
        int[] pi = new int[s.length()];
        for (int i = 1; i < s.length(); i++) {
            int k = pi[i - 1];
            while (k > 0 && s.charAt(i) != s.charAt(k)) k = pi[k - 1]; // fall back to a shorter border
            if (s.charAt(i) == s.charAt(k)) k++;
            pi[i] = k;
        }
        return pi;
    }

    // Number of (possibly overlapping) occurrences of pattern in text, O(|text| + |pattern|).
    static int countOccurrences(String text, String pattern) {
        int m = pattern.length();
        int[] pi = prefixFunction(pattern + "#" + text); // '#' never matches, so borders stop at m
        int count = 0;
        for (int i = m + 1; i < pi.length; i++) if (pi[i] == m) count++;
        return count;
    }

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String text = br.readLine().trim();
        String pattern = br.readLine().trim();
        System.out.println(countOccurrences(text, pattern));
    }
}