import { z } from 'zod';

export const logSchema = z.object({
  id: z.number(),
  meal: z.string().min(1, 'Meal name should be longer').max(255),
  symptom: z.string().optional(),
  notes: z.string().optional(),
  userId: z.number(),
  createdAt: z.string()
});

//omit fields managed by database when creating a log
export const createLogSchema = logSchema.omit({
  id: true,
  createdAt: true
});