function addBalanced(tree, data) {
    let leftH = height(tree.left);
    let rightH = height(tree.right);
    if(leftH - rightH > 0) {
        if(tree.right === null) {
            tree.right = new TreeNode(data);
        } else {
            addBalanced(tree.right, data)
        }
    } else {
        if(tree.left === null) {
            tree.left = new TreeNode(data);
        } else {
            addBalanced(tree.left, data)
        }
    }
}

function height(tree) {
    if(tree === null) {
        return 0
    }
    let l = height(tree.left)
    let r = height(tree.right)
    return l > r? l + 1 : r + 1;
}
