export const arrayNotEmpty = array => Array.isArray(array) && array.length;

export const arrayEmpty = array => !Array.isArray(array) || !array.length;