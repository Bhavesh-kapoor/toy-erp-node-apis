import mongoose from "mongoose";

export default function globalErrorHandler(err, req, res, next) {
  let statusCode = err.httpStatus ?? 500;
  let message = err.message;

  if (err instanceof mongoose.Error) {
    switch (true) {
      case err instanceof mongoose.Error.ValidationError:
        statusCode = 400;
        message = Object.values(err.errors)
          .map((error) => error.message)
          .join(", ");
        break;

      case err instanceof mongoose.Error.CastError:
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
        break;

      case err instanceof mongoose.Error.DuplicateKeyError ||
        err.code === 11000:
        statusCode = 409;
        message = "Duplicate key error. Resource already exists.";
        break;

      case err instanceof mongoose.Error.MongooseServerSelectionError:
        statusCode = 503;
        message = "Database connection error. Please try again later.";
        break;

      case err instanceof mongoose.Error.DocumentNotFoundError:
        statusCode = 404;
        message = "Document not found.";
        break;

      case err instanceof mongoose.Error.StrictModeError:
        statusCode = 400;
        message = "Attempted to save a field not defined in the schema.";
        break;

      default:
        statusCode = 500;
        message = "An unexpected database error occurred.";
    }
  }

  if (err.name === "SyntaxError" && err.status === 400) {
    statusCode = 400;
    message = "Invalid JSON syntax.";
  }

  res.status(statusCode).json({
    status: false,
    message,
  });
}
