import { z } from 'zod';

export const logSchema = z.object({
  description: z.string().min(1, 'Meal name should be longer').max(255),
  notes: z.string().optional(),
  createdAt: z.string(),
  date: z.coerce.date(),
  time: z.coerce.string(),
  userId: z.number(),
  id: z.number()
});

//omit fields managed by database when creating a log
export const createLogSchema = logSchema.omit({
  id: true,
  createdAt: true
});

export const editLogSchema = logSchema.omit({
  createdAt: true
});