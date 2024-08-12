export class ResourceNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.message = message;
  }
}

export class ResourceStateError extends Error {
  constructor(message) {
    super(message);
    this.message = message;
  }
}

export class ResourceUnmodifiedError extends Error {
  constructor(message) {
    super(message);
    this.message = message;
  }
}