import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../database.sqlite');

let dbInstance = null;

export async function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Enable foreign keys
  await dbInstance.run('PRAGMA foreign_keys = ON');

  // Initialize schema
  await initSchema(dbInstance);

  return dbInstance;
}

async function initSchema(db) {
  // Users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Categories table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#4F46E5',
      icon TEXT DEFAULT 'folder',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Tags table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#06B6D4',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, name)
    );
  `);

  // Tasks table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category_id INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      due_date DATETIME,
      priority TEXT CHECK(priority IN ('baixa', 'media', 'urgente')) DEFAULT 'media',
      status TEXT CHECK(status IN ('pendente', 'em_andamento', 'concluida')) DEFAULT 'pendente',
      completed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );
  `);

  // Task Tags relation table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS task_tags (
      task_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (task_id, tag_id),
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );
  `);
}

// Helper to seed initial categories for a new user
export async function seedDefaultUserCategories(db, userId) {
  const defaultCategories = [
    { name: 'Trabalho', color: '#3B82F6', icon: 'briefcase' },
    { name: 'Casa', color: '#10B981', icon: 'home' },
    { name: 'Estudo', color: '#8B5CF6', icon: 'book' },
    { name: 'Pessoal', color: '#EC4899', icon: 'user' }
  ];

  const defaultTags = [
    { name: 'Importante', color: '#EF4444' },
    { name: 'Projeto', color: '#3B82F6' },
    { name: 'Rotina', color: '#10B981' }
  ];

  for (const cat of defaultCategories) {
    await db.run(
      `INSERT INTO categories (user_id, name, color, icon) VALUES (?, ?, ?, ?)`,
      [userId, cat.name, cat.color, cat.icon]
    );
  }

  for (const tag of defaultTags) {
    await db.run(
      `INSERT INTO tags (user_id, name, color) VALUES (?, ?, ?)`,
      [userId, tag.name, tag.color]
    );
  }
}
