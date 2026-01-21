import { useState, useMemo } from 'react';
import PlayerImage from './PlayerImage';
import AdBanner from './AdBanner';

const TEAM_COLORS = {
  CSK: '#f9cd05', MI: '#004ba0', RCB: '#ec1c24', KKR: '#3a225d', SRH: '#ff822a',
  RR: '#ea1a85', DC: '#0078bc', PBKS: '#ed1b24', LSG: '#00b7eb', GT: '#1c1c1c'
};

const TEAM_LOGOS = {
  CSK: 'https://documents.iplt20.com/ipl/CSK/Logos/Roundbig/CSKroundbig.png',
  MI: 'https://documents.iplt20.com/ipl/MI/Logos/Roundbig/MIroundbig.png',
  RCB: 'https://documents.iplt20.com/ipl/RCB/Logos/Roundbig/RCBroundbig.png',
  KKR: 'https://documents.iplt20.com/ipl/KKR/Logos/Roundbig/KKRroundbig.png',
  SRH: 'https://documents.iplt20.com/ipl/SRH/Logos/Roundbig/SRHroundbig.png',
  RR: 'https://documents.iplt20.com/ipl/RR/Logos/Roundbig/RRroundbig.png',
  DC: 'https://documents.iplt20.com/ipl/DC/Logos/Roundbig/DCroundbig.png',
  PBKS: 'https://documents.iplt20.com/ipl/PBKS/Logos/Roundbig/PBKSroundbig.png',
  LSG: 'https://documents.iplt20.com/ipl/LSG/Logos/Roundbig/LSGroundbig.png',
  GT: 'https://documents.iplt20.com/ipl/GT/Logos/Roundbig/GTroundbig.png'
};

function TeamLogo({ name, size = 32 }) {
  const [error, setError] = useState(false);

  if (error || !TEAM_LOGOS[name]) {
    return (
      <div style={{
        width: size,
        height: size,
        borderRadius: 6,
        background: TEAM_COLORS[name] || '#374151',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.4,
        fontWeight: 'bold',
        color: '#fff'
      }}>
        {name?.charAt(0)}
      </div>
    );
  }

  return (
    <img
      src={TEAM_LOGOS[name]}
      alt={name}
      style={{
        width: size,
        height: size,
        borderRadius: 6,
        objectFit: 'contain',
        background: 'rgba(255, 255, 255, 0.1)'
      }}
      onError={() => setError(true)}
    />
  );
}

export default function TeamPanel({ teams, compact = false, hostSocketId = null, maxBudget = 120 }) {
  if (!Array.isArray(teams) || teams.length === 0) return null;

  const sortedTeams = [...teams].sort((a, b) => b.budget - a.budget);

  if (compact) {
    return (
      <div style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        borderRadius: 'var(--radius-lg)',
        padding: 16,
        border: '1px solid var(--glass-border)',
        height: 'fit-content'
      }}>
        <h3 style={{ color: '#fff', marginBottom: 12, fontSize: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
          🏆 Team Leaderboard
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sortedTeams.map(team => {
            const osCount = team.players?.filter(p => p.overseas).length || 0;
            const totalCount = team.players?.length || 0;

            return (
              <div key={team.id} style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                transition: 'all 0.2s ease'
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
              >
                {/* Logo */}
                <TeamLogo name={team.name} size={36} />

                {/* Info */}
                <div>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{team.name}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                    <span style={{
                      fontSize: 10,
                      color: osCount >= 8 ? '#ef4444' : '#94a3b8',
                      background: osCount >= 8 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                      padding: '2px 6px',
                      borderRadius: 4
                    }}>
                      OS: {osCount}/8
                    </span>
                    <span style={{
                      fontSize: 10,
                      color: totalCount >= 25 ? '#ef4444' : '#94a3b8',
                      background: 'rgba(148, 163, 184, 0.1)',
                      padding: '2px 6px',
                      borderRadius: 4
                    }}>
                      SQ: {totalCount}/25
                    </span>
                  </div>
                </div>

                {/* Budget */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontWeight: 'bold',
                    fontSize: 14,
                    color: team.budget < 10 ? '#f87171' : '#34d399',
                    fontFamily: '"Outfit", sans-serif'
                  }}>
                    ₹{team.budget?.toFixed(1)}
                  </div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>Cr</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ad Slot in Sidebar - Fixed position, won't affect scroll */}
        <div style={{
          marginTop: 16,
          padding: 10,
          background: 'rgba(30, 41, 59, 0.8)',
          borderRadius: 8,
          border: '1px solid rgba(255, 255, 255, 0.05)',
          overflow: 'hidden'
        }}>
          <div style={{
            color: '#4b5563',
            fontSize: 9,
            marginBottom: 6,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            textAlign: 'center'
          }}>
            Advertisement
          </div>
          <div style={{
            width: '100%',
            height: 100,
            background: '#1f2937',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#374151',
            fontSize: 10,
            overflow: 'hidden'
          }}>
            AD SPACE
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ color: '#fff', marginBottom: 20, fontSize: 22 }}>🏆 Team Squads</h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 16
      }}>
        {sortedTeams.map(team => (
          <div key={team.id} style={{
            background: 'rgba(30, 41, 59, 0.95)',
            borderRadius: 16,
            padding: 20,
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            {/* Team Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <TeamLogo name={team.name} size={48} />
                <div>
                  <div style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{team.name}</div>
                  <div style={{ color: '#9ca3af', fontSize: 12 }}>
                    {team.isAI ? '🤖 AI' : `👤 ${team.owner}`}
                    {!team.isAI && team.socketId && hostSocketId && team.socketId === hostSocketId && (
                      <span style={{ color: '#f59e0b', fontWeight: 'bold', marginLeft: 8, fontSize: 10, background: 'rgba(245, 158, 11, 0.1)', padding: '2px 6px', borderRadius: 4 }}>
                        (HOST)
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#9ca3af', fontSize: 11, letterSpacing: 1 }}>PURSE REMAINING</div>
                <div style={{
                  fontWeight: 900,
                  fontSize: 20,
                  fontFamily: '"Outfit", sans-serif',
                  color: team.budget < 15 ? '#ef4444' : team.budget < 40 ? '#f59e0b' : '#10b981',
                  textShadow: team.budget < 15 ? '0 0 15px rgba(239, 68, 68, 0.3)' : 'none'
                }}>
                  ₹{team.budget?.toFixed(2)} Cr
                </div>
              </div>
            </div>

            {/* Ad Slot - Fixed size, won't grow or affect layout */}
            <div style={{
              marginBottom: 12,
              height: 90,
              minHeight: 90,
              maxHeight: 90,
              overflow: 'hidden',
              borderRadius: 8
            }}>
              <AdBanner slotId="TEAM_SLOT" format="horizontal" style={{ width: '100%', height: 90 }} />
            </div>

            {/* Budget Utilization Bar */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
                <div className="bar-shine" style={{
                  width: `${(team.budget / maxBudget) * 100}%`,
                  height: '100%',
                  background: team.budget < 15 ? 'linear-gradient(90deg, #ef4444, #b91c1c)' : 'linear-gradient(90deg, #10b981, #059669)',
                  transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderRadius: 3
                }} />
              </div>
            </div>

            {/* Role Distribution Summary */}
            <div style={{
              display: 'flex',
              gap: 8,
              marginBottom: 16,
              justifyContent: 'flex-start'
            }}>
              {['BAT', 'BOWL', 'AR', 'WK'].map(role => {
                const count = team.players?.filter(p => p.role === role).length || 0;
                return (
                  <div key={role} style={{
                    padding: '4px 10px',
                    borderRadius: 20,
                    background: count > 0 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${count > 0 ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255,255,255,0.1)'}`,
                    fontSize: 11,
                    fontWeight: 600,
                    color: count > 0 ? '#818cf8' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    <span>{role}</span>
                    <span style={{ fontSize: 13, color: count > 0 ? '#fff' : '#475569' }}>{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Players List */}
            <div style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: 12
            }}>
              {team.players?.length === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: 8, fontSize: 14 }}>
                  No players yet
                </p>
              ) : (
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {team.players?.map((player, idx) => (
                    <div key={player.id || idx} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      background: idx % 2 === 0 ? 'rgba(55, 65, 81, 0.3)' : 'transparent',
                      borderRadius: 6,
                      fontSize: 13
                    }}>
                      <span style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {idx + 1}. {player.name}
                        {player.overseas && (
                          <span style={{
                            fontSize: 10,
                            background: 'rgba(239, 68, 68, 0.2)',
                            color: '#f87171',
                            padding: '1px 4px',
                            borderRadius: 4,
                            border: '1px solid rgba(239, 68, 68, 0.3)'
                          }}>✈️ OS</span>
                        )}
                        <span style={{ color: '#9ca3af' }}>({player.role})</span>
                      </span>
                      <span style={{ color: '#34d399', fontWeight: 500 }}>
                        ₹{player.soldPrice?.toFixed(2)}Cr
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Squad Progress */}
            <div style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 11,
                color: '#9ca3af',
                marginBottom: 4
              }}>
                <span>Squad Size</span>
                <span>{team.players?.length || 0} / 25</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 11,
                color: '#9ca3af',
                marginBottom: 4
              }}>
                <span>Overseas</span>
                <span style={{
                  color: (team.players?.filter(p => p.overseas).length || 0) >= 8 ? '#ef4444' : '#9ca3af'
                }}>
                  {team.players?.filter(p => p.overseas).length || 0} / 8
                </span>
              </div>
              <div style={{
                height: 4,
                background: '#374151',
                borderRadius: 2,
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${((team.players?.length || 0) / 25) * 100}%`,
                  height: '100%',
                  background: '#3b82f6'
                }} />
              </div>
            </div>
          </div>
        ))
        }

        {/* Ad Slot Card - Fits in the grid like a team card */}
        {/* Removed as per instruction: "Remove ad from end of full teams grid" */}
      </div >
    </div >
  );
}
