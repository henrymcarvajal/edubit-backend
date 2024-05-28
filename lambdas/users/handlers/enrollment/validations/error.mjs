import { FailedValidationError } from '../../../../commons/validations/error.mjs';

export class CredentialsValidationError extends FailedValidationError {
  constructor(message) {
    super(message);
  }
}

export class DuplicateEmailsError extends FailedValidationError {
  constructor(message) {
    super(message);
  }
}

export class InvalidGradeError extends FailedValidationError {
  constructor(message) {
    super(message);
  }
}
