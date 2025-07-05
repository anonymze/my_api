import type { QueryKey } from "@tanstack/react-query";

import type {
  AppUsersCommissionsCode,
  Commission,
  SuppliersCommissionsColumn,
} from "@/front/types/commission";
import type { PaginatedResponse } from "@/front/types/response";
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

export async function getGlobalCommissionsImportQuery({
  queryKey,
}: {
  queryKey: QueryKey;
}) {
  const [, filters] = queryKey;

  const response = await api.get<any>("/api/globals/commission-imports", {
    params: filters,
  });

  return response.data;
}
