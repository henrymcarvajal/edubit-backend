export class FailedValidationError extends Error {
  constructor(message) {
    super(message);
    this.message = message;
  }
}

export class ReferenceNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.message = message;
  }
}

export class InvalidUuidError extends FailedValidationError {
  constructor(message) {
    super(message);
  }
}

export class InvalidActivitiesFormatError extends FailedValidationError {
  constructor(message) {
    super(message);
  }
}

export class ActivitiesNotFoundError extends FailedValidationError {
  constructor(message) {
    super(message);
  }
}