export default function globalErrorHandler(err, req, res, next) {
  res.status(err.httpStatus).json({
    status: false,
    message: err.message,
  });
}
