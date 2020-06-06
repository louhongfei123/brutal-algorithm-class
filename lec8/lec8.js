function sameTree(tree1, tree2) {
    if(tree1 === tree2 || tree1.data === tree2.data) {
        return true;
    }
    if(tree1 === null && tree2 !== null) {
        return false;
    }
    if(tree1 !== null && tree2 === null) {
        return false;
    }
    return sameTree(tree1.left, tree2.left) && sameTree(tree1.right, tree2.right)
}

// 配置文件动态修改
let config = {
    "x": {
        "x1": 10
    },
    "y": {
        "y1": {
            "y2": "yyy"
        }
    }
}

let config2 = {
    "x": {
        "x1": 10
    },
    "y": {
        "y1": {
            "y2": "yyy",
            "y3": "yyy"
        }
    }
}


// 测试类库
// let result = func()
// assertEqual(
//     {
//         "x": {
//             "x1": not(20)
//         },
//         "y": {
//             "y1": exist
//         }
//     },
//     result
// )

// function not(num) {
//     return {
//         equal: function(obj) {
//             return obj !== num
//         }
//     }
// }

// assertEqual(true, result.x.x1 < 20)

// function assertEqual(tree1: Comparator, tree2: Comparator) {
//     if(tree1 === tree2 || tree1.data === tree2.data) {
//         return true;
//     }
//     if(tree1 === null && tree2 !== null) {
//         return false;
//     }
//     if(tree1 !== null && tree2 === null) {
//         return false;
//     }

//     if(tree1.children.length !== tree2.children.length) {
//         return false;
//     }
//     for(let i = 0; i < tree1.children.length; i++) {
//         if(tree1.children[i].equal(tree2.children[i] ||
//            tree2.children[i].equal(tree1.children[i])) {
//                return false;
//            }
//     }
//     return true;
// }

// interface Comparator {
//     equal(obj): boolean
// }

// x.equal(y);
// y.equal(x);

// function smallerThan(num): Comparator {
//     return {
//         equal: function(obj) {
//             if(typeof obj !== 'number') {
//                 true false;
//             }
//             return obj < num
//         }
//     }
// }

// let exist = {
//     equal: function(obj) {
//         return obj !== null && obj !== undefined;
//     }
// }

function sameIterable(iterable, iterable2) {
    let iter1 = iter(iterable);
    let iter2 = iter(iterable2);
    let done1 = false;
    let done2 = false;
    let current1 = null;
    let current2 = null;
    try { current1 = iter1.next(); } catch { done1 = true;}
    try { current2 = iter2.next(); } catch { done2 = true;}
    let i = 0;
    while(!done1 || !done2) {
        if(current1 !== current2) {
            return false;
        }
        try { current1 = iter1.next(); } catch { done1 = true;}
        try { current2 = iter2.next(); } catch { done2 = true;}
    }
    return done1 === done2;
}

function iter(array) {
    let current = 0;
    return {
        next() {
            if(current < array.length) {
                return array[current++];
            }
            throw new Error('StopIteration');
        }
    }
}
let iterator = iter([1, 2, 3])
console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());
// console.log(iterator.next());
console.log(sameIterable([1,2,3],[1,2,3]))
console.log(sameIterable([1,4,3],[1,2,3]))
console.log(sameIterable([1,2,3],[1,2,3,4]))
console.log(sameIterable([1,2,3,4],[1,2,3]))
console.log(sameIterable([],[1,2,3]))


function someTree(tree1, tree2, recursionF) {
    if(tree1 === tree2 || tree1.data === tree2.data) {
        return true;
    }
    if(tree1 === null && tree2 !== null) {
        return false;
    }
    if(tree1 !== null && tree2 === null) {
        return false;
    }
    return recursionF(tree1, tree2, recursionF);
}

// Same Tree
let recursionF = function(t1, t2, f) {
    return someTree(t1.left, t2.left, f) && someTree(t1.right, t2.right, f)
}
someTree(tree1, tree2, recursionF);

// Mirror Tree
someTree(tree1, tree2, function(t1, t2, f) {
    return someTree(t1.left, t2.right, f) && someTree(t1.right, t2.left, f)
})
