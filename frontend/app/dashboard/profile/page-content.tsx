"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, LogOut, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { DashboardShell } from "@/components/dashboard/shell";
import { FieldError } from "@/components/shared/field-error";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth";
import {
  useDeleteAccount,
  useRequestPasswordReset,
  useUpdateProfile,
} from "@/hooks/use-account";
import { apiErrorMessage } from "@/lib/api";
import {
  profileSchema,
  type ProfileValues,
} from "@/features/auth/schemas/auth.schema";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const updateProfile = useUpdateProfile();
  const requestReset = useRequestPasswordReset();
  const deleteAccount = useDeleteAccount();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name ?? "",
        display_name: user.display_name ?? "",
        avatar_url: user.avatar_url ?? "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (values: ProfileValues) => {
    try {
      await updateProfile.mutateAsync({
        full_name: values.full_name || "",
        display_name: values.display_name || "",
        avatar_url: values.avatar_url || "",
      });
      toast.success("Perfil atualizado.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível salvar."));
    }
  };

  const changePassword = async () => {
    if (!user) return;
    try {
      await requestReset.mutateAsync(user.email);
      toast.success("Enviamos um e-mail com o link para alterar sua senha.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível enviar o e-mail."));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAccount.mutateAsync();
      logout();
      router.push("/");
      toast.success("Conta encerrada.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível encerrar a conta."));
    }
  };

  const initials = (user?.display_name || user?.full_name || user?.email || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DashboardShell>
      <h1 className="mb-6 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Perfil
      </h1>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        {/* Informações */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Informações</CardTitle>
            <CardDescription>
              Membro desde{" "}
              {user?.date_joined
                ? new Date(user.date_joined).toLocaleDateString("pt-BR", {
                    month: "long",
                    year: "numeric",
                  })
                : "—"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="flex items-center gap-4">
                <Avatar className="size-16">
                  <AvatarImage src={user?.avatar_url || undefined} />
                  <AvatarFallback className="text-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="avatar_url">URL do avatar</Label>
                  <Input
                    id="avatar_url"
                    placeholder="https://…"
                    {...register("avatar_url")}
                  />
                  <FieldError message={errors.avatar_url?.message} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>E-mail</Label>
                <Input
                  value={user?.email ?? ""}
                  readOnly
                  className="bg-muted text-muted-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="full_name">Nome completo</Label>
                <Input
                  id="full_name"
                  placeholder="Seu nome"
                  {...register("full_name")}
                />
                <FieldError message={errors.full_name?.message} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="display_name">Nome de exibição</Label>
                <Input
                  id="display_name"
                  placeholder="Como quer ser chamado"
                  {...register("display_name")}
                />
                <FieldError message={errors.display_name?.message} />
              </div>

              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting ? "Salvando…" : "Salvar alterações"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Segurança</CardTitle>
            <CardDescription>
              A troca de senha é confirmada por e-mail.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                onClick={changePassword}
                disabled={requestReset.isPending}
              >
                <KeyRound />{" "}
                {requestReset.isPending ? "Enviando…" : "Alterar senha"}
              </Button>
              <Button
                variant="ghost"
                className="text-muted-foreground"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
              >
                <LogOut /> Sair da conta
              </Button>
            </div>

            <Separator />

            <div>
              <p className="mb-3 text-sm text-muted-foreground">
                Ao encerrar a conta, seus dados serão desativados
                permanentemente.
              </p>
              <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 /> Encerrar conta
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Encerrar conta</DialogTitle>
                    <DialogDescription>
                      Esta ação não pode ser desfeita. Seus eventos e dados
                      serão desativados.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDeleteOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={deleteAccount.isPending}
                      onClick={handleDelete}
                    >
                      {deleteAccount.isPending
                        ? "Encerrando…"
                        : "Confirmar encerramento"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
