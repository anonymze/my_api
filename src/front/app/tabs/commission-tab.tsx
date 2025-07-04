import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/front/components/ui/select";
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
import { Input } from "@/front/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/front/components/ui/table";
import {
  Calculator,
  DollarSign,
  Filter,
  Loader2,
  Search,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Commission {
  id: number;
  employee: string;
  code: string;
  sales: number;
  rate: number;
  commission: number;
  period: string;
  status: string;
}

export default function CommissionsTab() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    const loadCommissions = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Mock large dataset
      const mockData: Commission[] = Array.from({ length: 200 }, (_, i) => ({
        id: i + 1,
        employee: `Employee ${i + 1}`,
        code: `EMP${String(i + 1).padStart(3, "0")}`,
        sales: Math.floor(Math.random() * 50000) + 10000,
        rate: Math.floor(Math.random() * 8) + 3,
        commission: 0,
        period: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}`,
        status: Math.random() > 0.8 ? "pending" : "calculated",
      }));

      // Calculate commissions
      mockData.forEach((item) => {
        item.commission = Math.floor(item.sales * (item.rate / 100));
      });

      setCommissions(mockData);
      setLoading(false);
    };

    loadCommissions();
  }, []);

  const filteredCommissions = commissions.filter((commission) => {
    const matchesSearch =
      commission.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commission.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPeriod =
      periodFilter === "all" || commission.period === periodFilter;
    return matchesSearch && matchesPeriod;
  });

  const paginatedCommissions = filteredCommissions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalPages = Math.ceil(filteredCommissions.length / itemsPerPage);
  const totalCommissions = filteredCommissions.reduce(
    (sum, c) => sum + c.commission,
    0,
  );
  const totalSales = filteredCommissions.reduce((sum, c) => sum + c.sales, 0);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Chargement des données de commission...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Calcul et Gestion des Commissions
        </CardTitle>
        <CardDescription>
          Consultez et gérez les commissions calculées pour tous les employés
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">
                    ${totalCommissions.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total Commissions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">
                    ${totalSales.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Ventes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {filteredCommissions.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Enregistrements</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Alert>
          <Calculator className="h-4 w-4" />
          <AlertDescription>
            Les calculs de commissions sont basés sur les données importées et les
            mappings configurés. Assurez-vous que tous les fichiers sont traités et que les mappings sont corrects
            avant de calculer.
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
            <Button>
              <Calculator className="w-4 h-4 mr-2" />
              Recalculer
            </Button>
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
              {paginatedCommissions.map((commission) => (
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
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Affichage de {(currentPage - 1) * itemsPerPage + 1} à{" "}
              {Math.min(currentPage * itemsPerPage, filteredCommissions.length)}{" "}
              sur {filteredCommissions.length} commissions
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
        )}
      </CardContent>
    </Card>
  );
}
