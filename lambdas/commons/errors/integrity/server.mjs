export class InternalServerError extends Error {
  constructor(message) {
    super(message);
    this.message = message;
  }
}