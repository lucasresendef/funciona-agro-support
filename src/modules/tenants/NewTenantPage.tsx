import { supportTenantsApi } from "@/modules/tenants/support-tenants.api";
import type {
  CreateTenantFarmInputDto,
  CreateTenantFieldInputDto,
  CreateTenantRequestDto,
} from "@/modules/tenants/contracts/support-tenants.dto";
import { routes } from "@/shared/config/routes";
import { queryKeys } from "@/shared/config/query-keys";
import { getApiErrorMessage, handleSecurityError } from "@/shared/lib/http/security";
import { AppButton } from "@/shared/ui/components/AppButton";
import { AppCard } from "@/shared/ui/components/AppCard";
import { AppDialog } from "@/shared/ui/components/AppDialog";
import { ConfirmDialog } from "@/shared/ui/components/ConfirmDialog";
import { PageHeader } from "@/shared/ui/components/PageHeader";
import { TableIconButton } from "@/shared/ui/components/TableIconButton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface FarmDraft extends CreateTenantFarmInputDto {
  id: string;
  fields: FieldDraft[];
}

interface FieldDraft extends CreateTenantFieldInputDto {
  id: string;
}

let draftId = 0;

function nextDraftId(): string {
  draftId += 1;
  return `draft-${draftId}`;
}

function blankField(): FieldDraft {
  return { id: nextDraftId(), name: "", areaHectares: 0, description: "" };
}

function blankFarm(): FarmDraft {
  return { id: nextDraftId(), name: "", description: "", fields: [] };
}

export function NewTenantPage() {
  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [farms, setFarms] = useState<FarmDraft[]>([]);
  const [farmDialogOpen, setFarmDialogOpen] = useState(false);
  const [editingFarmId, setEditingFarmId] = useState<string | null>(null);
  const [farmName, setFarmName] = useState("");
  const [farmDescription, setFarmDescription] = useState("");
  const [farmToRemove, setFarmToRemove] = useState<FarmDraft | null>(null);
  const [fieldDialogOpen, setFieldDialogOpen] = useState(false);
  const [fieldFarmId, setFieldFarmId] = useState("");
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [fieldName, setFieldName] = useState("");
  const [fieldAreaHectares, setFieldAreaHectares] = useState("0");
  const [fieldDescription, setFieldDescription] = useState("");
  const [fieldToRemove, setFieldToRemove] = useState<{
    farmId: string;
    farmName: string;
    field: FieldDraft;
  } | null>(null);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const createMutation = useMutation({
    mutationFn: (payload: CreateTenantRequestDto) => supportTenantsApi.createTenant(payload),
    onSuccess: (tenant) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.supportTenants });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.supportTenantDetail, tenant.id] });
      toast.success("Tenant criado com sucesso");
      navigate(routes.tenantDetail.replace(":tenantId", tenant.id));
    },
    onError: (error) => {
      if (handleSecurityError(error, navigate)) return;
      toast.error(getApiErrorMessage(error, "Falha ao criar tenant"));
    },
  });

  function validate() {
    if (!key.trim() || !name.trim()) {
      toast.error("Preencha key e nome do tenant");
      return false;
    }
    if (!username.trim() || !adminName.trim() || !email.trim() || !password.trim()) {
      toast.error("Preencha todos os dados do admin inicial");
      return false;
    }
    if (password.length < 8) {
      toast.error("A senha do admin deve ter no mínimo 8 caracteres");
      return false;
    }
    const invalidFarm = farms.find((farm) => !farm.name.trim());
    if (invalidFarm) {
      toast.error("Toda fazenda inicial precisa ter nome");
      return false;
    }
    const invalidField = farms.flatMap((farm) => farm.fields).find((field) => !field.name.trim());
    if (invalidField) {
      toast.error("Todo campo inicial precisa ter nome");
      return false;
    }
    const invalidFieldArea = farms
      .flatMap((farm) => farm.fields)
      .find((field) => !Number.isFinite(Number(field.areaHectares)) || Number(field.areaHectares) < 0);
    if (invalidFieldArea) {
      toast.error("Toda área inicial de campo precisa ser um número válido");
      return false;
    }
    return true;
  }

  function openCreateFarmDialog() {
    setEditingFarmId(null);
    setFarmName("");
    setFarmDescription("");
    setFarmDialogOpen(true);
  }

  function openEditFarmDialog(farm: FarmDraft) {
    setEditingFarmId(farm.id);
    setFarmName(farm.name);
    setFarmDescription(farm.description ?? "");
    setFarmDialogOpen(true);
  }

  function closeFarmDialog() {
    setFarmDialogOpen(false);
    setEditingFarmId(null);
    setFarmName("");
    setFarmDescription("");
  }

  function saveFarmDraft() {
    if (!farmName.trim()) {
      toast.error("Informe o nome da fazenda");
      return;
    }

    if (editingFarmId) {
      setFarms((prev) =>
        prev.map((farm) =>
          farm.id === editingFarmId
            ? {
                ...farm,
                name: farmName.trim(),
                description: farmDescription.trim(),
              }
            : farm,
        ),
      );
    } else {
      setFarms((prev) => [
        ...prev,
        {
          ...blankFarm(),
          name: farmName.trim(),
          description: farmDescription.trim(),
        },
      ]);
    }

    closeFarmDialog();
  }

  function openCreateFieldDialog(farmId: string) {
    setFieldFarmId(farmId);
    setEditingFieldId(null);
    setFieldName("");
    setFieldAreaHectares("0");
    setFieldDescription("");
    setFieldDialogOpen(true);
  }

  function openEditFieldDialog(farmId: string, field: FieldDraft) {
    setFieldFarmId(farmId);
    setEditingFieldId(field.id);
    setFieldName(field.name);
    setFieldAreaHectares(String(field.areaHectares));
    setFieldDescription(field.description ?? "");
    setFieldDialogOpen(true);
  }

  function closeFieldDialog() {
    setFieldDialogOpen(false);
    setFieldFarmId("");
    setEditingFieldId(null);
    setFieldName("");
    setFieldAreaHectares("0");
    setFieldDescription("");
  }

  function saveFieldDraft() {
    if (!fieldFarmId) {
      toast.error("Selecione uma fazenda para o campo");
      return;
    }
    if (!fieldName.trim()) {
      toast.error("Informe o nome do campo");
      return;
    }

    const parsedArea = Number(fieldAreaHectares);
    if (!Number.isFinite(parsedArea) || parsedArea < 0) {
      toast.error("Informe uma área válida para o campo");
      return;
    }

    setFarms((prev) =>
      prev.map((farm) => {
        if (farm.id !== fieldFarmId) return farm;

        if (editingFieldId) {
          return {
            ...farm,
            fields: farm.fields.map((field) =>
              field.id === editingFieldId
                ? {
                    ...field,
                    name: fieldName.trim(),
                    areaHectares: parsedArea,
                    description: fieldDescription.trim(),
                  }
                : field,
            ),
          };
        }

        return {
          ...farm,
          fields: [
            ...farm.fields,
            {
              ...blankField(),
              name: fieldName.trim(),
              areaHectares: parsedArea,
              description: fieldDescription.trim(),
            },
          ],
        };
      }),
    );

    closeFieldDialog();
  }

  function handleSubmit() {
    if (!validate()) return;

    createMutation.mutate({
      key,
      name,
      adminUser: {
        username,
        name: adminName,
        email,
        password,
      },
      farms: farms.map((farm) => ({
        name: farm.name,
        description: farm.description || undefined,
        fields: farm.fields.map((field) => ({
          name: field.name,
          areaHectares: Number(field.areaHectares),
          description: field.description || undefined,
        })),
      })),
    });
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Novo tenant"
        subtitle="Crie tenant, admin inicial e estrutura opcional de fazendas e campos"
        breadcrumb="Operações / Tenants / Novo"
        actions={
          <Link to={routes.tenants}>
            <AppButton type="button" variant="secondary">
              Voltar
            </AppButton>
          </Link>
        }
      />

      <AppCard className="space-y-4">
        <h2 className="text-lg font-bold text-[hsl(var(--brand-dark))]">Dados do tenant</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={key}
            onChange={(event) => setKey(event.target.value)}
            placeholder="Key (ex: tenant-demo)"
            className="h-11 rounded-[var(--radius-md)] border bg-white px-3 text-sm"
          />
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nome"
            className="h-11 rounded-[var(--radius-md)] border bg-white px-3 text-sm"
          />
        </div>
      </AppCard>

      <AppCard className="space-y-4">
        <h2 className="text-lg font-bold text-[hsl(var(--brand-dark))]">Admin inicial</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Username"
            className="h-11 rounded-[var(--radius-md)] border bg-white px-3 text-sm"
          />
          <input
            value={adminName}
            onChange={(event) => setAdminName(event.target.value)}
            placeholder="Nome"
            className="h-11 rounded-[var(--radius-md)] border bg-white px-3 text-sm"
          />
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="E-mail"
            type="email"
            className="h-11 rounded-[var(--radius-md)] border bg-white px-3 text-sm"
          />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Senha"
            type="password"
            className="h-11 rounded-[var(--radius-md)] border bg-white px-3 text-sm"
          />
        </div>
      </AppCard>

      <AppCard className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[hsl(var(--brand-dark))]">Fazendas e campos iniciais</h2>
          <AppButton type="button" variant="secondary" className="h-9 px-3" onClick={openCreateFarmDialog}>
            <Plus size={16} className="mr-1" />
            Nova fazenda
          </AppButton>
        </div>

        {farms.length === 0 ? (
          <p className="text-sm text-[hsl(var(--foreground-muted))]">
            Nenhuma fazenda inicial adicionada. Essa etapa é opcional.
          </p>
        ) : (
          <div className="space-y-3">
            {farms.map((farm) => (
              <div key={farm.id} className="rounded-[var(--radius-md)] border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-[hsl(var(--brand-dark))]">{farm.name}</h3>
                    <p className="text-sm text-[hsl(var(--foreground-muted))]">
                      {(farm.description ?? "").trim() || "Sem descrição"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <TableIconButton aria-label={`Editar ${farm.name}`} onClick={() => openEditFarmDialog(farm)}>
                      <Pencil size={16} />
                    </TableIconButton>
                    <TableIconButton
                      aria-label={`Remover ${farm.name}`}
                      variant="danger"
                      onClick={() => setFarmToRemove(farm)}
                    >
                      <Trash2 size={16} />
                    </TableIconButton>
                  </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-[var(--radius-md)] border">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-[hsl(var(--surface-muted))]">
                      <tr>
                        <th className="px-3 py-2">Campo</th>
                        <th className="px-3 py-2">Área</th>
                        <th className="px-3 py-2">Descrição</th>
                        <th className="px-3 py-2 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {farm.fields.length === 0 ? (
                        <tr>
                          <td className="px-3 py-3 text-sm text-[hsl(var(--foreground-muted))]" colSpan={4}>
                            Nenhum campo cadastrado nesta fazenda.
                          </td>
                        </tr>
                      ) : (
                        farm.fields.map((field) => (
                          <tr key={field.id} className="border-t">
                            <td className="px-3 py-3">{field.name}</td>
                            <td className="px-3 py-3">{field.areaHectares}</td>
                            <td className="px-3 py-3">{field.description || "-"}</td>
                            <td className="px-3 py-3">
                              <div className="flex justify-end gap-2">
                                <TableIconButton
                                  aria-label={`Editar ${field.name}`}
                                  onClick={() => openEditFieldDialog(farm.id, field)}
                                >
                                  <Pencil size={16} />
                                </TableIconButton>
                                <TableIconButton
                                  aria-label={`Remover ${field.name}`}
                                  variant="danger"
                                  onClick={() =>
                                    setFieldToRemove({
                                      farmId: farm.id,
                                      farmName: farm.name,
                                      field,
                                    })
                                  }
                                >
                                  <Trash2 size={16} />
                                </TableIconButton>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 flex justify-end">
                  <AppButton
                    type="button"
                    variant="secondary"
                    className="h-9 px-3"
                    onClick={() => openCreateFieldDialog(farm.id)}
                  >
                    <Plus size={16} className="mr-1" />
                    Adicionar campo
                  </AppButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </AppCard>

      <div className="flex justify-end">
        <AppButton type="button" onClick={handleSubmit} disabled={createMutation.isPending}>
          <Check size={16} className="mr-1" />
          {createMutation.isPending ? "Criando..." : "Criar tenant"}
        </AppButton>
      </div>

      <AppDialog
        open={farmDialogOpen}
        onOpenChange={(open) => {
          if (!open) closeFarmDialog();
        }}
        title={editingFarmId ? "Editar fazenda" : "Nova fazenda"}
        description="Use este formulário para criar ou alterar a fazenda inicial do tenant."
        footer={
          <>
            <AppButton type="button" variant="ghost" onClick={closeFarmDialog}>
              Cancelar
            </AppButton>
            <AppButton type="button" onClick={saveFarmDraft}>
              <Check size={16} className="mr-1" />
              {editingFarmId ? "Salvar fazenda" : "Criar fazenda"}
            </AppButton>
          </>
        }
      >
        <div className="grid gap-3">
          <input
            value={farmName}
            onChange={(event) => setFarmName(event.target.value)}
            placeholder="Nome da fazenda"
            className="h-10 rounded-[var(--radius-md)] border bg-white px-3 text-sm"
          />
          <textarea
            value={farmDescription}
            onChange={(event) => setFarmDescription(event.target.value)}
            placeholder="Descrição (opcional)"
            className="min-h-24 rounded-[var(--radius-md)] border bg-white px-3 py-2 text-sm"
          />
        </div>
      </AppDialog>

      <AppDialog
        open={fieldDialogOpen}
        onOpenChange={(open) => {
          if (!open) closeFieldDialog();
        }}
        title={editingFieldId ? "Editar campo" : "Novo campo"}
        description="Preencha os dados do campo vinculado à fazenda selecionada."
        contentClassName="max-w-xl"
        footer={
          <>
            <AppButton type="button" variant="ghost" onClick={closeFieldDialog}>
              Cancelar
            </AppButton>
            <AppButton type="button" onClick={saveFieldDraft}>
              <Check size={16} className="mr-1" />
              {editingFieldId ? "Salvar campo" : "Criar campo"}
            </AppButton>
          </>
        }
      >
        <div className="grid gap-3">
          <input
            value={farms.find((farm) => farm.id === fieldFarmId)?.name ?? ""}
            placeholder="Fazenda"
            className="h-10 rounded-[var(--radius-md)] border bg-[hsl(var(--surface-muted))] px-3 text-sm"
            readOnly
          />
          <input
            value={fieldName}
            onChange={(event) => setFieldName(event.target.value)}
            placeholder="Nome do campo"
            className="h-10 rounded-[var(--radius-md)] border bg-white px-3 text-sm"
          />
          <input
            value={fieldAreaHectares}
            onChange={(event) => setFieldAreaHectares(event.target.value)}
            placeholder="Área em hectares"
            type="number"
            min={0}
            step="0.01"
            className="h-10 rounded-[var(--radius-md)] border bg-white px-3 text-sm"
          />
          <textarea
            value={fieldDescription}
            onChange={(event) => setFieldDescription(event.target.value)}
            placeholder="Descrição (opcional)"
            className="min-h-24 rounded-[var(--radius-md)] border bg-white px-3 py-2 text-sm"
          />
        </div>
      </AppDialog>

      <ConfirmDialog
        open={Boolean(farmToRemove)}
        onOpenChange={(open) => {
          if (!open) setFarmToRemove(null);
        }}
        title="Remover fazenda"
        description={`A fazenda "${farmToRemove?.name ?? ""}" será removida da estrutura inicial do tenant.`}
        confirmLabel="Remover fazenda"
        onConfirm={() => {
          if (!farmToRemove) return;
          setFarms((prev) => prev.filter((farm) => farm.id !== farmToRemove.id));
          setFarmToRemove(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(fieldToRemove)}
        onOpenChange={(open) => {
          if (!open) setFieldToRemove(null);
        }}
        title="Remover campo"
        description={`O campo "${fieldToRemove?.field.name ?? ""}" da fazenda "${fieldToRemove?.farmName ?? ""}" será removido.`}
        confirmLabel="Remover campo"
        onConfirm={() => {
          if (!fieldToRemove) return;
          setFarms((prev) =>
            prev.map((farm) =>
              farm.id === fieldToRemove.farmId
                ? {
                    ...farm,
                    fields: farm.fields.filter((field) => field.id !== fieldToRemove.field.id),
                  }
                : farm,
            ),
          );
          setFieldToRemove(null);
        }}
      />
    </div>
  );
}
