import { z } from "zod/v4";

export const loginSchema = z.strictObject({
  email: z.email(),
  password: z.string().min(10),
});
