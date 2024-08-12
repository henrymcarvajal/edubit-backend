import { PESO_CURRENCY_FORMATTER } from '../../../../../util/currency.mjs';

export const PurchasesMessages = {
  ALL_ASSETS_MUST_BE_MORTGAGEABLE: 'Todos los activos deben ser hipotecables',
  ALL_ASSETS_MUST_BE_NON_MORTGAGEABLE: 'Ninguno de los activos debe ser hipotecable',
  INVALID_BUYER: 'Comprador inválido',
  INVALID_SOURCE: 'Fuente inválida',
  INSTALLMENTS_EXCEED_MAX_ALLOWED_INSTALLMENTS:
      (installments, maxInstallments) =>
          `Número de pagos (${ installments }) supera el máximo de pagos permitido (${ maxInstallments })`,
  INSTALLMENTS_EXCEED_MIN_ALLOWED_INSTALLMENTS:
      (installments, minInstallments) =>
          `Número de pagos (${ installments }) supera el máximo de pagos permitido (${ minInstallments })`,
  MISSING_ASSETS_TO_BUY: `Falta incluir activos por comprar`,
  MISSING_INSTALLMENTS: `Falta número de cuotas`,
  NOT_ENOUGH_FUNDS: (funds) => `Fondos insuficientes: ${ PESO_CURRENCY_FORMATTER.format(funds) }`,
  NOT_ENOUGH_FUNDS_FOR_INITIAL_PAYMENT: 'Fondos insuficientes para el pago de cuota inicial',
  NOT_ENOUGH_FOR_PERSONAL_LOAN:
      (maxLoanAmount, totalLoanAmount) =>
          `Valor de activos (${ PESO_CURRENCY_FORMATTER.format(totalLoanAmount) }) supera valor máximo para libre destino (${ PESO_CURRENCY_FORMATTER.format(maxLoanAmount) })`,
  NOT_ENOUGH_DOWN_PAYMENT_FOR_MORTGAGE:
      (averagedDownPayment, currentBalance) =>
          `Valor de cuota inicial promediada (${ PESO_CURRENCY_FORMATTER.format(averagedDownPayment) }) supera balance actual (${ PESO_CURRENCY_FORMATTER.format(currentBalance) })`,
  NOT_ENOUGH_INCOME_FOR_INSTALLMENT:
      (installment, income) =>
          `Valor de cuota mensual (${ PESO_CURRENCY_FORMATTER.format(installment) }) supera ingresos (${ PESO_CURRENCY_FORMATTER.format(income) })`,
};

export const LoanSimulator = {
  MISSING_ASSETS_TO_BUY: `Faltan activos por comprar`,
}