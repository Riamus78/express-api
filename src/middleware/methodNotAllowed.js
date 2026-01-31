export const methodNotAllowed = (req, res, next) => {
  const error = new Error(
    `Cannot make a ${req.method} request for ${req.originalUrl}`,
  );
  error.status = 405;
  next(error);
};
