export class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // Mark this error as operational (expected)
    }
}

export class NotFoundError extends AppError {
    constructor(message = "Resource not found") {
        super(message, 404);
    }
}

export class ForbiddenError extends AppError {
    constructor(message = "Forbidden") {
        super(message, 403);
    }
}

export class BadRequestError extends AppError {
    constructor(message = "Bad request") {
        super(message, 400);
    }
}