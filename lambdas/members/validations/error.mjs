import { FailedValidationError } from '../../commons/validations/error.mjs';

export class InvalidRequestError extends FailedValidationError {
  constructor(message) {
    super(message);
  }
}

export class ImprovementRequestError extends FailedValidationError {
  constructor(message) {
    super(message);
  }
}

export class InsufficientFundsError extends FailedValidationError {
  constructor(message) {
    super(message);
  }
}

export class UnauthorizedOperationError extends Error {
  constructor(message) {
    super(message);
  }
}

export class NoPurchaseAllowedError extends UnauthorizedOperationError {
  constructor(message) {
    super(message);
  }
}