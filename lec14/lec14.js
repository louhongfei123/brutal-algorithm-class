class Node {
    constructor(id, children) {
        this.id = id;
        if(children) {
            this.children = children
        } else {
            this.children = [];
        }
    }
}


let e = new Node('e')
let f = new Node('f', [e])
let c = new Node('c', [e])
let b = new Node('b')
let a = new Node('a', [b, e])
b.children = [a]
let d = new Node('d', [c])


let graph = [e, f, b, d, a, c];


function topologicalSort(graph) {

    let visited = new Set();
    let deque = new Array();

    function dfs(node) {
        if(visited.has(node)) {
            return;
        }
        visited.add(node);
        for(let child of node.children) {
            dfs(child)
        }
        deque.push(node);
    }

    for(let node of graph) {
        let visited_local = new Set();
        dfs(node)
        console.log(node)
    }
    return deque;
}


let array = topologicalSort(graph);
console.log(array)
