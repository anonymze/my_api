import type React from "react";

import { useLoginMutation, type LoginCredentials } from "@/front/api/auth";
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
import { Checkbox } from "@/front/components/ui/checkbox";
import { Input } from "@/front/components/ui/input";
import { Label } from "@/front/components/ui/label";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useState } from "react";

interface LoginPageProps {
  onLogin: (credentials: {
    email: string;
    password: string;
    rememberMe: boolean;
  }) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const loginMutation = useLoginMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.reset(); // Clear previous mutation errors

    // Basic validation
    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    if (!email.includes("@")) {
      setError("Veuillez entrer une adresse email valide");
      return;
    }

    const credentials: LoginCredentials = { email, password, rememberMe };

    loginMutation.mutate(credentials, {
      onSuccess: (data) => {
        onLogin({ email, password, rememberMe });
      },
      onError: (error) => {
        // Error is automatically handled by React Query state
        console.error("Login failed:", error);
      },
    });
  };

  const handleDemoLogin = () => {
    setEmail("admin@company.com");
    setPassword("admin123");
  };

  const isLoading = loginMutation.isPending;

  // Show either validation error or mutation error
  const displayError = error || loginMutation.error?.message;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-blue-600 p-3 rounded-full">
              <img src={logo} alt="Logo" className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestionnaire de Commissions pour le Groupe Valorem
          </h1>
          <p className="text-gray-600">Connectez-vous à votre compte</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Bon retour</CardTitle>
            <CardDescription className="text-center">
              Entrez vos identifiants pour accéder au système de gestion des
              commissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {displayError && (
              <Alert variant="destructive">
                <AlertDescription>{displayError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Entrez votre email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Entrez votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setRememberMe(checked as boolean)
                    }
                    disabled={isLoading}
                  />
                  <Label htmlFor="remember" className="text-sm font-normal">
                    Se souvenir de moi
                  </Label>
                </div>
                <Button
                  variant="link"
                  className="px-0 font-normal text-sm"
                  disabled={isLoading}
                >
                  Mot de passe oublié ?
                </Button>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>
            {/*
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Accès Démo
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full bg-transparent"
              onClick={handleDemoLogin}
              disabled={isLoading}
            >
              Utiliser les identifiants démo
            </Button>

            <div className="text-center text-sm text-gray-600">
              <p>Identifiants démo :</p>
              <p className="font-mono text-xs bg-gray-100 p-2 rounded mt-1">
                Email: admin@company.com
                <br />
                Password: admin123
              </p>
            </div> */}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} Groupe Valorem. Tous droits réservés.
          </p>
          {/* <div className="flex justify-center space-x-4 mt-2">
            <Button variant="link" className="px-0 text-xs">
              Politique de Confidentialité
            </Button>
            <Button variant="link" className="px-0 text-xs">
              Conditions d'Utilisation
            </Button>
            <Button variant="link" className="px-0 text-xs">
              Support
            </Button>
          </div> */}
        </div>
      </div>
    </div>
  );
}
