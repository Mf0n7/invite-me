"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { AdminShell } from "@/components/admin/shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn, formatDateTime } from "@/lib/utils";

// TODO: substituir por chamada real quando o endpoint `/admin/users/` existir no backend.
const USERS = [
  { id: 1, full_name: "Ana Souza", email: "ana@email.com", plan: "Premium", status: "ativo", date_joined: "2026-01-12T10:00:00Z" },
  { id: 2, full_name: "Bruno Lima", email: "bruno@email.com", plan: "Plus", status: "ativo", date_joined: "2026-02-03T10:00:00Z" },
  { id: 3, full_name: "Carla Dias", email: "carla@email.com", plan: "Básico", status: "ativo", date_joined: "2026-02-20T10:00:00Z" },
  { id: 4, full_name: "Diego Alves", email: "diego@email.com", plan: "Plus", status: "inativo", date_joined: "2025-11-08T10:00:00Z" },
  { id: 5, full_name: "Elaine Rocha", email: "elaine@email.com", plan: "Premium", status: "ativo", date_joined: "2026-03-15T10:00:00Z" },
  { id: 6, full_name: "Felipe Costa", email: "felipe@email.com", plan: "Básico", status: "ativo", date_joined: "2026-04-01T10:00:00Z" },
];

export default function AdminUsersPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return USERS;
    return USERS.filter(
      (u) => u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <AdminShell>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Usuários
          </h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} de {USERS.length} usuários
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email…"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Plano</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{u.full_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">{u.plan}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        u.status === "ativo"
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDateTime(u.date_joined)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
