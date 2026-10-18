#include <bits/stdc++.h>
using namespace std;

// res[i] = first value to the right of i that is strictly greater than a[i], or -1.
vector<long long> next_greater(const vector<long long>& a) {
    int n = a.size();
    vector<long long> res(n, -1);
    vector<int> st; // indices whose answer is unknown; values are non-increasing
    for (int i = 0; i < n; i++) {
        while (!st.empty() && a[st.back()] < a[i]) {
            res[st.back()] = a[i];
            st.pop_back();
        }
        st.push_back(i);
    }
    return res;
}

int main() {
    int n;
    scanf("%d", &n);
    vector<long long> a(n);
    for (auto& x : a) scanf("%lld", &x);
    vector<long long> res = next_greater(a);
    for (int i = 0; i < n; i++) printf("%lld%c", res[i], i + 1 < n ? ' ' : '\n');
    return 0;
}