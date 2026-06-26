import { getApiErrorMessage, handleSecurityError } from "@/shared/lib/http/security";
import { formatBooleanPtBr } from "@/shared/lib/utils/format";
import { formatDatePtBr } from "@/shared/lib/utils/date";
import { AppButton } from "@/shared/ui/components/AppButton";
import { AppDialog } from "@/shared/ui/components/AppDialog";
import { ConfirmDialog } from "@/shared/ui/components/ConfirmDialog";
import { EmptyState } from "@/shared/ui/components/EmptyState";
import { TableIconButton } from "@/shared/ui/components/TableIconButton";
import { useMutation } from "@tanstack/react-query";
import { Check, KeyRound, Pencil, Plus, RotateCcw, Shield, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const DEFAULT_TEMP_PASSWORD = "@Abcdefg1234";
const inputClassName = "h-10 rounded-[var(--radius-md)] border bg-white px-3 text-sm";

export interface UsersManagerUser {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  active: boolean;
  createdAt?: string;
}

export interface UsersManagerCreateInput {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isAdmin: boolean;
}

export interface UsersManagerUpdateInput {
  name?: string;
  email?: string;
  isAdmin?: boolean;
  active?: boolean;
}

export interface UsersManagerApi {
  create: (input: UsersManagerCreateInput) => Promise<unknown>;
  update: (userId: string, input: UsersManagerUpdateInput) => Promise<unknown>;
  resetPassword: (userId: string, password: string) => Promise<unknown>;
}

interface UsersManagerProps {
  users: UsersManagerUser[];
  totalUsers: number;
  isLoading?: boolean;
  onChanged: () => Promise<void> | void;
  api: UsersManagerApi;
}

export function UsersManager({ users, totalUsers, isLoading, onChanged, api }: UsersManagerProps) {
  const navigate = useNavigate();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const [editingUser, setEditingUser] = useState<UsersManagerUser | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [editActive, setEditActive] = useState(true);

  const [passwordTarget, setPasswordTarget] = useState<UsersManagerUser | null>(null);
  const [passwordValue, setPasswordValue] = useState("");

  const [deactivateTarget, setDeactivateTarget] = useState<UsersManagerUser | null>(null);

  function onMutationError(error: unknown, fallback: string) {
    if (handleSecurityError(error, navigate)) return;
    toast.error(getApiErrorMessage(error, fallback));
  }

  function openCreateDialog() {
    setUsername("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setIsAdmin(false);
    setIsCreateOpen(true);
  }

  function startEditUser(user: UsersManagerUser) {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditIsAdmin(user.isAdmin);
    setEditActive(user.active);
  }

  const createMutation = useMutation({
    mutationFn: () =>
      api.create({
        username: username.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password: DEFAULT_TEMP_PASSWORD,
        isAdmin,
      }),
    onSuccess: async () => {
      await onChanged();
      setIsCreateOpen(false);
      toast.success("Usuário criado com sucesso");
    },
    onError: (error) => onMutationError(error, "Falha ao criar usuário"),
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!editingUser) throw new Error("Nenhum usuário selecionado.");
      return api.update(editingUser.id, {
        name: editName.trim(),
        email: editEmail.trim(),
        isAdmin: editIsAdmin,
        active: editActive,
      });
    },
    onSuccess: async () => {
      await onChanged();
      setEditingUser(null);
      toast.success("Usuário atualizado com sucesso");
    },
    onError: (error) => onMutationError(error, "Falha ao atualizar usuário"),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: () => {
      if (!passwordTarget) throw new Error("Nenhum usuário selecionado.");
      return api.resetPassword(passwordTarget.id, passwordValue);
    },
    onSuccess: () => {
      setPasswordTarget(null);
      setPasswordValue("");
      toast.success("Senha redefinida com sucesso");
    },
    onError: (error) => onMutationError(error, "Falha ao redefinir senha"),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (payload: { userId: string; active: boolean }) =>
      api.update(payload.userId, { active: payload.active }),
    onSuccess: async () => {
      await onChanged();
      setDeactivateTarget(null);
      toast.success("Status do usuário atualizado");
    },
    onError: (error) => onMutationError(error, "Falha ao atualizar status do usuário"),
  });

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[hsl(var(--brand-dark))]">Usuários</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[hsl(var(--foreground-muted))]">
            {totalUsers} cadastrados
          </span>
          <AppButton type="button" className="h-9 px-3" onClick={openCreateDialog}>
            <Plus size={16} className="mr-1" />
            Novo usuário
          </AppButton>
        </div>
      </div>

      {!isLoading && users.length === 0 ? (
        <EmptyState title="Nenhum usuário" description="Crie o primeiro usuário desta operação." />
      ) : (
        <div className="overflow-auto rounded-[var(--radius-md)] border">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[hsl(var(--surface-muted))]">
              <tr>
                <th className="px-3 py-2">Nome</th>
                <th className="px-3 py-2">E-mail</th>
                <th className="px-3 py-2">Admin</th>
                <th className="px-3 py-2">Ativo</th>
                <th className="px-3 py-2">Criado em</th>
                <th className="px-3 py-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="px-3 py-2">{user.name}</td>
                  <td className="px-3 py-2">{user.email}</td>
                  <td className="px-3 py-2">{formatBooleanPtBr(user.isAdmin)}</td>
                  <td className="px-3 py-2">{formatBooleanPtBr(user.active)}</td>
                  <td className="px-3 py-2">
                    {user.createdAt ? formatDatePtBr(user.createdAt) : "-"}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-2">
                      <TableIconButton
                        aria-label={`Editar ${user.name}`}
                        onClick={() => startEditUser(user)}
                      >
                        <Pencil size={16} />
                      </TableIconButton>
                      <TableIconButton
                        aria-label={`Redefinir senha de ${user.name}`}
                        onClick={() => {
                          setPasswordTarget(user);
                          setPasswordValue("");
                        }}
                      >
                        <KeyRound size={16} />
                      </TableIconButton>
                      {user.active ? (
                        <TableIconButton
                          aria-label={`Inativar ${user.name}`}
                          variant="danger"
                          disabled={toggleStatusMutation.isPending}
                          onClick={() => setDeactivateTarget(user)}
                        >
                          <Trash2 size={16} />
                        </TableIconButton>
                      ) : (
                        <TableIconButton
                          aria-label={`Reativar ${user.name}`}
                          className="border-emerald-200 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                          disabled={toggleStatusMutation.isPending}
                          onClick={() =>
                            toggleStatusMutation.mutate({ userId: user.id, active: true })
                          }
                        >
                          <RotateCcw size={16} />
                        </TableIconButton>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AppDialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          if (!open) setIsCreateOpen(false);
        }}
        title="Novo usuário"
        description="O usuário será criado no Keycloak e vinculado a esta operação. A senha inicial é temporária e deve ser trocada no primeiro acesso."
        footer={
          <>
            <AppButton type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </AppButton>
            <AppButton
              type="button"
              disabled={createMutation.isPending}
              onClick={() => {
                if (!username.trim() || !firstName.trim() || !lastName.trim() || !email.trim()) {
                  toast.error("Preencha todos os dados do novo usuário");
                  return;
                }
                createMutation.mutate();
              }}
            >
              <Plus size={16} className="mr-1" />
              {createMutation.isPending ? "Criando..." : "Criar usuário"}
            </AppButton>
          </>
        }
      >
        <div className="grid gap-3">
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Username"
            className={inputClassName}
          />
          <input
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            placeholder="Nome"
            className={inputClassName}
          />
          <input
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            placeholder="Sobrenome"
            className={inputClassName}
          />
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="E-mail"
            type="email"
            className={inputClassName}
          />
          <div className="space-y-1">
            <input
              value={DEFAULT_TEMP_PASSWORD}
              readOnly
              disabled
              aria-label="Senha temporária"
              className={`${inputClassName} cursor-not-allowed bg-[hsl(var(--surface-muted))] text-[hsl(var(--foreground-muted))]`}
            />
            <p className="text-xs text-[hsl(var(--foreground-muted))]">
              Senha temporária padrão — o usuário deverá trocá-la no primeiro acesso.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={(event) => setIsAdmin(event.target.checked)}
            />
            Admin da operação
          </label>
        </div>
      </AppDialog>

      <AppDialog
        open={editingUser !== null}
        onOpenChange={(open) => {
          if (!open) setEditingUser(null);
        }}
        title="Editar usuário"
        description={editingUser ? `${editingUser.name} · ${editingUser.email}` : undefined}
        footer={
          <>
            <AppButton type="button" variant="ghost" onClick={() => setEditingUser(null)}>
              Cancelar
            </AppButton>
            <AppButton
              type="button"
              disabled={updateMutation.isPending}
              onClick={() => {
                if (!editName.trim() || !editEmail.trim()) {
                  toast.error("Informe nome e e-mail do usuário");
                  return;
                }
                updateMutation.mutate();
              }}
            >
              <Check size={16} className="mr-1" />
              {updateMutation.isPending ? "Salvando..." : "Salvar usuário"}
            </AppButton>
          </>
        }
      >
        <div className="grid gap-3">
          <input
            value={editName}
            onChange={(event) => setEditName(event.target.value)}
            placeholder="Nome"
            className={inputClassName}
          />
          <input
            value={editEmail}
            onChange={(event) => setEditEmail(event.target.value)}
            placeholder="E-mail"
            type="email"
            className={inputClassName}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={editIsAdmin}
              onChange={(event) => setEditIsAdmin(event.target.checked)}
            />
            Admin da operação
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={editActive}
              onChange={(event) => setEditActive(event.target.checked)}
            />
            Usuário ativo
          </label>
        </div>
      </AppDialog>

      <AppDialog
        open={Boolean(passwordTarget)}
        onOpenChange={(open) => {
          if (!open) setPasswordTarget(null);
        }}
        title="Redefinir senha"
        description={
          passwordTarget ? `${passwordTarget.name} · ${passwordTarget.email}` : undefined
        }
        footer={
          <>
            <AppButton type="button" variant="ghost" onClick={() => setPasswordTarget(null)}>
              Cancelar
            </AppButton>
            <AppButton
              type="button"
              disabled={resetPasswordMutation.isPending}
              onClick={() => {
                if (passwordValue.trim().length < 8) {
                  toast.error("A nova senha deve ter no mínimo 8 caracteres");
                  return;
                }
                resetPasswordMutation.mutate();
              }}
            >
              <Check size={16} className="mr-1" />
              {resetPasswordMutation.isPending ? "Salvando..." : "Redefinir senha"}
            </AppButton>
          </>
        }
      >
        <div className="rounded-[var(--radius-md)] border border-[hsl(var(--brand-light))] bg-[hsl(var(--surface-muted))] px-4 py-3 text-sm text-[hsl(var(--brand-dark))]">
          <div className="flex items-center gap-2">
            <Shield size={16} />
            <span>Defina uma senha temporária forte para o usuário.</span>
          </div>
        </div>
        <input
          value={passwordValue}
          onChange={(event) => setPasswordValue(event.target.value)}
          placeholder="Nova senha"
          type="password"
          className={inputClassName}
        />
      </AppDialog>

      <ConfirmDialog
        open={deactivateTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeactivateTarget(null);
        }}
        title="Inativar usuário"
        description={deactivateTarget ? `${deactivateTarget.name} será inativado.` : ""}
        confirmLabel="Inativar"
        isPending={toggleStatusMutation.isPending}
        onConfirm={() => {
          if (!deactivateTarget) return;
          toggleStatusMutation.mutate({ userId: deactivateTarget.id, active: false });
        }}
      />
    </section>
  );
}
