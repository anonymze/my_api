import { useState, useEffect } from "react";
import { Building2, Plus, Trash2, Loader2 } from "lucide-react";
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

interface SupplierMapping {
  id: number;
  supplier: string;
  salesColumn: string;
  commissionColumn: string;
  employeeColumn: string;
}

export default function SupplierMappingTab() {
  const [supplierMappings, setSupplierMappings] = useState<SupplierMapping[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSupplierMappings = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Mock data
      const mockData: SupplierMapping[] = [
        {
          id: 1,
          supplier: "Supplier A",
          salesColumn: "Total Sales",
          commissionColumn: "Commission %",
          employeeColumn: "Employee Code",
        },
        {
          id: 2,
          supplier: "Supplier B",
          salesColumn: "Net Sales",
          commissionColumn: "Rate",
          employeeColumn: "Rep Code",
        },
      ];

      setSupplierMappings(mockData);
      setLoading(false);
    };

    loadSupplierMappings();
  }, []);

  const addSupplierMapping = () => {
    const newId = Math.max(...supplierMappings.map((s) => s.id), 0) + 1;
    setSupplierMappings((prev) => [
      ...prev,
      {
        id: newId,
        supplier: "",
        salesColumn: "",
        commissionColumn: "",
        employeeColumn: "",
      },
    ]);
  };

  const updateSupplierMapping = (
    id: number,
    field: keyof SupplierMapping,
    value: string,
  ) => {
    setSupplierMappings((prev) =>
      prev.map((mapping) =>
        mapping.id === id ? { ...mapping, [field]: value } : mapping,
      ),
    );
  };

  const removeSupplierMapping = (id: number) => {
    setSupplierMappings((prev) => prev.filter((mapping) => mapping.id !== id));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Chargement des mappings fournisseurs...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Mapping des Colonnes Fournisseur
        </CardTitle>
        <CardDescription>
          Associez les colonnes Excel aux champs de données de commissions pour chaque fournisseur
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {supplierMappings.length} mappings fournisseur configurés
          </p>
          <Button onClick={addSupplierMapping} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter Mapping
          </Button>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {supplierMappings.map((mapping) => (
            <Card key={mapping.id}>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Nom du Fournisseur</Label>
                    <Input
                      value={mapping.supplier}
                      onChange={(e) =>
                        updateSupplierMapping(
                          mapping.id,
                          "supplier",
                          e.target.value,
                        )
                      }
                      placeholder="Nom du fournisseur"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Colonne Ventes</Label>
                    <Select
                      value={mapping.salesColumn}
                      onValueChange={(value) =>
                        updateSupplierMapping(mapping.id, "salesColumn", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner colonne" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Total Sales">Ventes Totales</SelectItem>
                        <SelectItem value="Net Sales">Ventes Nettes</SelectItem>
                        <SelectItem value="Revenue">Revenus</SelectItem>
                        <SelectItem value="Amount">Montant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Colonne Commission</Label>
                    <Select
                      value={mapping.commissionColumn}
                      onValueChange={(value) =>
                        updateSupplierMapping(
                          mapping.id,
                          "commissionColumn",
                          value,
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner colonne" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Commission %">
                          Commission %
                        </SelectItem>
                        <SelectItem value="Commission Rate">
                          Taux de Commission
                        </SelectItem>
                        <SelectItem value="Rate">Taux</SelectItem>
                        <SelectItem value="Percentage">Pourcentage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Colonne Employé</Label>
                    <Select
                      value={mapping.employeeColumn}
                      onValueChange={(value) =>
                        updateSupplierMapping(
                          mapping.id,
                          "employeeColumn",
                          value,
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner colonne" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Employee Code">
                          Code Employé
                        </SelectItem>
                        <SelectItem value="Employee ID">ID Employé</SelectItem>
                        <SelectItem value="Rep Code">Code Rep</SelectItem>
                        <SelectItem value="Sales Rep">Représentant Ventes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSupplierMapping(mapping.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
