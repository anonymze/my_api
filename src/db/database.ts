import { Database } from "bun:sqlite";

// Create or connect to database (start path at root)
export const db = new Database("src/db/db.sqlite", {
  create: true,
  strict: true,
});

export const queriesDB = {
  getUserByEmail: db.prepare("SELECT * FROM users WHERE email = ?"),
  getUserById: db.prepare("SELECT * FROM users WHERE id = ?"),
  insertUser: db.prepare(
    "INSERT INTO users (lastname, firstname, email, password) VALUES (?, ?, ?, ?) RETURNING *",
  ),
  updateUser: db.prepare("UPDATE users SET password = ? WHERE email = ?"),
};
