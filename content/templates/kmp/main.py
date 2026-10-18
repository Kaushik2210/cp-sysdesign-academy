import sys


def prefix_function(s):
    """pi[i] = length of the longest proper prefix of s[:i+1] that is also its suffix."""
    pi = [0] * len(s)
    for i in range(1, len(s)):
        k = pi[i - 1]
        while k > 0 and s[i] != s[k]:
            k = pi[k - 1]           # fall back to the next shorter border
        if s[i] == s[k]:
            k += 1
        pi[i] = k
    return pi


def count_occurrences(text, pattern):
    """Number of (possibly overlapping) occurrences of pattern in text in O(|text| + |pattern|)."""
    m = len(pattern)
    pi = prefix_function(pattern + "#" + text)   # '#' never matches, so borders stop at |pattern|
    return sum(1 for v in pi[m + 1:] if v == m)


def main():
    lines = sys.stdin.read().split("\n")
    text, pattern = lines[0].strip(), lines[1].strip()
    print(count_occurrences(text, pattern))


main()