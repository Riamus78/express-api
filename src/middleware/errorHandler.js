import { ZodError } from "zod";
import env from "../../env.js";

export const errorHandler = (err, req, res, next) => {
  console.error(err);
  let message = err.message || "internal server error";
  let status = err.status || 500;
  let details = undefined;

  if (err instanceof ZodError) {
    message = "Validation error";
    status = 400;
    details = err.issues.map((e) => ({
      fields: e.path.join("."),
      message: e.message,
    }));
  } else if (
    status === 500 && // Only override if the status is still the default 500
    err.cause && // Check if there's an underlying cause
    typeof err.cause.code === "string" // Ensure the cause has a string 'code'
  ) {
    if (err.cause.code.match(/^\d{5}$/)) {
      // This is an unhandled PostgreSQL SQLSTATE error.
      message = "An unexpected database error occurred.";
      status = 500;
    } else if (
      ["ETIMEDOUT", "ECONNREFUSED", "ENOTFOUND", "EHOSTUNREACH"].includes(
        err.cause.code,
      )
    ) {
      // This is a database connection/network error.
      message = "Could not connect to the database. Please try again later.";
      status = 503; // Service Unavailable
    } else {
      // Other database-related errors with a known code
      message = "A database-related error occurred.";
      status = 500;
    }
  }

  res.status(status).json({
    message: message,
    ...(details && { details: details }),
    ...(env.APP_STAGE == "dev" && { stack: err.stack }),
  });
};
