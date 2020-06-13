// Method 3
let graph = [
    [0,1,0,1],
    [0,0,1,0],
    [1,0,0,0],
    [0,1,1,0],
];

let dataMap = {
    0: data1,
    1: data2,
    2: data3
}

let dataList = [data1, data2, data3, ...]

// Method 1
class Vertex {
    constructor(data) {
        this.data = data
        this.edges = [Vertex1, Vertex2, ...]
    }
}

let graph = Vertex1;

// Method 2
class Edge {
    constructor(vertex1, vertex2) {
        this.left = vertex1
        this.right = vertex2
    }
}

class Vertex {
    constructor(data) {
        this.data = data
    }
}

let graph = [Edge1, Edge2, ...]



function hasCircle(graph) {

}

