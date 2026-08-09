import { useState, useEffect } from 'react';
import { fetchProfile, saveProfile } from '../api';
import './profile.css';

const gameOptions = [
  { name: 'Fortnite',      color: 'fortnite' },
  { name: 'Valorant',      color: 'valorant' },
  { name: 'CS:GO',         color: 'csgo'     },
  { name: 'Marvel Rivals', color: 'marvel'   },
  { name: 'Rocket League', color: 'rocket'   },
];

const gameAchievementsMap = {
  Valorant: [
    'Radiant Challenger', 'Immortal 3', 'Ascendant 2', 'Clutch God',
    'Team MVP x12', 'Flawless Run', 'Ace x9', 'First Blood Master',
    'Site Lock Down', 'Flash Master', 'Sentinel Anchor'
  ],
  Fortnite: [
    'Victory Royale x28', 'Crown Winner x16', 'FNCS Qualifier', 'Solo Cup Champ',
    'Top 1% Ranked', 'Box Fight Champion', 'Build Master', 'High Kills Squad'
  ],
  'CS:GO': [
    'Global Elite', 'Faceit Level 10', 'Ace x9', 'Major Scrim Winner',
    'Pistol Round King', 'Utility Master', 'Deagle God', 'HLTV Top 50', 'Tactical Genius'
  ],
  'Rocket League': [
    'Grand Champion II', 'Ceiling Shot Legend', 'Air Dribbler', 'Golden Goal',
    'Saves MVP', 'RLCS Qualifier', 'Freestyler Pro', 'Champion II'
  ],
  'Marvel Rivals': [
    'Vanguard Master', 'Triple Kill', 'MVP Award', 'Lord of Rivals', 'Grandmaster'
  ]
};

const regionOptions = [
  'North America', 'Europe', 'Asia Pacific', 'South America', 'Middle East', 'Oceania',
];

const platformOptions = ['PC', 'Console', 'Cross-platform'];
const availabilityOptions = ['Evenings', 'Late night', 'Weekends', 'Flexible'];

function GameMark({ color, name }) {
  return <span className={`game-mark game-mark--${color}`}>{name.slice(0, 1)}</span>;
}

function Profile() {
  const [username, setUsername]               = useState('pixelpilot');
  const [originalUsername, setOriginalUsername] = useState('pixelpilot');
  const [usernameConfirmed, setUsernameConfirmed] = useState(true);
  const [games, setGames]                     = useState([]);
  const [selectedGame, setSelectedGame]       = useState('');
  const [saved, setSaved]                     = useState(false);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState('');

  // Game-specific achievement selections state
  const [selectedAchMap, setSelectedAchMap]   = useState({});
  const [customAchInputs, setCustomAchInputs] = useState({});

  // Region & Preferences
  const [region, setRegion]                   = useState('North America');
  const [platform, setPlatform]               = useState('PC');
  const [availability, setAvailability]       = useState('Evenings');
  const [prefsConfirmed, setPrefsConfirmed]   = useState(false);

  // Verify credentials
  const [showVerify, setShowVerify]           = useState(false);
  const [verifyPassword, setVerifyPassword]   = useState('');
  const [verifyStatus, setVerifyStatus]       = useState('');
  const [verifyLoading, setVerifyLoading]     = useState(false);

  const [autoLoadedMsg, setAutoLoadedMsg]     = useState('');
  const debounceRef                           = useState({ current: null })[0];

  useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    let target = 'pixelpilot';
    if (stored) {
      try { const u = JSON.parse(stored); if (u.username) target = u.username; } catch {}
    }
    setUsername(target);
    setOriginalUsername(target);

    fetchProfile(target)
      .then((data) => { if (data.games) setGames(data.games); setLoading(false); })
      .catch(() => { setError('Using offline profile state'); setLoading(false); });
  }, []);

  const fetchAndLoadAccount = async (targetName) => {
    if (!targetName || !targetName.trim()) return;
    try {
      const data = await fetchProfile(targetName.trim());
      if (data && data.games) {
        setGames(data.games);
        setAutoLoadedMsg(`✓ Automatically loaded games & achievements for @${data.username}!`);
        setTimeout(() => setAutoLoadedMsg(''), 4000);
      }
    } catch {
      // User not found in database, keep existing state
    }
  };

  const handleUsernameChange = (e) => {
    const val = e.target.value;
    setUsername(val);
    setUsernameConfirmed(false);

    if (val.trim()) {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchAndLoadAccount(val.trim());
      }, 350);
    }
  };

  const handleConfirmUsername = () => {
    if (!username.trim()) return;
    setUsernameConfirmed(true);
    fetchAndLoadAccount(username.trim());
  };

  const handleConfirmPrefs = () => {
    setPrefsConfirmed(true);
    setTimeout(() => setPrefsConfirmed(false), 2500);
  };

  const addGame = () => {
    const game = gameOptions.find(({ name }) => name === selectedGame);
    if (!game || games.some(({ name }) => name === game.name)) return;
    setGames((prev) => [...prev, { id: Date.now(), name: game.name, hours: 0, achievements: [], color: game.color }]);
    setSelectedGame('');
  };

  const updateGame = (id, field, value) =>
    setGames((prev) => prev.map((g) =>
      g.id === id ? { ...g, [field]: field === 'hours' ? Math.max(0, Number(value) || 0) : value } : g
    ));

  const removeGame = (id) => setGames((prev) => prev.filter((g) => g.id !== id));

  const handleAddAchievement = (gameId, gameName) => {
    const game = games.find((g) => g.id === gameId);
    if (!game) return;

    const selectedAch = selectedAchMap[gameId];
    let achToAdd = '';

    if (selectedAch === '__custom__') {
      achToAdd = (customAchInputs[gameId] || '').trim();
    } else if (selectedAch) {
      achToAdd = selectedAch;
    } else {
      // Default to first available game achievement if none selected
      const pool = gameAchievementsMap[gameName] || [];
      const unused = pool.filter(a => !(game.achievements || []).includes(a));
      achToAdd = unused.length > 0 ? unused[0] : `${gameName} Achievement ${game.achievements.length + 1}`;
    }

    if (!achToAdd || (game.achievements || []).includes(achToAdd)) return;

    updateGame(gameId, 'achievements', [...(game.achievements || []), achToAdd]);
    setSelectedAchMap((prev) => ({ ...prev, [gameId]: '' }));
    setCustomAchInputs((prev) => ({ ...prev, [gameId]: '' }));
  };

  const removeAchievement = (id, ach) => {
    const game = games.find((g) => g.id === id);
    if (!game) return;
    updateGame(id, 'achievements', game.achievements.filter((a) => a !== ach));
  };

  const handleSave = async () => {
    setError('');
    try {
      const res = await saveProfile(originalUsername, username, games);
      if (res.success) {
        setSaved(true);
        setOriginalUsername(res.username);
        const stored = localStorage.getItem('currentUser');
        if (stored) {
          try { const u = JSON.parse(stored); u.username = res.username; localStorage.setItem('currentUser', JSON.stringify(u)); } catch {}
        }
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) { setError(err.message || 'Failed to save profile'); }
  };

  const handleVerifyCredentials = async (e) => {
    e.preventDefault();
    setVerifyLoading(true);
    setVerifyStatus('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: originalUsername, password: verifyPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVerifyStatus('success');
      } else {
        setVerifyStatus('fail');
      }
    } catch {
      setVerifyStatus('fail');
    } finally {
      setVerifyLoading(false);
    }
  };

  const availableGames = gameOptions.filter((g) => !games.some(({ name }) => name === g.name));

  if (loading) {
    return (
      <main className="profile-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Loading profile…</p>
      </main>
    );
  }

  return (
    <main className="profile-page">
      {/* Hero */}
      <section className="profile-hero">
        <div className="profile-avatar-hero" aria-hidden="true">
          {username.charAt(0).toUpperCase() || 'P'}
        </div>
        <div className="profile-hero__text">
          <p className="profile-kicker">Player Profile</p>
          <h1>@{username || 'pixelpilot'}</h1>
          <p>Show teammates what you play, your hours, and wins you're proud of.</p>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', marginBottom: '24px', fontSize: '0.85rem' }}>
          ⚠ {error}
        </div>
      )}

      {/* Identity */}
      <section className="profile-section" aria-labelledby="identity-heading">
        <p className="section-label">Identity</p>
        <h2 id="identity-heading">Your gamer tag</h2>
        <p>This is how potential teammates will find you.</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <label className="username-input" htmlFor="username">
            <span>@</span>
            <input
              id="username"
              value={username}
              onChange={handleUsernameChange}
              placeholder="e.g. NovaSkye, DriftKing, Quasar…"
              maxLength="24"
            />
          </label>
          <button
            id="confirm-username-btn"
            type="button"
            className="confirm-btn"
            onClick={handleConfirmUsername}
            disabled={usernameConfirmed || !username.trim()}
          >
            {usernameConfirmed ? '✓ Confirmed' : 'Confirm Username'}
          </button>
        </div>
        {autoLoadedMsg && (
          <div style={{ marginTop: '12px', padding: '8px 14px', borderRadius: '10px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', fontSize: '0.82rem', fontWeight: 600 }}>
            {autoLoadedMsg}
          </div>
        )}
      </section>

      {/* Region & Preferences */}
      <section className="profile-section" aria-labelledby="prefs-heading">
        <p className="section-label">Region & Preferences</p>
        <h2 id="prefs-heading">Your play settings</h2>
        <p>Set your region, platform, and availability so teams know when you're on.</p>
        <div className="prefs-grid">
          <label className="prefs-label" htmlFor="region-select">
            <span>Region</span>
            <select id="region-select" value={region} onChange={(e) => { setRegion(e.target.value); setPrefsConfirmed(false); }}>
              {regionOptions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <label className="prefs-label" htmlFor="platform-select">
            <span>Platform</span>
            <select id="platform-select" value={platform} onChange={(e) => { setPlatform(e.target.value); setPrefsConfirmed(false); }}>
              {platformOptions.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <label className="prefs-label" htmlFor="availability-select">
            <span>Availability</span>
            <select id="availability-select" value={availability} onChange={(e) => { setAvailability(e.target.value); setPrefsConfirmed(false); }}>
              {availabilityOptions.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </label>
        </div>
        <button
          id="confirm-prefs-btn"
          type="button"
          className="confirm-btn"
          style={{ marginTop: '16px' }}
          onClick={handleConfirmPrefs}
        >
          {prefsConfirmed ? '✓ Preferences Saved!' : 'Confirm Preferences'}
        </button>
      </section>

      {/* Verify Credentials */}
      <section className="profile-section" aria-labelledby="verify-heading">
        <p className="section-label">Security</p>
        <h2 id="verify-heading">Verify your credentials</h2>
        <p>Confirm your identity before making sensitive changes to your account.</p>
        {!showVerify ? (
          <button
            id="open-verify-btn"
            type="button"
            className="verify-trigger-btn"
            onClick={() => { setShowVerify(true); setVerifyStatus(''); setVerifyPassword(''); }}
          >
            🔐 Verify Identity
          </button>
        ) : (
          <form id="verify-credentials-form" onSubmit={handleVerifyCredentials} className="verify-form">
            <div className="verify-field">
              <label htmlFor="verify-password">Enter your password to verify</label>
              <input
                id="verify-password"
                type="password"
                placeholder="Your current password"
                value={verifyPassword}
                onChange={(e) => { setVerifyPassword(e.target.value); setVerifyStatus(''); }}
                required
                autoComplete="current-password"
              />
            </div>
            {verifyStatus === 'success' && (
              <div className="verify-success">✓ Credentials verified successfully!</div>
            )}
            {verifyStatus === 'fail' && (
              <div className="verify-error">⚠ Incorrect password. Please try again.</div>
            )}
            <div className="verify-actions">
              <button type="submit" className="confirm-btn" disabled={verifyLoading}>
                {verifyLoading ? 'Verifying…' : 'Verify Now'}
              </button>
              <button type="button" className="cancel-btn" onClick={() => setShowVerify(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Game Library */}
      <section className="games-section" aria-labelledby="games-heading">
        <div className="games-section-header">
          <div>
            <p className="section-label">Game Library</p>
            <h2 id="games-heading">Your games</h2>
            <p>Add the games you want to find teammates for.</p>
          </div>
          <div className="game-picker">
            <label className="sr-only" htmlFor="game-picker">Choose a game</label>
            <select id="game-picker" value={selectedGame} onChange={(e) => setSelectedGame(e.target.value)}>
              <option value="">Choose a game…</option>
              {availableGames.map(({ name }) => <option key={name} value={name}>{name}</option>)}
            </select>
            <button className="add-game-button" type="button" onClick={addGame} disabled={!selectedGame}>
              + Add
            </button>
          </div>
        </div>

        <div className="game-list">
          {games.map((game) => {
            const availableAchs = (gameAchievementsMap[game.name] || []).filter(
              (ach) => !(game.achievements || []).includes(ach)
            );
            const isCustom = selectedAchMap[game.id] === '__custom__';

            return (
              <article className={`game-card game-card--${game.color}`} key={game.id || game.name}>
                <div className="game-card__topline">
                  <div className="game-title">
                    <GameMark color={game.color} name={game.name} />
                    <h3>{game.name}</h3>
                  </div>
                  <button className="remove-button" type="button" onClick={() => removeGame(game.id)} aria-label={`Remove ${game.name}`}>
                    Remove
                  </button>
                </div>

                <div className="hours-row">
                  <label htmlFor={`hours-${game.id}`}>Hours played</label>
                  <div className="hours-input">
                    <input
                      id={`hours-${game.id}`}
                      type="number"
                      min="0"
                      value={game.hours}
                      onChange={(e) => updateGame(game.id, 'hours', e.target.value)}
                    />
                    <span>hrs</span>
                  </div>
                </div>

                <div className="achievement-row">
                  <div className="achievement-heading" style={{ flexWrap: 'wrap', gap: '8px' }}>
                    <span>{game.name} Achievements</span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <select
                        value={selectedAchMap[game.id] || ''}
                        onChange={(e) => setSelectedAchMap((prev) => ({ ...prev, [game.id]: e.target.value }))}
                        style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                      >
                        <option value="">Select {game.name} achievement…</option>
                        {availableAchs.map((ach) => (
                          <option key={ach} value={ach}>{ach}</option>
                        ))}
                        <option value="__custom__">+ Custom title…</option>
                      </select>

                      {isCustom && (
                        <input
                          type="text"
                          placeholder="Type achievement…"
                          value={customAchInputs[game.id] || ''}
                          onChange={(e) => setCustomAchInputs((prev) => ({ ...prev, [game.id]: e.target.value }))}
                          style={{
                            padding: '6px 10px',
                            fontSize: '0.8rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border)',
                            background: 'var(--surface)',
                            color: 'var(--text)',
                            width: '140px'
                          }}
                        />
                      )}

                      <button
                        type="button"
                        onClick={() => handleAddAchievement(game.id, game.name)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid rgba(139,92,246,0.3)',
                          background: 'var(--purple-dim)',
                          color: 'var(--purple-light)',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        + Add
                      </button>
                    </div>
                  </div>

                  <div className="achievement-list" style={{ marginTop: '10px' }}>
                    {game.achievements && game.achievements.length ? (
                      game.achievements.map((ach) => (
                        <span className="achievement" key={ach}>
                          ★ {ach}
                          <button type="button" onClick={() => removeAchievement(game.id, ach)} aria-label={`Remove ${ach}`}>×</button>
                        </span>
                      ))
                    ) : (
                      <p className="empty-achievements">No achievements yet — select a {game.name} milestone above.</p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="profile-actions">
        <p>{games.length} {games.length === 1 ? 'game' : 'games'} on your profile</p>
        <button className="save-button" type="button" onClick={handleSave}>
          {saved ? '✓ Saved to database!' : 'Save profile'}
        </button>
      </footer>
    </main>
  );
}

export default Profile;
