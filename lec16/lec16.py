def Knapsack(c, items):
    return helper(0, sum(items), items, c, {})

def helper(pick, remaining, items, c, d):
    if (pick, remaining) in d:
        return d[(pick, remaining)]
    if len(items) == 0:
        return pick
    r = helper(pick, remaining-items[0], items[1:], c, d)
    if pick+items[0] <= c:
        l = helper(pick+items[0], remaining-items[0], items[1:], c, d)
    else:
        l = r
    bigger = max(l, r)
    d[(pick, remaining)] = bigger
    return bigger


print(Knapsack(13, [1,1,2,3,4,5]))

