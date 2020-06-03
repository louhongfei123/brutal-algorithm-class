export function randomArray(size, lower, upper) {
  let array = new Array(size);
  for (let i = 0; i < size; i++) {
    array[i] = Math.floor(Math.random() * (upper - lower) + lower);
  }
  return array;
}
