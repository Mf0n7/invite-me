import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    full_name: z.string().trim().max(150).optional(),
    email: z.string().email("E-mail inválido"),
    password1: z.string().min(8, "A senha precisa de ao menos 8 caracteres"),
    password2: z.string(),
  })
  .refine((d) => d.password1 === d.password2, {
    message: "As senhas não conferem",
    path: ["password2"],
  });
export type RegisterValues = z.infer<typeof registerSchema>;
