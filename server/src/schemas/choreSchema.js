import { z } from 'zod';

export const choreSchema = z.object({
  choreId: z.number().optional(),
  groupId: z.number(),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  completed: z.boolean().optional().default(false),
  dueDate: z.coerce.date()
});

export const createChoreSchema = choreSchema.omit({
  choreId: true
});

export const updateChoreSchema = choreSchema.partial().extend({
  choreId: z.number().optional(),
  groupId: z.number()
});
