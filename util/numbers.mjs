export const roundToNDecimalPositions = (decimal, positions) => parseFloat(decimal.toFixed(positions));

export const roundTwoDecimalPositions = (decimal) => roundToNDecimalPositions(decimal, 2);

