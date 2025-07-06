import type { PaginatedResponse } from "@/front/types/response";
import type { User } from "@/front/types/user";
import type { QueryKey } from "@tanstack/react-query";
import { api } from "../_config";

export async function getAppUsersQuery({ queryKey }: { queryKey: QueryKey }) {
  const [, filters] = queryKey;
  const response = await api.get<PaginatedResponse<User>>("/api/app-users", {
    params: filters,
  });
  return response.data;
}
