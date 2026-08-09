import { useMemo, useState, useEffect } from 'react';
import { fetchRequirements } from '../api';
import './req.css';

const gameFilters = {
  Fortnite: { label: 'Minimum wins', values: [['any', 'Any wins'], ['10', '10+ wins'], ['25', '25+ wins'], ['50', '50+ wins']], key: 'wins' },
  Valorant: { label: 'Minimum K/D', values: [['any', 'Any K/D'], ['1', '1.0+ K/D'], ['1.2', '1.2+ K/D'], ['1.5', '1.5+ K/D']], key: 'kd' },
  'CS:GO': { label: 'Minimum K/D', values: [['any', 'Any K/D'], ['1', '1.0+ K/D'], ['1.2', '1.2+ K/D'], ['1.5', '1.5+ K/D']], key: 'kd' },
  'Rocket League': { label: 'Minimum rank', values: [['any', 'Any rank'], ['diamond', 'Diamond+'], ['champion', 'Champion+'], ['grand-champion', 'Grand Champion']], key: 'rank' },
};

function Requirements() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState('Valorant');
  const [skill, setSkill] = useState('any');
  const [region, setRegion] = useState('All regions');
  const [platform, setPlatform] = useState('Any platform');
  const [availability, setAvailability] = useState('Any time');
  const [earnings, setEarnings] = useState('any');
  const [requestedIds, setRequestedIds] = useState([]);

  const handleRequestJoin = (id) => {
    if (!requestedIds.includes(id)) {
      setRequestedIds((prev) => [...prev, id]);
    }
  };

  useEffect(() => {
    fetchRequirements()
      .then((data) => {
        setListings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading team finder requirements:', err);
        setLoading(false);
      });
  }, []);

  const filter = gameFilters[game] || gameFilters['Valorant'];

  const changeGame = (nextGame) => { setGame(nextGame); setSkill('any'); };

  const results = useMemo(() => listings.filter((listing) => {
    if (listing.game !== game) return false;
    if (region !== 'All regions' && listing.region !== region) return false;
    if (platform !== 'Any platform' && listing.platform !== platform && listing.platform !== 'Cross-platform') return false;
    if (availability !== 'Any time' && listing.availability !== availability && listing.availability !== 'Flexible') return false;
    if (earnings === 'paid' && !listing.earnings) return false;
    if (skill === 'any') return true;
    if (filter.key === 'rank') return ['diamond', 'champion', 'grand-champion'].indexOf(listing.rank) >= ['diamond', 'champion', 'grand-champion'].indexOf(skill);
    return Number(listing[filter.key] || 0) >= Number(skill);
  }), [availability, earnings, filter.key, game, listings, platform, region, skill]);

  return (
    <main className="requirements-page">
      <header className="requirements-hero">
        <div>
          <p className="requirements-eyebrow">TEAM FINDER</p>
          <h1>Find a squad that fits.</h1>
          <p>Set what matters to you, then browse teams looking for players with your setup and schedule.</p>
        </div>
        <div className="requirements-hero__tip">
          <span>✦</span>
          <p>Live listings fetched directly from TeamSync SQLite backend database.</p>
        </div>
      </header>
      <section className="requirements-layout" aria-label="Team search">
        <aside className="requirements-filter-panel">
          <div className="requirements-filter-panel__heading">
            <div>
              <p className="requirements-eyebrow">FILTERS</p>
              <h2>Your preferences</h2>
            </div>
            <button type="button" onClick={() => { setSkill('any'); setRegion('All regions'); setPlatform('Any platform'); setAvailability('Any time'); setEarnings('any'); }}>Reset</button>
          </div>
          <fieldset>
            <legend>Game</legend>
            <div className="requirements-games">
              {Object.keys(gameFilters).map((item) => (
                <button type="button" key={item} className={item === game ? 'is-active' : ''} onClick={() => changeGame(item)}>{item}</button>
              ))}
            </div>
          </fieldset>
          <label><span>{filter.label}</span><select value={skill} onChange={(event) => setSkill(event.target.value)}>{filter.values.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label><span>Region / timezone</span><select value={region} onChange={(event) => setRegion(event.target.value)}><option>All regions</option><option>North America</option><option>Europe</option><option>Asia Pacific</option></select></label>
          <label><span>Platform preference</span><select value={platform} onChange={(event) => setPlatform(event.target.value)}><option>Any platform</option><option>PC</option><option>Console</option></select></label>
          <label><span>Availability</span><select value={availability} onChange={(event) => setAvailability(event.target.value)}><option>Any time</option><option>Evenings</option><option>Late night</option><option>Weekends</option></select></label>
          <fieldset><legend>Earnings</legend><div className="requirements-choice"><button type="button" className={earnings === 'any' ? 'is-active' : ''} onClick={() => setEarnings('any')}>Any team</button><button type="button" className={earnings === 'paid' ? 'is-active' : ''} onClick={() => setEarnings('paid')}>Prize earnings</button></div></fieldset>
        </aside>

        <section className="requirements-results" aria-live="polite">
          {loading ? (
            <div className="requirements-empty"><h3>Loading teams from database...</h3></div>
          ) : (
            <>
              <header>
                <div>
                  <p className="requirements-eyebrow">OPEN TEAMS</p>
                  <h2>{results.length} {results.length === 1 ? 'team' : 'teams'} for {game}</h2>
                </div>
                <span>{filter.label}: <strong>{filter.values.find(([value]) => value === skill)?.[1]}</strong></span>
              </header>
              <div className="requirements-list">
                {results.map((listing) => (
                  <article className="requirements-card" key={listing.id}>
                    <div className="requirements-card__content">
                      <div className={`requirements-card__badge requirements-card__badge--${listing.color}`}>{listing.tag}</div>
                      <div className="requirements-card__body">
                        <div className="requirements-card__title">
                          <div>
                            <h3>{listing.team}</h3>
                            <p>{listing.game} · {listing.members} members</p>
                          </div>
                          {listing.earnings > 0 && <strong className="requirements-card__earnings">${listing.earnings.toLocaleString()} earned</strong>}
                        </div>
                        <p className="requirements-card__note">{listing.note}</p>
                        <div className="requirements-card__meta">
                          <span>◉ {listing.region} · {listing.timezone}</span>
                          <span>⌘ {listing.platform}</span>
                          <span>◷ {listing.availability}</span>
                          {filter.key !== 'rank' && <span>{filter.key === 'wins' ? `${listing.wins} wins required` : `${listing.kd} K/D required`}</span>}
                          {filter.key === 'rank' && <span>{listing.rank?.replace('-', ' ')} required</span>}
                        </div>
                      </div>
                    </div>
                    <div className="requirements-card__actions">
                      <button type="button" className="requirements-card__join">View team <span>→</span></button>
                      <button
                        type="button"
                        className="requirements-card__request"
                        onClick={() => handleRequestJoin(listing.id)}
                        disabled={requestedIds.includes(listing.id)}
                      >
                        {requestedIds.includes(listing.id) ? '✓ Request Sent' : 'Request to Join'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              {!results.length && (
                <div className="requirements-empty">
                  <span>⌕</span>
                  <h3>No teams match these filters.</h3>
                  <p>Try widening your region, platform, or skill preferences.</p>
                  <button type="button" onClick={() => { setSkill('any'); setRegion('All regions'); setPlatform('Any platform'); setAvailability('Any time'); setEarnings('any'); }}>Clear filters</button>
                </div>
              )}
            </>
          )}
        </section>
      </section>
    </main>
  );
}

export default Requirements;
