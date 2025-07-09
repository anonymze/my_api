import indexHtml from "./front/index.html";


const server = Bun.serve({
  port: 3003,
  routes: {
    "/*": indexHtml,
    // "/api/login": loginRoute,
    // "/api/protected": protectedRoute,
  },

  // fetch(request) {
  //   return new Response("Not Found", { status: 404 });
  // },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
  // tls: {
  //   cert: Bun.file("certificates/localhost.pem"),
  //   key: Bun.file("certificates/localhost-key.pem"),
  // },
});
console.log(`Listening on http://localhost:${server.port} ...`);
