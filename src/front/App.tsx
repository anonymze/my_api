import { QueryClientProvider } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import CommissionPage from "./app/home";
import LoginPage from "./app/login";
import { queryClient } from "./api/_queries";
import { AuthProvider, useAuth } from "./context/auth-context";

function AppContent() {
  const { isAuthenticated, login, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />;
  }

  return <CommissionPage />;
}

export default function Page() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}
