import type { QueryKey } from "@tanstack/react-query";

import type {
  AppUsersCommissionsCode,
  Commission,
  CommissionImport,
  SuppliersCommissionsColumn,
} from "@/front/types/commission";
import type { PaginatedResponse } from "@/front/types/response";
import type { Supplier } from "@/front/types/supplier";
import { api } from "../_config";

export async function getCommissionsQuery({
  queryKey,
}: {
  queryKey: QueryKey;
}) {
  const [, filters] = queryKey;

  const response = await api.get<PaginatedResponse<Commission>>(
    "/api/commissions",
    { params: filters },
  );

  return response.data;
}

export async function getAppUserCommissionsCodeQuery({
  queryKey,
}: {
  queryKey: QueryKey;
}) {
  const [, filters] = queryKey;

  const response = await api.get<PaginatedResponse<AppUsersCommissionsCode>>(
    "/api/app-users-commissions-code",
    { params: filters },
  );

  return response.data;
}

export async function getSupplierCommissionsColumnQuery({
  queryKey,
}: {
  queryKey: QueryKey;
}) {
  const [, filters] = queryKey;

  const response = await api.get<PaginatedResponse<SuppliersCommissionsColumn>>(
    "/api/suppliers-commissions-column",
    { params: filters },
  );

  return response.data;
}

export async function getCommissionsImportQuery({
  queryKey,
}: {
  queryKey: QueryKey;
}) {
  const [, filters] = queryKey;

  const response = await api.get<PaginatedResponse<CommissionImport>>(
    "/api/commission-imports",
    {
      params: filters,
    },
  );

  return response.data;
}

export async function deleteCommissionImportQuery(
  chatRoomId: CommissionImport["id"],
) {
  const response = await api.delete(`/api/commission-imports/${chatRoomId}`);
  return response.data;
}

export const createCommissionImportQuery = async ({
  file,
  supplierId,
}: {
  file: File;
  supplierId: Supplier["id"];
}) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("supplier", supplierId);

  const response = await api.post(
    "/api/commission-imports/custom-create",
    formData,
  );

  return response.data;
};
