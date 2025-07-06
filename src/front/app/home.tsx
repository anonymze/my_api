import { Button } from "@/front/components/ui/button";
import { Card, CardContent } from "@/front/components/ui/card";
import { Skeleton } from "@/front/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/front/components/ui/tabs";
import { Calculator, CodeIcon, LogOutIcon, Upload } from "lucide-react";
import React, { Suspense, useEffect } from "react";

import "@/front/styles/global.css";

// Lazy load tab components
import { lazy } from "react";
import { AuthContext } from "../context/auth-context";

const ImportTab = lazy(() => import("./tabs/import-tab"));
const UserCodesTab = lazy(() => import("./tabs/user-code-mapping"));
const SupplierMappingTab = lazy(() => import("./tabs/supplier-column-mapping"));
const CommissionsTab = lazy(() => import("./tabs/commission-tab"));

// Loading skeleton component
export function TabSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-5 w-2/3" />
        <div className="space-y-2 pt-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function CommissionPage() {
  const { logout } = React.use(AuthContext);

  // Get initial tab from URL or default to "commissions"
  const getInitialTab = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("tab") || "commissions";
  };

  const [activeTab, setActiveTab] = React.useState(getInitialTab);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", value);
    window.history.replaceState({}, "", url.toString());
  };

  // Update tab if URL changes (e.g., back button)
  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(getInitialTab());
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <div className="">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestion des Commissions</h1>
            <p className="text-muted-foreground">
              Gérez les commissions des employés, les imports, les calculs...
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={logout}>
              <LogOutIcon className="w-4 h-4 mr-2" />
              Se déconnecter
            </Button>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger
              value="commissions"
              className="flex items-center gap-2"
            >
              <Calculator className="w-4 h-4" />
              Commissions
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Importer les fichiers
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <CodeIcon className="w-4 h-4" />
              Codes utilisateur
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="flex items-center gap-2">
              <CodeIcon className="w-4 h-4" />
              Mapping fournisseur
            </TabsTrigger>
          </TabsList>

          <TabsContent value="commissions">
            <Suspense fallback={<TabSkeleton />}>
              <CommissionsTab />
            </Suspense>
          </TabsContent>

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
        </Tabs>
      </div>
    </div>
  );
}
