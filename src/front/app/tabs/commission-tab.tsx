import {
  deleteCommissionQuery,
  getCommissionExportQuery,
  getCommissionsQuery,
} from "@/front/api/queries/commission-queries";
import CreateCommissionDialog from "@/front/components/commission-dialog";
import { Alert, AlertDescription } from "@/front/components/ui/alert";
import { Badge } from "@/front/components/ui/badge";
import { Button } from "@/front/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/front/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/front/components/ui/dropdown-menu";
import { Input } from "@/front/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/front/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/front/components/ui/table";
import { userRoleLabels } from "@/front/types/user";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  BookAlertIcon,
  Calculator,
  Download,
  Edit,
  Filter,
  Mail,
  MoreHorizontal,
  Search,
  Trash2,
  XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TabSkeleton } from "../home";

// Shared search input component outside the main component
const SearchInput = ({
  searchTerm,
  onSearchChange,
}: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}) => (
  <div className="flex items-center space-x-2 max-w-sm">
    <Search className="w-4 h-4 text-muted-foreground" />
    <div className="relative">
      <Input
        placeholder="Rechercher..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="h-8 pr-8"
      />
      {searchTerm && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSearchChange("")}
          className="absolute right-0 top-0 h-8 w-8 p-0 hover:bg-transparent"
        >
          <XIcon className="h-3 w-3 text-gray-400 hover:text-gray-600" />
        </Button>
      )}
    </div>
  </div>
);

export default function CommissionsTab() {
  const queryClient = useQueryClient();

  // Get initial search term from URL
  const getInitialSearchTerm = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("search") || "";
  };

  const [searchTerm, setSearchTerm] = useState(getInitialSearchTerm);
  const [periodFilter, setPeriodFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Delete commission mutation
  const deleteCommissionMutation = useMutation({
    mutationFn: deleteCommissionQuery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
      toast.success("Commission supprimée avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression de la commission");
    },
  });

  // Export commission mutation
  const exportCommissionMutation = useMutation({
    mutationFn: getCommissionExportQuery,
    onSuccess: (response, commissionRequest) => {
      if (commissionRequest.email) {
        toast.success("Commission envoyée par email avec succès");
        return;
      }

      const { data, contentType } = response;

      // Determine file extension based on content type
      let extension = "";
      let mimeType = contentType || "application/octet-stream";

      if (contentType?.includes("text/csv")) {
        extension = ".csv";
        mimeType = "text/csv";
      } else if (contentType?.includes("application/vnd.ms-excel")) {
        extension = ".xls";
        mimeType = "application/vnd.ms-excel";
      } else {
        // Default to Excel if unknown
        extension = ".xlsx";
        mimeType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      }

      const blob = new Blob([data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `commission-${commissionRequest.commissionId}${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Commission exportée avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de l'exportation de la commission");
    },
  });

  // Update URL when search term changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set("search", value);
    } else {
      url.searchParams.delete("search");
    }
    window.history.replaceState({}, "", url.toString());
  };

  // Update search term if URL changes (e.g., back button)
  useEffect(() => {
    const handlePopState = () => {
      setSearchTerm(getInitialSearchTerm());
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const { error, data, isLoading, isFetching } = useQuery({
    queryKey: [
      "commissions",
      {
        page: currentPage,
      },
    ],
    queryFn: getCommissionsQuery,
    placeholderData: keepPreviousData,
  });

  // Filter data based on search term
  const filteredData = data?.docs
    ? {
        ...data,
        docs: data.docs.filter((commission) => {
          const searchLower = searchTerm.toLowerCase();
          const email = commission.app_user?.email?.toLowerCase() || "";
          const firstName = commission.app_user?.firstname?.toLowerCase() || "";
          const lastName = commission.app_user?.lastname?.toLowerCase() || "";
          const role = commission.app_user?.role?.toLowerCase() || "";

          return (
            email.includes(searchLower) ||
            firstName.includes(searchLower) ||
            lastName.includes(searchLower) ||
            role.includes(searchLower) ||
            `${firstName} ${lastName}`.includes(searchLower) ||
            `${lastName} ${firstName}`.includes(searchLower)
          );
        }),
      }
    : data;

  if (isLoading) {
    return <TabSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <p className="text-red-600">
            Erreur lors du chargement des commissions
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <Card>
        <CardHeader className="gap-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col gap-2">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Gestion et calcul des Commissions
              </CardTitle>
              <CardDescription>
                Consultez, gérez et créez les commissions pour tous les
                employés.
              </CardDescription>
            </div>
            <Button
              disabled={
                deleteCommissionMutation.isPending ||
                exportCommissionMutation.isPending
              }
              onClick={() => setShowCreateDialog(true)}
            >
              Créer une commission
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="items-center">
            <BookAlertIcon className="h-4 w-4" />
            <AlertDescription>
              Les calculs de commissions sont basés sur les données importées et
              les mappings configurés. Assurez-vous que tous les fichiers sont
              traités et que les mappings sont corrects avant créer une
              commission.
            </AlertDescription>
          </Alert>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <SearchInput
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
            />
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filtrer par période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les Périodes</SelectItem>
                  <SelectItem value="2024-01">Janvier 2024</SelectItem>
                  <SelectItem value="2024-02">Février 2024</SelectItem>
                  <SelectItem value="2024-03">Mars 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table or No Results */}
          {filteredData?.docs.length === 0 && searchTerm ? (
            <div className="p-6 flex items-center justify-center">
              <p className="text-gray-600">
                Aucun résultat trouvé pour "{searchTerm}"
              </p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-5">Email</TableHead>
                    <TableHead className="px-5">Nom et prénom</TableHead>
                    <TableHead className="px-5">Role</TableHead>
                    <TableHead className="px-5">Données</TableHead>
                    <TableHead className="px-5">Date</TableHead>
                    <TableHead className="ml-auto text-right px-5">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData?.docs.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell className="font-medium px-5">
                        {commission.app_user.email}
                      </TableCell>
                      <TableCell className="px-5">
                        {commission.app_user.lastname}{" "}
                        {commission.app_user.firstname}
                      </TableCell>
                      <TableCell className="px-5">
                        <Badge variant="outline">
                          {userRoleLabels[commission.app_user.role]}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 flex flex-col gap-2">
                        <Badge className="bg-production">
                          Production :{" "}
                          {commission.commission_suppliers.reduce(
                            (cum, item) => Math.max(cum, item.production || 0),
                            0,
                          )}
                        </Badge>
                        <Badge className="bg-encours">
                          Encours :{" "}
                          {commission.commission_suppliers.reduce(
                            (cum, item) => Math.max(cum, item.encours || 0),
                            0,
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5">
                        {new Date(commission.date).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "2-digit",
                        })}
                      </TableCell>

                      <TableCell className="text-right px-5">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            disabled={
                              deleteCommissionMutation.isPending ||
                              exportCommissionMutation.isPending
                            }
                            asChild
                          >
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Ouvrir le menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {/* <DropdownMenuItem
                            onClick={() => console.log("View", commission.id)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            <span>Voir</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator /> */}
                            <DropdownMenuItem
                              onClick={() =>
                                console.log("Update", commission.id)
                              }
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Modifier</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                deleteCommissionMutation.mutate(commission.id)
                              }
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Supprimer</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                exportCommissionMutation.mutate({
                                  commissionId: commission.id,
                                })
                              }
                            >
                              <Download className="mr-2 h-4 w-4" />
                              <span>Exporter</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                exportCommissionMutation.mutate({
                                  commissionId: commission.id,
                                  email: commission.app_user.email,
                                })
                              }
                            >
                              <Mail className="mr-2 h-4 w-4" />
                              <span>Envoyer</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {data?.totalPages && data.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Affichage de {(data.page - 1) * data.limit + 1} à{" "}
                {Math.min(data.page * data.limit, data.totalDocs)} sur{" "}
                {data.totalDocs} commissions
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={!data.hasPrevPage || isFetching}
                >
                  Précédent
                </Button>
                <span className="flex items-center px-3 text-sm">
                  Page {data.page} sur {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={!data.hasNextPage || isFetching}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <CreateCommissionDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}
