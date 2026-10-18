#include <bits/stdc++.h>
using namespace std;

int main() {
    int r, c, q;
    scanf("%d %d %d", &r, &c, &q);
    // P[i][j] = sum of the first i rows and first j columns (extra zero row/column).
    vector<vector<long long>> P(r + 1, vector<long long>(c + 1, 0));
    for (int i = 1; i <= r; i++) {
        for (int j = 1; j <= c; j++) {
            long long x;
            scanf("%lld", &x);
            P[i][j] = x + P[i - 1][j] + P[i][j - 1] - P[i - 1][j - 1];
        }
    }
    while (q--) {
        int r1, c1, r2, c2;
        scanf("%d %d %d %d", &r1, &c1, &r2, &c2);
        printf("%lld\n", P[r2][c2] - P[r1 - 1][c2] - P[r2][c1 - 1] + P[r1 - 1][c1 - 1]);
    }
    return 0;
}