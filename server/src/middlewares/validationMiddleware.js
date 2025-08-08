import { z } from 'zod';
const { ZodError } = z;
import jwt from 'jsonwebtoken';

export function validateData(schema) {
  console.log("in validation");
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body); //validate req with schema
      console.log("in try of val")
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

export const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};
