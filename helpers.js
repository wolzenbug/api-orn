export function normalize(array) {
  const normalizedArray = [];
  for(let i = 0; i < array.length; i++) {
    normalizedArray.push(array[i]/255);
  }
  return normalizedArray;
}