import sqlite3 from "sqlite3";

const db = new sqlite3.Database("./gscrm.db", (err) => {
  if (err) {
    console.error("Erro SQLite:", err.message);
  } else {
    console.log("SQLite conectado");
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS whatsapp_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_name TEXT UNIQUE,
      status TEXT,
      phone TEXT,
      last_connected_at TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT,
      message TEXT,
      direction TEXT,
      status TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT UNIQUE,
      last_message TEXT,
      last_message_at TEXT
    )
  `);
});

export default db;
