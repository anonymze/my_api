import { Database } from "bun:sqlite";

// Create or connect to database (start path at root)
export const db = new Database("src/db/db.sqlite", {
  strict: true,
});

export const queriesDB = {
  getUserByEmail: db.prepare("SELECT * FROM users WHERE email = ?"),
  getUserById: db.prepare("SELECT * FROM users WHERE id = ?"),
  insertUser: db.prepare(
    "INSERT INTO users (lastname, firstname, email, hash) VALUES (?, ?, ?, ?) RETURNING *",
  ),
  updateUser: db.prepare("UPDATE users SET hash = ? WHERE email = ?"),
};
