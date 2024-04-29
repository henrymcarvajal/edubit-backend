import { BusinessRuleValidationError } from '../lambdas/commons/validations/error.mjs';

export class MissingPropertyError extends BusinessRuleValidationError {
  constructor(message) {
    super(message);
  }
}

export class InvalidMobileNumberFormatError extends BusinessRuleValidationError {
  constructor(message) {
    super(message);
  }
}

export class InvalidIdentificationNumberFormatError extends BusinessRuleValidationError {
  constructor(message) {
    super(message);
  }
}

export class InvalidEmailError extends BusinessRuleValidationError {
  constructor(message) {
    super(message);
  }
}

export class DuplicateEmailsError extends BusinessRuleValidationError {
  constructor(message) {
    super(message);
  }
}

export class DuplicatePhonesError extends BusinessRuleValidationError {
  constructor(message) {
    super(message);
  }
}