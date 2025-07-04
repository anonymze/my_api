import type { QueryKey } from "@tanstack/react-query";

import { api } from "../_config";

export interface Commission {
  id: number;
  employee: string;
  code: string;
  sales: number;
  rate: number;
  commission: number;
  period: string;
  status: string;
}

export interface CommissionsResponse {
  data: Commission[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CommissionsQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  period?: string;
  userId?: string;
}

export async function getCommissionsQuery({
  queryKey,
}: {
  queryKey: QueryKey;
}) {
  const [, filters] = queryKey;

  const response = await api.get("/api/commissions", { params: filters });

  return response.data;
}
