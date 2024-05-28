import { FailedValidationError } from '../lambdas/commons/validations/error.mjs';

export class MissingPropertyError extends FailedValidationError {
  constructor(message) {
    super(message);
  }
}

export class InvalidMobileNumberFormatError extends FailedValidationError {
  constructor(message) {
    super(message);
  }
}

export class InvalidIdentificationNumberFormatError extends FailedValidationError {
  constructor(message) {
    super(message);
  }
}

export class InvalidEmailError extends FailedValidationError {
  constructor(message) {
    super(message);
  }
}

export class DuplicateEmailsError extends FailedValidationError {
  constructor(message) {
    super(message);
  }
}

export class DuplicatePhonesError extends FailedValidationError {
  constructor(message) {
    super(message);
  }
}