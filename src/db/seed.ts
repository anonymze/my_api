import { db, queriesDB } from "./database";

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

// Initialize default user if none exists
const initializeDefaultUser = () => {
  const existingUser = queriesDB.getUserByEmail.get("test@test.fr");
  if (!existingUser) {
    queriesDB.insertUser.run("Admin", "User", "test@test.fr", "azerty123456");
    console.log("Default user created: admin@example.com");
  }
};

// Call initialization
initializeDefaultUser();
