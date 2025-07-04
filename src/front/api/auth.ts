import { useMutation } from "@tanstack/react-query";

// Types for login
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginResponse {
  user: {
    email: string;
    name: string;
    role: string;
  };
  token: string;
}

export interface LoginError {
  message: string;
  code?: string;
}

// Mock API function - replace with actual API call
const loginApi = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Mock authentication logic
  if (credentials.email === "admin@company.com" && credentials.password === "admin123") {
    return {
      user: {
        email: credentials.email,
        name: "Admin User",
        role: "Administrator",
      },
      token: "mock-jwt-token",
    };
  } else {
    throw new Error("Email ou mot de passe incorrect");
  }
};

// Custom hook for login mutation
export const useLoginMutation = () => {
  return useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: loginApi,
    onError: (error) => {
      console.error("Login error:", error);
    },
    onSuccess: (data) => {
      console.log("Login successful:", data);
    },
  });
};