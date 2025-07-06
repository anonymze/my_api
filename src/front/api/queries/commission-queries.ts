import type { QueryKey } from "@tanstack/react-query";

import type {
  AppUsersCommissionsCode,
  Commission,
  CommissionImport,
  CommissionImportUser,
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

export const createCommissionQuery = async (data: {
  app_user: string;
  commission_suppliers: {
    supplier: Supplier["id"];
    encours: number;
    production: number;
  }[];
  date: string;
  structured_product: boolean;
  title?: string | undefined;
  up_front?: number | undefined;
  broqueur?: string | undefined;
}) => {
  const response = await api.post(
    "/api/commissions/commission-suppliers",
    data,
  );
  return response.data;
};

export async function getCommissionImportUserQuery({
  queryKey,
}: {
  queryKey: QueryKey;
}) {
  const [, userId] = queryKey;

  const response = await api.get<CommissionImportUser>(
    `/api/commission-imports/${userId}`,
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

export const createAppUserCommissionCodeQuery = async (data: {
  app_user: string;
  code: { code: string; id?: string | null }[];
}) => {
  const response = await api.post("/api/app-users-commissions-code", data);
  return response.data;
};

export const updateAppUserCommissionCodeQuery = async (data: {
  app_user: string;
  code: { code: string; id?: string | null }[];
  appUserCodeId: AppUsersCommissionsCode["id"];
}) => {
  const response = await api.patch(
    `/api/app-users-commissions-code/${data.appUserCodeId}`,
    data,
  );
  return response.data;
};

export async function deleteAppUserCommissionCodeQuery(
  appUserCodeId: AppUsersCommissionsCode["id"],
) {
  const response = await api.delete(
    `/api/app-users-commissions-code/${appUserCodeId}`,
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

export const createSupplierCommissionColumnQuery = async (
  data: Pick<
    SuppliersCommissionsColumn,
    "code_column_letter" | "type_column_letter" | "amount_column_letter"
  > & { supplier: Supplier["id"] },
) => {
  const response = await api.post("/api/suppliers-commissions-column", data);

  return response.data;
};

export const updateSupplierCommissionColumnQuery = async (
  data: Pick<
    SuppliersCommissionsColumn,
    "code_column_letter" | "type_column_letter" | "amount_column_letter"
  > & {
    supplier: Supplier["id"];
    supplierColumnId: SuppliersCommissionsColumn["id"];
  },
) => {
  const response = await api.patch(
    `/api/suppliers-commissions-column/${data.supplierColumnId}`,
    data,
  );

  return response.data;
};

export async function deleteSupplierCommissionColumnQuery(
  supplierCommissionColumn: SuppliersCommissionsColumn["id"],
) {
  const response = await api.delete(
    `/api/suppliers-commissions-column/${supplierCommissionColumn}`,
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
