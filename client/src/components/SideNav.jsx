import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './SideNav.css';

const links = [
  {
    to: '/profile',
    label: 'My Profile',
    icon: (
      <svg className="sidenav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    ),
  },
  {
    to: '/requirements',
    label: 'Find a Squad',
    icon: (
      <svg className="sidenav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="11" cy="11" r="7"/>
        <path d="M21 21l-4-4"/>
      </svg>
    ),
  },
  {
    to: '/team',
    label: 'My Teams',
    icon: (
      <svg className="sidenav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="8" r="3"/>
        <circle cx="17" cy="8" r="3"/>
        <path d="M2 19c0-3 3-5 7-5s7 2 7 5"/>
        <path d="M17 14c2 0 4 1.5 4 4"/>
      </svg>
    ),
  },
];

const devLinks = [
  {
    to: '/dev/seed-viewer',
    label: 'Seed Viewer',
    icon: (
      <svg className="sidenav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M3 9h18M9 21V9"/>
      </svg>
    ),
  },
];

export default function SideNav() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) setUser(JSON.parse(stored));
    } catch {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  return (
    <>
      {/* Mobile hamburger */}
      <button className="sidenav__toggle" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {open
            ? <path d="M18 6L6 18M6 6l12 12"/>
            : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
          }
        </svg>
      </button>

      {/* Overlay */}
      <div className={`sidenav__overlay ${open ? 'open' : ''}`} onClick={() => setOpen(false)} />

      {/* Nav */}
      <nav className={`sidenav ${open ? 'open' : ''}`}>
        <NavLink to="/profile" className="sidenav__brand" onClick={() => setOpen(false)}>
          <div className="sidenav__logo">TS</div>
          <span className="sidenav__brand-name">TeamSync</span>
        </NavLink>

        <span className="sidenav__section-label">Navigation</span>

        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidenav__link${isActive ? ' active' : ''}`}
            onClick={() => setOpen(false)}
          >
            {icon}
            {label}
          </NavLink>
        ))}

        {user?.username === 'admin' && (
          <>
            <span className="sidenav__section-label" style={{ marginTop: '16px' }}>Developer</span>

            {devLinks.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `sidenav__link${isActive ? ' active' : ''}`}
                onClick={() => setOpen(false)}
                style={{ opacity: 0.7, fontSize: '0.82rem' }}
              >
                {icon}
                {label}
              </NavLink>
            ))}
          </>
        )}

        <div className="sidenav__spacer" />


        {user && (
          <div style={{ marginBottom: '10px' }}>
            <div className="sidenav__user">
              <div className="sidenav__avatar">{(user.username || 'U').charAt(0).toUpperCase()}</div>
              <div>
                <div className="sidenav__username">{user.username}</div>
                <div className="sidenav__rank">{user.rank_title || 'Player'}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                marginTop: '8px',
                width: '100%',
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text-muted)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              Sign out
            </button>
          </div>
        )}
      </nav>
    </>
  );
}
