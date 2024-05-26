export class BusinessRuleValidationError extends Error {
  constructor(message) {
    super(message);
    this.message = message;
  }
}

export class InvalidUuidError extends BusinessRuleValidationError {
  constructor(message) {
    super(message);
  }
}


export class InvalidActivitiesFormatError extends BusinessRuleValidationError {
  constructor(message) {
    super(message);
  }
}

export class ActivitiesNotFoundError extends BusinessRuleValidationError {
  constructor(message) {
    super(message);
  }
}