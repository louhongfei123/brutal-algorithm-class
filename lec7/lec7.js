function f(x, n, m) {
    if(x < 0) {
        return;
    }
    for(let i = 0; i < m; i++) {
        f(x-1, n, m);
    }
    console.log(x) // [console.log, x]
    for(let i = m+1; i < n; i++) {
        f(x-1, n, m);
    }
}


// f(10000, 3, 1);

function fInALoop(x, recursion) {
    let stack = [[recursion, x]]
    while(stack.length) {
        let [f, x] = stack.pop();
        f(x, stack);
    }
}

fInALoop(10000, function f(x, stack) {
    if(x < 0) {
        return;
    }
    stack.push([f, x-1]);
    stack.push([() => {
        console.log(x)
    }]);
    stack.push([f, x-1]);
});


function fInALoop2(x) {
    function f(x, stack) {
        if(x < 0) {
            return;
        }
        stack.push([f, x-1]);
        stack.push([console.log, x]);
        stack.push([f, x-1]);
    }
    let stack = [[f, x]]
    while(stack.length) {
        let [f, x] = stack.pop();
        f(x, stack);
    }
}

fInALoop2(10)
