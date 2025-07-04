import type { Media } from "./media";
import type { Supplier } from "./supplier";
import type { AppUser } from "./user";

export interface Commission {
  id: string;
  app_user: AppUser;
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
