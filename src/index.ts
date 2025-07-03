import { loginRoute, protectedRoute } from "./routes";

const server = Bun.serve({
  port: 3000,
  routes: {
    "/api/login": loginRoute,
    "/api/protected": protectedRoute,
  },
  // fallback on all routes
  fetch(_) {
    return new Response("Not Found", { status: 404 });
  },
});
console.log(`Listening on http://localhost:${server.port} ...`);
