import { InvalidInputError } from '../../../../commons/errors/data/input.mjs';

export class CredentialsValidationError extends InvalidInputError {
  constructor(message) {
    super(message);
  }
}

export class DuplicateEmailsError extends InvalidInputError {
  constructor(message) {
    super(message);
  }
}

export class InvalidGradeError extends InvalidInputError {
  constructor(message) {
    super(message);
  }
}
