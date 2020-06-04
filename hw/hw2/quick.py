from random import randint
from time import time
from heapq import heapify

def partition(arr, low, high):
    i = (low-1)         # index of smaller element
    pivot = arr[high]   # pivot

    for j in range(low, high):
        if arr[j] <= pivot:
            i = i+1
            arr[i], arr[j] = arr[j], arr[i]

    arr[i+1], arr[high] = arr[high], arr[i+1]

    return (i+1)

# 快排实现摘抄自 https://www.geeksforgeeks.org/python-program-for-quicksort/
# 但是，将递归改为循环，不然在几千个数的时候就会爆栈。
def quickSort(arr, low, high):
    heapify(arr)
    call_stack = [(arr, low, high)]
    while call_stack:
        arr, low, high = call_stack.pop()
        if low < high:
            pi = partition(arr, low, high)
            call_stack.append((arr, low, pi-1))
            call_stack.append((arr, pi+1, high))


size = 100_0000
bound = 100_0000

a1 = [x for x in range(0, size)]                    # 正序
a2 = [x for x in range(size, 0, -1)]                # 倒序
a3 = [randint(0, bound) for _ in range(0, size)]    # 乱序


def timeit(f, *args):
    t = time()
    f(*args)
    print(time() - t)


# for i in range(1000, 100001, 1000):
#     a1 = [randint(0, bound) for _ in range(0, i)]   # 乱序
#     print(i)
#     timeit(quickSort, a1, 0, len(a1)-1)

for i in range(1000, 100001, 1000):
    a1 = [x for x in range(0, i)]                   # 正序慢很多，为什么？
    print(i)
    timeit(quickSort, a1, 0, len(a1)-1)
