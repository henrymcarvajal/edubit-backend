import { FINANCIAL_SOURCES_OPTIONS } from '../../commons/calculators/financialSources.mjs';
import { HttpResponseCodes } from '../../../../../commons/web/webResponses.mjs';
import { PurchasesMessages } from '../../commons/messages/purchasesMessages.mjs';

import { calculateMonthlyInstallment, LOANS_TERMS } from '../../commons/loans.mjs';
import { extractBody } from '../../../../../client/aws/utils/bodyExtractor.mjs';
import { handleErrorResponse } from '../../../../commons/errorHandling.mjs';
import { sendResponse } from '../../../../../util/responseHelper.mjs';

import { InvalidInputError } from '../../../../commons/errors/data/input.mjs';

exports.handle = async (event) => {

  try {

    const { principal, source, installments } = validateAndExtractParams(event);

    const monthlyRate = source === FINANCIAL_SOURCES_OPTIONS.MORTGAGE ? LOANS_TERMS.MORTGAGE.INTEREST_RATE : LOANS_TERMS.PERSONAL_LOAN.INTEREST_RATE;

    const monthlyInstallment = calculateMonthlyInstallment(principal, monthlyRate, installments);

    return sendResponse(HttpResponseCodes.OK, { installment: monthlyInstallment, rate: monthlyRate });

  } catch (error) {
    return handleErrorResponse(error);
  }
};


const validateAndExtractParams = (event) => {
  const { body: { principal, source, installments } } = extractBody(event);
  if (!principal) {
    throw new InvalidInputError(PurchasesMessages.MISSING_ASSETS_TO_BUY);
  } else if (principal < 0) {
    throw new InvalidInputError(`El monto del préstamo no puede ser negativo: ${principal}`);
  }

  if (source) {
    const sourceKeys = Object.keys(FINANCIAL_SOURCES_OPTIONS);
    if (!sourceKeys.includes(source)) {
      throw new InvalidInputError(PurchasesMessages.INVALID_SOURCE);
    }
  } else {
    throw new InvalidInputError(PurchasesMessages.INVALID_SOURCE);
  }

  if (installments) {
    if (source === FINANCIAL_SOURCES_OPTIONS.MORTGAGE) {
      if (installments > LOANS_TERMS.MORTGAGE.MAX_INSTALLMENTS) {
        throw new InvalidInputError(PurchasesMessages.INSTALLMENTS_EXCEED_MAX_ALLOWED_INSTALLMENTS(installments, LOANS_TERMS.MORTGAGE.MAX_INSTALLMENTS));
      }
    } else if (source === FINANCIAL_SOURCES_OPTIONS.PERSONAL_LOAN) {
      if (installments > LOANS_TERMS.PERSONAL_LOAN.MAX_INSTALLMENTS) {
        throw new InvalidInputError(PurchasesMessages.INSTALLMENTS_EXCEED_MAX_ALLOWED_INSTALLMENTS(installments, LOANS_TERMS.PERSONAL_LOAN.MAX_INSTALLMENTS));
      }
    }

  } else {
    if (installments < 1) {
      throw new InvalidInputError(PurchasesMessages.INSTALLMENTS_EXCEED_MIN_ALLOWED_INSTALLMENTS(installments, 1));
    }
  }

  return { principal, source, installments };
};