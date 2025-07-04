import axios from "redaxios";

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
