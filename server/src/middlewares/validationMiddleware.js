import { z } from 'zod';
const { ZodError } = z;

export function validateData(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body); //validate req with schema
      next();
    } catch (error) {
      if (error instanceof ZodError) { //if req body does not match schema
        const errorMessages = error.issues.map((issue) => ({
                message: `${issue.path.join('.')} is ${issue.message}`,
            }))
            return res.status(400).json({ error: "invalid data", details: errorMessages });
      } else {
        return res.status(500).json({ error: "internal server error"});
      }
    }
  };
}