export class ApiError extends Error {
  statusCode: number;
  code: string;

  constructor(statusCode: number, message: string, code = "ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }

  static badRequest(message: string, code = "BAD_REQUEST") {
    return new ApiError(400, message, code);
  }

  static unauthorized(message = "You must be logged in to do that.", code = "UNAUTHORIZED") {
    return new ApiError(401, message, code);
  }

  static forbidden(message = "You don't have access to that.", code = "FORBIDDEN") {
    return new ApiError(403, message, code);
  }

  static notFound(message = "We couldn't find what you're looking for.", code = "NOT_FOUND") {
    return new ApiError(404, message, code);
  }

  static conflict(message: string, code = "CONFLICT") {
    return new ApiError(409, message, code);
  }
}
