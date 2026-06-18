"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthShell, FieldError } from "@/features/auth/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRequestPasswordReset } from "@/lib/account";

const schema = z.object({ email: z.string().email("E-mail inválido") });
type Values = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const request = useRequestPasswordReset();
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Values) => {
    await request.mutateAsync(values.email).catch(() => null);
    setSent(true); // não revelamos se o e-mail existe
  };

  return (
    <AuthShell
      title="Esqueci minha senha"
      description="Enviaremos um link de redefinição para o seu e-mail."
      footer={
        <Link href="/login" className="text-primary hover:underline">
          Voltar para o login
        </Link>
      }
    >
      {sent ? (
        <p className="text-sm text-muted-foreground">
          Se houver uma conta com esse e-mail, enviamos um link para redefinir a
          senha. Confira sua caixa de entrada e o spam.
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email")}
            />
            <FieldError message={errors.email?.message} />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Enviando…" : "Enviar link"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
