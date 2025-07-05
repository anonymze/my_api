import axios from "axios";

const ORIGIN_WEB = "simply-life-app://web";

/**
 * @description WITHCREDENTIALS PROPERTY IS NEEDED TO SEND / STORE THE COOKIES
 */
export const api = axios.create({
  baseURL: process.env.BUN_PUBLIC_API_URL || "",
  timeout: 15 * 1000, // 15 seconds
  responseType: "json",
  headers: {
    Accept: "application/json",
    // "Content-Type": "application/json",
    // "X-Origin": ORIGIN_WEB,
  },
  // withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("commission-jwt-token");
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => Promise.reject(error),
);
