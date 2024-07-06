export class UnauthorizedOperationError extends Error {
  constructor(message) {
    super(message);
    this.message = message;
  }
}

export class ForbiddenOperationError extends Error {
  constructor(message) {
    super(message);
    this.message = message;
  }
}
