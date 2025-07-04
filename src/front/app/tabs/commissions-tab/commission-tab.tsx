import { getCommissionsQuery } from "@/front/api/queries/commission-queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/front/components/ui/card";
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
  TableHead,
  TableHeader,
  TableRow,
} from "@/front/components/ui/table";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  Calculator,
  DollarSignIcon,
  Filter,
  Loader2,
  Search,
} from "lucide-react";
import { useState } from "react";

export default function CommissionsTab() {
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
      },
    ],
    queryFn: getCommissionsQuery,
    placeholderData: keepPreviousData,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Chargement des données de commission...
        </CardContent>
      </Card>
    );
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <p className="text-2xl font-bold">{data?.total || 0}</p>
                  <p className="text-sm text-muted-foreground">
                    Total Enregistrements
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* <Alert className="items-center">
          <Calculator className="h-4 w-4" />
          <AlertDescription>
            Les calculs de commissions sont basés sur les données importées et
            les mappings configurés. Assurez-vous que tous les fichiers sont
            traités et que les mappings sont corrects avant créer une
            commission.
          </AlertDescription>
        </Alert> */}

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
                <TableHead>Employé</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Période</TableHead>
                <TableHead className="text-right">Ventes</TableHead>
                <TableHead className="text-right">Taux (%)</TableHead>
                <TableHead className="text-right">Commission</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* {commissions.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell className="font-medium">
                    {commission.employee}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{commission.code}</Badge>
                  </TableCell>
                  <TableCell>{commission.period}</TableCell>
                  <TableCell className="text-right">
                    ${commission.sales.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {commission.rate}%
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${commission.commission.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        commission.status === "calculated"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {commission.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))} */}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {/* {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Affichage de {(currentPage - 1) * itemsPerPage + 1} à{" "}
              {Math.min(currentPage * itemsPerPage, data?.total || 0)} sur{" "}
              {data?.total || 0} commissions
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Précédent
              </Button>
              <span className="flex items-center px-3 text-sm">
                Page {currentPage} sur {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              >
                Suivant
              </Button>
            </div>
          </div>
        )} */}
      </CardContent>
    </Card>
  );
}
