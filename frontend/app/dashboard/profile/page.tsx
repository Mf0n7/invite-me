"use client";

import { KeyRound, LogOut, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { BackButton } from "@/components/shared/back-button";
import { DashboardShell } from "@/components/dashboard/shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRequestPasswordReset } from "@/hooks/use-account";
import { apiErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/auth";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const requestReset = useRequestPasswordReset();

  const changePassword = async () => {
    if (!user) return;
    try {
      await requestReset.mutateAsync(user.email);
      toast.success("Enviamos um e-mail com o link para alterar sua senha.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível enviar o e-mail."));
    }
  };

  return (
    <DashboardShell>
      <BackButton href="/dashboard" />
      <h1 className="mb-6 font-display text-2xl font-semibold tracking-tight sm:text-3xl">Perfil</h1>

      <div className="max-w-md space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Sua conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <Mail className="size-4 text-primary" /> {user?.email}
            </p>
            {user?.full_name && <p className="text-muted-foreground">{user.full_name}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Segurança</CardTitle>
            <CardDescription>
              Por segurança, a troca de senha é confirmada por e-mail.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" onClick={changePassword} disabled={requestReset.isPending}>
              <KeyRound /> {requestReset.isPending ? "Enviando…" : "Alterar senha"}
            </Button>
            <Button
              variant="ghost"
              className="text-destructive"
              onClick={() => {
                logout();
                router.push("/");
              }}
            >
              <LogOut /> Sair da conta
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
