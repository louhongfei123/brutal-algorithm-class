class LinkedList {
    constructor() {
        this.head = null;
        this._length = 0;
    }

    // 得到链表长度
    // O(1)
    length() {
        return this._length;
    }     
    
    // N --> O(n)
    // 在链表末尾追加元素
    append(data) {
        if(!this.head) {
            this.head = new Node(data);
        } else {
            this.head.append(data)
        }
        this._length += 1;
    }        
    // 在链表头部追加元素
    append_head(data) {
        let newHead = new Node(data)
        newHead.next = this.head;
        this.head = newHead;
        this._length += 1;
    }
    
    // 在链表 index-1 和 index 之间插入一个元素
    // insert(element, 0) 等于 append_head(element)
    // insert(element, length()) 等于 append(element)
    insert(element, index){

    }  
    
    // 得到 index 位的元素
    get(index) {
        if(index >= this.length()) {
            throw Error('not found');
        }
        return this.head.get(index);
    }      
}

class Node {
    constructor(data) {
        this.data = data
        this.next = null; // Node
    }

    append(data) {
        if(this.next) {
            return this.next.append(data)
        }
        this.next = new Node(data)
    }

    get(index) {
        console.log(this.data);
        if( index === 0) {
            return this.data;
        }
        return this.next.get(index-1);
    }
}

let list = new LinkedList(1);
list.append(1);
list.append(2);
list.append(3);
list.append(4);
list.append(5);

// 先序遍历链表
function forEach(ll, f) {
    for(let cur = ll.head; cur != null; cur = cur.next) {
        f(cur.data)
    }
}

console.log('forEach');
forEach(list, function(data) {
    console.log(data);
});

// 先序遍历链表，可停止
function forEachStoppable(ll, f) {
    for(let cur = ll.head; cur != null; cur = cur.next) {
        if(!f(cur.data)) {
            return;
        }
    }
}

console.log('forEachStoppable');
forEachStoppable(list, function(data) {
    console.log(data);
    return data < 2
});

// 后序遍历链表，递归
function forEachPostOrderRecursion(ll, f) {
    function forEach(node) {
        if(!node) {
            return true;
        }
        forEach(node.next);
        f(node.data);
        return true;
    }
    forEach(ll.head);
}
console.log('forEachPostOrderRecursion');
forEachPostOrderRecursion(list, function(data) {
    console.log(data);
});

// 后序遍历链表，可停止，循环
function forEachPostOrderLoop(ll, f) {
    let stack = [ll.head];
    let previsouDone = null;
    while(stack.length) {
        let top = stack[stack.length - 1];
        if(top.next && top.next !== previsouDone ) {
            stack.push(top.next);
        } else {
            top = stack.pop();
            if(top.next === previsouDone) {
                f(top.data);
                previsouDone = top;
            }
        }
    }
}
console.log('forEachPostOrderLoop');
forEachPostOrderLoop(list, function(data) {
    console.log(data);
});

/*

    大家要理解，链表的本质就是单叉树。如果你可以在链表上实现各种遍历方式，
    那么，同样的逻辑可以少量修改，就转接到二叉树、多叉树与图上。
*/
