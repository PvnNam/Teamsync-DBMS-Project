// Small, idempotent sample records for the messaging, recruitment, events,
// notifications, and password-reset tables. Existing users/teams are required.
export function seedRelationalData(db) {
  const userId = username => db.prepare('SELECT id FROM users WHERE username = ?').get(username)?.id;
  const teamId = name => db.prepare('SELECT id FROM teams WHERE name = ? ORDER BY id LIMIT 1').get(name)?.id;

  const addMessage = db.prepare(`
    INSERT INTO messages (sender_id, receiver_id, message_text)
    SELECT ?, ?, ? WHERE ? IS NOT NULL AND ? IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM messages WHERE sender_id = ? AND receiver_id = ? AND message_text = ?)
  `);
  const messageRows = [
    ['pixelpilot', 'JettStream', 'Are you available for the Night Shift scrim this week?'],
    ['JettStream', 'pixelpilot', 'Yes, I can join. I will be online before the match.'],
    ['NovaSkye', 'pixelpilot', 'I sent a request to join Storm Chasers. Let me know if you need anything else.']
  ];
  for (const [sender, receiver, text] of messageRows) {
    const from = userId(sender), to = userId(receiver);
    addMessage.run(from ?? null, to ?? null, text, from ?? null, to ?? null, from ?? null, to ?? null, text);
  }

  const addApplication = db.prepare(`
    INSERT OR IGNORE INTO team_applications (team_id, user_id, status)
    SELECT ?, ?, ? WHERE ? IS NOT NULL AND ? IS NOT NULL
  `);
  for (const [team, applicant, status] of [
    ['Storm Chasers', 'NovaSkye', 'Pending'],
    ['Night Shift', 'FrostByte', 'Accepted'],
    ['A Site', 'ViperAce', 'Rejected']
  ]) {
    const tid = teamId(team), uid = userId(applicant);
    addApplication.run(tid ?? null, uid ?? null, status, tid ?? null, uid ?? null);
  }

  const addEvent = db.prepare(`
    INSERT INTO team_events (team_id, title, event_date, location, status)
    SELECT ?, ?, ?, ?, ? WHERE ? IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM team_events WHERE team_id = ? AND title = ?)
  `);
  for (const [team, title, date, location, status] of [
    ['Night Shift', 'Weekly Valorant Scrim', '2026-11-02 18:00:00', 'Online · EU server', 'Scheduled'],
    ['High Ground', 'Fortnite Cash Cup Review', '2026-10-20 19:00:00', 'Team voice channel', 'Completed'],
    ['Skyline', 'Rocket League Doubles Practice', '2026-11-04 17:30:00', 'Online · Private lobby', 'Scheduled']
  ]) {
    const tid = teamId(team);
    addEvent.run(tid ?? null, title, date, location, status, tid ?? null, tid ?? null, title);
  }

  const addNotification = db.prepare(`
    INSERT INTO notifications (user_id, message, type, is_read)
    SELECT ?, ?, ?, ? WHERE ? IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = ? AND message = ? AND type = ?)
  `);
  for (const [username, message, type, isRead] of [
    ['NovaSkye', 'Your application to Storm Chasers is pending review.', 'application', 0],
    ['FrostByte', 'Your application to Night Shift was accepted.', 'application', 0],
    ['JettStream', 'You have a new private message from pixelpilot.', 'message', 0],
    ['pixelpilot', 'Night Shift has a scrim scheduled for November 2.', 'event', 1]
  ]) {
    const uid = userId(username);
    addNotification.run(uid ?? null, message, type, isRead, uid ?? null, uid ?? null, message, type);
  }

  // Deliberately expired demo entry; reset tokens older than one hour are rejected.
  const resetEmail = db.prepare('SELECT email FROM users WHERE username = ?').get('pixelpilot')?.email;
  if (resetEmail) {
    db.prepare(`
      INSERT INTO password_resets (email, token, created_at)
      SELECT ?, ?, '2020-01-01 00:00:00'
      WHERE NOT EXISTS (SELECT 1 FROM password_resets WHERE email = ? AND token = ?)
    `).run(resetEmail, 'DEMO-EXPIRED-TOKEN', resetEmail, 'DEMO-EXPIRED-TOKEN');
  }
}
