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

export async function getSupplierCommissionsColumnCodeQuery({
  queryKey,
}: {
  queryKey: QueryKey;
}) {
  const [, filters] = queryKey;

  const response = await api.get<PaginatedResponse<SuppliersCommissionsColumn>>(
    "/api/supplier-commissions-column",
    { params: filters },
  );

  return response.data;
}
