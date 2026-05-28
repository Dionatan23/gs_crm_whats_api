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
      session_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT,
      phone TEXT UNIQUE,
      last_message TEXT,
      last_message_at TEXT
    )
  `);

  db.run(`
  CREATE TABLE IF NOT EXISTS automations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    lead_type TEXT NOT NULL,
    session_id TEXT,
    status TEXT DEFAULT 'ativa',
    active INTEGER DEFAULT 1,
    start_time TEXT,
    end_time TEXT,
    daily_limit INTEGER DEFAULT 35,
    min_delay INTEGER DEFAULT 40,
    max_delay INTEGER DEFAULT 120,
    message_template TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

  db.run(`
  CREATE TABLE IF NOT EXISTS automation_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    automation_lead_id INTEGER,
    automation_id INTEGER,
    phone TEXT,
    status TEXT,
    sent_at TEXT DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT,
    session_id TEXT
  )
`);

  db.run(`
  CREATE TABLE IF NOT EXISTS automation_leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    automation_id INTEGER NOT NULL,
    lead_name TEXT NOT NULL,
    company TEXT,
    lead_type TEXT NOT NULL,
    city TEXT,
    phone TEXT NOT NULL,
    source_status TEXT,
    execution_status TEXT DEFAULT 'pending',
    sent_at TEXT,
    error_message TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);
});

export default db;
