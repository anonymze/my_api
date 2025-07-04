import { QueryClientProvider } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React from "react";
import { queryClient } from "./api/_queries";
import CommissionPage from "./app/home";
import LoginPage from "./app/login";
import { AuthContext, AuthProvider } from "./context/auth-context";

function AppContent() {
  const { isAuthenticated, isLoading } = React.use(AuthContext);

  console.log(isAuthenticated);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
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
