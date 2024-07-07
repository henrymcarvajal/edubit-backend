import {
  EmailValidationMessages,
  IdentificationValidationMessages,
  MobilePhoneValidationMessages
} from './messages.mjs';
import { promises } from 'dns';
import { InvalidInputError } from '../lambdas/commons/errors/data/input.mjs';

export const checkMobileNumberFormat = (phone) => {
  if (!phone) {
    throw new InvalidInputError(MobilePhoneValidationMessages.EMPTY_MOBILE_PHONE);
  }

  let phoneVal = Number(phone);
  if (isNaN(phoneVal)) {
    throw new InvalidInputError(MobilePhoneValidationMessages.MOBILE_PHONE_NOT_A_NUMBER + `: ${phone}`);
  }

  const operatorCode = Math.floor(phoneVal / 10000000);
  if (operatorCode <= 299 || operatorCode >= 400) {
    throw new InvalidInputError(MobilePhoneValidationMessages.INVALID_MOBILE_PHONE_NUMBER + `: ${phone}`);
  }
};

export const checkIdentificationNumberFormat = (identificationNumber) => {
  if (!identificationNumber) {
    throw new InvalidInputError(IdentificationValidationMessages.EMPTY_IDENTIFICATION);
  }

  let identificationNumberVal = Number(identificationNumber);
  if (isNaN(identificationNumberVal)) {
    throw new InvalidInputError(IdentificationValidationMessages.IDENTIFICATION_NOT_A_NUMBER + `: ${identificationNumber}`);
  }
};

export const validateEmail = async (email) => {
  if (!email) {
    throw new InvalidInputError(EmailValidationMessages.EMAIL_EMPTY);
  }

  const domain = email.replace(/^.*@/, '') || '';
  if (!domain) {
    throw new InvalidInputError(EmailValidationMessages.EMAIL_FORMAT_INVALID);
  }

  try {

    const servers = await promises.resolveMx(domain);
    if (Array.isArray(servers) && servers.length > 0) {
      return;
    }

  } catch (e) {
    console.log('e', e);
  }

  throw new InvalidInputError(EmailValidationMessages.EMAIL_DOMAIN_NOT_FOUND + `: ${domain}`);
};
