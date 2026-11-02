import { useEffect, useState } from 'react';
import './dbms.css';

const call = async (path, options = {}) => {
  const response = await fetch(`/api/dbms${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
  const data = response.headers.get('content-type')?.includes('xml') ? await response.text() : await response.json();
  if (!response.ok) throw new Error(data.error || 'Database operation failed');
  return data;
};
const post = (path, body) => call(path, { method: 'POST', body: JSON.stringify(body) });

export default function Dbms() {
  const [table, setTable] = useState('teams');
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [stats, setStats] = useState({});
  const [message, setMessage] = useState('');
  const [output, setOutput] = useState(null);
  const [filter, setFilter] = useState({ column: 'game', operator: '=', value: 'Valorant' });
  const [aggregate, setAggregate] = useState({ fn: 'COUNT', column: 'id' });
  const [insert, setInsert] = useState({ username: '', email: '', password: '', rankTitle: '' });
  const [teamEdit, setTeamEdit] = useState({ id: '', name: '', region: '', wins: '', kd: '' });
  const [join, setJoin] = useState('INNER');

  const refresh = async (xml = false) => {
    const [result, dashboard] = await Promise.all([call(`/table/${table}${xml ? '?xml=1' : ''}`), call('/dashboard')]);
    if (typeof result === 'string') { setOutput(result); return; }
    setRows(result.rows); setColumns(result.rows[0] ? Object.keys(result.rows[0]) : []);
    setMessage(`SELECT all columns from ${table}: ${result.executionMs.toFixed(3)} ms`);
    setStats(dashboard.counts);
  };
  useEffect(() => { refresh().catch(error => setMessage(error.message)); }, [table]);

  const run = async (action, xml = false) => {
    try {
      const result = await action(xml ? '?xml=1' : '');
      if (typeof result === 'string') { setOutput(result); setMessage('XML result generated'); }
      else { setOutput(null); setRows(result.rows || result); setColumns(result.rows?.[0] ? Object.keys(result.rows[0]) : []); setMessage(`Query completed${result.executionMs == null ? '' : ` in ${result.executionMs.toFixed(3)} ms`}`); }
    } catch (error) { setMessage(error.message); }
  };
  const postResult = (path, body, xml = false) => run(extra => post(`${path}${extra}`, body), xml);

  const downloadXmlForTable = async () => {
    try { const response = await fetch(`/api/dbms/table/${table}?xml=1`); setOutput(await response.text()); setMessage('XML result generated'); }
    catch (error) { setMessage(error.message); }
  };

  return <main className="dbms-page">
    <header className="dbms-hero"><p className="dbms-kicker">DATABASE MANAGEMENT SYSTEMS</p><h1>SQL Operations Studio</h1><p>Run project queries, compare index timing, and inspect the SQLite view and trigger.</p></header>
    <section className="dbms-dashboard"><h2>Database dashboard</h2><div className="dbms-stat-grid">{Object.entries(stats).map(([name, count]) => <article key={name}><span>{name.replace('_', ' ')}</span><strong>{count}</strong><small>records</small></article>)}</div></section>
    <section className="dbms-panel"><div className="dbms-panel-head"><div><p className="dbms-kicker">CRUD · QUERY 1</p><h2>Display table records</h2></div><label>Table <select value={table} onChange={e => setTable(e.target.value)}>{['teams', 'users', 'user_games', 'achievements', 'team_members', 'password_resets', 'messages', 'team_applications', 'team_events', 'notifications'].map(t => <option key={t}>{t}</option>)}</select></label><button onClick={() => refresh()}>Display all</button><button onClick={downloadXmlForTable}>Display as XML</button></div>
      <div className="dbms-table-wrap"><table><thead><tr>{columns.map(col => <th key={col}>{col}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={row.id ?? i}>{columns.map(col => <td key={col}>{String(row[col] ?? '')}</td>)}</tr>)}</tbody></table>{!rows.length && <p className="dbms-empty">No rows to display.</p>}</div>
    </section>
    <div className="dbms-grid">
      <section className="dbms-panel"><p className="dbms-kicker">QUERY 2 · INSERT WITH CONSTRAINTS</p><h2>Insert user</h2><form onSubmit={async e => { e.preventDefault(); try { const result = await post('/insert-user', insert); setMessage(`User inserted in ${result.executionMs.toFixed(3)} ms`); setInsert({ username: '', email: '', password: '', rankTitle: '' }); await refresh(); } catch (err) { setMessage(err.message); } }}>
        {['username', 'email', 'password', 'rankTitle'].map(key => <label key={key}>{key}<input required={key !== 'rankTitle'} type={key === 'password' ? 'password' : key === 'email' ? 'email' : 'text'} value={insert[key]} onChange={e => setInsert({ ...insert, [key]: e.target.value })} /></label>)}<button>Insert</button></form></section>
      <section className="dbms-panel"><p className="dbms-kicker">QUERY 3 · AGGREGATE</p><h2>Aggregate function</h2><div className="dbms-controls"><select value={aggregate.fn} onChange={e => setAggregate({ ...aggregate, fn: e.target.value })}>{['COUNT', 'SUM', 'AVG', 'MIN', 'MAX'].map(x => <option key={x}>{x}</option>)}</select><select value={aggregate.column} onChange={e => setAggregate({ ...aggregate, column: e.target.value })}>{['id', 'wins', 'kd', 'earnings'].map(x => <option key={x}>{x}</option>)}</select><button onClick={() => postResult('/aggregate', { ...aggregate, table: 'teams' })}>Run</button><button onClick={() => postResult('/aggregate?xml=1', { ...aggregate, table: 'teams' })}>XML</button></div></section>
      <section className="dbms-panel"><p className="dbms-kicker">QUERY 4 · CONDITIONAL SELECT</p><h2>Filter records</h2><div className="dbms-controls"><select value={filter.column} onChange={e => setFilter({ ...filter, column: e.target.value })}>{['game', 'region', 'wins', 'kd', 'platform'].map(x => <option key={x}>{x}</option>)}</select><select value={filter.operator} onChange={e => setFilter({ ...filter, operator: e.target.value })}>{['=', '!=', '>', '<', '>=', '<=', 'LIKE'].map(x => <option key={x}>{x}</option>)}</select><input value={filter.value} onChange={e => setFilter({ ...filter, value: e.target.value })} /><button onClick={() => postResult('/filter', { table: 'teams', ...filter })}>Run</button><button onClick={() => postResult('/filter?xml=1', { table: 'teams', ...filter })}>XML</button></div></section>
      <section className="dbms-panel"><p className="dbms-kicker">QUERY 5 · JOIN</p><h2>Join project tables</h2><div className="dbms-controls"><select value={join} onChange={e => setJoin(e.target.value)}>{['INNER', 'LEFT', 'CROSS'].map(x => <option key={x}>{x}</option>)}</select><button onClick={() => postResult('/join', { join })}>Teams + members</button></div><small>Join implementation uses teams, team_members, and users.</small></section>
      <section className="dbms-panel"><p className="dbms-kicker">QUERIES 6 &amp; 7 · MULTI-TABLE SUBQUERY</p><h2>Subquery records</h2><div className="dbms-controls"><select id="subquery-mode"><option value="subquery">IN subquery</option><option value="correlated">Correlated EXISTS</option></select><select id="subquery-game">{['Valorant', 'Fortnite', 'CS:GO', 'Rocket League'].map(x => <option key={x}>{x}</option>)}</select><button onClick={() => { const mode = document.getElementById('subquery-mode').value; const game = document.getElementById('subquery-game').value; postResult('/subqueries', { mode, game }); }}>Run</button></div></section>
      <section className="dbms-panel"><p className="dbms-kicker">QUERY 8 · UPDATE / DELETE</p><h2>Update or delete a team</h2><div className="dbms-controls">{Object.keys(teamEdit).map(k => <input key={k} aria-label={k} placeholder={k} value={teamEdit[k]} onChange={e => setTeamEdit({ ...teamEdit, [k]: e.target.value })} />)}<button onClick={async () => { try { const result = await call(`/team/${teamEdit.id}`, { method: 'PUT', body: JSON.stringify({ name: teamEdit.name || undefined, region: teamEdit.region || undefined, wins: teamEdit.wins === '' ? undefined : Number(teamEdit.wins), kd: teamEdit.kd === '' ? undefined : Number(teamEdit.kd) }) }); setMessage(`Updated ${result.changes} row(s) in ${result.executionMs.toFixed(3)} ms`); await refresh(); } catch (e) { setMessage(e.message); } }}>Update</button><button className="dbms-danger" onClick={async () => { if (!teamEdit.id) return setMessage('Enter a team ID first'); try { const result = await call(`/team/${teamEdit.id}`, { method: 'DELETE' }); setMessage(`Deleted ${result.changes} row(s)`); await refresh(); } catch (e) { setMessage(e.message); } }}>Delete by ID</button></div></section>
      <section className="dbms-panel"><p className="dbms-kicker">SECTION B · INDEX ANALYSIS</p><h2>Compare query timing</h2><p>Measure a game and region lookup before and after its composite index.</p><button onClick={async () => { try { const result = await post('/benchmark', {}); setOutput(JSON.stringify(result, null, 2)); setMessage('Benchmark completed'); } catch (e) { setMessage(e.message); } }}>Run benchmark</button></section>
      <section className="dbms-panel"><p className="dbms-kicker">SECTION C · VIEW + TRIGGER</p><h2>Team member directory view</h2><div className="dbms-controls"><button onClick={() => run(() => call('/view'))}>Execute saved directory procedure</button><input id="view-team" placeholder="Team ID" /><input id="view-user" placeholder="User ID" /><input id="view-role" placeholder="Role" /><button onClick={async () => { try { const result = await post('/view', { teamId: Number(document.getElementById('view-team').value), userId: Number(document.getElementById('view-user').value), role: document.getElementById('view-role').value }); setRows(result.rows); setColumns(result.rows[0] ? Object.keys(result.rows[0]) : []); setMessage('View insert accepted by validation trigger'); } catch (e) { setMessage(e.message); } }}>Insert through view</button></div></section>
    </div>
    {message && <div className="dbms-message" role="status">{message}</div>}
    {output && <pre className="dbms-output">{output}</pre>}
  </main>;
}
