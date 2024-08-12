export const sorter = (a, b, f) => {
  if (a[f] < b[f]) {
    return -1;
  }
  if (a[f] > b[f]) {
    return 1;
  }
  return 0;
};


export const concatenate = (accumulator, currentValue) => accumulator + `${currentValue.prerequisite}`