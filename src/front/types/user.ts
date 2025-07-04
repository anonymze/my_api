import type { Media } from "./media";

export interface AppUser {
  exp: number;
  token: string;
  user: User;
}

export interface User {
  id: string;
  lastname: string;
  firstname: string;
  email: string;
  role: UserRole;
  phone?: string;
  photo?: Media;
  createdAt: string;
  updatedAt: string;
}

type UserRole = "associate" | "independent" | "visitor" | "employee";

export const userHierarchy: Record<UserRole, number> = {
  associate: 0,
  employee: 1,
  independent: 2,
  visitor: 3,
} as const;

export const userRoleLabels: Record<UserRole, string> = {
  associate: "Associé",
  employee: "Employé",
  independent: "Indépendant",
  visitor: "Visiteur",
} as const;
