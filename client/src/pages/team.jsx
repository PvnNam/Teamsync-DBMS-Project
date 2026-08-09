import { useState, useEffect } from 'react';
import { fetchTeams } from '../api';
import './team.css';

const gameOptions = [
  { name: 'Valorant',      color: 'valorant' },
  { name: 'Fortnite',      color: 'fortnite' },
  { name: 'CS:GO',         color: 'csgo'     },
  { name: 'Rocket League', color: 'rocket'   },
  { name: 'Marvel Rivals', color: 'marvel'   },
];

function Team() {
  const [teams, setTeams] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [leavingTeamId, setLeavingTeamId] = useState(null);
  const [leftTeams, setLeftTeams] = useState([]);
  const [leaveConfirmId, setLeaveConfirmId] = useState(null);

  // Create squad state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSquadName, setNewSquadName]     = useState('');
  const [newSquadGame, setNewSquadGame]     = useState('Valorant');
  const [newSquadTag, setNewSquadTag]       = useState('');
  const [newSquadDesc, setNewSquadDesc]     = useState('');
  const [creating, setCreating]             = useState(false);
  const [createError, setCreateError]       = useState('');

  useEffect(() => {
    fetchTeams()
      .then((data) => {
        setTeams(data);
        if (data.length > 0) {
          setSelectedId(data[0].id);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching teams roster:', err);
        setLoading(false);
      });
  }, []);

  const visibleTeams = teams.filter((t) => !leftTeams.includes(t.id));
  const selectedTeam = visibleTeams.find((team) => team.id === selectedId) || visibleTeams[0];

  const handleLeaveSquad = (teamId) => {
    setLeavingTeamId(teamId);
    setTimeout(() => {
      setLeftTeams((prev) => [...prev, teamId]);
      setLeavingTeamId(null);
      setLeaveConfirmId(null);
      if (selectedId === teamId) {
        const remaining = visibleTeams.filter((t) => t.id !== teamId);
        if (remaining.length > 0) setSelectedId(remaining[0].id);
      }
    }, 800);
  };

  const handleCreateSquad = async (e) => {
    e.preventDefault();
    setCreateError('');

    if (!newSquadName.trim()) {
      setCreateError('Please enter a squad name.');
      return;
    }

    setCreating(true);
    try {
      const stored = localStorage.getItem('currentUser');
      const currentUser = stored ? JSON.parse(stored).username : 'pixelpilot';

      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSquadName.trim(),
          game: newSquadGame,
          tag: newSquadTag.trim() || newSquadName.trim().substring(0, 3).toUpperCase(),
          description: newSquadDesc.trim(),
          username: currentUser
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTeams((prev) => [...prev, data.team]);
        setSelectedId(data.team.id);
        setNewSquadName('');
        setNewSquadTag('');
        setNewSquadDesc('');
        setShowCreateForm(false);
      } else {
        setCreateError(data.error || 'Failed to create squad');
      }
    } catch {
      setCreateError('Could not reach server.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <main className="team-page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <p style={{ color: '#94a3b8', fontSize: '1.2rem' }}>Loading active team rosters from SQLite database...</p>
      </main>
    );
  }

  const totalPlayers = visibleTeams.reduce((acc, t) => acc + (t.players ? t.players.length : 0), 0);

  return (
    <main className="team-page">
      <header className="team-hero">
        <div>
          <p className="team-eyebrow">MY TEAM</p>
          <h1>Your squads, in sync.</h1>
          <p>Pick a squad to view your team roster, achievements, and earnings. You can create multiple squads for any game!</p>
        </div>
        <div className="team-summary">
          <strong>{visibleTeams.length}</strong><span>active teams</span>
          <i />
          <strong>{totalPlayers}</strong><span>total players</span>
        </div>
      </header>

      <section aria-labelledby="game-teams-heading">
        <div className="team-section-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
          <div>
            <p className="team-eyebrow">SQUAD ROSTERS</p>
            <h2 id="game-teams-heading">Choose your squad</h2>
          </div>
          <button
            id="open-create-squad-btn"
            type="button"
            className="create-squad-trigger-btn"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? '✕ Close Form' : '+ Create New Squad'}
          </button>
        </div>

        {/* Create Squad Form */}
        {showCreateForm && (
          <form id="create-squad-form" onSubmit={handleCreateSquad} className="create-squad-card">
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', color: 'var(--purple-light)' }}>
              ✦ Create a New Squad
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Form a custom roster with a unique squad name. You can create multiple squads for the same game!
            </p>

            {createError && (
              <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '0.82rem', marginBottom: '12px' }}>
                ⚠ {createError}
              </div>
            )}

            <div className="create-squad-grid">
              <div className="field">
                <label htmlFor="squad-name">Squad Name</label>
                <input
                  id="squad-name"
                  type="text"
                  placeholder="e.g. Phoenix Roster, Night Shift"
                  value={newSquadName}
                  onChange={(e) => setNewSquadName(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="squad-game">Game</label>
                <select
                  id="squad-game"
                  value={newSquadGame}
                  onChange={(e) => setNewSquadGame(e.target.value)}
                >
                  {gameOptions.map((g) => (
                    <option key={g.name} value={g.name}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="squad-tag">Squad Tag (3-4 chars)</label>
                <input
                  id="squad-tag"
                  type="text"
                  placeholder="e.g. PHX, NS, OMEGA"
                  maxLength={5}
                  value={newSquadTag}
                  onChange={(e) => setNewSquadTag(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="squad-desc">Motto / Note</label>
                <input
                  id="squad-desc"
                  type="text"
                  placeholder="e.g. Competitive duo for cash cups."
                  value={newSquadDesc}
                  onChange={(e) => setNewSquadDesc(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              <button id="submit-create-squad-btn" type="submit" className="confirm-btn" disabled={creating}>
                {creating ? 'Creating…' : 'Create Squad →'}
              </button>
              <button type="button" className="cancel-btn" onClick={() => setShowCreateForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="team-game-grid">
          {visibleTeams.map((team) => (
            <div key={team.id} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setSelectedId(team.id)}
                className={`team-game-card team-game-card--${team.color} ${selectedTeam && selectedTeam.id === team.id ? 'is-selected' : ''}`}
                aria-pressed={selectedTeam && selectedTeam.id === team.id}
              >
                <span className="team-game-card__mark">{team.short}</span>
                <span className="team-game-card__content">
                  <strong>{team.name}</strong>
                  <small>{team.game} · {team.members} {team.members === 1 ? 'member' : 'members'}</small>
                </span>
                <span className="team-game-card__arrow" aria-hidden="true">→</span>
              </button>
              {leaveConfirmId !== team.id ? (
                <button
                  id={`leave-squad-${team.id}`}
                  type="button"
                  className="leave-squad-btn"
                  onClick={(e) => { e.stopPropagation(); setLeaveConfirmId(team.id); }}
                  aria-label={`Leave ${team.name} squad`}
                >
                  Leave Squad
                </button>
              ) : (
                <div className="leave-confirm-row">
                  <span>Sure?</span>
                  <button
                    type="button"
                    className="leave-confirm-yes"
                    disabled={leavingTeamId === team.id}
                    onClick={() => handleLeaveSquad(team.id)}
                  >
                    {leavingTeamId === team.id ? 'Leaving…' : 'Yes, leave'}
                  </button>
                  <button type="button" className="leave-confirm-no" onClick={() => setLeaveConfirmId(null)}>No</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {selectedTeam ? (
        <section className="team-roster" aria-labelledby="roster-heading">
          <div className="team-roster__header">
            <div>
              <p className="team-eyebrow">{selectedTeam.name.toUpperCase()} ROSTER ({selectedTeam.game.toUpperCase()})</p>
              <h2 id="roster-heading">{selectedTeam.members} {selectedTeam.members === 1 ? 'player' : 'players'}, one squad.</h2>
              <p>{selectedTeam.description}</p>
            </div>
            <span className={`team-roster__badge team-roster__badge--${selectedTeam.color}`}>{selectedTeam.short}</span>
          </div>
          <div className="team-player-list">
            {(selectedTeam.players || []).map((player) => (
              <article className="team-player" key={player.name}>
                <div className={`team-player__avatar team-player__avatar--${selectedTeam.color}`}>{player.initials}</div>
                <div className="team-player__identity">
                  <h3>{player.name}{player.name === 'pixelpilot' && <span>You</span>}</h3>
                  <p>{player.role}</p>
                  <small className={player.online === 'Online now' ? 'is-online' : ''}><b />Last online {player.online}</small>
                </div>
                <div className="team-player__stats">
                  <div>
                    <span>Achievements</span>
                    <p>{(player.achievements || []).map((achievement) => <em key={achievement}>★ {achievement}</em>)}</p>
                  </div>
                  <div>
                    <span>Recent tournaments</span>
                    <p>{(player.tournaments || []).map((tournament) => <em key={tournament}>{tournament}</em>)}</p>
                  </div>
                  <div className="team-player__earnings">
                    <span>Earnings</span>
                    <strong>{player.earnings}</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          No active squads remaining. Click "+ Create New Squad" above to form your team!
        </div>
      )}
    </main>
  );
}

export default Team;
