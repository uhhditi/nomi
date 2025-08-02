import { z } from 'zod';

export const userSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Name should be longer').max(255),
  email: z.string().min(1, 'Email should be longer').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  createdAt: z.string()
})

//omit fields managed by database when creating a log
export const createUserSchema = userSchema.omit({
  id: true,
  createdAt: true
});