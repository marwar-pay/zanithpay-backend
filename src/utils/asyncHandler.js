import {ApiError} from "./ApiError.js"

export const asyncHandler = requestHandler => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => {
            next(new ApiError(err.statusCode, err.message))
        })
    }
}