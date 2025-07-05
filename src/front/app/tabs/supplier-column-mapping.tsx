import { getSupplierCommissionsColumnQuery } from "@/front/api/queries/commission-queries";
import { getSuppliersQuery } from "@/front/api/queries/supplier-queries";
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
import type { Supplier } from "@/front/types/supplier";
import { useQuery } from "@tanstack/react-query";
import { ChevronsUpDown, Code, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { TabSkeleton } from "../home";

export default function SupplierMappingTab() {
  const [selectedSuppliers, setSelectedSuppliers] = useState<Supplier["id"][]>(
    [],
  );
  const [supplierColumns, setSupplierColumns] = useState<
    Record<
      Supplier["id"],
      {
        code: string;
        type: string;
        montant: string;
      }
    >
  >({});
  const [open, setOpen] = useState(false);

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

  const {
    error: errorSuppliersColumns,
    data: suppliersColumn,
    isLoading: loadingSuppliersColumn,
  } = useQuery({
    queryKey: [
      "suppliers-column",
      {
        limit: 0,
      },
    ],
    queryFn: getSupplierCommissionsColumnQuery,
  });

  // Get initial search term from URL
  const getInitialSearchTerm = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("supplierColumnSearch") || "";
  };

  const [searchSelectedSuppliers, setSearchSelectedSuppliers] =
    useState(getInitialSearchTerm);

  // Suppliers list from API
  const allSuppliers = suppliers?.docs || [];
  // Existing supplier columns from API
  const existingSupplierColumns = suppliersColumn?.docs || [];

  // Auto-load existing supplier mappings on component mount
  useEffect(() => {
    if (existingSupplierColumns.length > 0) {
      const existingIds = existingSupplierColumns
        .map((mapping) => mapping.supplier?.id)
        .filter(Boolean);

      setSelectedSuppliers((prev) => {
        const newIds = existingIds.filter((id) => !prev.includes(id));
        return [...prev, ...newIds];
      });

      const existingData: {
        [key: Supplier["id"]]: {
          code: string;
          type: string;
          montant: string;
        };
      } = {};
      existingSupplierColumns.forEach((mapping) => {
        if (mapping.supplier?.id) {
          existingData[mapping.supplier.id] = {
            code: mapping.code_column_letter || "",
            type: mapping.type_column_letter || "",
            montant: mapping.amount_column_letter || "",
          };
        }
      });

      setSupplierColumns((prev) => ({ ...prev, ...existingData }));
    }
  }, [existingSupplierColumns]);

  const handleSupplierAdd = (supplierId: string) => {
    if (!selectedSuppliers.includes(supplierId)) {
      setSelectedSuppliers((prev) => [supplierId, ...prev]);
      // Initialize empty columns object for this supplier
      setSupplierColumns((prev) => ({
        ...prev,
        [supplierId]: {
          code: "",
          type: "",
          montant: "",
        },
      }));
    }
    setOpen(false);
  };

  const removeSupplier = (supplierId: string) => {
    // Remove supplier from selected list
    setSelectedSuppliers((prev) => prev.filter((id) => id !== supplierId));
    // Remove columns for this supplier
    setSupplierColumns((prev) => {
      const newColumns = { ...prev };
      delete newColumns[supplierId];
      return newColumns;
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
      url.searchParams.set("supplierColumnSearch", value);
    } else {
      url.searchParams.delete("supplierColumnSearch");
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
      const name = supplier?.name || "";

      return name.toLowerCase().includes(searchSelectedSuppliers.toLowerCase());
    });
  };

  const updateSupplierColumn = (
    supplierId: Supplier["id"],
    field: "code" | "type" | "montant",
    value: string,
  ) => {
    setSupplierColumns((prev) => ({
      ...prev,
      [supplierId]: {
        ...(prev[supplierId] || { code: "", type: "", montant: "" }),
        [field]: value,
      },
    }));
  };

  if (loadingSuppliersColumn || loadingSuppliers) {
    return <TabSkeleton />;
  }

  if (errorSuppliers || errorSuppliersColumns) {
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
              <Code className="w-5 h-5" />
              Mapping des colonnes des fournisseurs
            </CardTitle>
            <CardDescription>
              Associez un fournisseur à des noms de colonnes Excel spécifiques.
            </CardDescription>
          </div>
          <Button onClick={() => console.log("Create commission")}>
            Sauvegarder
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
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
                  {getAvailableSuppliers().map((supplier) => {
                    return (
                      <CommandItem
                        key={supplier.id}
                        value={supplier.name}
                        onSelect={() => handleSupplierAdd(supplier.id)}
                      >
                        <span className="font-medium">{supplier.name}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Suppliers with Column Mapping */}
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
                      <div className="flex flex-col space-y-1">
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

                    {/* Columns Input */}
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Code Column */}
                        <div className="flex-1 space-y-1">
                          <Label
                            htmlFor={`code-${supplierId}`}
                            className="text-xs text-gray-700"
                          >
                            Colonne "Code unique"
                          </Label>
                          <Input
                            id={`code-${supplierId}`}
                            placeholder="Code"
                            value={supplierColumns[supplierId]?.code || ""}
                            onChange={(e) =>
                              updateSupplierColumn(
                                supplierId,
                                "code",
                                e.target.value,
                              )
                            }
                            className="w-full"
                          />
                        </div>

                        {/* Type Column */}
                        <div className="flex-1 space-y-1">
                          <Label
                            htmlFor={`type-${supplierId}`}
                            className="text-xs text-gray-700"
                          >
                            Colonne "Type commission"
                          </Label>
                          <Input
                            id={`type-${supplierId}`}
                            placeholder="Type"
                            value={supplierColumns[supplierId]?.type || ""}
                            onChange={(e) =>
                              updateSupplierColumn(
                                supplierId,
                                "type",
                                e.target.value,
                              )
                            }
                            className="w-full"
                          />
                        </div>

                        {/* Montant Column */}
                        <div className="flex-1 space-y-1">
                          <Label
                            htmlFor={`montant-${supplierId}`}
                            className="text-xs text-gray-700"
                          >
                            Colonne "Montant commission"
                          </Label>
                          <Input
                            id={`montant-${supplierId}`}
                            placeholder="Montant"
                            value={supplierColumns[supplierId]?.montant || ""}
                            onChange={(e) =>
                              updateSupplierColumn(
                                supplierId,
                                "montant",
                                e.target.value,
                              )
                            }
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
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
