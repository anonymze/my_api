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
import { Label } from "@/front/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/front/components/ui/popover";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import {
  Calculator,
  CalendarIcon,
  ChevronsUpDown,
  Loader2,
  Save,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { queryClient } from "../api/_queries";
import { getAppUsersQuery } from "../api/queries/app-user-queries";
import {
  createCommissionQuery,
  getCommissionImportUserQuery,
} from "../api/queries/commission-queries";
import { cn } from "../lib/utils";
import type { Supplier } from "../types/supplier";
import type { User } from "../types/user";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./ui/command";

interface CreateCommissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateCommissionDialog({
  open,
  onOpenChange,
}: CreateCommissionDialogProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null,
  );

  const createCommission = useMutation({
    mutationFn: createCommissionQuery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
      toast.success("Commission créée avec succès");
      onOpenChange(false);
    },
    onError: (_) => {
      toast.error(
        "Une erreur est survenue lors de la création de la commission, recommencez ou contactez le développeur",
      );
      form.setFieldValue("app_user", null);
      setSelectedEmployeeId(null);
      // onOpenChange(false);
    },
  });

  const form = useForm({
    defaultValues: {
      app_user: null as User | null,
      commission_suppliers: [] as Array<{
        supplier: Supplier["id"];
        encours: number;
        production: number;
      }>,
      date: new Date(),
    },
    onSubmit: async ({ value }) => {
      const { app_user, date } = value;

      if (!app_user || !commissionImportUser?.commissionSupplierIds?.length) {
        return toast(
          "Quelque chose d'inattendu s'est produit, rechargez la page ou contactez le développeur.",
        );
      }

      createCommission.mutate({
        app_user: app_user.id,
        commission_supplier_ids: commissionImportUser.commissionSupplierIds,
        date: date.toISOString(),
        structured_product: false,
        broqueur: undefined,
        up_front: undefined,
        title: undefined,
      });
    },
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
    isError,
    error: errorCommissions,
    data: commissionImportUser,
    isLoading: loadingCommissions,
    isFetching,
  } = useQuery({
    queryKey: ["commission-import-user", selectedEmployeeId],
    queryFn: getCommissionImportUserQuery,
    enabled: !!selectedEmployeeId,
    refetchOnMount: "always",
    staleTime: 0,
    gcTime: 0,
  });

  console.log(errorCommissions);

  // Auto-populate commission_suppliers when commission data is loaded
  useEffect(() => {
    if (commissionImportUser?.suppliersData) {
      const suppliersArray = Object.entries(
        commissionImportUser.suppliersData,
      ).map(([supplierId, supplier]) => ({
        supplier: supplierId,
        encours: supplier.encours,
        production: supplier.production,
      }));
      form.setFieldValue("commission_suppliers", suppliersArray);
    }
  }, [commissionImportUser]);

  const handleEmployeeChange = (userId: User["id"]) => {
    const user = users?.docs.find((u) => u.id === userId);
    if (user) {
      form.setFieldValue("app_user", user);
      setSelectedEmployeeId(user.id);
      // Validate the employee field to clear errors
      form.validateField("app_user", "change");
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
          <div className="grid grid-cols-1 gap-4 mb-4">
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
                    name="app_user"
                    validators={{
                      onChange: validateUser,
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
                                ? field.state.value.email
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
                    name="date"
                    validators={{
                      onChange: validatePeriod,
                    }}
                  >
                    {(field) => (
                      <div className="space-y-2">
                        <Label>
                          Mois de commission{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Popover
                          open={calendarOpen}
                          onOpenChange={setCalendarOpen}
                        >
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
                                ? field.state.value.toLocaleDateString(
                                    "fr-FR",
                                    {
                                      month: "2-digit",
                                      year: "numeric",
                                    },
                                  )
                                : "Sélectionner le mois"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.state.value}
                              onSelect={(date) => {
                                if (date) {
                                  field.handleChange(date);
                                  setCalendarOpen(false);
                                }
                              }}
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
            {loadingCommissions || isError ? (
              <div className="space-y-4">
                <Card className="gap-1 py-0">
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="flex flex-col items-center gap-3">
                      {isError ? (
                        <p className="text-sm text-red-500">
                          {/* @ts-ignore */}
                          {isAxiosError(errorCommissions)
                            ? errorCommissions.response?.data?.message ||
                              "Une erreur inconnue est survenue"
                            : "Une erreur inconnue est survenue"}
                        </p>
                      ) : (
                        <>
                          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                          <p className="text-sm text-gray-600">
                            Chargement des calculs de commission...
                          </p>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : selectedEmployeeId && commissionImportUser ? (
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
                          <Label className="text-sm font-medium">
                            Production
                          </Label>
                          <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg border border-production">
                            <span className="text-lg font-semibold text-production">
                              {commissionImportUser.totalGlobalProduction}€
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Encours</Label>
                          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-encours">
                            <span className="text-lg font-semibold text-encours">
                              {commissionImportUser.totalGlobalEncours}€
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="border-t"></div>

                {Object.values(commissionImportUser.suppliersData).map(
                  (supplier) => (
                    <div key={supplier.supplierName} className="space-y-4">
                      <Card className="gap-1 py-4">
                        <CardHeader className="">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {supplier.supplierName}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              Production :
                              <span className="text-md font-semibold text-production">
                                {supplier.production}
                              </span>
                            </Label>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              Encours :
                              <span className="text-md font-semibold text-encours">
                                {supplier.encours}
                              </span>
                            </Label>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ),
                )}
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
            <Button
              type="submit"
              disabled={
                form.state.isSubmitting ||
                createCommission.isPending ||
                isFetching ||
                loadingUsers
              }
            >
              {form.state.isSubmitting || createCommission.isPending ? (
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

const validateUser = ({ value }: { value: User | null }) => {
  if (!value) return "L'employé est requis";
  return undefined;
};

const validatePeriod = ({ value }: { value: Date | undefined }) => {
  if (!value) return "Le mois est requis";
  return undefined;
};
