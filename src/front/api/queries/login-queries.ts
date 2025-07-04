import type { AppUser } from "@/front/types/user";

import { api } from "../_config";

export async function loginQuery({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const response = await api.post<AppUser>("/api/app-users/login", {
    email,
    password,
  });
  return response.data;
}
