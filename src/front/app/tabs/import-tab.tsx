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
import {
  BookAlertIcon,
  Calculator,
  ChevronsUpDown,
  Search,
  Upload,
  X,
} from "lucide-react";
import { useState } from "react";

const allowedTypes = [
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const allowedExtensions = [".csv", ".xls", ".xlsx"];

export default function ImportTab() {
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [supplierFiles, setSupplierFiles] = useState<Record<string, File[]>>(
    {},
  );
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);
  const [searchSelectedSuppliers, setSearchSelectedSuppliers] = useState("");

  // Expanded suppliers list - replace with actual data from your API
  const suppliers = [
    { id: "supplier1", name: "Fournisseur A" },
    { id: "supplier2", name: "Fournisseur B" },
    { id: "supplier3", name: "Fournisseur C" },
    { id: "supplier3s", name: "Fournisseur Cs" },
    { id: "supplier3ss", name: "Fournisseur Css" },
    // Add more suppliers as needed...
  ];

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
      setSelectedSuppliers((prev) => [...prev, supplierId]);
      // Initialize empty files array for this supplier
      setSupplierFiles((prev) => ({
        ...prev,
        [supplierId]: [],
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
    return suppliers.filter(
      (supplier) => !selectedSuppliers.includes(supplier.id),
    );
  };

  // Filter selected suppliers based on search
  const getFilteredSelectedSuppliers = () => {
    if (!searchSelectedSuppliers) return selectedSuppliers;

    return selectedSuppliers.filter((supplierId) => {
      const supplier = suppliers.find((s) => s.id === supplierId);
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

      // Add file to existing files array
      setSupplierFiles((prev) => ({
        ...prev,
        [supplierId]: [...(prev[supplierId] || []), file],
      }));
    }
  };

  const handleRemoveFile = (supplierId: string, fileIndex: number) => {
    setSupplierFiles((prev) => ({
      ...prev,
      [supplierId]:
        prev[supplierId]?.filter((_, index) => index !== fileIndex) || [],
    }));
  };

  return (
    <Card>
      <CardHeader className="gap-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col gap-2">
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
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
                <Input
                  placeholder="Rechercher..."
                  value={searchSelectedSuppliers}
                  onChange={(e) => setSearchSelectedSuppliers(e.target.value)}
                  className="h-8"
                />
              </div>
            </div>
            <div className="space-y-4">
              {getFilteredSelectedSuppliers().map((supplierId) => {
                const supplier = suppliers.find((s) => s.id === supplierId);
                const fileCount = supplierFiles[supplierId]?.length || 0;
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

                    {/* File List */}
                    {supplierFiles[supplierId]?.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">
                            Fichier :
                          </span>
                        </div>
                        <div className="space-y-1">
                          {supplierFiles[supplierId].map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-white rounded text-sm"
                            >
                              <div className="flex items-center space-x-2">
                                <Upload className="h-4 w-4 text-green-600" />
                                <span className="text-gray-700">
                                  {file.name}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleRemoveFile(supplierId, index)
                                }
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
