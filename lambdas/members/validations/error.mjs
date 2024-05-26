import { BusinessRuleValidationError } from '../../commons/validations/error.mjs';

export class InvalidRequestError extends BusinessRuleValidationError {
  constructor(message) {
    super(message);
  }
}

export class ImprovementRequestError extends BusinessRuleValidationError {
  constructor(message) {
    super(message);
  }
}

export class InsufficientFundsError extends BusinessRuleValidationError {
  constructor(message) {
    super(message);
  }
}