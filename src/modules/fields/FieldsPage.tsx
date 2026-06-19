import { adminOperationsApi } from "@/modules/admin/admin-operations.api";
import { useAuth } from "@/modules/auth/AuthContext";
import { isAppAdmin } from "@/shared/config/permissions";
import type { FieldEntity } from "@/shared/types/auth";
import { queryKeys } from "@/shared/config/query-keys";
import { getApiErrorMessage } from "@/shared/lib/http/security";
import { AppButton } from "@/shared/ui/components/AppButton";
import { AppCard } from "@/shared/ui/components/AppCard";
import { AppDialog } from "@/shared/ui/components/AppDialog";
import { ConfirmDialog } from "@/shared/ui/components/ConfirmDialog";
import { EmptyState } from "@/shared/ui/components/EmptyState";
import { PaginationControls } from "@/shared/ui/components/PaginationControls";
import { PageHeader } from "@/shared/ui/components/PageHeader";
import { RefreshIconButton } from "@/shared/ui/components/RefreshIconButton";
import { TableIconButton } from "@/shared/ui/components/TableIconButton";
import { usePaginationState } from "@/shared/lib/hooks/usePaginationState";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const inputClassName = "h-10 rounded-[var(--radius-md)] border bg-white px-3 text-sm";
const textareaClassName = "min-h-24 rounded-[var(--radius-md)] border bg-white px-3 py-2 text-sm";

export function FieldsPage() {
  const queryClient = useQueryClient();
  const pagination = usePaginationState();
  const { profile } = useAuth();
  const canManage = isAppAdmin(profile);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [targetField, setTargetField] = useState<FieldEntity | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<FieldEntity | null>(null);
  const [farmId, setFarmId] = useState("");
  const [name, setName] = useState("");
  const [areaHectares, setAreaHectares] = useState("0");
  const [description, setDescription] = useState("");

  const fieldsQuery = useQuery({
    queryKey: [...queryKeys.fields, pagination.pagination],
    queryFn: () => adminOperationsApi.listFields(pagination.pagination),
    placeholderData: keepPreviousData,
  });

  const farmsQuery = useQuery({
    queryKey: [...queryKeys.farms, { page: 1, limit: 100, active: true }],
    queryFn: () => adminOperationsApi.listFarms({ page: 1, limit: 100, active: true }),
    enabled: dialogMode !== null,
  });

  async function invalidateFields() {
    await queryClient.invalidateQueries({ queryKey: queryKeys.fields });
  }

  function onError(error: unknown, fallback: string) {
    toast.error(getApiErrorMessage(error, fallback));
  }

  function openCreateDialog() {
    setTargetField(null);
    setFarmId("");
    setName("");
    setAreaHectares("0");
    setDescription("");
    setDialogMode("create");
  }

  function openEditDialog(field: FieldEntity) {
    setTargetField(field);
    setFarmId(field.farmId);
    setName(field.name);
    setAreaHectares(String(field.areaHectares));
    setDescription(field.description ?? "");
    setDialogMode("edit");
  }

  function closeDialog() {
    setDialogMode(null);
    setTargetField(null);
  }

  const createMutation = useMutation({
    mutationFn: () =>
      adminOperationsApi.createField({
        farmId,
        name: name.trim(),
        areaHectares: Number(areaHectares),
        description: description.trim() || undefined,
      }),
    onSuccess: async () => {
      await invalidateFields();
      closeDialog();
      toast.success("Talhão criado com sucesso");
    },
    onError: (error) => onError(error, "Falha ao criar talhão"),
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!targetField) throw new Error("Nenhum talhão selecionado.");
      return adminOperationsApi.updateField(targetField.id, {
        name: name.trim(),
        areaHectares: Number(areaHectares),
        description: description.trim() || null,
      });
    },
    onSuccess: async () => {
      await invalidateFields();
      closeDialog();
      toast.success("Talhão atualizado com sucesso");
    },
    onError: (error) => onError(error, "Falha ao atualizar talhão"),
  });

  const deactivateMutation = useMutation({
    mutationFn: (fieldId: string) => adminOperationsApi.deactivateField(fieldId),
    onSuccess: async () => {
      await invalidateFields();
      setConfirmTarget(null);
      toast.success("Talhão inativado com sucesso");
    },
    onError: (error) => onError(error, "Falha ao inativar talhão"),
  });

  const fields = fieldsQuery.data?.data ?? [];
  const farms = farmsQuery.data?.data ?? [];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Talhões"
        subtitle="Gestão de áreas cultiváveis por fazenda"
        breadcrumb="Operações / Talhões"
        actions={
          <div className="flex items-center gap-2">
            <RefreshIconButton
              onClick={() => {
                void queryClient.invalidateQueries({ queryKey: queryKeys.fields });
                void queryClient.invalidateQueries({ queryKey: queryKeys.farms });
              }}
              disabled={fieldsQuery.isFetching || farmsQuery.isFetching}
            />
            {canManage ? (
              <AppButton type="button" onClick={openCreateDialog}>
                Novo talhão
              </AppButton>
            ) : null}
          </div>
        }
      />

      {fieldsQuery.isError ? (
        <EmptyState
          title="Erro ao carregar talhões"
          description="Não foi possível carregar a listagem."
        />
      ) : fields.length === 0 ? (
        <EmptyState
          title="Nenhum talhão cadastrado"
          description="Cadastre talhões para acompanhar áreas, hectares e operação de campo."
          actionLabel={canManage ? "Novo talhão" : undefined}
          onAction={canManage ? openCreateDialog : undefined}
        />
      ) : (
        <>
          <AppCard className="overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[hsl(var(--surface-muted))]">
              <tr>
                <th className="px-3 py-2">Nome</th>
                <th className="px-3 py-2">Fazenda</th>
                <th className="px-3 py-2">Área (ha)</th>
                <th className="px-3 py-2">Status</th>
                {canManage ? <th className="px-3 py-2 text-right">Ações</th> : null}
              </tr>
            </thead>
            <tbody>
              {fields.map((field) => (
                <tr key={field.id} className="border-t">
                  <td className="px-3 py-2">{field.name}</td>
                  <td className="px-3 py-2">{field.farm?.name ?? field.farmId}</td>
                  <td className="px-3 py-2">{field.areaHectares}</td>
                  <td className="px-3 py-2">{field.active ? "Ativo" : "Inativo"}</td>
                  {canManage ? (
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-2">
                        <TableIconButton
                          aria-label={`Editar ${field.name}`}
                          onClick={() => openEditDialog(field)}
                        >
                          <Pencil size={16} />
                        </TableIconButton>
                        <TableIconButton
                          aria-label={`Inativar ${field.name}`}
                          variant="danger"
                          disabled={deactivateMutation.isPending}
                          onClick={() => setConfirmTarget(field)}
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

          <PaginationControls
            page={pagination.page}
            limit={pagination.limit}
            total={fieldsQuery.data?.total ?? 0}
            totalPages={fieldsQuery.data?.totalPages ?? 0}
            onPageChange={pagination.setPage}
            onLimitChange={pagination.setLimit}
          />
        </>
      )}

      <AppDialog
        open={dialogMode !== null}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        title={dialogMode === "edit" ? "Editar talhão" : "Novo talhão"}
        description="Use o mesmo formulário para criar ou atualizar o talhão."
        footer={
          <>
            <AppButton type="button" variant="ghost" onClick={closeDialog}>
              Cancelar
            </AppButton>
            <AppButton
              type="button"
              disabled={createMutation.isPending || updateMutation.isPending}
              onClick={() => {
                if (!farmId || !name.trim()) {
                  toast.error("Informe fazenda e nome do talhão");
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
                  ? "Salvar talhão"
                  : "Criar talhão"}
            </AppButton>
          </>
        }
      >
        <div className="grid gap-3">
          <select
            value={farmId}
            onChange={(event) => setFarmId(event.target.value)}
            className={inputClassName}
            disabled={dialogMode === "edit"}
          >
            <option value="">Selecione a fazenda</option>
            {farms.map((farm) => (
              <option key={farm.id} value={farm.id}>
                {farm.name}
              </option>
            ))}
          </select>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nome do talhão"
            className={inputClassName}
          />
          <input
            value={areaHectares}
            onChange={(event) => setAreaHectares(event.target.value)}
            placeholder="Área (ha)"
            type="number"
            min={0}
            step="0.01"
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
        title="Inativar talhão"
        description={`O talhão "${confirmTarget?.name ?? ""}" será retirado da operação ativa.`}
        confirmLabel="Inativar talhão"
        isPending={deactivateMutation.isPending}
        onConfirm={() => {
          if (!confirmTarget) return;
          deactivateMutation.mutate(confirmTarget.id);
        }}
      />
    </div>
  );
}
