// Time: O(2^n)
// Space: O(n)
function fib(n) {
    if (n == 0 || n == 1) {
        return 1
    }
    return fib(n - 2) + fib(n - 1)
}

// Time: O(n)
// Space: O(n)
function fibDP(n) {
    let map = new Map();
    function internal(n) {
        if (map.has(n)) {
            return map.get(n);
        }
        if (n == 0 || n == 1) {
            return 1
        }
        map.set(n, internal(n - 2) + internal(n - 1))
        return map.get(n);
    }
    return internal(n);
}

function fibDP2(n) {
    let map = new Map();
    map.set(0, 1)
    map.set(1, 1)
    for (let i = 2; i <= n; i++) {
        map.set(i, map.get(i - 2) + map.get(i - 1))
    }
    return map.get(n);
}

function fibDP3(n) {
    let map = [1, 1];
    for (let i = 2; i <= n; i++) {
        map.push(map[i - 2] + map[i - 1])
    }
    return map[n];
}

// for (let i = 0; i < 100; i++) {
//     console.log(fibDP3(i))
// }


// [10, 2, 3, 6, 5], target = 9

// time: O(n^2), n == len(set)
// space: O(n), n == len(set)
function subsetSum(set, target) {
    if (target === 0) {
        return true;
    }
    if (target < 0 || set.reduce((p, c) => p + c, 0) == 0) {
        return false;
    }

    return subsetSum(set.slice(1), target - set[0]) ||
        subsetSum(set.slice(1), target)
}

console.log(subsetSum([10, 2, 3, 6, 5], 26))

[
    //  10, 2, 3, 6, 5 | 9
    [0, 0,  0, 0,  0, 0],
    [x, 10, 2, 3,  0, 0],
    [x, x,  0, 5, 9,  0], // 6, 3
    [x, x,  x, 0, 11, 0],
    [x, x,  x, x, 0,  0],
    [x, x,  x, x, x,  0],
]

(n+1)^2 / 2