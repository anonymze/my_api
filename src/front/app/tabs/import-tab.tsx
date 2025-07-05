import { getCommissionsImportQuery } from "@/front/api/queries/commission-queries";
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
import { useQuery } from "@tanstack/react-query";
import {
  BookAlertIcon,
  ChevronsUpDown,
  FileIcon,
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
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [supplierFiles, setSupplierFiles] = useState<
    Record<string, File | null>
  >({});
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);

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

  const allSuppliers = suppliers?.docs || [];
  // Existing imports from API (now returns paginated commission imports)
  const existingImports = commissionImports?.docs || [];

  // Auto-load existing supplier imports on component mount
  useEffect(() => {
    if (existingImports.length > 0) {
      const existingIds = existingImports
        .map((fileItem) => {
          return fileItem.supplier?.id || fileItem.supplier.id;
        })
        .filter(Boolean);

      setSelectedSuppliers((prev) => {
        const newIds = existingIds.filter((id: string) => !prev.includes(id));

        return [...prev, ...newIds];
      });

      // Note: Cannot recreate File objects from database
      // But we'll initialize null for suppliers that have existing files
      const existingData: Record<string, File | null> = {};
      existingImports.forEach((fileItem) => {
        const supplierId = fileItem.supplier?.id || fileItem.supplier.id;
        if (supplierId) {
          existingData[supplierId] = null;
        }
      });

      setSupplierFiles((prev) => ({ ...prev, ...existingData }));
    }
  }, [existingImports]);

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

  const handleSupplierAdd = (supplierId: string) => {
    if (!selectedSuppliers.includes(supplierId)) {
      setSelectedSuppliers((prev) => [supplierId, ...prev]);
      // Initialize null file for this supplier
      setSupplierFiles((prev) => ({
        ...prev,
        [supplierId]: null,
      }));
    }
    setOpen(false);
  };

  const removeSupplier = (supplierId: string) => {
    // Remove supplier from selected list
    setSelectedSuppliers((prev) => prev.filter((id) => id !== supplierId));
    // Remove all files for this supplier
    setSupplierFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[supplierId];
      return newFiles;
    });
    // Remove any errors for this supplier
    setFileErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[supplierId];
      return newErrors;
    });
  };

  // Get available suppliers (not yet selected)
  const getAvailableSuppliers = () => {
    return allSuppliers.filter(
      (supplier) => !selectedSuppliers.includes(supplier.id),
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

  // Filter selected suppliers based on search
  const getFilteredSelectedSuppliers = () => {
    if (!searchSelectedSuppliers) return selectedSuppliers;

    return selectedSuppliers.filter((supplierId) => {
      const supplier = allSuppliers.find((s) => s.id === supplierId);
      return supplier?.name
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

      // Replace the existing file (only 1 file per supplier)
      setSupplierFiles((prev) => ({
        ...prev,
        [supplierId]: file,
      }));
    }
  };

  const handleRemoveFile = (supplierId: string) => {
    setSupplierFiles((prev) => ({
      ...prev,
      [supplierId]: null,
    }));
  };

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
              Importation des fichiers globaux de commissions
            </CardTitle>
            <CardDescription>
              Ajoutez, modifiez ou supprimez les fichiers globaux de commissions
              des fournisseurs
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="items-center">
          <BookAlertIcon className="h-4 w-4" />
          <AlertDescription>
            Les commissions seront basées sur les derniers fichiers globaux de
            commissions importés ici.
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
                      onSelect={() => handleSupplierAdd(supplier.id)}
                    >
                      {supplier.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Selected Suppliers with File Upload */}
        {selectedSuppliers.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label>
                Fournisseurs sélectionnés ({selectedSuppliers.length})
              </Label>
              <div className="flex items-center space-x-2 max-w-sm">
                <Search className="w-4 h-4 text-muted-foreground" />
                <div className="relative">
                  <Input
                    placeholder="Rechercher..."
                    value={searchSelectedSuppliers}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="h-8 pr-8"
                  />
                  {searchSelectedSuppliers && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSearchChange("")}
                      className="absolute right-0 top-0 h-8 w-8 p-0 hover:bg-transparent"
                    >
                      <X className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {getFilteredSelectedSuppliers().map((supplierId) => {
                const supplier = allSuppliers.find((s) => s.id === supplierId);
                return (
                  <div
                    key={supplierId}
                    className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3"
                  >
                    {/* Supplier Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          {supplier?.name}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeSupplier(supplierId)}
                        className="h-8 w-8 p-0 border-red-200 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Label
                          htmlFor={`file-${supplierId}`}
                          className="text-sm text-gray-700"
                        >
                          Importer le fichier :
                        </Label>
                        <Input
                          id={`file-${supplierId}`}
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          className="flex-1"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            handleFileUpload(supplierId, file);
                            // Reset input to allow same file upload again
                            e.target.value = "";
                          }}
                        />
                      </div>

                      {fileErrors[supplierId] && (
                        <p className="text-red-500 text-sm">
                          {fileErrors[supplierId]}
                        </p>
                      )}
                    </div>

                    {/* File List - showing existing or new file (only 1 per supplier) */}
                    {(() => {
                      const existingFile = existingImports.find(
                        (fileItem) =>
                          (fileItem.supplier?.id || fileItem.supplier.id) ===
                          supplierId,
                      );
                      const newFile = supplierFiles?.[supplierId];
                      const hasExistingFile = !!existingFile;
                      const hasNewFile = !!newFile;

                      if (hasExistingFile || hasNewFile) {
                        return (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">
                                Fichier :
                              </span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between p-2 bg-white rounded text-sm">
                                <div className="flex items-center space-x-2">
                                  <Upload className="h-4 w-4 text-green-600" />
                                  <span className="text-gray-700">
                                    {hasNewFile
                                      ? newFile.name
                                      : hasExistingFile
                                        ? existingFile.file.filename
                                        : ""}
                                  </span>
                                </div>
                                {/* Only show remove button for new files, not existing database files */}
                                {hasNewFile && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveFile(supplierId)}
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
