import { getAppUsersQuery } from "@/front/api/queries/app-user-queries";
import {
  createAppUserCommissionCodeQuery,
  deleteAppUserCommissionCodeQuery,
  getAppUserCommissionsCodeQuery,
  updateAppUserCommissionCodeQuery,
} from "@/front/api/queries/commission-queries";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronsUpDown, CodeIcon, Loader2, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TabSkeleton } from "../home";

export default function UsersCodeTab() {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [userCodes, setUserCodes] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // Mutations
  const deleteUserCodeMutation = useMutation({
    mutationFn: deleteAppUserCommissionCodeQuery,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["commissions-code"] });
      toast.success("Codes utilisateur supprimés avec succès");

      // Update local state to remove the deleted user
      const deletedMapping = existingCodeUsers.find(
        (mapping) => mapping.id === deletedId,
      );
      if (deletedMapping?.app_user?.id) {
        setSelectedUsers((prev) =>
          prev.filter((id) => id !== deletedMapping.app_user.id),
        );
        setUserCodes((prev) => {
          const newCodes = { ...prev };
          delete newCodes[deletedMapping.app_user.id];
          return newCodes;
        });
      }
    },
  });

  const createUserCodeMutation = useMutation({
    mutationFn: createAppUserCommissionCodeQuery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commissions-code"] });
      toast.success("Codes utilisateur créés avec succès");
      // Local state will be updated by the useEffect when the query refetches
    },
    onError: (error) => {
      toast.error(
        "Une erreur est survenue. Vérifiez que vous n'avez pas entré deux fois le même code sur la page.",
      );
    },
  });

  const updateUserCodeMutation = useMutation({
    mutationFn: updateAppUserCommissionCodeQuery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commissions-code"] });
      toast.success("Codes utilisateur mis à jour avec succès");
      // Local state will be updated by the useEffect when the query refetches
    },
    onError: (error) => {
      toast.error(
        "Une erreur est survenue. Vérifiez que vous n'avez pas entré deux fois le même code sur la page.",
      );
    },
  });

  const {
    error: errorCodeUsers,
    data: codeUsers,
    isLoading: loadingCodeUsers,
  } = useQuery({
    queryKey: [
      "commissions-code",
      {
        limit: 0,
      },
    ],
    queryFn: getAppUserCommissionsCodeQuery,
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
  });

  // Get initial search term from URL
  const getInitialSearchTerm = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("userSearch") || "";
  };

  const [searchSelectedUsers, setSearchSelectedUsers] =
    useState(getInitialSearchTerm);

  // Users list from API
  const allUsers = users?.docs || [];
  // Existing code users from API
  const existingCodeUsers = codeUsers?.docs || [];

  // Auto-load existing user mappings on component mount
  useEffect(() => {
    if (existingCodeUsers.length > 0) {
      const existingIds = existingCodeUsers
        .map((mapping) => mapping.app_user?.id)
        .filter(Boolean);

      setSelectedUsers((prev) => {
        const newIds = existingIds.filter((id) => !prev.includes(id));
        return [...prev, ...newIds];
      });

      const existingData: Record<string, string> = {};
      existingCodeUsers.forEach((mapping) => {
        if (mapping.app_user?.id) {
          const codes = mapping.code.map((c) => c.code).join(", ");
          existingData[mapping.app_user.id] = codes;
        }
      });

      setUserCodes((prev) => ({ ...prev, ...existingData }));
    }
  }, [existingCodeUsers]);

  const handleUserAdd = (userId: string) => {
    if (!selectedUsers.includes(userId)) {
      setSelectedUsers((prev) => [userId, ...prev]);
      // Initialize empty codes string for this user
      setUserCodes((prev) => ({
        ...prev,
        [userId]: "",
      }));
    }
    setOpen(false);
  };

  const removeUser = (userId: string) => {
    const existingMapping = existingCodeUsers.find(
      (mapping) => mapping.app_user?.id === userId,
    );

    if (existingMapping) {
      // Remove from database
      deleteUserCodeMutation.mutate(existingMapping.id);
    } else {
      // Remove from local state (new user not yet saved)
      setSelectedUsers((prev) => prev.filter((id) => id !== userId));
      setUserCodes((prev) => {
        const newCodes = { ...prev };
        delete newCodes[userId];
        return newCodes;
      });
    }
  };

  const saveUserCode = (userId: string) => {
    const codeString = userCodes[userId];
    if (!codeString) return;

    // Parse codes from comma-separated string
    const codes = codeString
      .split(",")
      .map((code) => code.trim())
      .filter((code) => code.length > 0)
      .map((code) => ({ code, id: null }));

    const existingMapping = existingCodeUsers.find(
      (mapping) => mapping.app_user?.id === userId,
    );

    if (existingMapping) {
      // Update existing mapping
      updateUserCodeMutation.mutate({
        app_user: userId,
        code: codes,
        appUserCodeId: existingMapping.id,
      });
    } else {
      // Create new mapping
      createUserCodeMutation.mutate({
        app_user: userId,
        code: codes,
      });
    }
  };

  const isOperating =
    createUserCodeMutation.isPending ||
    updateUserCodeMutation.isPending ||
    deleteUserCodeMutation.isPending;

  // Get available users (not yet selected)
  const getAvailableUsers = () => {
    return allUsers.filter((user) => !selectedUsers.includes(user.id));
  };

  // Update URL when search term changes
  const handleSearchChange = (value: string) => {
    setSearchSelectedUsers(value);
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set("userSearch", value);
    } else {
      url.searchParams.delete("userSearch");
    }
    window.history.replaceState({}, "", url.toString());
  };

  // Update search term if URL changes (e.g., back button)
  useEffect(() => {
    const handlePopState = () => {
      setSearchSelectedUsers(getInitialSearchTerm());
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Filter selected users based on search
  const getFilteredSelectedUsers = () => {
    if (!searchSelectedUsers) return selectedUsers;

    return selectedUsers.filter((userId) => {
      const user = allUsers.find((u) => u.id === userId);
      const fullName =
        `${user?.firstname || ""} ${user?.lastname || ""}`.trim();
      const email = user?.email || "";

      return (
        fullName.toLowerCase().includes(searchSelectedUsers.toLowerCase()) ||
        email.toLowerCase().includes(searchSelectedUsers.toLowerCase())
      );
    });
  };

  if (loadingCodeUsers || loadingUsers) {
    return <TabSkeleton />;
  }

  if (errorCodeUsers || errorUsers) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <p className="text-red-600">
            Erreur lors du chargement des utilisateurs
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!users || !users.docs.length) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <p className="text-gray-600">
            Il n'y a pas de d'utilisateur disponible
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="gap-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col gap-2">
            <CardTitle className="flex items-center gap-2">
              <CodeIcon className="w-5 h-5" />
              Mapping des codes utilisateurs
            </CardTitle>
            <CardDescription>
              Associez un utilisateur à des codes uniques de commission.
            </CardDescription>
          </div>
          {/* Loading indicator */}
          {isOperating && (
            <Loader2 className="h-5 w-5 animate-spin text-black" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Selection */}
        <div className="space-y-2.5">
          <Label htmlFor="user-select">Ajouter un utilisateur</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
                disabled={isOperating}
              >
                Choisir un utilisateur...
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0">
              <Command>
                <CommandInput placeholder="Rechercher un utilisateur..." />
                <CommandEmpty>Aucun utilisateur disponible</CommandEmpty>
                <CommandGroup className="max-h-[230px] overflow-auto">
                  {getAvailableUsers().map((user) => {
                    const fullName =
                      `${user.firstname || ""} ${user.lastname || ""}`.trim();
                    const displayName = fullName || user.email;
                    return (
                      <CommandItem
                        key={user.id}
                        value={`${fullName} ${user.email}`}
                        onSelect={() => handleUserAdd(user.id)}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{displayName}</span>
                          {fullName && (
                            <span className="text-xs text-gray-500">
                              {user.email}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Selected Users with Code Input */}
        {selectedUsers.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label>Utilisateurs sélectionnés ({selectedUsers.length})</Label>
              <div className="flex items-center space-x-2 max-w-sm">
                <Search className="w-4 h-4 text-muted-foreground" />
                <div className="relative">
                  <Input
                    placeholder="Rechercher..."
                    value={searchSelectedUsers}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="h-8 pr-8"
                    disabled={isOperating}
                  />
                  {searchSelectedUsers && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSearchChange("")}
                      className="absolute right-0 top-0 h-8 w-8 p-0 hover:bg-transparent"
                      disabled={isOperating}
                    >
                      <X className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {getFilteredSelectedUsers().map((userId) => {
                const user = allUsers.find((u) => u.id === userId);
                const fullName =
                  `${user?.firstname || ""} ${user?.lastname || ""}`.trim();
                const displayName = fullName || user?.email;
                return (
                  <div
                    key={userId}
                    className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3"
                  >
                    {/* User Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm font-medium">
                          {displayName}
                        </span>
                        {fullName && (
                          <span className="text-xs text-gray-600">
                            {user?.email}
                          </span>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeUser(userId)}
                        className="h-8 w-8 p-0 border-red-200 hover:bg-red-50"
                        disabled={isOperating}
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>

                    {/* Codes Input */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Label
                          htmlFor={`codes-${userId}`}
                          className="text-sm text-gray-700"
                        >
                          Codes de commission :
                        </Label>
                      </div>
                      <Input
                        id={`codes-${userId}`}
                        placeholder="Entrez les codes séparés par des virgules (ex: CODE1, CODE2, CODE3)"
                        value={userCodes[userId] || ""}
                        onChange={(e) =>
                          setUserCodes((prev) => ({
                            ...prev,
                            [userId]: e.target.value,
                          }))
                        }
                        className="w-full"
                        disabled={isOperating}
                      />
                      <p className="text-xs text-gray-500">
                        Séparez chaque code par une virgule (,) pour ajouter
                        plusieurs codes
                      </p>

                      {/* Individual Save Button */}
                      <div className="flex justify-end mt-3">
                        <Button
                          onClick={() => saveUserCode(userId)}
                          disabled={isOperating}
                          size="sm"
                        >
                          Sauvegarder
                        </Button>
                      </div>
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
