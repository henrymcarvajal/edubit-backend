import { CredentialsPolicyMessages } from '../validations/messages.mjs';
import { promises } from 'dns';

import { CredentialsValidationError } from '../validations/error.mjs';

const validateEmail = async (email) => {
  if (!email) {
    throw new CredentialsValidationError(CredentialsPolicyMessages.EMAIL_EMPTY);
  }

  const domain = email.replace(/^.*@/, '') || '';
  if (!domain) {
    throw new CredentialsValidationError(CredentialsPolicyMessages.EMAIL_FORMAT_INVALID);
  }

  try {

    const servers = await promises.resolveMx(domain);
    if (Array.isArray(servers) && servers.length > 0) {
      return;
    }

  } catch (e) {
    console.log('e', e);
  }

  throw new CredentialsValidationError(CredentialsPolicyMessages.EMAIL_DOMAIN_NOT_FOUND + `: ${domain}`);
};

export const validatePassword = async (password) => {
  if (!password) {
    return {
      success: false,
      message: 'Password empty'
    };
  }

  if (password.length < process.env.password_minimum_size) {
    throw new CredentialsValidationError(CredentialsPolicyMessages.PASSWORD_SHORTER_THAN_POLICY);
  }

  if (!password.match(passwordPolicy())) {
    throw new CredentialsValidationError(CredentialsPolicyMessages.PASSWORD_NOT_COMPLIANT_WITH_POLICY);
  }
};

const passwordPolicy = () => {
  const specialChars = '!@#$%&';
  const minimumOneSpecialChar = '(?=.*[' + specialChars + '])';
  const minimumOneUpperCaseLetter = '(?=.*[A-Z])';
  const minimumOneLowerCaseLetter = '(?=.*[a-z])';
  const minimumOneDigit = '(?=.*\\d)';
  const passwordMinimumSize = process.env.password_minimum_size;
  const passwordMaximumSize = process.env.password_maximum_size;

  return new RegExp(
      minimumOneUpperCaseLetter +
      minimumOneLowerCaseLetter +
      minimumOneDigit +
      minimumOneSpecialChar +
      '.{' + passwordMinimumSize + ',' + passwordMaximumSize + '}');
};

export const validateCredentials = async (email, password) => {
  await validateEmail(email);
  await validatePassword(password);
};



