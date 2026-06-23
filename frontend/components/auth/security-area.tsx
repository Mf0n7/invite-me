import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import { KeyRound, LogOut, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// todo: ajustar esse componente e importar ele em /profile com responsabilidades separadas

export default function SecurityArea() {
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
          <KeyRound /> {requestReset.isPending ? "Enviando…" : "Alterar senha"}
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
          Ao encerrar a conta, seus dados serão desativados permanentemente.
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
                Esta ação não pode ser desfeita. Seus eventos e dados serão
                desativados.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteOpen(false)}>
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
  </Card>;
}
