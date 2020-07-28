// 1 + 2 + 3 * 4 = 24   right to left
//               = 16   left to right
//               = 16   * over +

// 1,2,3,4
// +,+,*

const operations = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b,
    '/': (a, b) => a / b,
}

class Expression {
    constructor(exp1, op, exp2) {
        this.exp1 = exp1;
        this.op = op;
        this.exp2 = exp2;
    }
    eval() {
        return operations[this.op](this.exp1.eval(), this.exp2.eval());
    }
}

class NumberExp {
    constructor(string) {
        this.data = string
    }
    eval() {
        return Number(this.data)
    }
}


// string -(regex/lexer)> list<token> -(cfl/parser)> AST
function lexer(string) {
    return string.split(' ')
}

/*
expression  = num
            | expression op num

num = [0-9]
op  = + 
    | * 
    | - 
    | /
*/
function parse(tokens) /* AST */ {
    // parse: number
    let [num, err] = parseNumber(tokens)
    if (!err) {
        return num;
    }
    // parse: num op expression
    let exp = parse(tokens.slice(0, -2))
    let [op, err2] = parseOp(tokens.slice(-2, -1))
    if (err2) {
        throw Error();
    }
    [num, err] = parseNumber(tokens.slice(-1))
    if (err) {
        throw Error();
    }
    return new Expression(exp, op, num);
}

function parseOp(tokens) {
    if (tokens.length > 1) {
        return [null, true]
    }
    if (!tokens[0] in operations) {
        return [null, true]
    }
    return [tokens[0], false]
}

function parseNumber(tokens) {
    if (tokens.length > 1) {
        return [null, true]
    }
    return [new NumberExp(tokens[0]), false]
}

console.log(parse(lexer('31')).eval());
console.log(parse(lexer('31 + 2 - 3')).eval());
