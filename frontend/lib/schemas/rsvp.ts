import { z } from "zod";

const nameRegex = /^[\p{L}\s'-]+$/u;
const nameField = z
  .string()
  .trim()
  .min(5, "O nome deve ter ao menos 5 caracteres")
  .max(120)
  .regex(nameRegex, "O nome não pode conter caracteres especiais ou números");

export const confirmSchema = z.object({
  name: nameField,
  companions: z.array(z.object({ name: nameField })).default([]),
});
export type ConfirmValues = z.infer<typeof confirmSchema>;
