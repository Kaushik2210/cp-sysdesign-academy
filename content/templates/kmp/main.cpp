#include <bits/stdc++.h>
using namespace std;

// pi[i] = length of the longest proper prefix of s[0..i] that is also its suffix.
vector<int> prefix_function(const string& s) {
    vector<int> pi(s.size(), 0);
    for (size_t i = 1; i < s.size(); i++) {
        int k = pi[i - 1];
        while (k > 0 && s[i] != s[k]) k = pi[k - 1]; // fall back to a shorter border
        if (s[i] == s[k]) k++;
        pi[i] = k;
    }
    return pi;
}

// Number of (possibly overlapping) occurrences of pattern in text, O(|text| + |pattern|).
int count_occurrences(const string& text, const string& pattern) {
    int m = pattern.size();
    vector<int> pi = prefix_function(pattern + "#" + text); // '#' never matches, so borders stop at m
    int count = 0;
    for (size_t i = m + 1; i < pi.size(); i++) if (pi[i] == m) count++;
    return count;
}

int main() {
    string text, pattern;
    cin >> text >> pattern;
    cout << count_occurrences(text, pattern) << "\n";
    return 0;
}