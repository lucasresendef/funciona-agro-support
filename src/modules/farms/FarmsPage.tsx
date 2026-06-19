import { adminOperationsApi } from "@/modules/admin/admin-operations.api";
import { useAuth } from "@/modules/auth/AuthContext";
import { isAppAdmin } from "@/shared/config/permissions";
import type { FarmEntity } from "@/shared/types/auth";
import { queryKeys } from "@/shared/config/query-keys";
import { getApiErrorMessage } from "@/shared/lib/http/security";
import { AppButton } from "@/shared/ui/components/AppButton";
import { AppCard } from "@/shared/ui/components/AppCard";
import { AppDialog } from "@/shared/ui/components/AppDialog";
import { ConfirmDialog } from "@/shared/ui/components/ConfirmDialog";
import { EmptyState } from "@/shared/ui/components/EmptyState";
import { PageHeader } from "@/shared/ui/components/PageHeader";
import { RefreshIconButton } from "@/shared/ui/components/RefreshIconButton";
import { TableIconButton } from "@/shared/ui/components/TableIconButton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const inputClassName = "h-10 rounded-[var(--radius-md)] border bg-white px-3 text-sm";
const textareaClassName = "min-h-24 rounded-[var(--radius-md)] border bg-white px-3 py-2 text-sm";

export function FarmsPage() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const canManage = isAppAdmin(profile);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [targetFarm, setTargetFarm] = useState<FarmEntity | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<FarmEntity | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const query = useQuery({
    queryKey: [...queryKeys.farms, { page: 1, limit: 100 }],
    queryFn: () => adminOperationsApi.listFarms({ page: 1, limit: 100 }),
  });

  async function invalidateFarms() {
    await queryClient.invalidateQueries({ queryKey: queryKeys.farms });
  }

  function onError(error: unknown, fallback: string) {
    toast.error(getApiErrorMessage(error, fallback));
  }

  function openCreateDialog() {
    setTargetFarm(null);
    setName("");
    setDescription("");
    setDialogMode("create");
  }

  function openEditDialog(farm: FarmEntity) {
    setTargetFarm(farm);
    setName(farm.name);
    setDescription(farm.description ?? "");
    setDialogMode("edit");
  }

  function closeDialog() {
    setDialogMode(null);
    setTargetFarm(null);
  }

  const createMutation = useMutation({
    mutationFn: () =>
      adminOperationsApi.createFarm({
        name: name.trim(),
        description: description.trim() || undefined,
      }),
    onSuccess: async () => {
      await invalidateFarms();
      closeDialog();
      toast.success("Fazenda criada com sucesso");
    },
    onError: (error) => onError(error, "Falha ao criar fazenda"),
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!targetFarm) throw new Error("Nenhuma fazenda selecionada.");
      return adminOperationsApi.updateFarm(targetFarm.id, {
        name: name.trim(),
        description: description.trim() || null,
      });
    },
    onSuccess: async () => {
      await invalidateFarms();
      closeDialog();
      toast.success("Fazenda atualizada com sucesso");
    },
    onError: (error) => onError(error, "Falha ao atualizar fazenda"),
  });

  const deactivateMutation = useMutation({
    mutationFn: (farmId: string) => adminOperationsApi.deactivateFarm(farmId),
    onSuccess: async () => {
      await invalidateFarms();
      setConfirmTarget(null);
      toast.success("Fazenda inativada com sucesso");
    },
    onError: (error) => onError(error, "Falha ao inativar fazenda"),
  });

  const farms = query.data?.data ?? [];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Fazendas"
        subtitle="Gestão das unidades produtivas da operação"
        breadcrumb="Operações / Fazendas"
        actions={
          <div className="flex items-center gap-2">
            <RefreshIconButton onClick={() => query.refetch()} disabled={query.isFetching} />
            {canManage ? (
              <AppButton type="button" onClick={openCreateDialog}>
                Nova fazenda
              </AppButton>
            ) : null}
          </div>
        }
      />

      {query.isError ? (
        <EmptyState
          title="Erro ao carregar fazendas"
          description="Não foi possível carregar a listagem."
        />
      ) : farms.length === 0 ? (
        <EmptyState
          title="Nenhuma fazenda cadastrada"
          description="Adicione fazendas para estruturar áreas e permissões da plataforma."
        />
      ) : (
        <AppCard className="overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[hsl(var(--surface-muted))]">
              <tr>
                <th className="px-3 py-2">Nome</th>
                <th className="px-3 py-2">Descrição</th>
                <th className="px-3 py-2">Status</th>
                {canManage ? <th className="px-3 py-2 text-right">Ações</th> : null}
              </tr>
            </thead>
            <tbody>
              {farms.map((farm) => (
                <tr key={farm.id} className="border-t">
                  <td className="px-3 py-2">{farm.name}</td>
                  <td className="px-3 py-2">{farm.description ?? "-"}</td>
                  <td className="px-3 py-2">{farm.active ? "Ativa" : "Inativa"}</td>
                  {canManage ? (
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-2">
                        <TableIconButton
                          aria-label={`Editar ${farm.name}`}
                          onClick={() => openEditDialog(farm)}
                        >
                          <Pencil size={16} />
                        </TableIconButton>
                        <TableIconButton
                          aria-label={`Inativar ${farm.name}`}
                          variant="danger"
                          disabled={deactivateMutation.isPending}
                          onClick={() => setConfirmTarget(farm)}
                        >
                          <Trash2 size={16} />
                        </TableIconButton>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </AppCard>
      )}

      <AppDialog
        open={dialogMode !== null}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        title={dialogMode === "edit" ? "Editar fazenda" : "Nova fazenda"}
        description="Preencha os dados principais da fazenda. O mesmo formulário atende criação e edição."
        footer={
          <>
            <AppButton type="button" variant="ghost" onClick={closeDialog}>
              Cancelar
            </AppButton>
            <AppButton
              type="button"
              disabled={createMutation.isPending || updateMutation.isPending}
              onClick={() => {
                if (!name.trim()) {
                  toast.error("Informe o nome da fazenda");
                  return;
                }
                if (dialogMode === "edit") {
                  updateMutation.mutate();
                  return;
                }
                createMutation.mutate();
              }}
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Salvando..."
                : dialogMode === "edit"
                  ? "Salvar fazenda"
                  : "Criar fazenda"}
            </AppButton>
          </>
        }
      >
        <div className="grid gap-3">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nome da fazenda"
            className={inputClassName}
          />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Descrição"
            className={textareaClassName}
          />
        </div>
      </AppDialog>

      <ConfirmDialog
        open={Boolean(confirmTarget)}
        onOpenChange={(open) => {
          if (!open) setConfirmTarget(null);
        }}
        title="Inativar fazenda"
        description={`A fazenda "${confirmTarget?.name ?? ""}" será retirada da operação ativa.`}
        confirmLabel="Inativar fazenda"
        isPending={deactivateMutation.isPending}
        onConfirm={() => {
          if (!confirmTarget) return;
          deactivateMutation.mutate(confirmTarget.id);
        }}
      />
    </div>
  );
}
