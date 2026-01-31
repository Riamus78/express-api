import { ZodError } from "zod";

export const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      const validatedBody = schema.parse(req.body);
      req.body = validatedBody;
      next();
    } catch (e) {
      next(e);
    }
  };
};

export const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.params);
      next();
    } catch (e) {
      next(e);
    }
  };
};

export const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.query);
      next();
    } catch (e) {
      next(e);
    }
  };
};
