"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AuthShell, Divider } from "@/components/auth/auth-shell";
import { GoogleButton } from "@/components/auth/google-button";
import { FieldError } from "@/components/shared/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/auth";
import { registerSchema, type RegisterValues } from "@/lib/schemas";

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterValues) => {
    try {
      await registerUser(values);
      toast.success("Conta criada! Vamos começar.");
      router.push("/dashboard");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível criar a conta."));
    }
  };

  return (
    <AuthShell
      title="Criar conta"
      description="Comece grátis — eventos com até 20 confirmados não custam nada."
      footer={
        <>
          Já tem conta?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Nome (opcional)</Label>
          <Input
            id="full_name"
            autoComplete="name"
            autoFocus
            {...register("full_name")}
          />
          <FieldError message={errors.full_name?.message} />
        </div>
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
        <div className="space-y-1.5">
          <Label htmlFor="password1">Senha</Label>
          <Input
            id="password1"
            type="password"
            autoComplete="new-password"
            {...register("password1")}
          />
          <FieldError message={errors.password1?.message} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password2">Confirmar senha</Label>
          <Input
            id="password2"
            type="password"
            autoComplete="new-password"
            {...register("password2")}
          />
          <FieldError message={errors.password2?.message} />
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Criando…" : "Criar conta"}
        </Button>
      </form>

      <Divider>ou</Divider>
      <GoogleButton onSuccess={() => router.push("/dashboard")} />
    </AuthShell>
  );
}
