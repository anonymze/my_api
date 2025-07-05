import {
  createCommissionImportQuery,
  deleteCommissionImportQuery,
  getCommissionsImportQuery,
} from "@/front/api/queries/commission-queries";
import { getSuppliersQuery } from "@/front/api/queries/supplier-queries";
import { Alert, AlertDescription } from "@/front/components/ui/alert";
import { Button } from "@/front/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/front/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/front/components/ui/command";
import { Input } from "@/front/components/ui/input";
import { Label } from "@/front/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/front/components/ui/popover";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookAlertIcon,
  ChevronsUpDown,
  FileIcon,
  Loader2,
  Search,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { TabSkeleton } from "../home";

const allowedTypes = [
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const allowedExtensions = [".csv", ".xls", ".xlsx"];

export default function ImportTab() {
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // Get initial search term from URL
  const getInitialSearchTerm = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("supplierSearch") || "";
  };

  const [searchSelectedSuppliers, setSearchSelectedSuppliers] =
    useState(getInitialSearchTerm);

  const {
    error: errorCommissionImports,
    data: commissionImports,
    isLoading: loadingCommissionImports,
  } = useQuery({
    queryKey: [
      "commissions-import",
      {
        limit: 0,
      },
    ],
    queryFn: getCommissionsImportQuery,
  });

  const {
    error: errorSuppliers,
    data: suppliers,
    isLoading: loadingSuppliers,
  } = useQuery({
    queryKey: [
      "suppliers",
      {
        limit: 0,
      },
    ],
    queryFn: getSuppliersQuery,
  });

  // Mutations
  const createImportMutation = useMutation({
    mutationFn: createCommissionImportQuery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commissions-import"] });
    },
  });

  const deleteImportMutation = useMutation({
    mutationFn: deleteCommissionImportQuery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commissions-import"] });
    },
  });

  const allSuppliers = suppliers?.docs || [];
  const existingImports = commissionImports?.docs || [];

  const validateFile = (file: File): string | null => {
    const hasValidType = allowedTypes.includes(file.type);
    const hasValidExtension = allowedExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext),
    );

    if (!hasValidType && !hasValidExtension) {
      return "Le fichier doit être au format CSV, XLS ou XLSX";
    }

    return null;
  };

  const handleRemoveSupplier = (supplierId: string) => {
    const existingImport = existingImports.find(
      (importItem) => importItem.supplier.id === supplierId,
    );

    if (existingImport) {
      deleteImportMutation.mutate(existingImport.id);
    }
  };

  // Get available suppliers (not yet imported)
  const getAvailableSuppliers = () => {
    const importedSupplierIds = existingImports.map((imp) => imp.supplier.id);
    return allSuppliers.filter(
      (supplier) => !importedSupplierIds.includes(supplier.id),
    );
  };

  // Update URL when search term changes
  const handleSearchChange = (value: string) => {
    setSearchSelectedSuppliers(value);
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set("supplierSearch", value);
    } else {
      url.searchParams.delete("supplierSearch");
    }
    window.history.replaceState({}, "", url.toString());
  };

  // Update search term if URL changes (e.g., back button)
  useEffect(() => {
    const handlePopState = () => {
      setSearchSelectedSuppliers(getInitialSearchTerm());
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Filter existing imports based on search
  const getFilteredImports = () => {
    if (!searchSelectedSuppliers) return existingImports;

    return existingImports.filter((importItem) => {
      return importItem.supplier.name
        .toLowerCase()
        .includes(searchSelectedSuppliers.toLowerCase());
    });
  };

  const handleFileUpload = (supplierId: string, file: File | null) => {
    if (file) {
      const error = validateFile(file);
      if (error) {
        setFileErrors((prev) => ({ ...prev, [supplierId]: error }));
        return;
      } else {
        setFileErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[supplierId];
          return newErrors;
        });
      }

      // Upload file to backend immediately
      createImportMutation.mutate({ file, supplierId });
    }
  };

  const isUploading = createImportMutation.isPending;
  const isDeleting = deleteImportMutation.isPending;
  const isOperating = isUploading || isDeleting;

  if (loadingCommissionImports || loadingSuppliers) {
    return <TabSkeleton />;
  }

  if (errorSuppliers || errorCommissionImports) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <p className="text-red-600">
            Erreur lors du chargement des fournisseurs
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!suppliers || !suppliers.docs.length) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <p className="text-gray-600">
            Il n'y a pas de fournisseurs disponibles
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="gap-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col gap-2">
            <CardTitle className="flex items-center gap-2">
              <FileIcon className="w-5 h-5" />
              Importation des fichiers de commissions
            </CardTitle>
            <CardDescription>
              Importez des fichiers de commissions par fournisseur
            </CardDescription>
          </div>
          {/* Loading indicator */}
          {isOperating && (
            <Loader2 className="h-5 w-5 animate-spin text-black" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="items-center">
          <BookAlertIcon className="h-4 w-4" />
          <AlertDescription>
            Les commissions seront basées sur les derniers fichiers importés
            ici.
          </AlertDescription>
        </Alert>

        {/* Supplier Selection */}
        <div className="space-y-2.5">
          <Label htmlFor="supplier-select">Ajouter un fournisseur</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
                disabled={isOperating}
              >
                Choisir un fournisseur...
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0">
              <Command>
                <CommandInput placeholder="Rechercher un fournisseur..." />
                <CommandEmpty>Aucun fournisseur disponible</CommandEmpty>
                <CommandGroup className="max-h-[230px] overflow-auto">
                  {getAvailableSuppliers().map((supplier) => (
                    <CommandItem
                      key={supplier.id}
                      value={supplier.name}
                      onSelect={() => {
                        // Trigger file input immediately
                        const fileInput = document.createElement("input");
                        fileInput.type = "file";
                        fileInput.accept = ".csv,.xlsx,.xls";
                        fileInput.onchange = (e) => {
                          const file = (e.target as HTMLInputElement)
                            .files?.[0];
                          if (file) {
                            handleFileUpload(supplier.id, file);
                          }
                        };
                        fileInput.click();
                        setOpen(false);
                      }}
                    >
                      {supplier.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Existing Imports */}
        {existingImports.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label>Fournisseurs importés ({existingImports.length})</Label>
              <div className="flex items-center space-x-2 max-w-sm">
                <Search className="w-4 h-4 text-muted-foreground" />
                <div className="relative">
                  <Input
                    placeholder="Rechercher..."
                    value={searchSelectedSuppliers}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="h-8 pr-8"
                    disabled={isOperating}
                  />
                  {searchSelectedSuppliers && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSearchChange("")}
                      className="absolute right-0 top-0 h-8 w-8 p-0 hover:bg-transparent"
                      disabled={isOperating}
                    >
                      <X className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {getFilteredImports().map((importItem) => (
                <div
                  key={importItem.id}
                  className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3"
                >
                  {/* Supplier Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        {importItem.supplier.name}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleRemoveSupplier(importItem.supplier.id)
                      }
                      className="h-8 w-8 p-0 border-red-200 hover:bg-red-50"
                      disabled={isOperating}
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>

                  {/* File Display */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Fichier :</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded text-sm">
                      <div className="flex items-center space-x-2">
                        <Upload className="h-4 w-4 text-green-600" />
                        <span className="text-gray-700">
                          {importItem.file.filename}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* File error display */}
                  {fileErrors[importItem.supplier.id] && (
                    <p className="text-red-500 text-sm">
                      {fileErrors[importItem.supplier.id]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
