"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { AuthShell, FieldError } from "@/features/auth/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConfirmPasswordReset } from "@/lib/account";
import { apiErrorMessage } from "@/lib/api";

const schema = z
  .object({
    new_password1: z
      .string()
      .min(8, "A senha precisa de ao menos 8 caracteres"),
    new_password2: z.string(),
  })
  .refine((d) => d.new_password1 === d.new_password2, {
    message: "As senhas não conferem",
    path: ["new_password2"],
  });
type Values = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const router = useRouter();
  const confirm = useConfirmPasswordReset();
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Values) => {
    try {
      await confirm.mutateAsync({ uid, token, ...values });
      setDone(true);
      toast.success("Senha alterada! Faça login.");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      toast.error(
        apiErrorMessage(err, "Link inválido ou expirado. Solicite um novo."),
      );
    }
  };

  return (
    <AuthShell
      title="Criar nova senha"
      description="Defina uma nova senha para sua conta."
      footer={
        <Link href="/login" className="text-primary hover:underline">
          Voltar para o login
        </Link>
      }
    >
      {done ? (
        <p className="text-sm text-muted-foreground">
          Senha alterada! Redirecionando para o login…
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new_password1">Nova senha</Label>
            <Input
              id="new_password1"
              type="password"
              autoComplete="new-password"
              {...register("new_password1")}
            />
            <FieldError message={errors.new_password1?.message} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new_password2">Confirmar nova senha</Label>
            <Input
              id="new_password2"
              type="password"
              autoComplete="new-password"
              {...register("new_password2")}
            />
            <FieldError message={errors.new_password2?.message} />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Salvando…" : "Alterar senha"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
