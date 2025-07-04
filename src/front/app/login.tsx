import { loginQuery } from "@/front/api/queries/login-queries";
import logo from "@/front/assets/images/logo.png";
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
import type { AppUser } from "@/front/types/user";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import React from "react";
import { AuthContext } from "../context/auth-context";

export default function LoginPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const { login } = React.use(AuthContext);

  const loginMutation = useMutation({
    mutationFn: loginQuery,
    onError: (error: any) => {
      // console.error("Login error:", error);
    },
    onSuccess: (data: AppUser) => {
      login(data);
    },
  });

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      loginMutation.mutate(value);
    },
  });

  const isLoading = loginMutation.isPending || form.state.isSubmitting;

  // Show either form validation errors or mutation error
  const displayError = loginMutation.error
    ? "Vos identifiants sont incorrects."
    : undefined;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <img src={logo} alt="Logo" className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestionnaire de commissions pour le Groupe Valorem
          </h1>
          <p className="text-gray-600">Connectez-vous à votre compte</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Bienvenue,</CardTitle>
            <CardDescription className="text-center">
              Entrez vos identifiants pour accéder au système de gestion des
              commissions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {displayError && (
              <Alert variant="destructive">
                <AlertDescription>{displayError}</AlertDescription>
              </Alert>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-4"
            >
              <form.Field
                name="email"
                validators={{
                  onSubmit: ({ value }) => {
                    if (!value) return "Veuillez entrer votre email";
                    if (!value.includes("@"))
                      return "Veuillez entrer une adresse email valide";
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Entrez votre email"
                        // value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-600">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field
                name="password"
                validators={{
                  onSubmit: ({ value }) => {
                    if (!value) return "Veuillez entrer votre mot de passe";
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Entrez votre mot de passe"
                        // value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className="pl-10 pr-10"
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-600">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    className="w-full mt-2"
                    disabled={!canSubmit || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connexion en cours...
                      </>
                    ) : (
                      "Se connecter"
                    )}
                  </Button>
                )}
              </form.Subscribe>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} Groupe Valorem. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}
