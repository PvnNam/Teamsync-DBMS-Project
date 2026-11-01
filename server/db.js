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
      role TEXT NOT NULL DEFAULT 'naive' CHECK (role IN ('naive', 'application_developer', 'DBA')),
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

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      message_text TEXT NOT NULL,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS team_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected')),
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (team_id, user_id),
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS team_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      event_date DATETIME NOT NULL,
      location TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled')),
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('application', 'message', 'event')),
      is_read INTEGER NOT NULL DEFAULT 0 CHECK (is_read IN (0, 1)),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS application_audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_name TEXT NOT NULL,
      operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
      row_id INTEGER NOT NULL,
      changed_by TEXT NOT NULL DEFAULT 'application',
      changed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      old_values TEXT,
      new_values TEXT
    );

    -- Recreate assignment triggers so updates to their rules apply to an
    -- existing teamsync.db as well as a newly initialized database.
    DROP TRIGGER IF EXISTS teams_validate_insert;
    DROP TRIGGER IF EXISTS teams_validate_update;
    DROP TRIGGER IF EXISTS teams_write_window_delete;
    DROP TRIGGER IF EXISTS teams_uppercase_tag_insert;
    DROP TRIGGER IF EXISTS teams_uppercase_tag_update;
    DROP TRIGGER IF EXISTS teams_uppercase_name_insert;
    DROP TRIGGER IF EXISTS teams_uppercase_name_update;

    CREATE TRIGGER IF NOT EXISTS teams_audit_insert
    AFTER INSERT ON teams BEGIN
      INSERT INTO application_audit_log(table_name, operation, row_id, new_values)
      VALUES ('teams', 'INSERT', NEW.id,
        json_object('name', NEW.name, 'game', NEW.game, 'tag', NEW.tag, 'region', NEW.region, 'wins', NEW.wins, 'kd', NEW.kd));
    END;
    CREATE TRIGGER IF NOT EXISTS teams_validate_insert
    BEFORE INSERT ON teams BEGIN
      SELECT CASE WHEN CAST(strftime('%w','now','localtime') AS INTEGER)<>1
        OR strftime('%H%M','now','localtime')<'1400'
        OR strftime('%H%M','now','localtime')>'1600'
        THEN RAISE(ABORT, 'Team changes are allowed only Monday from 2:00 PM to 4:00 PM') END;
      SELECT CASE WHEN TRIM(NEW.name)='' OR TRIM(NEW.game)=''
        THEN RAISE(ABORT, 'Team name and game are required') END;
      SELECT CASE WHEN COALESCE(NEW.wins, 0)<0 OR COALESCE(NEW.kd, 0)<0
        THEN RAISE(ABORT, 'Wins and K/D must be zero or greater') END;
    END;
    CREATE TRIGGER IF NOT EXISTS teams_validate_update
    BEFORE UPDATE ON teams BEGIN
      SELECT CASE WHEN CAST(strftime('%w','now','localtime') AS INTEGER)<>1
        OR strftime('%H%M','now','localtime')<'1400'
        OR strftime('%H%M','now','localtime')>'1600'
        THEN RAISE(ABORT, 'Team changes are allowed only Monday from 2:00 PM to 4:00 PM') END;
      SELECT CASE WHEN TRIM(NEW.name)='' OR TRIM(NEW.game)=''
        THEN RAISE(ABORT, 'Team name and game are required') END;
      SELECT CASE WHEN COALESCE(NEW.wins, 0)<0 OR COALESCE(NEW.kd, 0)<0
        THEN RAISE(ABORT, 'Wins and K/D must be zero or greater') END;
    END;
    CREATE TRIGGER IF NOT EXISTS teams_audit_update
    AFTER UPDATE ON teams BEGIN
      INSERT INTO application_audit_log(table_name, operation, row_id, old_values, new_values)
      VALUES ('teams', 'UPDATE', NEW.id,
        json_object('name', OLD.name, 'game', OLD.game, 'tag', OLD.tag, 'region', OLD.region, 'wins', OLD.wins, 'kd', OLD.kd),
        json_object('name', NEW.name, 'game', NEW.game, 'tag', NEW.tag, 'region', NEW.region, 'wins', NEW.wins, 'kd', NEW.kd));
    END;
    CREATE TRIGGER IF NOT EXISTS teams_audit_delete
    AFTER DELETE ON teams BEGIN
      INSERT INTO application_audit_log(table_name, operation, row_id, old_values)
      VALUES ('teams', 'DELETE', OLD.id,
        json_object('name', OLD.name, 'game', OLD.game, 'tag', OLD.tag, 'region', OLD.region, 'wins', OLD.wins, 'kd', OLD.kd));
    END;
    CREATE TRIGGER IF NOT EXISTS teams_write_window_delete
    BEFORE DELETE ON teams BEGIN
      SELECT CASE WHEN CAST(strftime('%w','now','localtime') AS INTEGER)<>1
        OR strftime('%H%M','now','localtime')<'1400'
        OR strftime('%H%M','now','localtime')>'1600'
        THEN RAISE(ABORT, 'Team changes are allowed only Monday from 2:00 PM to 4:00 PM') END;
    END;
    CREATE TRIGGER IF NOT EXISTS teams_uppercase_tag_insert
    AFTER INSERT ON teams WHEN NEW.tag <> UPPER(NEW.tag) BEGIN
      UPDATE teams SET tag=UPPER(NEW.tag) WHERE id=NEW.id;
    END;
    CREATE TRIGGER IF NOT EXISTS teams_uppercase_name_insert
    AFTER INSERT ON teams WHEN NEW.name <> UPPER(NEW.name) BEGIN
      UPDATE teams SET name=UPPER(NEW.name) WHERE id=NEW.id;
    END;
    CREATE TRIGGER IF NOT EXISTS teams_uppercase_name_update
    AFTER UPDATE OF name ON teams WHEN NEW.name <> UPPER(NEW.name) BEGIN
      UPDATE teams SET name=UPPER(NEW.name) WHERE id=NEW.id;
    END;
    CREATE TRIGGER IF NOT EXISTS teams_uppercase_tag_update
    AFTER UPDATE OF tag ON teams WHEN NEW.tag <> UPPER(NEW.tag) BEGIN
      UPDATE teams SET tag=UPPER(NEW.tag) WHERE id=NEW.id;
    END;

    CREATE INDEX IF NOT EXISTS idx_teams_game_region ON teams(game, region);
    CREATE INDEX IF NOT EXISTS idx_team_members_team_user ON team_members(team_id, user_id);
    CREATE INDEX IF NOT EXISTS idx_user_games_user_name ON user_games(user_id, name);
    CREATE INDEX IF NOT EXISTS idx_messages_sender_sent ON messages(sender_id, sent_at);
    CREATE INDEX IF NOT EXISTS idx_messages_receiver_sent ON messages(receiver_id, sent_at);
    CREATE INDEX IF NOT EXISTS idx_team_applications_team_status ON team_applications(team_id, status);
    CREATE INDEX IF NOT EXISTS idx_team_events_team_date ON team_events(team_id, event_date);
    CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);

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

  const userColumns = db.prepare('PRAGMA table_info(users)').all().map(column => column.name);
  if (!userColumns.includes('role')) {
    db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'naive'");
  }

  // Make the documented demo account available on a new or unseeded database.
  // `INSERT OR IGNORE` preserves an existing admin account (including a password
  // changed through the reset flow) while ensuring admin/admin works out of box.
  db.prepare(`
    INSERT OR IGNORE INTO users (username, password, email, avatar_text, rank_title)
    VALUES (?, ?, ?, ?, ?)
  `).run('admin', 'admin', 'admin@teamsync.gg', 'A', 'System Administrator');
  db.prepare("UPDATE users SET role='DBA' WHERE username='admin'").run();
}

export default db;
