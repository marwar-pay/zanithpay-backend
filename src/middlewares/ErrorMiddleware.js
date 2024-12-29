const ErrorMiddleware = (err, req, res, next) => {
    err.message = err.message || "Internel Server Error !"
    err.statusCode = err.statusCode || 500

    return res.status(err.statusCode).json({ success: "Failed", message: err.message })
}

export default ErrorMiddleware;