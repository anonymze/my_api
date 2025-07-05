import type { Media } from "./media";
import type { Supplier } from "./supplier";
import type { AppUser, User } from "./user";

export interface Commission {
  id: string;
  app_user: AppUser["user"];
  pdf?: Media | null;
  suppliers: Supplier[];
  structured_product?: boolean | null;
  informations?: {
    date: string;
    encours?: number | null;
    production?: number | null;
    title?: string | null;
    up_front?: number | null;
    broqueur?: string | null;
  };
  updatedAt: string;
  createdAt: string;
}

export interface AppUsersCommissionsCode {
  id: string;
  app_user: User;
  code: {
    code: string;
    id?: string | null;
  }[];
  updatedAt: string;
  createdAt: string;
}

export interface SuppliersCommissionsColumn {
  id: string;
  supplier: Supplier;
  code_column_letter: string;
  type_column_letter: string;
  amount_column_letter: string;
  updatedAt: string;
  createdAt: string;
}

export interface GlobalCommissionsImport {
  id: string;
  files: Array<{ id: string; supplier: Supplier; file: Media }>;
  updatedAt: string;
  createdAt: string;
  globalType: "commission-imports";
}
