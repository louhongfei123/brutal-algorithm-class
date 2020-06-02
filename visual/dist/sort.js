import { chan, select, } from "https://creatcodebuild.github.io/csp/dist/csp.js";
export function InsertionSort(array) {
    function insert(array, number) {
        if (array.length === 0) {
            return [number];
        }
        let sorted = [];
        let inserted = false;
        for (let i = 0; i < array.length; i++) { // n
            if (!inserted) {
                if (number < array[i]) {
                    inserted = true;
                    sorted.push(number);
                }
            }
            sorted.push(array[i]);
        }
        if (!inserted) {
            sorted.push(number);
        }
        return sorted;
    }
    let resultChannel = chan();
    let sortedArray = [];
    (async () => {
        for (let i = 0; i < array.length; i++) { // n
            sortedArray = insert(sortedArray, array[i]);
            await resultChannel.put(sortedArray.concat(array.slice(i + 1)));
        }
        resultChannel.close();
    })();
    // @ts-ignore
    return resultChannel;
}
export function MergeSort(array) {
    let resultChannel = chan();
    function merge(l, r, startIndex) {
        if (l.length === 0) {
            return r;
        }
        if (r.length === 0) {
            return l;
        }
        let shifted = (function () {
            if (l[0] < r[0]) {
                return l.slice(0, 1).concat(merge(l.slice(1), r, startIndex + 1));
            }
            else {
                return r.slice(0, 1).concat(merge(l, r.slice(1), startIndex + 1));
            }
        })();
        return shifted;
    }
    async function sort(array, startIndex) {
        if (array.length <= 1) {
            return array;
        }
        let m = Math.floor(array.length / 2);
        let l = array.slice(0, m);
        let r = array.slice(m);
        let sortedL = await sort(l, startIndex);
        let sortedR = await sort(r, startIndex + m);
        let merged = merge(sortedL, sortedR, startIndex);
        await resultChannel.put(merged);
        return merged;
    }
    (async () => {
        let result = await sort(array, 0);
        resultChannel.close();
    })();
    // @ts-ignore
    return resultChannel;
}
export async function infinite(f, ...args) {
    while (true) {
        await f(...args);
    }
}
export async function Sorter2(sortFunc, resetChannel, renderChannel) {
    console.log("before");
    let arrayToSort = await resetChannel.pop();
    if (!arrayToSort) {
        throw new Error("array init failed");
    }
    console.log("after");
    let sorting = sortFunc(arrayToSort);
    while (true) {
        await select([
            [
                resetChannel,
                async (array) => {
                    console.log("reset", array);
                    arrayToSort = array;
                    // @ts-ignore
                    sorting = sortFunc(arrayToSort);
                },
            ],
        ], async () => {
            let array = await sorting.pop();
            console.log("next", array);
            if (array) {
                await renderChannel.put(array);
            }
            else {
                sorting = sortFunc(arrayToSort);
            }
        });
    }
}
//# sourceMappingURL=sort.js.map