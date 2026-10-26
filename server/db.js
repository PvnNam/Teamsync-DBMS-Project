import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'teamsync.db');
const db = new DatabaseSync(dbPath);
db.exec('PRAGMA foreign_keys = ON');

// Initialize database schema
export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      avatar_text TEXT,
      rank_title TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      hours INTEGER DEFAULT 0,
      color TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_game_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      FOREIGN KEY (user_game_id) REFERENCES user_games(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      game TEXT NOT NULL,
      tag TEXT NOT NULL,
      color TEXT NOT NULL,
      region TEXT NOT NULL,
      timezone TEXT NOT NULL,
      platform TEXT NOT NULL,
      availability TEXT NOT NULL,
      members TEXT NOT NULL,
      note TEXT,
      wins INTEGER DEFAULT 0,
      kd REAL DEFAULT 0,
      rank TEXT,
      earnings INTEGER DEFAULT 0,
      leader_id INTEGER,
      FOREIGN KEY (leader_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS team_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      role TEXT NOT NULL,
      online_status TEXT DEFAULT 'Offline',
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      token TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_teams_game_region ON teams(game, region);
    CREATE INDEX IF NOT EXISTS idx_team_members_team_user ON team_members(team_id, user_id);
    CREATE INDEX IF NOT EXISTS idx_user_games_user_name ON user_games(user_id, name);

    CREATE VIEW IF NOT EXISTS team_member_directory AS
      SELECT t.id AS team_id, t.name AS team_name, t.game, t.region,
             u.id AS user_id, u.username, tm.role, tm.online_status
      FROM teams t
      JOIN team_members tm ON tm.team_id = t.id
      JOIN users u ON u.id = tm.user_id;

    CREATE TRIGGER IF NOT EXISTS validate_team_member_directory_insert
    INSTEAD OF INSERT ON team_member_directory
    BEGIN
      SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM teams WHERE id = NEW.team_id)
        THEN RAISE(ABORT, 'Team does not exist') END;
      SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM users WHERE id = NEW.user_id)
        THEN RAISE(ABORT, 'User does not exist') END;
      INSERT INTO team_members (team_id, user_id, role, online_status)
      VALUES (NEW.team_id, NEW.user_id, COALESCE(NEW.role, 'Member'), COALESCE(NEW.online_status, 'Offline'));
    END;
  `);

  // Make the documented demo account available on a new or unseeded database.
  // `INSERT OR IGNORE` preserves an existing admin account (including a password
  // changed through the reset flow) while ensuring admin/admin works out of box.
  db.prepare(`
    INSERT OR IGNORE INTO users (username, password, email, avatar_text, rank_title)
    VALUES (?, ?, ?, ?, ?)
  `).run('admin', 'admin', 'admin@teamsync.gg', 'A', 'System Administrator');
}

export default db;
