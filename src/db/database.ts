import { Database } from "bun:sqlite";

// Create or connect to database (start path at root)
export const db = new Database("src/db/db.sqlite", {
  create: true,
  strict: true,
});

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lastname TEXT NOT NULL,
    firstname TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export const queriesDB = {
  getUserByEmail: db.prepare("SELECT * FROM users WHERE email = ?"),
  getUserById: db.prepare("SELECT * FROM users WHERE id = ?"),
  insertUser: db.prepare(
    "INSERT INTO users (email, password) VALUES (?, ?) RETURNING *",
  ),
  updateUser: db.prepare("UPDATE users SET password = ? WHERE email = ?"),
};
