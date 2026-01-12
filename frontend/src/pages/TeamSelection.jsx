import { socket } from "../socket";

const TEAM_COLORS = {
  CSK: { bg: '#f9cd05', text: '#000', accent: '#f9cd05' },
  MI: { bg: '#004ba0', text: '#fff', accent: '#004ba0' },
  RCB: { bg: '#ec1c24', text: '#fff', accent: '#ec1c24' },
  KKR: { bg: '#3a225d', text: '#fff', accent: '#3a225d' },
  SRH: { bg: '#ff822a', text: '#fff', accent: '#ff822a' },
  RR: { bg: '#ea1a85', text: '#fff', accent: '#ea1a85' },
  DC: { bg: '#0078bc', text: '#fff', accent: '#0078bc' },
  PBKS: { bg: '#ed1b24', text: '#fff', accent: '#ed1b24' },
  LSG: { bg: '#00b7eb', text: '#fff', accent: '#00b7eb' },
  GT: { bg: '#1c1c1c', text: '#fff', accent: '#00ff9d' }
};

// Official IPL team logos
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

const IPL_TEAMS = ["CSK", "MI", "RCB", "KKR", "SRH", "RR", "DC", "PBKS", "LSG", "GT"];

export default function TeamSelection({ room }) {
  const mySocketId = socket.id;
  const me = room.humans?.find(h => h.socketId === mySocketId);
  const myTeam = me?.team || null;
  const isHost = room.hostSocketId === mySocketId;

  const takenTeams = {};
  room.humans?.forEach(h => {
    if (h.team) takenTeams[h.team] = h.username;
  });

  function selectTeam(teamCode) {
    console.log("Frontend selecting team:", teamCode);
    socket.emit("select-team", { roomId: room.id, teamName: teamCode });
  }

  function lockTeams() {
    socket.emit("lock-teams", { roomId: room.id });
  }

  // Styles
  const glassStyle = {
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(24px)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--glass-shadow)',
    position: 'relative',
    overflow: 'hidden'
  };

  return (
    <div style={{ minHeight: '100vh', padding: 24, fontFamily: '"Outfit", system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          ...glassStyle,
          padding: '32px 40px',
          marginBottom: 32,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 24,
          background: 'linear-gradient(to right, rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.6))'
        }}>
          <div>
            <h1 style={{
              background: 'linear-gradient(to right, var(--primary-light), #fff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: 32,
              marginBottom: 8,
              fontWeight: 900,
              letterSpacing: -0.5,
              textTransform: 'uppercase'
            }}>
              Choose Your Franchise
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 16 }}>Select an IPL team to manage in the live auction</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 8, letterSpacing: 2, fontWeight: 700, textTransform: 'uppercase' }}>ROOM CODE</div>
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '12px 32px',
              borderRadius: 'var(--radius-lg)',
              fontFamily: 'monospace',
              fontSize: 32,
              fontWeight: 'bold',
              letterSpacing: 6,
              color: 'var(--warning)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.1)'
            }}>
              {room.id?.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Players List */}
        <div style={{
          ...glassStyle,
          padding: 24,
          marginBottom: 24
        }}>
          <h3 style={{ color: '#fff', marginBottom: 16, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>👥</span> MANAGERS IN LOBBY ({room.humans?.length || 0})
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {room.humans?.map((human, idx) => (
              <div
                key={idx}
                style={{
                  padding: '8px 16px',
                  borderRadius: 50,
                  background: human.socketId === mySocketId
                    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))'
                    : 'rgba(71, 85, 105, 0.3)',
                  border: human.socketId === mySocketId ? '1px solid #60a5fa' : '1px solid rgba(255,255,255,0.05)',
                  color: human.socketId === mySocketId ? '#60a5fa' : '#cbd5e1',
                  fontSize: 14,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                {human.username}
                {human.team && (
                  <span style={{
                    background: TEAM_COLORS[human.team].bg,
                    color: TEAM_COLORS[human.team].text,
                    fontSize: 10,
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontWeight: 'bold'
                  }}>
                    {human.team}
                  </span>
                )}
                {human.socketId === mySocketId && <span style={{ fontSize: 10, opacity: 0.7 }}>(YOU)</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Team Grid */}
        <div style={{
          ...glassStyle,
          padding: 32,
          marginBottom: 24
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 24 }}>
            {IPL_TEAMS.map((team, idx) => {
              const colors = TEAM_COLORS[team];
              const isMine = myTeam === team;
              const takenBy = takenTeams[team];
              const isTakenByOther = takenBy && !isMine;

              return (
                <button
                  key={team}
                  onClick={() => !isTakenByOther && selectTeam(team)}
                  disabled={isTakenByOther}
                  style={{
                    position: 'relative',
                    aspectRatio: '1',
                    borderRadius: 'var(--radius-lg)',
                    border: isMine ? `2px solid ${colors.accent}` : '1px solid var(--glass-border)',
                    background: isMine
                      ? `linear-gradient(135deg, ${colors.bg}40, ${colors.bg}10)`
                      : 'rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 16,
                    cursor: isTakenByOther ? 'not-allowed' : 'pointer',
                    opacity: isTakenByOther ? 0.4 : 1,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isMine ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: isMine ? `0 0 30px -5px ${colors.accent}` : 'none',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={e => !isTakenByOther && (e.currentTarget.style.transform = 'translateY(-5px)', e.currentTarget.style.borderColor = colors.accent)}
                  onMouseLeave={e => !isTakenByOther && (e.currentTarget.style.transform = isMine ? 'scale(1.02)' : 'scale(1)', e.currentTarget.style.borderColor = isMine ? colors.accent : 'var(--glass-border)')}
                >
                  <img
                    src={TEAM_LOGOS[team]}
                    alt={team}
                    style={{
                      width: 80,
                      height: 80,
                      filter: isMine ? 'drop-shadow(0 0 15px rgba(255,255,255,0.3))' : 'grayscale(100%) opacity(0.7)',
                      transition: 'all 0.3s'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div style={{ textAlign: 'center', zIndex: 2 }}>
                    <div style={{
                      color: isMine ? '#fff' : 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: 18,
                      textShadow: isMine ? '0 0 10px rgba(0,0,0,0.5)' : 'none'
                    }}>{team}</div>
                    {isTakenByOther && (
                      <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4, fontWeight: 600 }}>
                        {takenBy.length > 8 ? takenBy.substring(0, 6) + '...' : takenBy}
                      </div>
                    )}
                  </div>

                  {/* Tech diagonal line for decoration */}
                  <div style={{
                    position: 'absolute',
                    top: 0, left: 0, width: '100%', height: '100%',
                    background: `linear-gradient(135deg, transparent 40%, ${colors.accent}10 50%, transparent 60%)`,
                    pointerEvents: 'none',
                    opacity: isMine ? 1 : 0
                  }} />

                  {isMine && (
                    <div style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: colors.accent,
                      color: colors.text === '#000' ? '#000' : '#fff',
                      width: 28,
                      height: 28,
                      borderRadius: '8px', // Squircle
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
                      fontWeight: 'bold'
                    }}>✓</div>
                  )}
                </button>
              );
            })}
          </div>

          {myTeam && (
            <div style={{
              marginTop: 24,
              padding: 16,
              background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.2) 0%, transparent 100%)',
              borderLeft: '4px solid #10b981',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <div style={{ fontSize: 24 }}>🎉</div>
              <div>
                <div style={{ color: '#fff', fontWeight: 600 }}>Excellent Choice!</div>
                <div style={{ color: '#34d399', fontSize: 14 }}>You are managing <strong>{myTeam}</strong>. Waiting for other players...</div>
              </div>
            </div>
          )}
        </div>

        {/* Host Controls */}
        <div style={{
          ...glassStyle,
          padding: 32,
          textAlign: 'center',
          background: 'rgba(15, 23, 42, 0.6)'
        }}>
          {isHost ? (
            <>
              <h2 style={{ color: '#fff', fontSize: 20, marginBottom: 8 }}>Host Controls</h2>
              <p style={{ color: '#94a3b8', marginBottom: 24, fontSize: 14 }}>
                Once all players have joined and selected teams, start the auction.
              </p>
              <button
                onClick={lockTeams}
                style={{
                  padding: '16px 48px',
                  background: 'linear-gradient(135deg, #059669, #10b981)',
                  border: 'none',
                  borderRadius: 50,
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 10px 30px -5px rgba(16, 185, 129, 0.5)',
                  transition: 'transform 0.2s',
                  textTransform: 'uppercase',
                  letterSpacing: 1
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                🔒 Lock Teams & Start Auction
              </button>
            </>
          ) : (
            <div style={{ padding: 10 }}>
              <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.8 }} className="animate-pulse">⏳</div>
              <h3 style={{ color: '#fff', fontSize: 18, marginBottom: 8 }}>Waiting for Host</h3>
              <p style={{ color: '#64748b' }}>The auction will begin soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
