import { z } from 'zod';

export const groupSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Name should be longer').max(255),
  userIds: z.array(z.number().int())
})

//omit fields managed by database when creating a group
export const createGroupSchema = groupSchema.omit({
  id: true
});