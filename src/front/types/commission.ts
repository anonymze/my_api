import type { Media } from "./media";
import type { Supplier } from "./supplier";
import type { AppUser, User } from "./user";

export interface Commission {
  id: string;
  app_user: AppUser["user"];
  date: string;
  commission_suppliers: CommissionSupplier[];
  pdf?: Media | null;
  structured_product?: boolean | null;
  title?: string | null;
  up_front?: number | null;
  broqueur?: string | null;
  updatedAt: string;
  createdAt: string;
}

export interface CommissionSupplier {
  id: string;
  supplier: Supplier;
  encours: number;
  production: number;
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

export interface CommissionImport {
  id: string;
  supplier: Supplier;
  file: Media;
  updatedAt: string;
  createdAt: string;
}

export interface CommissionImportUser {
  id: string;
  totalGlobalEncours: string;
  totalGlobalProduction: string;
  totalGlobalStructured: string;
  suppliersData: {
    [key: string]: {
      encours: number;
      production: number;
      structured: number;
    };
  };
}
