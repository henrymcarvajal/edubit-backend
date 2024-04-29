import { BusinessRuleValidationError } from '../../../../commons/validations/error.mjs';

export class CredentialsValidationError extends BusinessRuleValidationError {
  constructor(message) {
    super(message);
  }
}

export class DuplicateEmailsError extends BusinessRuleValidationError {
  constructor(message) {
    super(message);
  }
}

export class InvalidGradeError extends BusinessRuleValidationError {
  constructor(message) {
    super(message);
  }
}
