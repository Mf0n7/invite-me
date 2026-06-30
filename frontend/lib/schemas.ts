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

export const eventSchema = z
  .object({
    title: z.string().trim().min(1, "Informe o título").max(140),
    description: z.string().trim().max(2000).optional(),
    address: z.string().trim().min(1, "Informe o endereço").max(255),
    location_link: z.string().url("Link inválido").or(z.literal("")).optional(),
    starts_at: z
      .string()
      .min(1, "Informe data e horário")
      .refine((val) => new Date(val) > new Date(), "A data do evento deve ser no futuro"),
    note: z.string().trim().max(2000).optional(),
    allow_companions: z.boolean().default(false),
    max_companions: z.coerce.number().int().min(0).max(20).default(0),
  })
  .refine((d) => !d.allow_companions || d.max_companions >= 1, {
    message: "Defina ao menos 1 acompanhante",
    path: ["max_companions"],
  });
export type EventFormValues = z.infer<typeof eventSchema>;

export const confirmSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(120),
  companions: z
    .array(z.object({ name: z.string().trim().min(1, "Informe o nome do acompanhante").max(120) }))
    .default([]),
});
export type ConfirmValues = z.infer<typeof confirmSchema>;
