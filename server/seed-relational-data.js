import db, { initDB } from './db.js';
import { seedRelationalData } from './relational-seed.js';

initDB();
db.exec('BEGIN');
try {
  seedRelationalData(db);
  db.exec('COMMIT');
  const counts = Object.fromEntries(['password_resets', 'messages', 'team_applications', 'team_events', 'notifications']
    .map(table => [table, db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get().count]));
  console.log('Inserted missing relational sample records. Current table counts:', counts);
} catch (error) {
  db.exec('ROLLBACK');
  throw error;
}
