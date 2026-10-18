import sys


def next_greater(a):
    """res[i] = the first value to the right of i that is strictly greater than a[i], or -1."""
    res = [-1] * len(a)
    stack = []                      # indices whose answer is still unknown; values are non-increasing
    for i, x in enumerate(a):
        while stack and a[stack[-1]] < x:
            res[stack.pop()] = x    # x is the first greater value to the right of that index
        stack.append(i)
    return res


def main():
    data = sys.stdin.read().split()
    n = int(data[0])
    a = list(map(int, data[1:1 + n]))
    print(" ".join(map(str, next_greater(a))))


main()