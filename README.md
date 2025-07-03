# MY API

db.run() - Direct execution, one-time use
const result = db.run("INSERT INTO users (email) VALUES (?)", "john@example.com");

db.query() - Direct query, returns rows
const users = db.query("SELECT * FROM users WHERE age > ?").all(18);

db.prepare() - Best for repeated queries
const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
const user = stmt.get("john@example.com");  // Execute with .get()
const users = stmt.all();                   // Execute with .all()
stmt.run("john@example.com");              // Execute with .run()

  When to use:
  - prepare() - When you'll run the same query multiple times
  - run() - One-off INSERT/UPDATE/DELETE operations
  - query() - One-off SELECT operations
