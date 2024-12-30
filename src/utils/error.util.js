export default function globalErrorHandler(err, req, res, next) {
  res.status(400).json({
    status: false,
    message: err.message,
  });
}
