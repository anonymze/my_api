import { Button } from "@/front/components/ui/button";
import { Card, CardContent } from "@/front/components/ui/card";
import { Skeleton } from "@/front/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/front/components/ui/tabs";
import {
  Building2,
  Calculator,
  Download,
  Save,
  Upload,
  Users,
} from "lucide-react";
import { Suspense, useState } from "react";

import "@/front/styles/global.css";

// Lazy load tab components
import { lazy } from "react";

const ImportTab = lazy(() => import("./tabs/import-tab"));
const UserCodesTab = lazy(() => import("./tabs/user-code-mapping"));
const SupplierMappingTab = lazy(() => import("./tabs/supplier-column-mapping"));
const CommissionsTab = lazy(() => import("./tabs/commission-tab"));

// Loading skeleton component
function TabSkeleton() {
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function CommissionPage() {
  const [activeTab, setActiveTab] = useState("import");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Commissions</h1>
          <p className="text-muted-foreground">
            Gérez les commissions des employés, les imports et les calculs
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter le Rapport
          </Button>
          <Button>
            <Save className="w-4 h-4 mr-2" />
            Enregistrer les Modifications
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Importer les Fichiers
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Codes Utilisateur
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Mapping Fournisseur
          </TabsTrigger>
          <TabsTrigger value="commissions" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Commissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="import">
          <Suspense fallback={<TabSkeleton />}>
            <ImportTab />
          </Suspense>
        </TabsContent>

        <TabsContent value="users">
          <Suspense fallback={<TabSkeleton />}>
            <UserCodesTab />
          </Suspense>
        </TabsContent>

        <TabsContent value="suppliers">
          <Suspense fallback={<TabSkeleton />}>
            <SupplierMappingTab />
          </Suspense>
        </TabsContent>

        <TabsContent value="commissions">
          <Suspense fallback={<TabSkeleton />}>
            <CommissionsTab />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
