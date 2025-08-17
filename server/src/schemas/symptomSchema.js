import { z } from 'zod';

export const symptomSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Symptom name should be longer').max(255),
  date: z.coerce.date(),
  time: z.coerce.string(),
  userId: z.number()
});

//omit fields managed by database when creating a log
export const createSymptomSchema = symptomSchema.omit({
  id: true,
});