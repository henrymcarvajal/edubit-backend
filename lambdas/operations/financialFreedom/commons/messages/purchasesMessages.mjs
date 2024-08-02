import { PESO_CURRENCY_FORMATTER } from '../../../../../util/currency.mjs';

export const PurchasesMessages = {
  ALL_ASSETS_MUST_BE_MORTGAGEABLE: 'Todos los activos deben ser hipotecables',
  ALL_ASSETS_MUST_BE_NON_MORTGAGEABLE: 'Ninguno de los activos debe ser hipotecable',
  INVALID_BUYER: 'Compra<dor inválido',
  INVALID_SOURCE: 'Fuente inválida',
  MISSING_ASSETS_TO_BUY:  `Faltan activos por comprar`,
  NOT_ENOUGH_FUNDS: 'Fondos insuficientes',
  NOT_ENOUGH_FUNDS_FOR_INITIAL_PAYMENT: 'Fondos insuficientes para el pago de cuota inicial',
  NOT_ENOUGH_FOR_FREE_INVESTMENT:
      (maxLoanAmount, totalLoanAmount) =>
          `Valor de activos (${ PESO_CURRENCY_FORMATTER.format(totalLoanAmount) }) supera valor máximo para libre destino (${ PESO_CURRENCY_FORMATTER.format(maxLoanAmount) })`,
  NOT_ENOUGH_FOR_MORTGAGE:
      (maxLoanAmount, totalLoanAmount)      =>
          `Valor de activos (${ PESO_CURRENCY_FORMATTER.format(totalLoanAmount) }) supera valor máximo para hipoteca (${ PESO_CURRENCY_FORMATTER.format(maxLoanAmount) })`,
};