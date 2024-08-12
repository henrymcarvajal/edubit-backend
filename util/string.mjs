export const isEmptyString = (str) => (typeof str === 'string' && str === '')



const factor = (array) => array.reduce((a,b) => a + 0.5*b, 0);

console.log(factor([2, 2]))