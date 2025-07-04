import { useState, useEffect } from "react";
import { Users, Plus, Trash2, Search, Loader2 } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/front/components/ui/select";

interface UserCode {
  id: number;
  name: string;
  email: string;
  code: string;
  status: string;
}

export default function UserCodesTab() {
  const [userCodes, setUserCodes] = useState<UserCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Simulate API call to load user codes
  useEffect(() => {
    const loadUserCodes = async () => {
      setLoading(true);
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data - in real app, this would be an API call
      const mockData: UserCode[] = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        name: `Employee ${i + 1}`,
        email: `employee${i + 1}@company.com`,
        code: `EMP${String(i + 1).padStart(3, "0")}`,
        status: i % 5 === 0 ? "inactive" : "active",
      }));

      setUserCodes(mockData);
      setLoading(false);
    };

    loadUserCodes();
  }, []);

  const filteredUsers = userCodes.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const addUserCode = () => {
    const newId = Math.max(...userCodes.map((u) => u.id)) + 1;
    setUserCodes((prev) => [
      ...prev,
      {
        id: newId,
        name: "",
        email: "",
        code: "",
        status: "active",
      },
    ]);
  };

  const updateUserCode = (id: number, field: keyof UserCode, value: string) => {
    setUserCodes((prev) =>
      prev.map((user) => (user.id === id ? { ...user, [field]: value } : user)),
    );
  };

  const removeUserCode = (id: number) => {
    setUserCodes((prev) => prev.filter((user) => user.id !== id));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Chargement des codes utilisateur...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Association des Codes Utilisateur
        </CardTitle>
        <CardDescription>
          Associez les employés avec des codes uniques pour le suivi des commissions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher les utilisateurs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {filteredUsers.length} utilisateurs trouvés
            </span>
            <Button onClick={addUserCode} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter Utilisateur
            </Button>
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom de l'Employé</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Code Unique</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Input
                      value={user.name}
                      onChange={(e) =>
                        updateUserCode(user.id, "name", e.target.value)
                      }
                      placeholder="Nom de l'employé"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={user.email}
                      onChange={(e) =>
                        updateUserCode(user.id, "email", e.target.value)
                      }
                      placeholder="email@entreprise.com"
                      type="email"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={user.code}
                      onChange={(e) =>
                        updateUserCode(user.id, "code", e.target.value)
                      }
                      placeholder="EMP001"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.status}
                      onValueChange={(value) =>
                        updateUserCode(user.id, "status", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="inactive">Inactif</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeUserCode(user.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Affichage de {(currentPage - 1) * itemsPerPage + 1} à{" "}
              {Math.min(currentPage * itemsPerPage, filteredUsers.length)} sur{" "}
              {filteredUsers.length} utilisateurs
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
