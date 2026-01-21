import { useState, useEffect } from "react";
import { socket } from "../socket";

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    fontFamily: '"Outfit", system-ui, sans-serif',
    position: 'relative',
    overflow: 'hidden'
  },
  glassCard: {
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderRadius: 'var(--radius-xl)',
    padding: 50,
    width: '100%',
    maxWidth: 600, // Wider
    boxShadow: 'var(--glass-shadow)',
    border: '1px solid var(--glass-border)',
    position: 'relative',
    zIndex: 10,
    // Tech Grid Pattern
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px'
  },
  title: {
    textAlign: 'center',
    fontSize: 48,
    fontWeight: 800,
    background: 'linear-gradient(to right, var(--primary-light), var(--secondary-light))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: 8,
    letterSpacing: -1.5,
    textTransform: 'uppercase'
  },
  subtitle: {
    textAlign: 'center',
    color: 'var(--text-secondary)',
    marginBottom: 40,
    fontSize: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: 500
  },
  inputGroup: {
    marginBottom: 24
  },
  input: {
    width: '100%',
    padding: '18px 24px',
    background: 'rgba(0, 0, 0, 0.4)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius-lg)',
    color: 'var(--text-primary)',
    fontSize: 18,
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily: 'monospace'
  },
  button: {
    width: '100%',
    padding: '18px 24px',
    border: 'none',
    borderRadius: 'var(--radius-lg)',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textTransform: 'uppercase',
    letterSpacing: 2,
    position: 'relative',
    overflow: 'hidden'
  },
  primaryBtn: {
    background: 'linear-gradient(135deg, var(--primary) 0%, #0891b2 100%)',
    color: '#fff',
    boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)',
    border: '1px solid rgba(255,255,255,0.1)'
  },
  accentBtn: {
    background: 'linear-gradient(135deg, var(--secondary) 0%, #7c3aed 100%)',
    color: '#fff',
    boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
    border: '1px solid rgba(255,255,255,0.1)'
  },
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '16px 20px',
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius-md)',
    marginBottom: 12,
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    transition: 'all 0.2s',
    userSelect: 'none'
  },
  tabGroup: {
    display: 'flex',
    background: 'rgba(0,0,0,0.3)',
    padding: 6,
    borderRadius: 'var(--radius-lg)',
    marginBottom: 32,
    border: '1px solid var(--glass-border)'
  },
  tab: {
    flex: 1,
    padding: '12px',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: 'transparent',
    color: 'var(--text-muted)'
  },
  activeTab: {
    background: 'var(--glass-bg)',
    color: 'var(--primary-light)',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    border: '1px solid var(--glass-border)'
  },
  error: {
    padding: 16,
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid var(--danger)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--danger)',
    fontSize: 14,
    marginBottom: 24,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontWeight: 500
  }
};

export default function Lobby() {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [allowAI, setAllowAI] = useState(false);
  const [retentionEnabled, setRetentionEnabled] = useState(false);
  const [budget, setBudget] = useState(120); // Default 120 Cr
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'join'

  // Check URL for room code on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlRoomCode = urlParams.get('room') || window.location.pathname.split('/room/')[1];

    if (urlRoomCode) {
      setRoomId(urlRoomCode.toUpperCase());
      setActiveTab('join');
    }

    // Restore saved username if available
    const savedUsername = sessionStorage.getItem("auctionUsername");
    if (savedUsername) {
      setName(savedUsername);
    }
  }, []);

  function createRoom() {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    // Save identity for session persistence
    sessionStorage.setItem("auctionUsername", name.trim());

    socket.emit("create-room", {
      username: name.trim(),
      config: { allowAI, retentionEnabled, budget }
    });
  }

  function joinRoom() {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!roomId.trim()) {
      setError("Please enter the Room Code");
      return;
    }

    // Save identity for session persistence
    sessionStorage.setItem("auctionUsername", name.trim());

    socket.emit("join-room", {
      roomId: roomId.trim().toLowerCase(),
      username: name.trim()
    });
  }

  return (
    <div style={styles.container}>
      {/* Ambient background glow */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        left: '-10%',
        width: '50%',
        height: '50%',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
        filter: 'blur(100px)',
        zIndex: 1
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-20%',
        right: '-10%',
        width: '50%',
        height: '50%',
        background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)',
        filter: 'blur(100px)',
        zIndex: 1
      }} />

      <div style={styles.glassCard}>
        {/* Animated Logo */}
        <div style={{
          fontSize: 64,
          textAlign: 'center',
          marginBottom: 16,
          animation: 'bounce 2s infinite ease-in-out',
          textShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}>
          🏏
        </div>

        <h1 style={styles.title}>IPL AUCTION</h1>
        <p style={styles.subtitle}>The ultimate real-time auction simulator</p>

        <div style={styles.inputGroup}>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, marginBottom: 8, fontWeight: 500 }}>YOUR IDENTITY</label>
          <input
            style={styles.input}
            placeholder="Enter your manager name"
            value={name}
            onChange={e => setName(e.target.value)}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
        </div>

        {error && (
          <div style={styles.error}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Tabs for Create/Join to clean up UI */}
        <div style={styles.tabGroup}>
          <button
            onClick={() => { setActiveTab('create'); setError(''); }}
            style={{
              ...styles.tab,
              ...(activeTab === 'create' ? styles.activeTab : {})
            }}
          >
            CREATE ROOM
          </button>
          <button
            onClick={() => { setActiveTab('join'); setError(''); }}
            style={{
              ...styles.tab,
              ...(activeTab === 'join' ? styles.activeTab : {})
            }}
          >
            JOIN ROOM
          </button>
        </div>

        {activeTab === 'create' ? (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
              <label style={{ ...styles.checkbox, border: allowAI ? '1px solid #3b82f6' : styles.checkbox.border }}>
                <input
                  type="checkbox"
                  checked={allowAI}
                  onChange={e => setAllowAI(e.target.checked)}
                  style={{ width: 18, height: 18 }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', fontWeight: 500 }}>Enable AI Teams</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>Computer manages empty slots</div>
                </div>
              </label>

              <label style={{ ...styles.checkbox, border: retentionEnabled ? '1px solid #10b981' : styles.checkbox.border }}>
                <input
                  type="checkbox"
                  checked={retentionEnabled}
                  onChange={e => setRetentionEnabled(e.target.checked)}
                  style={{ width: 18, height: 18 }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', fontWeight: 500 }}>Enable Retentions</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>Pre-auction retention phase</div>
                </div>
              </label>

              {/* Budget Selector */}
              <div style={{
                ...styles.checkbox,
                border: '1px solid #f59e0b',
                flexDirection: 'column',
                alignItems: 'stretch',
                gap: 12
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 24 }}>💰</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#fff', fontWeight: 500 }}>Team Budget</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>Starting purse for each team</div>
                  </div>
                  <div style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: '#f59e0b',
                    minWidth: 80,
                    textAlign: 'right'
                  }}>
                    ₹{budget} Cr
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: '#9ca3af', fontSize: 12 }}>120</span>
                  <input
                    type="range"
                    min="120"
                    max="200"
                    step="10"
                    value={budget}
                    onChange={e => setBudget(parseInt(e.target.value))}
                    style={{
                      flex: 1,
                      height: 8,
                      cursor: 'pointer',
                      accentColor: '#f59e0b'
                    }}
                  />
                  <span style={{ color: '#9ca3af', fontSize: 12 }}>200</span>
                </div>
              </div>
            </div>

            <button
              style={{ ...styles.button, ...styles.primaryBtn }}
              onClick={createRoom}
            >
              🚀 Launch Auction Room
            </button>
          </div>
        ) : (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={styles.inputGroup}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, marginBottom: 8, fontWeight: 500 }}>ROOM CODE</label>
              <input
                style={{ ...styles.input, fontFamily: 'monospace', letterSpacing: 4, textAlign: 'center', fontSize: 24, textTransform: 'uppercase' }}
                placeholder="ABCD"
                value={roomId}
                onChange={e => setRoomId(e.target.value.toUpperCase())}
                maxLength={8}
                onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
            <button
              style={{ ...styles.button, ...styles.accentBtn }}
              onClick={joinRoom}
            >
              🤝 Enter Room
            </button>
          </div>
        )}
      </div>

      {/* Footer Links for Static Pages */}
      <footer style={{
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        textAlign: 'center',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
          <a href="/about" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 13 }}>About</a>
          <a href="/how-to-play" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 13 }}>How to Play</a>
          <a href="/privacy" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 13 }}>Privacy</a>
          <a href="/terms" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 13 }}>Terms</a>
          <a href="/contact" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 13 }}>Contact</a>
        </div>
        <p style={{ color: '#6b7280', fontSize: 11, marginTop: 8 }}>
          © 2024 IPL Mock Auction. Created by Surendhar.
        </p>
      </footer>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
