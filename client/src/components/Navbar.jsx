import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import './Navbar.css'

const links = [
  { to: '/profile', label: 'Profile' },
  { to: '/requirements', label: 'Requirements' },
  { to: '/team', label: 'My Team' },
]

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const closeMenu = () => setIsOpen(false)

  return (
    <header className="navbar">
      <NavLink className="navbar__brand" to="/profile" onClick={closeMenu}>
        TeamSync
      </NavLink>

      <button
        className="navbar__toggle"
        type="button"
        aria-expanded={isOpen}
        aria-controls="primary-navigation"
        aria-label="Toggle navigation"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>

      <nav
        id="primary-navigation"
        className={`navbar__links ${isOpen ? 'navbar__links--open' : ''}`}
        aria-label="Primary navigation"
      >
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            className={({ isActive }) =>
              `navbar__link ${isActive ? 'navbar__link--active' : ''}`
            }
            to={to}
            onClick={closeMenu}
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}

export default Navbar
