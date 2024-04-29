export class UserNotRegisteredError extends Error {
  constructor(message) {
    super(message);
  }
}

export class UserNotAuthorizedError extends Error {
  constructor(message) {
    super(message);
  }
}