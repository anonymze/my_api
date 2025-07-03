import indexHtml from "./index.html";
import { loginRoute, protectedRoute } from "./routes";

const server = Bun.serve({
  port: 3000,
  routes: {
    "/*": indexHtml,
    "/api/login": loginRoute,
    "/api/protected": protectedRoute,
  },
  // fallback on all routes
  // fetch(_) {
  //   return new Response("Not Found", { status: 404 });
  // },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});
console.log(`Listening on http://localhost:${server.port} ...`);
