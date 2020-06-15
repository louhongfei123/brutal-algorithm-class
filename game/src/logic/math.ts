// Shuffle array in-place
export function shuffle(array: any[]) {
  for (let i = 0; i < array.length; i++) {
    let pick = Math.floor(Math.random() * array.length); // [0 ~ 1)
    swap(array, i, pick);
  }
  return array;
}

export function swap(array: any[], i: number, j: number) {
  let temp = array[i];
  array[i] = array[j];
  array[j] = temp;
}

export function popFrom<T>(array: T[], i: number): [T, T[]] {
  return [array[i], array.slice(0, i).concat(array.slice(i + 1))];
}

export function randomPick(array: any[]): any {
  let pick = Math.floor(Math.random() * array.length);
  return array[pick];
}

export class Deque<T> extends Array<T> {
  first(): T {
    return this[0]
  }
  last(): T {
    return this[this.length - 1]
  }
}
