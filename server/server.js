import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import db, { initDB } from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

initDB();

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const user = db.prepare('SELECT id, username, password, email, avatar_text, rank_title, role FROM users WHERE username = ? OR email = ?').get(username, username);

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatarText: user.avatar_text,
      rankTitle: user.rank_title,
      role: user.role
    }
  });
});

// POST /api/auth/signup
app.post('/api/auth/signup', (req, res) => {
  const { username, email, password, region, rankTitle, platform, availability } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
  if (existing) {
    return res.status(409).json({ error: 'Username or email already taken' });
  }

  const avatarText = username.charAt(0).toUpperCase();
  const finalRank = rankTitle || 'New Player';
  const info = db.prepare(
    'INSERT INTO users (username, password, email, avatar_text, rank_title) VALUES (?, ?, ?, ?, ?)'
  ).run(username, password, email, avatarText, finalRank);

  res.json({
    success: true,
    user: {
      id: info.lastInsertRowid,
      username,
      email,
      avatarText,
      rankTitle: finalRank,
      region: region || null,
      platform: platform || null,
      availability: availability || null
    }
  });
});

// POST /api/auth/forgot-password
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(email);
  if (!user) {
    return res.status(404).json({ error: 'No account found with this email address' });
  }

  const token = 'TS-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  db.prepare('INSERT INTO password_resets (email, token) VALUES (?, ?)').run(email, token);

  res.json({
    success: true,
    message: 'Password reset token generated successfully',
    token: token
  });
});

// POST /api/auth/reset-password
app.post('/api/auth/reset-password', (req, res) => {
  const { email, token, newPassword } = req.body;
  if (!email || !token || !newPassword) {
    return res.status(400).json({ error: 'Email, token, and new password are required' });
  }

  const record = db.prepare('SELECT * FROM password_resets WHERE email = ? AND token = ? ORDER BY id DESC LIMIT 1').get(email, token);

  if (!record) {
    return res.status(400).json({ error: 'Invalid or expired password reset token' });
  }

  if (Date.now() - new Date(record.created_at).getTime() > 60 * 60 * 1000) {
    db.prepare('DELETE FROM password_resets WHERE email = ? AND token = ?').run(email, token);
    return res.status(400).json({ error: 'Invalid or expired password reset token' });
  }

  const update = db.prepare('UPDATE users SET password = ? WHERE email = ?').run(newPassword, email);
  if (update.changes === 0) return res.status(404).json({ error: 'No account found with this email address' });
  db.prepare('DELETE FROM password_resets WHERE email = ?').run(email);

  res.json({ success: true, message: 'Password updated successfully' });
});

// GET /api/profile/:username
app.get('/api/profile/:username', (req, res) => {
  const { username } = req.params;
  const user = db.prepare('SELECT id, username, email, avatar_text, rank_title FROM users WHERE username = ?').get(username);

  if (!user) {
    return res.status(404).json({ error: 'Player profile not found' });
  }

  const userGames = db.prepare('SELECT * FROM user_games WHERE user_id = ?').all(user.id);
  const games = userGames.map(game => {
    const achievements = db.prepare('SELECT title FROM achievements WHERE user_game_id = ?').all(game.id).map(a => a.title);
    return {
      id: game.id,
      name: game.name,
      hours: game.hours,
      color: game.color,
      achievements
    };
  });

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    avatarText: user.avatar_text || user.username.charAt(0).toUpperCase(),
    rankTitle: user.rank_title || 'Player',
    games
  });
});

// PUT /api/profile/:username
app.put('/api/profile/:username', (req, res) => {
  const currentUsername = req.params.username;
  const { newUsername, games } = req.body;

  const user = db.prepare('SELECT id FROM users WHERE username = ?').get(currentUsername);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const userId = user.id;
  let updatedUsername = currentUsername;

  if (newUsername && newUsername !== currentUsername) {
    try {
      db.prepare('UPDATE users SET username = ? WHERE id = ?').run(newUsername, userId);
      updatedUsername = newUsername;
    } catch (err) {
      return res.status(400).json({ error: 'Username already taken' });
    }
  }

  if (Array.isArray(games)) {
    const existingGameIds = db.prepare('SELECT id FROM user_games WHERE user_id = ?').all(userId).map(g => g.id);
    for (const gid of existingGameIds) {
      db.prepare('DELETE FROM achievements WHERE user_game_id = ?').run(gid);
    }
    db.prepare('DELETE FROM user_games WHERE user_id = ?').run(userId);

    const insertGame = db.prepare('INSERT INTO user_games (user_id, name, hours, color) VALUES (?, ?, ?, ?)');
    const insertAch = db.prepare('INSERT INTO achievements (user_game_id, title) VALUES (?, ?)');

    for (const g of games) {
      const info = insertGame.run(userId, g.name, Number(g.hours) || 0, g.color || 'valorant');
      const newGameId = info.lastInsertRowid;
      if (Array.isArray(g.achievements)) {
        for (const title of g.achievements) {
          insertAch.run(newGameId, title);
        }
      }
    }
  }

  res.json({ success: true, username: updatedUsername, message: 'Profile saved to database' });
});

// GET /api/requirements
app.get('/api/requirements', (req, res) => {
  const listings = db.prepare('SELECT * FROM teams').all();
  const formatted = listings.map(l => ({
    id: l.id,
    game: l.game,
    team: l.name,
    tag: l.tag,
    color: l.color,
    region: l.region,
    timezone: l.timezone,
    platform: l.platform,
    availability: l.availability,
    kd: l.kd,
    wins: l.wins,
    rank: l.rank,
    earnings: l.earnings,
    members: l.members,
    note: l.note
  }));
  res.json(formatted);
});

// GET /api/teams
app.get('/api/teams', (req, res) => {
  const teamsWithMembers = db.prepare(`
    SELECT DISTINCT t.* FROM teams t
    INNER JOIN team_members tm ON t.id = tm.team_id
  `).all();

  const result = teamsWithMembers.map(t => {
    const members = db.prepare(`
      SELECT tm.role, tm.online_status, u.username, u.avatar_text
      FROM team_members tm
      INNER JOIN users u ON tm.user_id = u.id
      WHERE tm.team_id = ?
    `).all(t.id);

    const players = members.map(m => {
      const user = db.prepare('SELECT id FROM users WHERE username = ?').get(m.username);
      let achievements = [];
      let earnings = '$' + (Math.floor(Math.random() * 1500) + 500);

      if (user) {
        const gameRec = db.prepare('SELECT id FROM user_games WHERE user_id = ? AND name = ?').get(user.id, t.game);
        if (gameRec) {
          achievements = db.prepare('SELECT title FROM achievements WHERE user_game_id = ?').all(gameRec.id).map(a => a.title);
        }
      }

      if (achievements.length === 0) {
        achievements = ['Competitive Squad Member', 'Tourney Ready'];
      }

      return {
        name: m.username,
        role: m.role,
        initials: m.username.substring(0, 2).toUpperCase(),
        online: m.online_status,
        achievements,
        tournaments: [`${t.game} Championship`, `${t.game} Community Cup`],
        earnings
      };
    });

    return {
      id: String(t.id),
      name: t.name,
      game: t.game,
      short: t.tag,
      members: players.length,
      color: t.color || 'valorant',
      description: t.note || `A competitive ${t.game} squad.`,
      players
    };
  });

  res.json(result);
});

// POST /api/teams (Create new custom squad)
app.post('/api/teams', (req, res) => {
  const { name, game, tag, color, description, username } = req.body;
  if (!name || !game) {
    return res.status(400).json({ error: 'Squad name and game are required' });
  }

  const tagVal = tag || name.substring(0, 3).toUpperCase();
  const colorVal = color || (
    game === 'Valorant' ? 'valorant' :
    game === 'Fortnite' ? 'fortnite' :
    game === 'CS:GO' ? 'csgo' :
    game === 'Rocket League' ? 'rocket' : 'marvel'
  );

  const currentUser = username || 'pixelpilot';
  const user = db.prepare('SELECT id FROM users WHERE username = ?').get(currentUser);
  const leaderId = user ? user.id : 1;

  const newTeamId = withTransaction(() => {
    const info = db.prepare(`
      INSERT INTO teams (name, game, tag, color, region, timezone, platform, availability, members, note, wins, kd, rank, earnings, leader_id)
      VALUES (?, ?, ?, ?, 'Global', 'UTC', 'Cross-platform', 'Flexible', '1 / 5', ?, 0, 1.0, null, 0, ?)
    `).run(name, game, tagVal, colorVal, description || `New squad for ${game}.`, leaderId);
    const id = Number(info.lastInsertRowid);
    db.prepare(`
      INSERT INTO team_members (team_id, user_id, role, online_status)
      VALUES (?, ?, 'You · Captain', 'Online now')
    `).run(id, leaderId);
    return id;
  });

  res.json({
    success: true,
    team: {
      id: String(newTeamId),
      name,
      game,
      short: tagVal,
      members: 1,
      color: colorVal,
      description: description || `New squad for ${game}.`,
      players: [{
        name: currentUser,
        role: 'You · Captain',
        initials: currentUser.substring(0, 2).toUpperCase(),
        online: 'Online now',
        achievements: ['Squad Founder', 'Captain'],
        tournaments: [`${game} Community Cup`],
        earnings: '$0'
      }]
    }
  });
});

app.get('/api/dev/seed-data', (req, res) => {
  const users = db.prepare('SELECT id, username, password, email, avatar_text, rank_title FROM users').all();
  const fullUsers = users.map(u => {
    const userGames = db.prepare('SELECT * FROM user_games WHERE user_id = ?').all(u.id);
    const games = userGames.map(g => {
      const achievements = db.prepare('SELECT title FROM achievements WHERE user_game_id = ?').all(g.id).map(a => a.title);
      return { id: g.id, name: g.name, hours: g.hours, color: g.color, achievements };
    });
    return { ...u, games };
  });
  res.json(fullUsers);
});

// DBMS assignment workspace. Identifiers are selected from fixed allowlists;
// every value supplied by the client remains a bound SQL parameter.
const dbmsTables = {
  users: ['id', 'username', 'email', 'rank_title', 'role', 'created_at'],
  teams: ['id', 'name', 'game', 'tag', 'region', 'platform', 'availability', 'wins', 'kd', 'earnings'],
  user_games: ['id', 'user_id', 'name', 'hours', 'color'],
  team_members: ['id', 'team_id', 'user_id', 'role', 'online_status'],
  achievements: ['id', 'user_game_id', 'title'],
  password_resets: ['id', 'email', 'token', 'created_at'],
  messages: ['id', 'sender_id', 'receiver_id', 'message_text', 'sent_at'],
  team_applications: ['id', 'team_id', 'user_id', 'status', 'applied_at'],
  team_events: ['id', 'team_id', 'title', 'event_date', 'location', 'status'],
  notifications: ['id', 'user_id', 'message', 'type', 'is_read', 'created_at'],
  application_audit_log: ['id', 'table_name', 'operation', 'row_id', 'changed_by', 'changed_at', 'old_values', 'new_values']
};
const numericDbmsColumns = {
  users: ['id'], teams: ['id', 'wins', 'kd', 'earnings'], user_games: ['id', 'user_id', 'hours'],
  team_members: ['id', 'team_id', 'user_id'], achievements: ['id', 'user_game_id'],
  password_resets: ['id'], messages: ['id', 'sender_id', 'receiver_id'],
  team_applications: ['id', 'team_id', 'user_id'], team_events: ['id', 'team_id'],
  notifications: ['id', 'user_id', 'is_read'], application_audit_log: ['id', 'row_id']
};

function timedQuery(sql, ...params) {
  const start = process.hrtime.bigint();
  const rows = db.prepare(sql).all(...params);
  return { rows, executionMs: Number(process.hrtime.bigint() - start) / 1e6 };
}

function withTransaction(work) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = work();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function xmlEscape(value) {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}

function sendXml(res, rows, root = 'records') {
  const body = `<?xml version="1.0" encoding="UTF-8"?><${root}>${rows.map(row =>
    `<record>${Object.entries(row).map(([key, value]) => `<${key}>${xmlEscape(value)}</${key}>`).join('')}</record>`
  ).join('')}</${root}>`;
  res.type('application/xml').send(body);
}

// Saved procedure equivalent for SQLite: a reusable, parameterized JS routine.
function getTeamMemberDirectory() {
  return db.prepare('SELECT * FROM team_member_directory ORDER BY team_name, username').all();
}

app.get('/api/dbms/dashboard', (req, res) => {
  const counts = Object.fromEntries(Object.keys(dbmsTables).map(table => [table, db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get().count]));
  res.json({ counts, total: Object.values(counts).reduce((sum, count) => sum + count, 0) });
});

app.get('/api/dbms/table/:table', (req, res) => {
  const table = req.params.table;
  if (!dbmsTables[table]) return res.status(400).json({ error: 'Unsupported table' });
  const result = timedQuery(`SELECT ${dbmsTables[table].join(', ')} FROM ${table} ORDER BY id LIMIT 200`);
  if (req.query.xml === '1') return sendXml(res, result.rows);
  res.json(result);
});

// Cursor-style traversal over a fixed project table, either all at once or in
// bounded batches. Table/column identifiers stay on the server allowlist.
app.get('/api/dbms/cursor/:table', (req, res) => {
  const table = req.params.table;
  if (!dbmsTables[table]) return res.status(400).json({ error: 'Unsupported table' });
  const requestedBatch = Number.parseInt(req.query.batchSize, 10);
  const batchSize = Number.isFinite(requestedBatch) ? Math.min(Math.max(requestedBatch, 1), 500) : null;
  const started = process.hrtime.bigint();
  const selectSql = `SELECT ${dbmsTables[table].join(', ')} FROM ${table} ORDER BY id`;
  let rows;
  let batches;
  if (batchSize) {
    batches = [];
    const readBatch = db.prepare(`${selectSql} LIMIT ? OFFSET ?`);
    for (let offset = 0; ; offset += batchSize) {
      const batch = readBatch.all(batchSize, offset);
      if (!batch.length) break;
      batches.push(batch);
    }
  } else {
    rows = db.prepare(selectSql).all();
  }
  res.json({
    mode: batchSize ? 'batched' : 'unlimited',
    batchSize,
    batchCount: batchSize ? batches.length : 1,
    rows: batchSize ? undefined : rows,
    batches: batchSize ? batches : undefined,
    rowCount: rows.length,
    executionMs: Number(process.hrtime.bigint() - started) / 1e6
  });
});

// Paginated search supports no filters, game only, region only, or both.
app.get('/api/dbms/teams/search', (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(Number.parseInt(req.query.pageSize, 10) || 20, 1), 100);
  const conditions = [];
  const params = [];
  if (typeof req.query.game === 'string' && req.query.game.trim()) {
    conditions.push('game = ?');
    params.push(req.query.game.trim());
  }
  if (typeof req.query.region === 'string' && req.query.region.trim()) {
    conditions.push('region = ?');
    params.push(req.query.region.trim());
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const start = process.hrtime.bigint();
  const rows = db.prepare(`SELECT id, name, game, tag, region, wins, kd FROM teams ${where} ORDER BY id LIMIT ? OFFSET ?`)
    .all(...params, pageSize, (page - 1) * pageSize);
  const total = db.prepare(`SELECT COUNT(*) AS total FROM teams ${where}`).get(...params).total;
  res.json({ rows, page, pageSize, total, totalPages: Math.ceil(total / pageSize), executionMs: Number(process.hrtime.bigint() - start) / 1e6 });
});

app.get('/api/dbms/aggregate/wins-by-game', (req, res) => {
  res.json(timedQuery('SELECT game, COALESCE(SUM(wins), 0) AS totalWins FROM teams GROUP BY game ORDER BY game'));
});

app.post('/api/dbms/aggregate', (req, res) => {
  const { fn = 'COUNT', table = 'teams', column = 'id' } = req.body;
  if (!['COUNT', 'SUM', 'AVG', 'MIN', 'MAX'].includes(fn) || !dbmsTables[table]?.includes(column)
    || (fn !== 'COUNT' && !numericDbmsColumns[table]?.includes(column))) return res.status(400).json({ error: 'Invalid aggregate selection' });
  const result = timedQuery(`SELECT ${fn}(${column}) AS result FROM ${table}`);
  if (req.query.xml === '1') return sendXml(res, result.rows, 'aggregate');
  res.json(result);
});

app.post('/api/dbms/aggregate/grouped', (req, res) => {
  const { table = 'teams', column = 'wins', groupBy = 'game' } = req.body;
  if (!numericDbmsColumns[table]?.includes(column) || !dbmsTables[table]?.includes(groupBy)) {
    return res.status(400).json({ error: 'Select a numeric column and a valid grouping column' });
  }
  res.json(timedQuery(`SELECT ${groupBy}, SUM(${column}) AS result FROM ${table} GROUP BY ${groupBy} ORDER BY ${groupBy}`));
});

app.post('/api/dbms/filter', (req, res) => {
  const { table = 'teams', column = 'game', operator = '=', value = '' } = req.body;
  if (!dbmsTables[table]?.includes(column) || !['=', '!=', '>', '<', '>=', '<=', 'LIKE'].includes(operator)) return res.status(400).json({ error: 'Invalid filter selection' });
  const result = timedQuery(`SELECT ${dbmsTables[table].join(', ')} FROM ${table} WHERE ${column} ${operator} ? ORDER BY id LIMIT 200`, value);
  if (req.query.xml === '1') return sendXml(res, result.rows);
  res.json(result);
});

app.post('/api/dbms/join', (req, res) => {
  const { join = 'INNER' } = req.body;
  if (!['INNER', 'LEFT', 'CROSS'].includes(join)) return res.status(400).json({ error: 'Invalid join type' });
  const sql = join === 'CROSS'
    ? 'SELECT t.name AS team_name, u.username FROM teams t CROSS JOIN users u LIMIT 200'
    : `SELECT t.name AS team_name, t.game, u.username, tm.role FROM teams t ${join} JOIN team_members tm ON tm.team_id = t.id ${join} JOIN users u ON u.id = tm.user_id LIMIT 200`;
  res.json(timedQuery(sql));
});

app.post('/api/dbms/subqueries', (req, res) => {
  const { mode = 'subquery' } = req.body;
  const sql = mode === 'correlated'
    ? `SELECT u.id, u.username, u.rank_title FROM users u WHERE EXISTS (SELECT 1 FROM team_members tm JOIN teams t ON t.id = tm.team_id WHERE tm.user_id = u.id AND t.game = ?)`
    : `SELECT username, rank_title FROM users WHERE id IN (SELECT leader_id FROM teams WHERE game = ?)`;
  res.json(timedQuery(sql, req.body.game || 'Valorant'));
});

app.post('/api/dbms/insert-user', (req, res) => {
  const { username, email, password, rankTitle = 'New Player' } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'Username, email, and password are required' });
  try {
    const start = process.hrtime.bigint();
    db.prepare('INSERT INTO users (username, email, password, avatar_text, rank_title) VALUES (?, ?, ?, ?, ?)')
      .run(username, email, password, username[0].toUpperCase(), rankTitle);
    res.status(201).json({ success: true, executionMs: Number(process.hrtime.bigint() - start) / 1e6 });
  } catch (error) {
    res.status(409).json({ error: error.message.includes('UNIQUE') ? 'Username or email already exists' : error.message });
  }
});

// SQLite stored-procedure equivalents for account CRUD. Login itself is
// handled by /api/auth/login and accepts either username or email.
app.get('/api/dbms/account/:id', (req, res) => {
  const user = db.prepare('SELECT id, username, email, avatar_text, rank_title, role, created_at FROM users WHERE id = ?')
    .get(Number(req.params.id));
  if (!user) return res.status(404).json({ error: 'Account not found' });
  res.json(user);
});

app.post('/api/dbms/account', (req, res) => {
  const { username, email, password, rankTitle = 'Player', role = 'naive' } = req.body;
  if (![username, email, password].every(value => typeof value === 'string' && value.trim())) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }
  if (!['naive', 'application_developer', 'DBA'].includes(role)) {
    return res.status(400).json({ error: 'Role must be naive, application_developer, or DBA' });
  }
  try {
    const started = process.hrtime.bigint();
    const info = withTransaction(() => db.prepare(
      'INSERT INTO users (username, email, password, avatar_text, rank_title, role) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(username.trim(), email.trim(), password, username.trim()[0].toUpperCase(), rankTitle, role));
    res.status(201).json({ success: true, id: Number(info.lastInsertRowid), executionMs: Number(process.hrtime.bigint() - started) / 1e6 });
  } catch (error) {
    res.status(error.message.includes('UNIQUE') ? 409 : 400).json({ error: error.message.includes('UNIQUE') ? 'Username or email already exists' : error.message });
  }
});

app.put('/api/dbms/account/:id', (req, res) => {
  const { username, email, password, rankTitle, role } = req.body;
  if (role !== undefined && !['naive', 'application_developer', 'DBA'].includes(role)) {
    return res.status(400).json({ error: 'Role must be naive, application_developer, or DBA' });
  }
  const id = Number(req.params.id);
  try {
    const result = withTransaction(() => db.prepare(`
      UPDATE users SET username=COALESCE(?, username), email=COALESCE(?, email),
        password=COALESCE(?, password), rank_title=COALESCE(?, rank_title), role=COALESCE(?, role)
      WHERE id=?
    `).run(username?.trim() || null, email?.trim() || null, password || null, rankTitle || null, role || null, id));
    if (!result.changes) return res.status(404).json({ error: 'Account not found' });
    res.json({ success: true, changes: result.changes });
  } catch (error) {
    res.status(error.message.includes('UNIQUE') ? 409 : 400).json({ error: error.message.includes('UNIQUE') ? 'Username or email already exists' : error.message });
  }
});

app.delete('/api/dbms/account/:id', (req, res) => {
  const result = withTransaction(() => db.prepare('DELETE FROM users WHERE id=?').run(Number(req.params.id)));
  if (!result.changes) return res.status(404).json({ error: 'Account not found' });
  res.json({ success: true, changes: result.changes });
});

app.put('/api/dbms/team/:id', (req, res) => {
  const { name, region, wins, kd } = req.body;
  const start = process.hrtime.bigint();
  const result = db.prepare('UPDATE teams SET name = COALESCE(?, name), region = COALESCE(?, region), wins = COALESCE(?, wins), kd = COALESCE(?, kd) WHERE id = ?')
    .run(name || null, region || null, wins ?? null, kd ?? null, req.params.id);
  res.json({ success: result.changes > 0, changes: result.changes, executionMs: Number(process.hrtime.bigint() - start) / 1e6 });
});

app.delete('/api/dbms/team/:id', (req, res) => {
  const start = process.hrtime.bigint();
  const result = db.prepare('DELETE FROM teams WHERE id = ?').run(req.params.id);
  res.json({ success: result.changes > 0, changes: result.changes, executionMs: Number(process.hrtime.bigint() - start) / 1e6 });
});

app.get('/api/dbms/view', (req, res) => res.json({ rows: getTeamMemberDirectory() }));

app.post('/api/dbms/view', (req, res) => {
  try {
    db.prepare('INSERT INTO team_member_directory (team_id, user_id, role, online_status) VALUES (?, ?, ?, ?)')
      .run(req.body.teamId, req.body.userId, req.body.role || 'Member', req.body.onlineStatus || 'Offline');
    res.status(201).json({ success: true, rows: getTeamMemberDirectory() });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/dbms/benchmark', (req, res) => {
  const samples = [
    { query: 'teams game + region filter', index: 'idx_teams_game_region', sql: 'SELECT id, name, game, region FROM teams WHERE game = ? AND region = ?', params: ['Valorant', 'North America'] },
    { query: 'team roster join lookup', index: 'idx_team_members_team_user', sql: 'SELECT user_id, role FROM team_members WHERE team_id = ?', params: [1] },
    { query: 'user game lookup', index: 'idx_user_games_user_name', sql: 'SELECT id, name, hours FROM user_games WHERE user_id = ? AND name = ?', params: [1, 'Valorant'] }
  ];
  for (const sample of samples) db.exec(`DROP INDEX IF EXISTS ${sample.index}`);
  const before = samples.map(sample => ({ query: sample.query, index: sample.index, executionMs: timedQuery(sample.sql, ...sample.params).executionMs }));
  db.exec('CREATE INDEX IF NOT EXISTS idx_teams_game_region ON teams(game, region)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_team_members_team_user ON team_members(team_id, user_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_user_games_user_name ON user_games(user_id, name)');
  const after = samples.map(sample => ({ query: sample.query, index: sample.index, executionMs: timedQuery(sample.sql, ...sample.params).executionMs }));
  res.json({ before, after, analysis: 'Compare each before/after time. Tiny seeded tables and SQLite page caching can make individual measurements noisy.' });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const message = error?.message || 'Database operation failed';
  const status = message.includes('Team changes are allowed only Monday') ? 403 : 400;
  res.status(status).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`🚀 TeamSync SQLite Server running on http://localhost:${PORT}`);
});
