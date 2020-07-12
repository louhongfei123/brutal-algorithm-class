class File {
    constructor(name) {
        this.name = name
    }
}

class Dir extends File {
    constructor(name, files) {
        super(name)
        this.files = files? files: []
    }
}

let file3 = new File('file3')
let dir2 = new Dir('dir2', [file3])
let file2 = new File('file2')
let file1 = new File('file1')
let dir1 = new Dir('dir1', [file1, file2, dir2])
let file4 = new File('file4')
let dir3 = new Dir('dir3', [file4])
let root = new Dir('', [dir1, dir3])

function print(file, indent) {
    return f2(f1(file, 0, []), indent)
}

function f1(file, level, ret) {
    ret.push([level, file.name])
    if(file.files) {
        ret[0][1] = '/'+ file.name
        for(let child of file.files) {
            f1(child, level+1, ret);
        }
    }
    return ret;
}

function f2(list, indent) {
    for(let [level, name] of list) {
        console.log(indent.repeat(level)+name)
    }
}

// f2([
//     [0, '/'],
//     [1, '/dir1'],
//     [2, 'file1'],
//     [3, 'file2']
// ], '--')

print(root, '--')
