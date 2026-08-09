import { useEffect, useState } from 'react';
import './seed-viewer.css';

function SeedViewer() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/dev/seed-data')
      .then((res) => { if (!res.ok) throw new Error('Network error'); return res.json(); })
      .then((data) => { setUsers(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    const gameMatch = (u.games || []).some(g => g.name.toLowerCase().includes(term) || (g.achievements || []).some(a => a.toLowerCase().includes(term)));
    return (
      u.username.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.rank_title && u.rank_title.toLowerCase().includes(term)) ||
      gameMatch
    );
  });

  if (loading) return <main className="seed-viewer"><p style={{ color: 'var(--text-muted)' }}>Loading seed accounts database…</p></main>;
  if (error)   return <main className="seed-viewer"><p style={{ color: '#f87171' }}>Error: {error}</p></main>;

  return (
    <main className="seed-viewer">
      <header className="seed-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1>Seed Accounts Database</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Full database directory of all seeded fake accounts, credentials, active games, and achievements.
          </p>
        </div>
        <div className="seed-badge">🔧 Admin Only · {users.length} accounts loaded</div>
      </header>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="🔍 Search 96 fake accounts by username, rank, game, or achievement…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '500px',
            padding: '11px 16px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text)',
            fontSize: '0.88rem',
            outline: 'none'
          }}
        />
      </div>

      <div className="seed-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Password</th>
              <th>Rank / Role</th>
              <th>Active Games</th>
              <th>Achievements</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.username}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="seed-avatar">{u.avatar_text || u.username.charAt(0).toUpperCase()}</span>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.92rem' }}>@{u.username}</strong>
                      <small style={{ color: 'var(--text-dim)', fontSize: '0.76rem' }}>{u.email}</small>
                    </div>
                  </div>
                </td>
                <td><span className="seed-pwd">{u.password}</span></td>
                <td><span className="seed-rank">{u.rank_title || 'Player'}</span></td>
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(u.games && u.games.length > 0) ? (
                      u.games.map((g) => (
                        <span key={g.name} className={`seed-game-badge seed-game-badge--${g.color}`}>
                          {g.name} · {g.hours}h
                        </span>
                      ))
                    ) : (
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>None</span>
                    )}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '320px' }}>
                    {(u.games && u.games.some(g => g.achievements?.length)) ? (
                      u.games.flatMap(g => g.achievements || []).map((ach, idx) => (
                        <span key={idx} className="seed-ach-chip">★ {ach}</span>
                      ))
                    ) : (
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>None listed</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default SeedViewer;
