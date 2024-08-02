const DEFAULT_COLOMBIA_LOCALE = 'es-CO'

const CURRENCY_OPTIONS = {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0
}

export const PESO_CURRENCY_FORMATTER = new Intl.NumberFormat(DEFAULT_COLOMBIA_LOCALE, CURRENCY_OPTIONS);