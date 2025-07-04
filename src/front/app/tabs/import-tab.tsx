import { getCommissionsQuery } from "@/front/api/queries/commission-queries";
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
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  Calculator,
  Download,
  Edit,
  Eye,
  Filter,
  Mail,
  MoreHorizontal,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { TabSkeleton } from "../home";

export default function ImportTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    isPending,
    isError,
    error,
    data,
    isLoading,
    isFetching,
    isPlaceholderData,
  } = useQuery({
    queryKey: [
      "commissions",
      {
        page: currentPage,
        depht: 2,
      },
    ],
    queryFn: getCommissionsQuery,
    placeholderData: keepPreviousData,
  });

  console.log(data);
  console.log(data?.docs[0]);

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

  if (!data || !data.docs) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <p className="text-gray-600">
            Il n'y a pas de commissions disponibles
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Gestion et calcul des Commissions
        </CardTitle>
        <CardDescription>
          Consultez, gérez et créez les commissions pour tous les employés.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSignIcon className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">€{0}</p>
                  <p className="text-sm text-muted-foreground">
                    Total commissions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{data?.totalDocs || 0}</p>
                  <p className="text-sm text-muted-foreground">
                    Total Enregistrements
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div> */}

        <Alert className="items-center">
          <Calculator className="h-4 w-4" />
          <AlertDescription>
            Les calculs de commissions sont basés sur les données importées et
            les mappings configurés. Assurez-vous que tous les fichiers sont
            traités et que les mappings sont corrects avant créer une
            commission.
          </AlertDescription>
        </Alert>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher employés ou codes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
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

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Nom et prénom</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Production</TableHead>
                <TableHead>Encours</TableHead>
                <TableHead className="ml-auto text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.docs.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell className="font-medium">
                    {commission.app_user.email}
                  </TableCell>
                  <TableCell>
                    {commission.app_user.lastname}{" "}
                    {commission.app_user.firstname}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{commission.app_user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    {commission.informations?.production ? (
                      <Badge variant="secondary">
                        {commission.informations?.production}
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    {commission.informations?.encours ? (
                      <Badge variant="secondary">
                        {commission.informations?.encours}
                      </Badge>
                    ) : null}
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Ouvrir le menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => console.log("View", commission.id)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          <span>Voir</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => console.log("Update", commission.id)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Modifier</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => console.log("Delete", commission.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Supprimer</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => console.log("Export", commission.id)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          <span>Exporter</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            console.log("Send email", commission.id)
                          }
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          <span>Envoyer email</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {data?.totalPages > 1 && (
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
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
  );
}
