import { getCommissionsQuery } from "@/front/api/queries/commission-queries";
import { Alert, AlertDescription } from "@/front/components/ui/alert";
import { Button } from "@/front/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/front/components/ui/card";
import { Input } from "@/front/components/ui/input";
import { Label } from "@/front/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/front/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/front/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/front/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { Calculator, Upload, X, Save, Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { TabSkeleton } from "../home";

export default function ImportTab() {
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [supplierFiles, setSupplierFiles] = useState<Record<string, File[]>>({});
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  
  // Expanded suppliers list - replace with actual data from your API
  const suppliers = [
    { id: "supplier1", name: "Fournisseur A" },
    { id: "supplier2", name: "Fournisseur B" },
    { id: "supplier3", name: "Fournisseur C" },
    { id: "supplier4", name: "Fournisseur Delta" },
    { id: "supplier5", name: "Entreprise Echo" },
    { id: "supplier6", name: "Société Foxtrot" },
    { id: "supplier7", name: "Groupe Golf" },
    { id: "supplier8", name: "Solutions Hotel" },
    { id: "supplier9", name: "Industries India" },
    { id: "supplier10", name: "Logistics Juliet" },
    // Add more suppliers as needed...
  ];

  const validateFile = (file: File): string | null => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    const allowedExtensions = ['.csv', '.xls', '.xlsx'];
    
    const hasValidType = allowedTypes.includes(file.type);
    const hasValidExtension = allowedExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    );
    
    if (!hasValidType && !hasValidExtension) {
      return "Le fichier doit être au format CSV, XLS ou XLSX";
    }
    
    return null;
  };

  const handleSupplierChange = (supplierId: string) => {
    setSelectedSupplier(supplierId);
    setOpen(false);
  };

  const removeSupplierFiles = (supplierId: string) => {
    handleRemoveAllFiles(supplierId);
    if (selectedSupplier === supplierId) {
      setSelectedSupplier("");
    }
  };

  const getSuppliersWithFiles = () => {
    return Object.keys(supplierFiles).filter(id => supplierFiles[id]?.length > 0);
  };

  const handleFileUpload = (supplierId: string, file: File | null) => {
    if (file) {
      const error = validateFile(file);
      if (error) {
        setFileErrors(prev => ({ ...prev, [supplierId]: error }));
        return;
      } else {
        setFileErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[supplierId];
          return newErrors;
        });
      }
      
      // Add file to existing files array
      setSupplierFiles(prev => ({
        ...prev,
        [supplierId]: [...(prev[supplierId] || []), file]
      }));
    }
  };

  const handleRemoveFile = (supplierId: string, fileIndex: number) => {
    setSupplierFiles(prev => ({
      ...prev,
      [supplierId]: prev[supplierId]?.filter((_, index) => index !== fileIndex) || []
    }));
  };

  const handleRemoveAllFiles = (supplierId: string) => {
    setSupplierFiles(prev => ({
      ...prev,
      [supplierId]: []
    }));
    setFileErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[supplierId];
      return newErrors;
    });
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    
    try {
      // Validate all files before submitting
      const hasErrors = Object.values(fileErrors).some(error => error);
      if (hasErrors) {
        alert("Veuillez corriger les erreurs de validation des fichiers");
        return;
      }

      console.log("Saving supplier files:", supplierFiles);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Files saved successfully!");
      // Handle success (show toast, redirect, etc.)
      
    } catch (error) {
      console.error("Error saving files:", error);
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUploadedFilesCount = () => {
    return Object.values(supplierFiles).reduce((total, files) => total + files.length, 0);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Importation des fichiers globaux de commissions
            </CardTitle>
            <CardDescription>
              Ajoutez, modifiez ou supprimez les fichiers globaux de commissions des
              fournisseurs
            </CardDescription>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={getUploadedFilesCount() === 0 || isSubmitting}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="items-center">
          <Calculator className="h-4 w-4" />
          <AlertDescription>
            Les commissions seront basées sur les fichiers de commissions
            importés ici, quand vous importez un fichier il écrasera le dernier
            existant du même fournisseur.
          </AlertDescription>
        </Alert>

        {/* Suppliers with Files */}
        {getSuppliersWithFiles().length > 0 && (
          <div className="space-y-2">
            <Label>Fournisseurs avec fichiers</Label>
            <div className="space-y-2">
              {getSuppliersWithFiles().map((supplierId) => {
                const supplier = suppliers.find(s => s.id === supplierId);
                const fileCount = supplierFiles[supplierId]?.length || 0;
                return (
                  <div key={supplierId} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{supplier?.name}</span>
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                        {fileCount} fichier(s)
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeSupplierFiles(supplierId)}
                      className="h-8 w-8 p-0 border-red-200 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Supplier Selection */}
        <div className="space-y-2">
          <Label htmlFor="supplier-select">Sélectionner un fournisseur</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {selectedSupplier
                  ? suppliers.find(supplier => supplier.id === selectedSupplier)?.name
                  : "Choisir un fournisseur..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Rechercher un fournisseur..." />
                <CommandEmpty>Aucun fournisseur trouvé.</CommandEmpty>
                <CommandGroup className="max-h-[200px] overflow-auto">
                  {suppliers.map((supplier) => (
                    <CommandItem
                      key={supplier.id}
                      value={supplier.name}
                      onSelect={() => handleSupplierChange(supplier.id)}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          selectedSupplier === supplier.id ? "opacity-100" : "opacity-0"
                        }`}
                      />
                      {supplier.name}
                      {supplierFiles[supplier.id]?.length > 0 && (
                        <span className="ml-auto text-xs text-green-600">
                          ({supplierFiles[supplier.id].length})
                        </span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* File Upload for Selected Supplier */}
        {selectedSupplier && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <Label htmlFor={`file-${selectedSupplier}`} className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Importer le fichier pour {suppliers.find(s => s.id === selectedSupplier)?.name}
                    </span>
                  </Label>
                  <Input
                    id={`file-${selectedSupplier}`}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="mt-2"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleFileUpload(selectedSupplier, file);
                    }}
                  />
                  {fileErrors[selectedSupplier] && (
                    <p className="text-red-500 text-sm mt-1">
                      {fileErrors[selectedSupplier]}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Show selected files */}
            {supplierFiles[selectedSupplier]?.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {supplierFiles[selectedSupplier].length} fichier(s) sélectionné(s)
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveAllFiles(selectedSupplier)}
                  >
                    Tout supprimer
                  </Button>
                </div>
                {supplierFiles[selectedSupplier].map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Upload className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">{file.name}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveFile(selectedSupplier, index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Files Summary */}
        {getUploadedFilesCount() > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Fichiers à importer ({getUploadedFilesCount()})</h3>
            <div className="space-y-3">
              {Object.entries(supplierFiles).map(([supplierId, files]) => {
                if (!files.length) return null;
                const supplier = suppliers.find(s => s.id === supplierId);
                return (
                  <div key={supplierId} className="border rounded-lg p-4 bg-blue-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{supplier?.name}</span>
                      <span className="text-xs text-gray-600">{files.length} fichier(s)</span>
                    </div>
                    <div className="space-y-1">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">• {file.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFile(supplierId, index)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
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
