import type { QueryKey } from "@tanstack/react-query";

import type { PaginatedResponse } from "@/front/types/response";
import type { Supplier } from "@/front/types/supplier";
import { api } from "../_config";

export async function getSuppliersQuery({ queryKey }: { queryKey: QueryKey }) {
  const [, filters] = queryKey;

  const response = await api.get<PaginatedResponse<Supplier>>(
    "/api/suppliers",
    { params: filters },
  );

  return response.data;
}
