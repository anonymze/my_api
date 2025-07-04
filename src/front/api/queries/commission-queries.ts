import type { QueryKey } from "@tanstack/react-query";

import { api } from "../_config";

export async function getCommissionsQuery({
  queryKey,
}: {
  queryKey: QueryKey;
}) {
  const [, userId] = queryKey;

  const response = await api.get("/api/commissions", {
    params: {
      where: {
        app_user: {
          equals: userId,
        },
      },
      limit: 0,
    },
  });

  return response.data;
}
