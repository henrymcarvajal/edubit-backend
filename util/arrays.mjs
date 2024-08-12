export const arrayIsNotEmpty = array => array && Array.isArray(array) && array.length;

export const arrayIsEmpty = array => !Array.isArray(array) || !array.length;

export const arrayContainsAll = (array, items) => arrayIsNotEmpty(array) && arrayIsNotEmpty(items) &&
    array.length === items.length && items.every(item => array.includes(item));