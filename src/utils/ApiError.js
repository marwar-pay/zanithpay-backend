export class ApiError extends Error {
    constructor(statusCode, message = "Something Went Wrong", errors = []) {
        super();
        this.statusCode = statusCode,
            this.message = message,
            this.data = null,
            this.success = false,
            this.error = errors
    }
}