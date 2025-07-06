import { Button } from "@/front/components/ui/button";
import { Calendar } from "@/front/components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/front/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/front/components/ui/dialog";
import { Input } from "@/front/components/ui/input";
import { Label } from "@/front/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/front/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/front/components/ui/select";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import {
  Calculator,
  CalendarIcon,
  ChevronsUpDown,
  DollarSign,
  Loader2,
  Percent,
  Save,
  X,
} from "lucide-react";
import { useState } from "react";
import { getAppUsersQuery } from "../api/queries/app-user-queries";
import { getCommissionsQuery } from "../api/queries/commission-queries";
import { cn } from "../lib/utils";
import type { User } from "../types/user";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./ui/command";

interface Employee {
  id: number;
  name: string;
  code: string;
  email: string;
  defaultRate: number;
}

interface Supplier {
  id: number;
  name: string;
  defaultRate: number;
}

interface CommissionFormData {
  employee: Employee | null;
  supplier: Supplier | null;
  period: Date | undefined;
  salesAmount: string;
  commissionRate: string;
  commissionAmount: string;
  notes: string;
  calculationType: "manual" | "automatic";
}

interface CreateCommissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const suppliers: Supplier[] = [
  { id: 1, name: "Supplier A", defaultRate: 5 },
  { id: 2, name: "Supplier B", defaultRate: 6 },
  { id: 3, name: "Supplier C", defaultRate: 4 },
];

export default function CreateCommissionDialog({
  open,
  onOpenChange,
}: CreateCommissionDialogProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null,
  );

  const form = useForm({
    defaultValues: {
      employee: null as Employee | null,
      period: undefined as Date | undefined,
      production: "",
      encours: "",
      salesAmount: "",
      commissionRate: "",
      commissionAmount: "",
      notes: "",
      calculationType: "automatic" as "manual" | "automatic",
    },
    onSubmit: async ({ value }) => {},
  });

  const {
    error: errorUsers,
    data: users,
    isLoading: loadingUsers,
  } = useQuery({
    queryKey: [
      "users",
      {
        limit: 0,
      },
    ],
    queryFn: getAppUsersQuery,
    enabled: open,
  });

  const {
    error: errorCommissions,
    data: commissions,
    isLoading: loadingCommissions,
  } = useQuery({
    queryKey: [
      "commissions",
      {
        userId: selectedEmployeeId,
      },
    ],
    queryFn: getCommissionsQuery,
    enabled: !!selectedEmployeeId,
  });

  console.log(users);
  console.log(open);

  // Auto-calculate commission when sales amount or rate changes
  const handleCalculation = (
    salesAmount: string,
    commissionRate: string,
    calculationType: string,
  ) => {
    if (calculationType === "automatic" && salesAmount && commissionRate) {
      const sales = Number.parseFloat(salesAmount) || 0;
      const rate = Number.parseFloat(commissionRate) || 0;
      const commission = (sales * rate) / 100;
      form.setFieldValue("commissionAmount", commission.toFixed(2));
    }
  };

  const handleEmployeeChange = (userId: User["id"]) => {
    const user = users?.docs.find((u) => u.id === userId);
    if (user) {
      const employee: Employee = {
        id: parseInt(user.id),
        name:
          `${user.firstname || ""} ${user.lastname || ""}`.trim() || user.email,
        code: user.id,
        email: user.email,
        defaultRate: 5, // Default rate
      };
      form.setFieldValue("employee", employee);
      form.setFieldValue("commissionRate", employee.defaultRate.toString());

      // Validate the employee field to clear errors
      form.validateField("employee", "change");

      // Set selected employee ID to trigger commission fetch
      setSelectedEmployeeId(user.id);

      // Recalculate if in automatic mode
      const currentValues = form.state.values;
      handleCalculation(
        currentValues.salesAmount,
        employee.defaultRate.toString(),
        currentValues.calculationType,
      );
    }
    setPopoverOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Créer une commission
          </DialogTitle>
          <DialogDescription>
            Créez un nouvel enregistrement de commission pour un employé.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 gap-6">
            {/* Left Column - Basic Information */}
            <div className="space-y-4">
              <Card className="gap-2 py-4">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    Commission
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Employee Field */}
                  <form.Field
                    name="employee"
                    validators={{
                      onChange: validateEmployee,
                    }}
                  >
                    {(field) => (
                      <div className="space-y-2.5">
                        <Label htmlFor="user-select">
                          Ajouter un utilisateur{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Popover
                          open={popoverOpen}
                          onOpenChange={setPopoverOpen}
                          modal={true}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={popoverOpen}
                              className="w-full justify-between"
                            >
                              {field.state.value
                                ? field.state.value.name
                                : "Choisir un utilisateur..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[250px] p-0">
                            <Command>
                              <CommandInput placeholder="Rechercher un utilisateur..." />
                              <CommandEmpty>
                                Aucun utilisateur disponible
                              </CommandEmpty>
                              <CommandGroup className="max-h-[230px] overflow-auto">
                                {loadingUsers ? (
                                  <div className="pb-4 text-center text-sm text-gray-500">
                                    Chargement des utilisateurs...
                                  </div>
                                ) : errorUsers ? (
                                  <div className="pb-4 text-center text-sm text-red-500">
                                    Erreur lors du chargement
                                  </div>
                                ) : (
                                  users?.docs?.map((user) => {
                                    const fullName =
                                      `${user.firstname || ""} ${user.lastname || ""}`.trim();
                                    const displayName = fullName || user.email;
                                    return (
                                      <CommandItem
                                        key={user.id}
                                        value={`${fullName} ${user.email}`}
                                        onSelect={() =>
                                          handleEmployeeChange(user.id)
                                        }
                                      >
                                        <div className="flex flex-col">
                                          <span className="font-medium">
                                            {displayName}
                                          </span>
                                          {fullName && (
                                            <span className="text-xs text-gray-500">
                                              {user.email}
                                            </span>
                                          )}
                                        </div>
                                      </CommandItem>
                                    );
                                  }) || []
                                )}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        {field.state.meta.errors.length > 0 && (
                          <p className="text-sm text-red-500">
                            {field.state.meta.errors[0]}
                          </p>
                        )}
                      </div>
                    )}
                  </form.Field>

                  {/* Period Field */}
                  <form.Field
                    name="period"
                    validators={{
                      onChange: validatePeriod,
                    }}
                  >
                    {(field) => (
                      <div className="space-y-2">
                        <Label>
                          Période de commission{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.state.value && "text-muted-foreground",
                                field.state.meta.errors.length > 0 &&
                                  "border-red-500",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.state.value
                                ? "05-2025"
                                : "Sélectionner la période"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.state.value}
                              onSelect={(date) => field.handleChange(date)}
                            />
                          </PopoverContent>
                        </Popover>
                        {field.state.meta.errors.length > 0 && (
                          <p className="text-sm text-red-500">
                            {field.state.meta.errors[0]}
                          </p>
                        )}
                      </div>
                    )}
                  </form.Field>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Financial Information */}
            {loadingCommissions ? (
              <div className="space-y-4">
                <Card className="gap-1 py-0">
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      <p className="text-sm text-gray-600">
                        Chargement des calculs de commission...
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : selectedEmployeeId ? (
              <>
                <div className="space-y-4">
                  <Card className="gap-1 py-4">
                    <CardHeader className="">
                      <CardTitle className="text-lg flex items-center gap-2">
                        Montants globaux
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-production">
                            Production
                          </Label>
                          <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg border border-production">
                            <span className="text-lg font-semibold text-production">
                              12 450,00 €
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-encours">
                            Encours
                          </Label>
                          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-encours">
                            <span className="text-lg font-semibold text-encours">
                              8 750,00 €
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Card className="gap-2 py-4">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        Détails
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Sales Amount Field */}
                      <form.Field
                        name="salesAmount"
                        validators={{
                          onChange: validateSalesAmount,
                        }}
                      >
                        {(field) => (
                          <div className="space-y-2">
                            <Label htmlFor="salesAmount">
                              Montant des ventes *
                            </Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                id="salesAmount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={field.state.value}
                                onChange={(e) => {
                                  field.handleChange(e.target.value);
                                  const currentValues = form.state.values;
                                  handleCalculation(
                                    e.target.value,
                                    currentValues.commissionRate,
                                    currentValues.calculationType,
                                  );
                                }}
                                className={cn(
                                  "pl-10",
                                  field.state.meta.errors.length > 0 &&
                                    "border-red-500",
                                )}
                              />
                            </div>
                            {field.state.meta.errors.length > 0 && (
                              <p className="text-sm text-red-500">
                                {field.state.meta.errors[0]}
                              </p>
                            )}
                          </div>
                        )}
                      </form.Field>

                      {/* Commission Rate Field */}
                      <form.Field
                        name="commissionRate"
                        validators={{
                          onChange: validateCommissionRate,
                        }}
                      >
                        {(field) => (
                          <div className="space-y-2">
                            <Label htmlFor="commissionRate">
                              Taux de commission (%) *
                            </Label>
                            <div className="relative">
                              <Percent className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                id="commissionRate"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={field.state.value}
                                onChange={(e) => {
                                  field.handleChange(e.target.value);
                                  const currentValues = form.state.values;
                                  handleCalculation(
                                    currentValues.salesAmount,
                                    e.target.value,
                                    currentValues.calculationType,
                                  );
                                }}
                                className={cn(
                                  "pl-10",
                                  field.state.meta.errors.length > 0 &&
                                    "border-red-500",
                                )}
                              />
                            </div>
                            {field.state.meta.errors.length > 0 && (
                              <p className="text-sm text-red-500">
                                {field.state.meta.errors[0]}
                              </p>
                            )}
                          </div>
                        )}
                      </form.Field>

                      {/* Calculation Type Field */}
                      <form.Field name="calculationType">
                        {(field) => (
                          <div className="space-y-2">
                            <Label htmlFor="calculationType">
                              Type de calcul
                            </Label>
                            <Select
                              value={field.state.value}
                              onValueChange={(
                                value: "manual" | "automatic",
                              ) => {
                                field.handleChange(value);
                                if (value === "automatic") {
                                  const currentValues = form.state.values;
                                  handleCalculation(
                                    currentValues.salesAmount,
                                    currentValues.commissionRate,
                                    value,
                                  );
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="automatic">
                                  Automatique (Taux × Ventes)
                                </SelectItem>
                                <SelectItem value="manual">
                                  Saisie manuelle
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </form.Field>

                      {/* Commission Amount Field */}
                      <form.Field
                        name="commissionAmount"
                        validators={{
                          onChange: validateCommissionAmount,
                        }}
                      >
                        {(field) => (
                          <div className="space-y-2">
                            <Label htmlFor="commissionAmount">
                              Montant de la commission *
                            </Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                id="commissionAmount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={field.state.value}
                                onChange={(e) =>
                                  field.handleChange(e.target.value)
                                }
                                className={cn(
                                  "pl-10",
                                  field.state.meta.errors.length > 0 &&
                                    "border-red-500",
                                )}
                                disabled={
                                  form.state.values.calculationType ===
                                  "automatic"
                                }
                              />
                            </div>
                            {field.state.meta.errors.length > 0 && (
                              <p className="text-sm text-red-500">
                                {field.state.meta.errors[0]}
                              </p>
                            )}
                            {form.state.values.calculationType ===
                              "automatic" && (
                              <p className="text-xs text-muted-foreground">
                                Calculé automatiquement basé sur le montant des
                                ventes et le taux de commission
                              </p>
                            )}
                          </div>
                        )}
                      </form.Field>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : null}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
            <Button type="submit" disabled={form.state.isSubmitting}>
              {form.state.isSubmitting ? (
                <>
                  <Calculator className="w-4 h-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Créer commission
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const validateEmployee = ({ value }: { value: Employee | null }) => {
  if (!value) return "L'employé est requis";
  return undefined;
};

const validatePeriod = ({ value }: { value: Date | undefined }) => {
  if (!value) return "La période est requise";
  return undefined;
};

const validateSalesAmount = ({ value }: { value: string }) => {
  if (!value || Number.parseFloat(value) <= 0) {
    return "Un montant de vente valide est requis";
  }
  return undefined;
};

const validateCommissionRate = ({ value }: { value: string }) => {
  if (!value || Number.parseFloat(value) <= 0) {
    return "Un taux de commission valide est requis";
  }
  return undefined;
};

const validateCommissionAmount = ({ value }: { value: string }) => {
  if (!value || Number.parseFloat(value) <= 0) {
    return "Un montant de commission valide est requis";
  }
  return undefined;
};
