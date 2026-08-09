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

  const user = db.prepare('SELECT id, username, password, email, avatar_text, rank_title FROM users WHERE username = ? OR email = ?').get(username, username);

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
      rankTitle: user.rank_title
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

  db.prepare('UPDATE users SET password = ? WHERE email = ?').run(newPassword, email);
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

  const info = db.prepare(`
    INSERT INTO teams (name, game, tag, color, region, timezone, platform, availability, members, note, wins, kd, rank, earnings, leader_id)
    VALUES (?, ?, ?, ?, 'Global', 'UTC', 'Cross-platform', 'Flexible', '1 / 5', ?, 0, 1.0, null, 0, ?)
  `).run(name, game, tagVal, colorVal, description || `New squad for ${game}.`, leaderId);

  const newTeamId = info.lastInsertRowid;

  // Add the user to team_members
  db.prepare(`
    INSERT INTO team_members (team_id, user_id, role, online_status)
    VALUES (?, ?, 'You · Captain', 'Online now')
  `).run(newTeamId, leaderId);

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

app.listen(PORT, () => {
  console.log(`🚀 TeamSync SQLite Server running on http://localhost:${PORT}`);
});
