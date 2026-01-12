import { useState, useEffect } from "react";
import { socket } from "../socket";
import { getPlayerPhotoUrl, DEFAULT_PLAYER_IMAGE } from "../data/playerPhotos";

export default function Retention({ room }) {
  // Hooks must be called unconditionally at the top
  const [retainedIds, setRetainedIds] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Null safety check - after hooks
  if (!room) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: '"Outfit", sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16, animation: 'bounce 1s infinite' }}>⏳</div>
          <p style={{ fontSize: 24, fontWeight: 600 }}>Loading retention phase...</p>
        </div>
      </div>
    );
  }

  const mySocketId = socket.id;
  const me = room.humans?.find(h => h.socketId === mySocketId);
  const myTeamName = me?.team;

  // Get retainable players for my team
  const retainablePlayers = myTeamName && room.retainablePlayers
    ? (room.retainablePlayers[myTeamName] || [])
    : [];

  // IPL 2025 Rule: Max 6 retentions, RTM cards = 6 - retentions
  const maxRetentions = 6;
  const retentionCosts = room.retentionCosts || [15, 11, 7, 4, 4];
  const purse = room.rules?.purse || 120;

  // Calculate RTM cards user will get
  const rtmCardsWillGet = Math.max(0, maxRetentions - retainedIds.length);

  // Calculate total retention cost
  const totalCost = retainedIds.reduce((sum, _, idx) => {
    return sum + (retentionCosts[idx] || retentionCosts[retentionCosts.length - 1]);
  }, 0);

  const remainingPurse = purse - totalCost;

  function toggleRetention(playerId) {
    if (submitted) return;
    setRetainedIds(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      }
      if (prev.length >= maxRetentions) return prev;
      return [...prev, playerId];
    });
  }

  function submitRetentions() {
    if (!myTeamName) return;

    socket.emit("retain-players", {
      roomId: room.id,
      teamName: myTeamName,
      retainedIds,
      rtmIds: [] // No pre-selection needed
    });
    setSubmitted(true);
  }

  // Auto-submit on selection change (debounced)
  useEffect(() => {
    if (!myTeamName || submitted) return;

    const timeout = setTimeout(() => {
      socket.emit("retain-players", {
        roomId: room.id,
        teamName: myTeamName,
        retainedIds,
        rtmIds: []
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [retainedIds, myTeamName, room.id, submitted]);

  const isRetained = (id) => retainedIds.includes(id);

  // Styles
  const glassStyle = {
    background: 'rgba(30, 41, 59, 0.7)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
  };

  return (
    <div style={{ minHeight: '100vh', padding: 24, fontFamily: '"Outfit", system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          ...glassStyle,
          padding: 24,
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))'
        }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: 28, margin: 0, fontWeight: 800 }}>RETENTION PHASE</h1>
            <p style={{ color: '#94a3b8', margin: '4px 0 0 0' }}>
              Strategic squad planning • Max 6 Retentions
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4, letterSpacing: 1, fontWeight: 600 }}>TIME REMAINING</div>
            <div style={{
              fontSize: 32,
              fontWeight: 900,
              color: timeLeft <= 10 ? '#ef4444' : '#10b981',
              fontVariantNumeric: 'tabular-nums',
              textShadow: timeLeft <= 10 ? '0 0 20px rgba(239, 68, 68, 0.5)' : 'none'
            }}>
              {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
            </div>
          </div>
        </div>

        {myTeamName ? (
          <>
            {/* Stats Panel */}
            <div style={{
              ...glassStyle,
              padding: 24,
              marginBottom: 20,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 20
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 24 }}>🛡️</div>
                <div>
                  <h3 style={{ color: '#fff', margin: 0, fontSize: 18, fontWeight: 700 }}>
                    {myTeamName}
                  </h3>
                  <p style={{ color: '#94a3b8', margin: 0, fontSize: 14 }}>
                    {retainedIds.length} / {maxRetentions} retained
                  </p>
                </div>
              </div>

              <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 12 }}>
                <div style={{ color: '#ef4444', fontSize: 11, marginBottom: 4, fontWeight: 600 }}>RETENTION COST</div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#f87171' }}>
                  ₹{totalCost} Cr
                </div>
              </div>

              <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 12 }}>
                <div style={{ color: '#10b981', fontSize: 11, marginBottom: 4, fontWeight: 600 }}>REMAINING PURSE</div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#34d399' }}>
                  ₹{remainingPurse.toFixed(1)} Cr
                </div>
              </div>

              <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 12 }}>
                <div style={{ color: '#f59e0b', fontSize: 11, marginBottom: 4, fontWeight: 600 }}>RTM CARDS</div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#fbbf24' }}>
                  {rtmCardsWillGet}
                </div>
              </div>
            </div>

            {/* RTM Info Box */}
            <div style={{
              background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.1) 0%, transparent 100%)',
              borderLeft: '4px solid #f59e0b',
              borderRadius: 4,
              padding: 16,
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 16
            }}>
              <span style={{ fontSize: 28 }}>🔄</span>
              <div>
                <div style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: 16 }}>RTM Strategy Guide</div>
                <p style={{ color: '#cbd5e1', fontSize: 13, margin: 0, maxWidth: 600 }}>
                  You retain {retainedIds.length} players, so you will receive <strong style={{ color: '#fff' }}>{rtmCardsWillGet} Right-To-Match cards</strong>.
                  Use these in the auction to instantly match the winning bid for your released players.
                </p>
              </div>
            </div>

            {/* Player Selection Grid */}
            <div style={{
              ...glassStyle,
              padding: 24,
              marginBottom: 24
            }}>
              <h3 style={{ color: '#fff', marginBottom: 20, fontSize: 16, fontWeight: 600, letterSpacing: 1 }}>AVAILABLE SQUAD</h3>

              {retainablePlayers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 48 }}>
                  <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>📋</div>
                  <p style={{ color: '#94a3b8' }}>
                    No players available for retention for {myTeamName}. Please wait for auction.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                  {retainablePlayers.map((player) => {
                    const retained = isRetained(player.id);
                    const retentionIdx = retainedIds.indexOf(player.id);
                    const disabled = submitted;
                    const photoUrl = getPlayerPhotoUrl(player.name) || DEFAULT_PLAYER_IMAGE;

                    return (
                      <div
                        key={player.id}
                        onClick={() => !disabled && toggleRetention(player.id)}
                        style={{
                          padding: 16,
                          borderRadius: 16,
                          border: retained ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                          background: retained
                            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 78, 59, 0.3))'
                            : 'rgba(30, 41, 59, 0.4)',
                          opacity: disabled ? 0.7 : 1,
                          cursor: disabled ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                          overflow: 'hidden',
                          transform: retained ? 'scale(1.02)' : 'scale(1)',
                          boxShadow: retained ? '0 10px 20px -5px rgba(16, 185, 129, 0.3)' : 'none'
                        }}
                      >
                        {/* Selection Indicator */}
                        {retained && (
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            background: '#10b981',
                            color: '#fff',
                            fontSize: 10,
                            fontWeight: 'bold',
                            padding: '4px 8px',
                            borderBottomLeftRadius: 10
                          }}>
                            #{retentionIdx + 1}
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                          <div style={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            padding: 2,
                            background: retained ? '#10b981' : 'rgba(255,255,255,0.1)',
                          }}>
                            <img
                              src={photoUrl}
                              alt={player.name}
                              style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                objectFit: 'cover'
                              }}
                              onError={(e) => { e.target.src = DEFAULT_PLAYER_IMAGE }}
                            />
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ color: '#fff', fontWeight: 600, fontSize: 16, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {player.name}
                            </div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: '#94a3b8' }}>
                              <span style={{
                                background: 'rgba(255,255,255,0.1)',
                                padding: '2px 6px',
                                borderRadius: 4,
                                fontSize: 11
                              }}>{player.role}</span>
                              {player.overseas && <span>✈️ Overseas</span>}
                            </div>

                            {retained && (
                              <div style={{
                                marginTop: 8,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                color: '#34d399',
                                fontSize: 13,
                                fontWeight: 700
                              }}>
                                <span>Cost: ₹{retentionCosts[retentionIdx]} Cr</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div style={{
              ...glassStyle,
              padding: 24,
              textAlign: 'center',
              background: 'rgba(15, 23, 42, 0.6)'
            }}>
              {submitted ? (
                <div style={{ padding: 16, animation: 'fadeIn 0.5s' }}>
                  <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
                  <h2 style={{ color: '#34d399', fontSize: 24, fontWeight: 'bold', margin: 0 }}>
                    Retentions Locked!
                  </h2>
                  <p style={{ color: '#94a3b8', marginTop: 8 }}>
                    Wait for other teams to finish...
                  </p>
                </div>
              ) : (
                <>
                  <button
                    onClick={submitRetentions}
                    style={{
                      padding: '16px 48px',
                      background: 'linear-gradient(135deg, #059669, #10b981)',
                      border: 'none',
                      borderRadius: 50,
                      color: '#fff',
                      fontSize: 18,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 10px 30px -5px rgba(16, 185, 129, 0.5)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 15px 35px -5px rgba(16, 185, 129, 0.6)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 10px 30px -5px rgba(16, 185, 129, 0.5)';
                    }}
                  >
                    CONFIRM RETENTIONS ({retainedIds.length})
                  </button>
                  <p style={{ color: '#64748b', marginTop: 16, fontSize: 13 }}>
                    Your selections are auto-saved. Click to permanently lock.
                  </p>
                </>
              )}
            </div>
          </>
        ) : (
          <div style={{
            ...glassStyle,
            padding: 48,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.8 }}>👀</div>
            <h2 style={{ color: '#fff', marginBottom: 8 }}>Spectating Mode</h2>
            <p style={{ color: '#94a3b8' }}>You are watching the retention phase</p>
          </div>
        )}
      </div>
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
