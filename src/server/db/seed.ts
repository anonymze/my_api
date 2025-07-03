import { Database } from "bun:sqlite";

export const db = new Database("src/server/db/db.sqlite", {
  create: true,
  strict: true,
});

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    lastname TEXT NOT NULL,
    firstname TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Initialize default user if none exists
const initializeDefaultUser = async () => {
  const existingUser = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get("test@test.fr");
  if (!existingUser) {
    const hashedPassword = await Bun.password.hash(
      process.env.USER_SEED_PASSWORD!,
    );

    db.prepare(
      "INSERT INTO users (lastname, firstname, email, hash) VALUES (?, ?, ?, ?) RETURNING *",
    ).run("Admin", "User", "test@test.fr", hashedPassword);
    console.log("Default user created: test@test.fr");
  }
};

// Call initialization
initializeDefaultUser();
