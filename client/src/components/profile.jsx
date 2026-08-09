import React from 'react';

/**
 * Reusable ProfileCard Component
 * Renders a player's avatar, gamer tag, title, game badges, and achievements.
 */
export function ProfileCard({ user, onSelect }) {
  if (!user) return null;

  const {
    username = 'Anonymous',
    avatarText = username.charAt(0).toUpperCase(),
    rankTitle = 'Gamer',
    games = []
  } = user;

  return (
    <article
      className="profile-card-component"
      style={{
        background: 'rgba(30, 41, 59, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '1.25rem',
        backdropFilter: 'blur(8px)',
        color: '#f8fafc',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        transition: 'transform 0.2s ease, border-color 0.2s ease',
        cursor: onSelect ? 'pointer' : 'default'
      }}
      onClick={() => onSelect && onSelect(user)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
          }}
        >
          {avatarText}
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#f1f5f9' }}>
            @{username}
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginTop: '2px' }}>
            {rankTitle}
          </span>
        </div>
      </div>

      <div style={{ marginTop: '0.75rem' }}>
        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 600 }}>
          Active Games ({games.length})
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {games.length > 0 ? (
            games.map((game, index) => (
              <span
                key={index}
                style={{
                  fontSize: '0.75rem',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: game.color === 'valorant' ? 'rgba(255, 70, 85, 0.2)' :
                              game.color === 'fortnite' ? 'rgba(168, 85, 247, 0.2)' :
                              game.color === 'csgo' ? 'rgba(234, 179, 8, 0.2)' :
                              'rgba(59, 130, 246, 0.2)',
                  color: game.color === 'valorant' ? '#ff4655' :
                         game.color === 'fortnite' ? '#c084fc' :
                         game.color === 'csgo' ? '#fde047' :
                         '#60a5fa',
                  border: `1px solid ${
                    game.color === 'valorant' ? 'rgba(255, 70, 85, 0.4)' :
                    game.color === 'fortnite' ? 'rgba(168, 85, 247, 0.4)' :
                    game.color === 'csgo' ? 'rgba(234, 179, 8, 0.4)' :
                    'rgba(59, 130, 246, 0.4)'
                  }`,
                  fontWeight: 500
                }}
              >
                {game.name} · {game.hours}h
              </span>
            ))
          ) : (
            <span style={{ fontSize: '0.8rem', color: '#64748b', italic: 'true' }}>No games listed yet</span>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProfileCard;
