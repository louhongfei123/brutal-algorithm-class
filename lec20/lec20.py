def run(fsm, input):
    state = 'start'
    for x in input:
        state = fsm[state][x]
    return state

r = run({
    'start': {
        'a': 'A',
        'b': 'B'
    },
    'A': {
        'a': 'A',
        'b': 'B'
    },
    'B': {}
}, 'aaab')
print(r)


def run2(start, inputs):
    state = start
    for x in inputs:
        state = state(x)
    return state


def start(char):
    if char == 'a':
        return A
    if char == 'b':
        return B
    if char == 'c':
        return C

def Cxxx(char):
    return A

def A(char):
    return start(char)

def B(char):
    raise Exception('B can not accept any')

print(run2(start, 'aaacb'))