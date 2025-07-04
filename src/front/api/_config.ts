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
    "Content-Type": "application/json",
    // "X-Origin": ORIGIN_WEB,
  },
  // withCredentials: true,
});

// Add response interceptor to handle authentication errors
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // Only reload if user was logged in (had a token)
//       const hadToken = localStorage.getItem("commission-jwt-token");
//       localStorage.removeItem("commission-jwt-token");
//       if (hadToken) {
//         alert("Votre session a expiré. Veuillez vous reconnecter.");
//         window.location.reload();
//       }
//     }
//     return Promise.reject(error);
//   },
// );
