import axios from "axios";

/**
 * @description WITHCREDENTIALS PROPERTY IS NEEDED TO SEND / STORE THE COOKIES
 */
export const api = axios.create({
  baseURL: process.env.BUN_PUBLIC_API_URL || "",
  responseType: "json",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Authentication failed, clear local storage and reload
      localStorage.removeItem("commission-jwt-token");
      window.location.reload();
    }
    return Promise.reject(error);
  },
);
