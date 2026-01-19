import { useState, useEffect, useRef } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { socket } from "../socket";
import Timer from "../components/Timer";
import PlayerCard from "../components/PlayerCard";
import BidControls from "../components/BidControls";
import TeamPanel from "../components/TeamPanel";
import PlayerImage from "../components/PlayerImage";
import { getPlayerPhotoUrl, DEFAULT_PLAYER_IMAGE } from "../data/playerPhotos";
import VoiceChat from "../components/VoiceChat";
import AdBanner from "../components/AdBanner";
import auctionVoice from "../utils/auctionVoice";

// Modal styles
const modalOverlay = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.85)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
};

const modalContent = {
  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.98))',
  borderRadius: 16,
  padding: 24,
  maxWidth: 900,
  maxHeight: '85vh',
  overflow: 'auto',
  width: '95%',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
};

const TEAM_COLORS = {
  CSK: '#f9cd05', MI: '#004ba0', RCB: '#ec1c24', KKR: '#3a225d', SRH: '#ff822a',
  RR: '#ea1a85', DC: '#0078bc', PBKS: '#ed1b24', LSG: '#00b7eb', GT: '#1c1c1c'
};

const ROLE_COLORS = {
  BAT: '#60a5fa', BOWL: '#34d399', AR: '#fbbf24', WK: '#f472b6'
};

// Team logo URLs (using BCCI official sources)
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


export default function Auction({ room }) {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [activeModal, setActiveModal] = useState(null); // 'sets', 'retentions', 'buys'
  const [activeRoleTab, setActiveRoleTab] = useState('BAT');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedSet, setSelectedSet] = useState(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showEndAuctionConfirm, setShowEndAuctionConfirm] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Track previous values for voice announcements
  const prevSetRef = useRef(null);
  const prevPlayerRef = useRef(null);
  const prevSaleRef = useRef(null); // Track specific sale events to prevent duplicates/misses

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Login Gate State (Persistent)
  const [isStatsUnlocked, setIsStatsUnlocked] = useState(() => {
    return localStorage.getItem('isAuctionStatsUnlocked') === 'true';
  });
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('auctionUserProfile');
    return saved ? JSON.parse(saved) : null;
  });

  const [counterAmount, setCounterAmount] = useState(0);
  const [rtmTimeLeft, setRtmTimeLeft] = useState(0);

  useEffect(() => {
    if (room?.rtmEndsAt) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((room.rtmEndsAt - Date.now()) / 1000));
        setRtmTimeLeft(remaining);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [room?.rtmEndsAt]);

  // Voice announcements for auction events
  useEffect(() => {
    if (!voiceEnabled) return;

    const currentSet = room?.currentSet;
    const currentPlayer = room?.currentPlayer;
    const auctionState = room?.auctionState;

    // Announce set change
    const setChanged = currentSet && currentSet !== prevSetRef.current;
    if (setChanged) {
      auctionVoice.announceSet(currentSet);
      prevSetRef.current = currentSet;
    }

    // Announce new player
    if (currentPlayer && currentPlayer.id !== prevPlayerRef.current?.id) {
      // If set changed, queue player announcement (priority=false). 
      // Otherwise interrupt (priority=true).
      const priority = !setChanged;
      auctionVoice.announcePlayer(currentPlayer, priority);

      prevPlayerRef.current = currentPlayer;
    }

    // Announce sold/unsold when bidding ends

    // SPY LOG - unconditional
    // console.log(`[Voice Spy] State: ${auctionState}, LFPlayer: ${!!room?.lastFinalizedPlayer}, Current: ${room?.currentPlayer?.name}`);

    // LOGIC: Check lastFinalizedPlayer for "Sold" or "Unsold" status
    // Note: Backend might send PLAYER_ACTIVE state during skip, so we rely on lastFinalizedPlayer being present

    if (room?.lastFinalizedPlayer) {
      if (room.lastFinalizedPlayer.sold) {
        // SOLD CASE
        const saleKey = `${room.currentPlayer.id}-SOLD-${room.lastFinalizedPlayer.soldTo}`;

        if (saleKey !== prevSaleRef.current) {
          console.log(`[Voice] Announcing SOLD: ${saleKey}`);
          auctionVoice.announceSold(room.lastFinalizedPlayer.soldTo, room.lastFinalizedPlayer.soldPrice);
          prevSaleRef.current = saleKey;
        }
      } else {
        // UNSOLD CASE (lastFinalizedPlayer exists but sold=false)
        const unsoldKey = `${room.lastFinalizedPlayer.id}-UNSOLD`;

        if (unsoldKey !== prevSaleRef.current) {
          console.log(`[Voice] Announcing UNSOLD: ${unsoldKey}`);
          auctionVoice.announceUnsold();
          prevSaleRef.current = unsoldKey;
        }
      }
    }
  }, [room?.currentSet, room?.currentPlayer, room?.auctionState, room?.lastFinalizedPlayer, voiceEnabled]);

  // Toggle voice
  const toggleVoice = () => {
    const newState = auctionVoice.toggle();
    setVoiceEnabled(newState);
  };

  const handleAcceptRTM = () => {
    if (socket) socket.emit("rtm-match", { roomId: room.id });
  };

  const handleDeclineRTM = () => {
    if (socket) socket.emit("rtm-decline", { roomId: room.id });
  };

  const mySocketId = socket.id;
  const myTeam = room.teams.find(t => t.socketId === mySocketId);
  const isHost = room.hostSocketId === mySocketId;
  const progress = room.totalPlayers > 0 ? ((room.currentIndex) / room.totalPlayers) * 100 : 0;

  // Get players for a specific set - use proper auctionSets from backend
  function getPlayersForSet(setName) {
    // Use properly serialized auctionSets from backend
    if (room.auctionSets && room.auctionSets[setName]) {
      return room.auctionSets[setName];
    }
    // Fallback: filter auctionPool by role if auctionSets not available
    const role = setName.replace(/[0-9]/g, '');
    const setNum = parseInt(setName.replace(/[A-Z]/g, '')) || 1;
    const size = role === 'WK' ? 5 : 10;
    const players = room.auctionPool?.filter(p => p.role === role) || [];
    const start = (setNum - 1) * size;
    return players.slice(start, start + size);
  }

  // Handle Google Login Success
  const handleLoginSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      console.log("Login Success:", decoded); // { name, email, picture, ... }

      setUserProfile(decoded);
      localStorage.setItem('auctionUserProfile', JSON.stringify(decoded));

      setIsStatsUnlocked(true);
      localStorage.setItem('isAuctionStatsUnlocked', 'true');
    } catch (error) {
      console.error("Login Failed (Decode Error):", error);
    }
  };

  // Completed State - Enhanced with Summary
  if (room.state === "COMPLETED") {
    const summary = room.summary || {};

    return (
      <div style={{ minHeight: '100vh', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* Victory Header */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.2), rgba(59, 130, 246, 0.2))',
            borderRadius: 20,
            padding: window.innerWidth < 768 ? 24 : 48,
            textAlign: 'center',
            marginBottom: 24,
            border: '1px solid rgba(52, 211, 153, 0.3)'
          }}>
            <div style={{ fontSize: window.innerWidth < 768 ? 60 : 80, marginBottom: 16 }}>🏆</div>
            <h1 style={{ fontSize: window.innerWidth < 768 ? 32 : 42, color: '#34d399', marginBottom: 16 }}>Auction Complete!</h1>

            {/* Team Rankings (Public View) */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.95)',
              borderRadius: 16,
              padding: window.innerWidth < 768 ? 16 : 20,
              marginBottom: 24,
              textAlign: 'left'
            }}>
              <h3 style={{ color: '#fbbf24', margin: '0 0 16px 0', textAlign: window.innerWidth < 768 ? 'center' : 'left' }}>📊 Team Squads & Rankings</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(2, 1fr)',
                gap: 12
              }}>
                {(summary.teamPredictions || []).map((team, idx) => (
                  <div key={idx} style={{
                    padding: 16,
                    background: idx === 0 ? 'rgba(251, 191, 36, 0.1)' : 'rgba(55, 65, 81, 0.3)',
                    borderRadius: 12,
                    border: idx === 0 ? '1px solid rgba(251, 191, 36, 0.3)' : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <span style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: idx < 3 ? '#fbbf24' : '#374151',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: idx < 3 ? '#000' : '#fff', fontWeight: 'bold', fontSize: 14
                      }}>{team.rank}</span>
                      <img
                        src={TEAM_LOGOS[team.name]}
                        alt={team.name}
                        style={{ width: 32, height: 32, borderRadius: 6 }}
                        onError={e => e.target.style.display = 'none'}
                      />
                      <div style={{ color: '#fff', fontWeight: 'bold' }}>{team.name}</div>
                    </div>
                    <div style={{ fontSize: 12, color: '#9ca3af', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Score: <strong style={{ color: '#34d399' }}>{team.score?.toFixed(1)}</strong></span>
                      <span>{team.playerCount} players</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Google Signup Gate */}
            {!isStatsUnlocked ? (
              <div style={{
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
                borderRadius: 16,
                padding: window.innerWidth < 768 ? 24 : 40,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'center',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <div style={{ fontSize: 48, marginBottom: 20 }}>🔒</div>
                <h2 style={{ color: '#fff', marginBottom: 12, fontSize: window.innerWidth < 768 ? 24 : 32 }}>Unlock Complete Auction Stats</h2>
                <p style={{ color: '#9ca3af', marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
                  Sign up with Google to view Best Team, Top Buys, Top Retentions, and detailed Value Picks.
                </p>

                {/* Real Google Login Button */}
                <div style={{ transform: 'scale(1.2)' }}>
                  <GoogleLogin
                    onSuccess={handleLoginSuccess}
                    onError={() => {
                      console.log('Login Failed');
                    }}
                    theme="filled_blue"
                    shape="pill"
                    text="signup_with"
                    useOneTap
                  />
                </div>
                <p style={{ marginTop: 16, fontSize: 12, color: '#666' }}>
                  Note: A valid Client ID is required in main.jsx
                </p>
              </div>
            ) : (
              // Protected Content (Stats)
              <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                <style>{`
                  @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                  }
                `}</style>

                {/* Stats Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: window.innerWidth < 768 ? '1fr 1fr' : 'repeat(4, 1fr)', // 2 cols on mobile, 4 on desktop
                  gap: 16,
                  marginTop: 24
                }}>
                  <div style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    padding: 16,
                    borderRadius: 12,
                    border: '1px solid rgba(59, 130, 246, 0.3)'
                  }}>
                    <div style={{ color: '#60a5fa', fontSize: 28, fontWeight: 'bold' }}>{summary.totalInPool || room.totalPlayers}</div>
                    <div style={{ color: '#9ca3af', fontSize: 12 }}>In Auction Pool</div>
                  </div>
                  <div style={{
                    background: 'rgba(52, 211, 153, 0.2)',
                    padding: 16,
                    borderRadius: 12,
                    border: '1px solid rgba(52, 211, 153, 0.3)'
                  }}>
                    <div style={{ color: '#34d399', fontSize: 28, fontWeight: 'bold' }}>{summary.totalPlayersSold || 0}</div>
                    <div style={{ color: '#9ca3af', fontSize: 12 }}>Sold in Auction</div>
                  </div>
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    padding: 16,
                    borderRadius: 12,
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                  }}>
                    <div style={{ color: '#ef4444', fontSize: 28, fontWeight: 'bold' }}>{summary.totalUnsold || 0}</div>
                    <div style={{ color: '#9ca3af', fontSize: 12 }}>Unsold</div>
                  </div>
                  <div style={{
                    background: 'rgba(251, 191, 36, 0.2)',
                    padding: 16,
                    borderRadius: 12,
                    border: '1px solid rgba(251, 191, 36, 0.3)'
                  }}>
                    <div style={{ color: '#fbbf24', fontSize: 28, fontWeight: 'bold' }}>{summary.totalPlayersAutoFilled || 0}</div>
                    <div style={{ color: '#9ca3af', fontSize: 12 }}>Auto-Filled</div>
                  </div>
                </div>

                {/* Best Team Card */}
                {/* Best Team Card */}
                {summary.bestTeam && (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2))',
                    borderRadius: 16,
                    padding: 24,
                    marginBottom: 24,
                    border: '1px solid rgba(251, 191, 36, 0.4)',
                    display: 'flex',
                    flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                    alignItems: 'center',
                    gap: 20,
                    textAlign: window.innerWidth < 768 ? 'center' : 'left'
                  }}>
                    <img
                      src={TEAM_LOGOS[summary.bestTeam.name]}
                      alt={summary.bestTeam.name}
                      style={{ width: 80, height: 80, borderRadius: 12 }}
                      onError={e => e.target.style.display = 'none'}
                    />
                    <div>
                      <div style={{ color: '#fbbf24', fontSize: 14, fontWeight: 500 }}>🥇 BEST TEAM</div>
                      <div style={{ color: '#fff', fontSize: 32, fontWeight: 'bold' }}>{summary.bestTeam.name}</div>
                      <div style={{ color: '#9ca3af' }}>
                        {summary.bestTeam.playerCount} players • Score: {summary.bestTeam.score?.toFixed(1)}
                      </div>
                      <div style={{ color: '#34d399', fontSize: 14, marginTop: 4 }}>
                        {summary.bestTeam.reason}
                      </div>
                    </div>
                  </div>
                )}

                {/* Top Auction Buys & Top Retentions */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(2, 1fr)',
                  gap: 20,
                  marginBottom: 24
                }}>
                  <div style={{ background: 'rgba(30, 41, 59, 0.95)', borderRadius: 16, padding: 20 }}>
                    <h3 style={{ color: '#f472b6', margin: '0 0 16px 0' }}>💰 Top Auction Buys</h3>
                    {(summary.topBuys || []).map((buy, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ color: '#9ca3af', width: 20 }}>{idx + 1}.</span>
                          <PlayerImage name={buy.name} role={buy.role} size={36} showRole={false} />
                          <div>
                            <div style={{ color: '#fff', fontWeight: 500 }}>{buy.name} {buy.overseas && '✈️'}</div>
                            <div style={{ color: '#9ca3af', fontSize: 12 }}>{buy.team}</div>
                          </div>
                        </div>
                        <span style={{ color: '#34d399', fontWeight: 'bold' }}>₹{buy.price} Cr</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ background: 'rgba(30, 41, 59, 0.95)', borderRadius: 16, padding: 20 }}>
                    <h3 style={{ color: '#fbbf24', margin: '0 0 16px 0' }}>🔒 Top Retentions</h3>
                    {(summary.topRetentions || []).map((player, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ color: '#9ca3af', width: 20 }}>{idx + 1}.</span>
                          <PlayerImage name={player.name} role={player.role} size={36} showRole={false} />
                          <div>
                            <div style={{ color: '#fff', fontWeight: 500 }}>{player.name} {player.overseas && '✈️'}</div>
                            <div style={{ color: '#9ca3af', fontSize: 12 }}>{player.team}</div>
                          </div>
                        </div>
                        <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>₹{player.price} Cr</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Best Value Picks */}
                <div style={{ background: 'rgba(30, 41, 59, 0.95)', borderRadius: 16, padding: 20, marginBottom: 24 }}>
                  <h3 style={{ color: '#60a5fa', margin: '0 0 16px 0' }}>🎯 Best Value Picks</h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: window.innerWidth < 768 ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)',
                    gap: 16
                  }}>
                    {(summary.bestPicks || []).map((pick, idx) => (
                      <div key={idx} style={{ background: 'rgba(59, 130, 246, 0.1)', borderRadius: 12, padding: 16, textAlign: 'center', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                        <div style={{ marginBottom: 8 }}><PlayerImage name={pick.name} role={pick.role} size={50} showRole={false} /></div>
                        <div style={{ color: '#fff', fontWeight: 500, fontSize: 13, marginBottom: 4 }}>{pick.name} {pick.overseas && '✈️'}</div>
                        <div style={{ color: '#9ca3af', fontSize: 11, marginBottom: 4 }}>{pick.team}</div>
                        <div style={{ color: '#60a5fa', fontWeight: 'bold' }}>₹{pick.price} Cr</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Full Team Squads */}
          <TeamPanel teams={room.teams} />
        </div>
      </div >
    );
  }

  // Loading State
  if (!room.currentPlayer) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{
          background: 'rgba(30, 41, 59, 0.95)',
          borderRadius: 16,
          padding: 48,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <h2 style={{ color: '#fff', marginBottom: 8 }}>Starting Auction...</h2>
          <p style={{ color: '#9ca3af' }}>Please wait</p>
        </div>
      </div>
    );
  }

  const navButton = (label, emoji, onClick, isActive) => (
    <button
      onClick={onClick}
      style={{
        padding: '12px 20px',
        background: isActive ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))' : 'rgba(255, 255, 255, 0.05)',
        border: isActive ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 'var(--radius-md)',
        color: isActive ? '#fff' : 'var(--text-secondary)',
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        transition: 'all 0.2s ease',
        boxShadow: isActive ? '0 0 15px rgba(59, 130, 246, 0.2)' : 'none'
      }}
      onMouseEnter={e => !isActive && (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
      onMouseLeave={e => !isActive && (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
    >
      <span style={{ fontSize: 18 }}>{emoji}</span> {label}
    </button>
  );

  // Player card with sold/unsold stamp
  const PlayerMiniCard = ({ player, isCurrent }) => {
    const isSold = player.sold === true && player.soldTo;
    // Player is unsold if: not sold, not current, and has been processed (soldTo is explicitly null or undefined but not sold)
    const playerIdx = room.auctionPool?.findIndex(p => p.id === player.id) ?? -1;
    const isUnsold = !isSold && !isCurrent && playerIdx !== -1 && playerIdx < room.currentIndex;

    return (
      <div style={{
        position: 'relative',
        padding: 12,
        borderRadius: 10,
        background: isCurrent
          ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3))'
          : 'rgba(55, 65, 81, 0.4)',
        border: isCurrent
          ? '2px solid #3b82f6'
          : isSold
            ? '1px solid rgba(52, 211, 153, 0.3)'
            : '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        overflow: 'hidden'
      }}>
        {/* Player Photo */}
        <div style={{
          width: 50,
          height: 50,
          borderRadius: 8,
          background: `linear-gradient(135deg, ${ROLE_COLORS[player.role]}40, ${ROLE_COLORS[player.role]}20)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          flexShrink: 0,
          overflow: 'hidden'
        }}>
          <img
            src={getPlayerPhotoUrl(player.name) || DEFAULT_PLAYER_IMAGE}
            alt={player.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
            onError={(e) => {
              if (e.target.src !== DEFAULT_PLAYER_IMAGE) {
                e.target.src = DEFAULT_PLAYER_IMAGE;
              }
            }}
          />
        </div>

        {/* Player Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            color: '#fff',
            fontWeight: 500,
            fontSize: 14,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {player.name} {player.overseas && '✈️'}
          </div>
          <div style={{ color: ROLE_COLORS[player.role], fontSize: 11 }}>
            {player.role} • ₹{player.basePrice || 0.5} Cr
          </div>
          {isSold && player.soldTo && (
            <div style={{
              color: '#34d399',
              fontSize: 11,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              <img
                src={TEAM_LOGOS[player.soldTo]}
                alt={player.soldTo}
                style={{ width: 16, height: 16, borderRadius: 4 }}
                onError={e => e.target.style.display = 'none'}
              />
              {player.soldTo} • ₹{player.soldPrice} Cr
            </div>
          )}
          {/* Always show Overseas badge if applicable */}
          {player.overseas && (
            <div style={{
              color: '#ff6b6b',
              fontSize: 10,
              fontWeight: 'bold',
              marginTop: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              ✈️ OVERSEAS
            </div>
          )}
        </div>

        {/* Current indicator */}
        {
          isCurrent && (
            <div style={{
              position: 'absolute',
              top: 6,
              right: 6,
              background: '#3b82f6',
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 'bold',
              color: '#fff'
            }}>LIVE</div>
          )
        }

        {/* SOLD Stamp */}
        {
          isSold && !isCurrent && (
            <div className="stamp-sold" style={{
              position: 'absolute',
              top: '50%',
              right: 10,
              background: 'rgba(52, 211, 153, 0.95)',
              padding: '6px 16px',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 'bold',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(52, 211, 153, 0.5)',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              letterSpacing: 1
            }}>SOLD</div>
          )
        }

        {/* UNSOLD Stamp */}
        {
          isUnsold && !isCurrent && (
            <div className="stamp-unsold" style={{
              position: 'absolute',
              top: '50%',
              right: 10,
              background: 'rgba(239, 68, 68, 0.95)',
              padding: '6px 16px',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 'bold',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.5)',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              letterSpacing: 1
            }}>UNSOLD</div>
          )
        }
      </div >
    );
  };

  return (
    <div className="auction-container" style={{ minHeight: '100vh', padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <VoiceChat roomId={room.id} />
      <div style={{ maxWidth: 1400, margin: '0 auto', paddingBottom: 100 }}>

        {/* Top Ad Banner (Mobile Only - usually good for revenue) */}
        <div className="mobile-only-ad" style={{ marginBottom: 16, display: 'none' }}>
          <AdBanner slotId="TOP_MOBILE_SLOT" style={{ width: '100%', height: 50 }} />
        </div>

        {/* Header - Premium Glassmorphism */}
        <div style={{
          borderRadius: 'var(--radius-lg)',
          padding: '16px 24px',
          marginBottom: 16,
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--glass-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}>
          {/* Left Side: Room Code & Voice Toggle & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            {/* Room Code & Toggle Group */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '8px 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#94a3b8', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>Room Code</span>
                <span style={{ color: '#fff', fontSize: 20, fontWeight: 700, letterSpacing: 1, fontFamily: 'monospace' }}>{room.id.toUpperCase()}</span>
              </div>

              {/* Voice Toggle Button */}
              <button
                onClick={toggleVoice}
                title={voiceEnabled ? "Mute Voice" : "Enable Voice"}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  cursor: 'pointer',
                  color: voiceEnabled ? '#4ade80' : '#f87171',
                  transition: 'all 0.2s'
                }}
              >
                {voiceEnabled ? '🔊' : '🔇'}
              </button>
            </div>

            {/* Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 32 }}>🏏</span>
              <div>
                <h1 style={{ color: '#fff', fontSize: 20, margin: 0 }}>Live Auction</h1>
                <p style={{ color: '#9ca3af', fontSize: 12, margin: 0 }}>
                  Room: {room.id?.toUpperCase()} {room.config?.allowAI && '• 🤖 AI'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: Set Info & Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            {/* Current Set Badge */}
            {room.currentSet && (
              <div style={{
                background: 'rgba(59, 130, 246, 0.2)',
                padding: '8px 16px',
                borderRadius: 8,
                border: '1px solid rgba(59, 130, 246, 0.5)',
                cursor: 'pointer'
              }} onClick={() => { setSelectedSet(room.currentSet); setActiveModal('sets'); }}>
                <div style={{ color: '#9ca3af', fontSize: 10, textTransform: 'uppercase' }}>Current Set</div>
                <div style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: 18 }}>{room.currentSet}</div>
              </div>
            )}

            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#9ca3af', fontSize: 12 }}>PROGRESS</div>
              <div style={{ color: '#fff', fontWeight: 'bold' }}>
                {room.currentIndex + 1} / {room.totalPlayers}
              </div>
            </div>

            {/* Progress Bar Mini */}
            <div style={{
              width: 120,
              height: 8,
              background: '#374151',
              borderRadius: 4,
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
                transition: 'width 0.5s'
              }} />
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', width: window.innerWidth < 768 ? '100%' : 'auto' }}>
            {navButton('Search', '🔍', () => setActiveModal('search'), activeModal === 'search')}
            {navButton('Sets', '📋', () => { setSelectedSet(room.currentSet); setActiveModal('sets'); }, activeModal === 'sets')}
            {navButton('Retentions', '🔒', () => setActiveModal('retentions'), activeModal === 'retentions')}
            {navButton('Team Buys', '🛒', () => setActiveModal('teamBuys'), activeModal === 'teamBuys')}
          </div>
          {isHost && (
            <button
              onClick={() => setShowEndAuctionConfirm(true)}
              style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                border: 'none',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: 14,
                boxShadow: '0 2px 4px rgba(220, 38, 38, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              End Auction
            </button>
          )}
        </div>
      </div>

      {/* Search Modal */}
      {
        activeModal === 'search' && (
          <div style={modalOverlay} onClick={() => setActiveModal(null)}>
            <div style={{ ...modalContent, maxWidth: 600 }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ color: '#fff', margin: 0 }}>🔍 Search Players</h2>
                <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 24, cursor: 'pointer' }}>×</button>
              </div>

              <input
                type="text"
                placeholder="Type player name..."
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 8,
                  background: 'rgba(55, 65, 81, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  fontSize: 16,
                  marginBottom: 20
                }}
              />

              <div style={{ maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(() => {
                  const query = searchQuery.toLowerCase().trim();
                  if (!query) return <div style={{ color: '#9ca3af', textAlign: 'center' }}>Type to search...</div>;

                  // Flatten all players with Set info
                  const allPlayers = [];
                  if (room.auctionSets) {
                    Object.entries(room.auctionSets).forEach(([setName, players]) => {
                      players.forEach(p => allPlayers.push({ ...p, setName }));
                    });
                  } else {
                    // Fallback to pool if sets not ready
                    (room.auctionPool || []).forEach(p => allPlayers.push({ ...p, setName: 'Pool' }));
                  }

                  const results = allPlayers.filter(p => p.name.toLowerCase().includes(query));

                  if (results.length === 0) return <div style={{ color: '#9ca3af', textAlign: 'center' }}>No players found</div>;

                  return results.map(player => (
                    <div key={player.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      background: 'rgba(55, 65, 81, 0.3)', padding: 12, borderRadius: 10,
                      position: 'relative' // For absolute positioning if needed, or flex
                    }}>
                      <PlayerImage name={player.name} role={player.role} size={50} showRole={false} />
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#fff', fontWeight: 500 }}>{player.name}</div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                          <span style={{ fontSize: 12, color: ROLE_COLORS[player.role] }}>{player.role}</span>
                          <span style={{ fontSize: 12, color: '#9ca3af' }}>₹{player.basePrice || 0.5} Cr</span>
                          {player.soldTo && <span style={{ fontSize: 12, color: '#34d399' }}>Sold to {player.soldTo}</span>}
                        </div>
                      </div>

                      {/* Right side controls/badges */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                        {/* Set Badge */}
                        <div style={{
                          background: 'rgba(30, 41, 59, 0.8)',
                          border: `1px solid ${ROLE_COLORS[player.role] || '#fff'}`,
                          color: ROLE_COLORS[player.role] || '#fff',
                          padding: '2px 6px',
                          borderRadius: 6,
                          fontWeight: 'bold',
                          fontSize: 10
                        }}>
                          {player.setName}
                        </div>
                        {/* Overseas Badge - Button Style */}
                        {player.overseas && (
                          <div style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid #ef4444',
                            color: '#f87171',
                            padding: '2px 6px',
                            borderRadius: 6,
                            fontWeight: 'bold',
                            fontSize: 10,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}>
                            ✈️ OS
                          </div>
                        )}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        )
      }

      {/* Retention Modal - Placeholder for now */}
      {
        activeModal === 'retentions' && (
          <div style={modalOverlay} onClick={() => setActiveModal(null)}>
            <div style={{ ...modalContent, maxWidth: 600 }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ color: '#fff', margin: 0 }}>🔒 Retentions</h2>
                <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 24, cursor: 'pointer' }}>×</button>
              </div>
              <p style={{ color: '#9ca3af', textAlign: 'center' }}>
                Retention functionality coming soon!
              </p>
            </div>
          </div>
        )
      }

      {/* Custom End Auction Confirmation Modal */}
      {
        showEndAuctionConfirm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.98))',
              borderRadius: 20,
              padding: 32,
              textAlign: 'center',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              maxWidth: 400
            }}>
              <div style={{ fontSize: 60, marginBottom: 16 }}>🏁</div>
              <h2 style={{ color: '#fff', marginBottom: 8 }}>End Auction Early?</h2>
              <p style={{ color: '#9ca3af', marginBottom: 24 }}>
                All teams will be auto-filled to complete their squads with remaining players based on role requirements.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button
                  onClick={() => setShowEndAuctionConfirm(false)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: 10,
                    background: 'rgba(55, 65, 81, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    fontSize: 16
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log('[End Auction] User confirmed! Emitting end-auction for room:', room.id);
                    socket.emit('end-auction', { roomId: room.id });
                    console.log('[End Auction] Emit sent!');
                    setShowEndConfirm(false);
                  }}
                  style={{
                    padding: '12px 24px',
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: 16,
                    fontWeight: 'bold'
                  }}
                >
                  🏁 End Auction
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Sold/Unsold Result Overlay - Shows for 5 seconds after player finalized */}
      {
        room.lastFinalizedPlayer && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            backdropFilter: 'blur(8px)'
          }}>
            <div className={room.lastFinalizedPlayer.sold ? 'big-buy-celebrate' : ''} style={{
              textAlign: 'center',
              padding: 48,
              position: 'relative'
            }}>

              {/* Confetti for Sold */}
              {room.lastFinalizedPlayer.sold && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '100vw',
                  height: '100vh',
                  overflow: 'hidden',
                  pointerEvents: 'none',
                  zIndex: -1
                }}>
                  {[...Array(50)].map((_, i) => (
                    <div key={i} style={{
                      position: 'absolute',
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      width: 10,
                      height: 10,
                      background: ['#f00', '#0f0', '#00f', '#ff0', '#f0f'][Math.floor(Math.random() * 5)],
                      animation: `confetti ${1 + Math.random()}s linear infinite`,
                      borderRadius: '50%'
                    }} />
                  ))}
                </div>
              )}

              {/* Hammer Graphic - Only if Sold */}
              {room.lastFinalizedPlayer.sold && (
                <div className="hammer-thump" style={{
                  fontSize: 120,
                  marginBottom: -40,
                  position: 'relative',
                  zIndex: 10,
                  textShadow: '0 0 50px rgba(255, 215, 0, 0.5)'
                }}>
                  🔨
                </div>
              )}

              {/* Unsold Graphic */}
              {!room.lastFinalizedPlayer.sold && (
                <div style={{
                  fontSize: 100,
                  marginBottom: 24,
                  animation: 'slideIn 0.5s ease-out'
                }}>
                  😶
                </div>
              )}

              {/* Player Photo with Glow */}
              <div style={{
                position: 'relative',
                display: 'inline-block',
                marginBottom: 24
              }}>
                <div style={{
                  width: 'clamp(150px, 40vw, 200px)',
                  height: 'clamp(150px, 40vw, 200px)',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                  padding: 8,
                  border: room.lastFinalizedPlayer.sold
                    ? '4px solid #34d399'
                    : '4px solid #ef4444',
                  boxShadow: room.lastFinalizedPlayer.sold
                    ? '0 0 50px rgba(52, 211, 153, 0.6)'
                    : '0 0 50px rgba(239, 68, 68, 0.3)',
                }}>
                  <img
                    src={getPlayerPhotoUrl(room.lastFinalizedPlayer.name) || DEFAULT_PLAYER_IMAGE}
                    alt={room.lastFinalizedPlayer.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '50%'
                    }}
                    onError={(e) => {
                      if (e.target.src !== DEFAULT_PLAYER_IMAGE) e.target.src = DEFAULT_PLAYER_IMAGE;
                    }}
                  />
                </div>

                {/* Result Stamp */}
                <div style={{
                  position: 'absolute',
                  bottom: window.innerWidth < 768 ? '50%' : 10,
                  left: '50%',
                  top: window.innerWidth < 768 ? '50%' : 'auto',
                  transform: window.innerWidth < 768
                    ? 'translate(-50%, -50%) rotate(-15deg) scale(1.5)'
                    : 'translateX(-50%) rotate(-15deg)',
                  background: room.lastFinalizedPlayer.sold ? '#10b981' : '#ef4444',
                  color: '#fff',
                  padding: '8px 32px',
                  borderRadius: 12,
                  fontSize: 32,
                  fontWeight: 900,
                  border: '4px solid #fff',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  animation: room.lastFinalizedPlayer.sold ? 'stampSold 0.5s forwards' : 'stampUnsold 0.6s forwards',
                  zIndex: 10
                }}>
                  {room.lastFinalizedPlayer.sold ? 'SOLD' : 'UNSOLD'}
                </div>
              </div>

              {/* Text Details */}
              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', width: '100%' }}>
                <h2 style={{
                  fontSize: 48,
                  margin: '0 0 12px 0',
                  color: '#fff',
                  textShadow: '0 4px 12px rgba(0,0,0,0.5)'
                }}>
                  {room.lastFinalizedPlayer.name}
                </h2>

                {room.lastFinalizedPlayer.sold ? (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: window.innerWidth < 768 ? 8 : 16,
                    background: 'rgba(255,255,255,0.1)',
                    padding: window.innerWidth < 768 ? '12px 16px' : '16px 32px',
                    borderRadius: 50,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                    maxWidth: '100%'
                  }}>
                    <span style={{ fontSize: window.innerWidth < 768 ? 18 : 24, color: '#9ca3af' }}>Sold to</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img
                        src={TEAM_LOGOS[room.lastFinalizedPlayer.soldTo]}
                        alt={room.lastFinalizedPlayer.soldTo}
                        style={{ width: 48, height: 48, borderRadius: 12 }}
                      />
                      <span style={{ fontSize: 36, fontWeight: 'bold', color: '#fff' }}>
                        {room.lastFinalizedPlayer.soldTo}
                      </span>
                    </div>
                    <span style={{
                      fontSize: 36,
                      fontWeight: 'bold',
                      color: '#34d399',
                      marginLeft: window.innerWidth < 768 ? 0 : 16
                    }}>
                      ₹{room.lastFinalizedPlayer.soldPrice} Cr
                    </span>
                  </div>
                ) : (
                  <div style={{
                    color: '#ef4444',
                    fontSize: 24,
                    fontWeight: 'bold',
                    background: 'rgba(239, 68, 68, 0.1)',
                    padding: '12px 24px',
                    borderRadius: 12,
                    display: 'inline-block'
                  }}>
                    Passed
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }

      {/* RTM Decision Overlay - Shows when RTM is pending */}
      {
        room.rtmPending && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            overflow: 'auto',
            padding: '20px 0'
          }}>
            <div style={{
              textAlign: 'center',
              padding: 24,
              maxWidth: 500,
              width: '95%'
            }}>
              {/* RTM Badge */}
              <div style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                padding: '8px 20px',
                borderRadius: 10,
                display: 'inline-block',
                marginBottom: 12
              }}>
                <span style={{ fontSize: 20, fontWeight: 'bold', color: '#fff' }}>⚡ RIGHT TO MATCH</span>
              </div>

              {/* Player Info Row - Compact */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                marginBottom: 12,
                background: 'rgba(251, 191, 36, 0.1)',
                padding: 12,
                borderRadius: 12,
                border: '1px solid rgba(251, 191, 36, 0.3)'
              }}>
                {/* Player Photo - Smaller */}
                <div style={{
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(245, 158, 11, 0.3))',
                  border: '3px solid #f59e0b',
                  overflow: 'hidden',
                  flexShrink: 0
                }}>
                  <img
                    src={getPlayerPhotoUrl(room.rtmPending.playerName) || DEFAULT_PLAYER_IMAGE}
                    alt={room.rtmPending.playerName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = DEFAULT_PLAYER_IMAGE;
                    }}
                  />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ color: '#fff', fontSize: 22, fontWeight: 'bold' }}>{room.rtmPending.playerName}</div>
                  <div style={{ color: '#9ca3af', fontSize: 13 }}>
                    Bid by <strong style={{ color: '#60a5fa' }}>{room.rtmPending.buyingTeamName}</strong>: <strong style={{ color: '#34d399' }}>₹{room.rtmPending.currentBid} Cr</strong>
                  </div>
                  {room.rtmPending.buyingTeamCounter && (
                    <div style={{ color: '#f59e0b', fontSize: 13, marginTop: 2 }}>
                      Counter: ₹{room.rtmPending.buyingTeamCounter} Cr
                    </div>
                  )}
                </div>
              </div>

              {/* RTM Team Info - Compact */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                marginBottom: 16
              }}>
                <img
                  src={TEAM_LOGOS[room.rtmPending.rtmTeamName]}
                  alt={room.rtmPending.rtmTeamName}
                  style={{ width: 40, height: 40, borderRadius: 8, border: '2px solid #f59e0b' }}
                  onError={(e) => e.target.style.display = 'none'}
                />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ color: '#f59e0b', fontSize: 12 }}>RTM FOR</div>
                  <div style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
                    {room.rtmPending.rtmTeamName}
                    <span style={{ color: '#9ca3af', fontSize: 12, marginLeft: 8 }}>
                      ({room.rtmCardsRemaining?.[room.rtmPending.rtmTeamName] || 0} cards left)
                    </span>
                  </div>
                </div>
              </div>

              {/* RTM Timer - Countdown */}
              {room.rtmEndsAt && (
                <div style={{
                  background: 'rgba(0,0,0,0.4)',
                  borderRadius: 20,
                  padding: '4px 12px',
                  color: rtmTimeLeft < 10 ? '#ef4444' : '#fff',
                  fontWeight: 'bold',
                  fontSize: 14,
                  marginBottom: 16,
                  border: `1px solid ${rtmTimeLeft < 10 ? '#ef4444' : 'rgba(255,255,255,0.2)'}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <span>⏱️</span>
                  <span>{rtmTimeLeft}s</span>
                </div>
              )}

              {/* RTM Decision Buttons - Context depends on state and team */}
              {room.auctionState === 'RTM_PENDING' && myTeam?.name === room.rtmPending.rtmTeamName ? (
                // Initial RTM decision - RTM team can match or decline
                <div>
                  <div style={{ color: '#f59e0b', fontSize: 18, marginBottom: 20, fontWeight: 500 }}>
                    Your team has Right to Match! Will you match the bid?
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: 16,
                    justifyContent: 'center',
                    flexDirection: window.innerWidth < 768 ? 'column' : 'row' // Stack on mobile
                  }}>
                    <button
                      onClick={() => {
                        console.log('[RTM] Matching bid');
                        socket.emit('rtm-match', { roomId: room.id });
                      }}
                      style={{
                        padding: '16px 40px',
                        borderRadius: 12,
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: 18,
                        fontWeight: 'bold',
                        boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)',
                        width: window.innerWidth < 768 ? '100%' : 'auto'
                      }}
                    >
                      ✓ MATCH (₹{room.rtmPending.currentBid} Cr)
                    </button>
                    <button
                      onClick={() => {
                        console.log('[RTM] Declining RTM');
                        socket.emit('rtm-decline', { roomId: room.id });
                      }}
                      style={{
                        padding: '16px 40px',
                        borderRadius: 12,
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: 18,
                        fontWeight: 'bold',
                        boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)',
                        width: window.innerWidth < 768 ? '100%' : 'auto'
                      }}
                    >
                      ✗ DECLINE
                    </button>
                  </div>
                </div>
              ) : room.auctionState === 'RTM_COUNTER_PENDING' && myTeam?.name === room.rtmPending.buyingTeamName ? (
                // Buying team can counter or accept
                (() => {
                  const minCounter = room.rtmPending.currentBid + 0.25;
                  const maxCounter = myTeam?.budget || 120;
                  const effectiveCounter = counterAmount > 0 ? counterAmount : minCounter;

                  return (
                    <div>
                      <div style={{ color: '#60a5fa', fontSize: 18, marginBottom: 16, fontWeight: 500 }}>
                        {room.rtmPending.rtmTeamName} matched your bid! Make a counter-offer:
                      </div>

                      {/* Counter Amount Input */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 12,
                        marginBottom: 20,
                        background: 'rgba(59, 130, 246, 0.1)',
                        padding: 20,
                        borderRadius: 12,
                        border: '1px solid rgba(59, 130, 246, 0.3)'
                      }}>
                        {/* Amount Display and Input */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ color: '#9ca3af', fontSize: 14 }}>Counter:</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ color: '#60a5fa', fontSize: 24 }}>₹</span>
                            <input
                              type="number"
                              value={counterAmount > 0 ? counterAmount : minCounter}
                              onChange={(e) => {
                                let val = parseFloat(e.target.value) || minCounter;
                                val = Math.max(minCounter, Math.min(val, maxCounter));
                                setCounterAmount(val);
                              }}
                              step="0.25"
                              min={minCounter}
                              max={maxCounter}
                              style={{
                                width: 100,
                                padding: '8px 12px',
                                fontSize: 24,
                                fontWeight: 'bold',
                                background: 'rgba(30, 41, 59, 0.8)',
                                border: '2px solid #3b82f6',
                                borderRadius: 8,
                                color: '#fff',
                                textAlign: 'center'
                              }}
                            />
                            <span style={{ color: '#60a5fa', fontSize: 24 }}>Cr</span>
                          </div>
                        </div>

                        {/* Slider */}
                        <div style={{ width: '100%', maxWidth: 400 }}>
                          <input
                            type="range"
                            min={minCounter}
                            max={maxCounter}
                            step="0.25"
                            value={counterAmount > 0 ? counterAmount : minCounter}
                            onChange={(e) => setCounterAmount(parseFloat(e.target.value))}
                            style={{
                              width: '100%',
                              height: 8,
                              appearance: 'none',
                              background: `linear-gradient(to right, #3b82f6 ${((effectiveCounter - minCounter) / (maxCounter - minCounter)) * 100}%, #374151 0%)`,
                              borderRadius: 4,
                              cursor: 'pointer'
                            }}
                          />
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                            <span style={{ color: '#9ca3af', fontSize: 11 }}>Min: ₹{minCounter.toFixed(2)} Cr</span>
                            <span style={{ color: '#9ca3af', fontSize: 11 }}>Your Budget: ₹{maxCounter.toFixed(2)} Cr</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                        <button
                          onClick={() => {
                            const amount = counterAmount > 0 ? counterAmount : minCounter;
                            console.log('[RTM] Counter offer:', amount);
                            socket.emit('rtm-counter', { roomId: room.id, counterAmount: amount });
                            setCounterAmount(0);
                          }}
                          style={{
                            padding: '14px 32px',
                            borderRadius: 12,
                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            border: 'none',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: 16,
                            fontWeight: 'bold',
                            boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)'
                          }}
                        >
                          📤 Counter at ₹{(counterAmount > 0 ? counterAmount : minCounter).toFixed(2)} Cr
                        </button>
                        <button
                          onClick={() => {
                            console.log('[RTM] Skipping counter');
                            socket.emit('rtm-skip-counter', { roomId: room.id });
                            setCounterAmount(0);
                          }}
                          style={{
                            padding: '14px 32px',
                            borderRadius: 12,
                            background: 'linear-gradient(135deg, #6b7280, #4b5563)',
                            border: 'none',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: 16,
                            fontWeight: 'bold'
                          }}
                        >
                          Skip Counter
                        </button>
                      </div>
                    </div>
                  )
                })()
              ) : room.auctionState === 'RTM_FINAL_PENDING' && myTeam?.name === room.rtmPending.rtmTeamName ? (
                // RTM Team Final Decision: Match Counter or Decline
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#f59e0b', fontSize: 18, marginBottom: 20, fontWeight: 500 }}>
                    <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>{room.rtmPending.buyingTeamName}</span> countered with <span style={{ color: '#fff', fontWeight: 'bold' }}>₹{room.rtmPending.buyingTeamCounter} Cr</span>!
                    <br />Will you match this price?
                  </div>
                  <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                    <button
                      onClick={() => {
                        console.log('[RTM] Matching counter');
                        socket.emit('rtm-final', { roomId: room.id, decision: 'match' });
                      }}
                      style={{
                        padding: '16px 40px',
                        borderRadius: 12,
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: 18,
                        fontWeight: 'bold',
                        boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)'
                      }}
                    >
                      ✓ MATCH (₹{room.rtmPending.buyingTeamCounter} Cr)
                    </button>
                    <button
                      onClick={() => {
                        console.log('[RTM] Declining counter');
                        socket.emit('rtm-final', { roomId: room.id, decision: 'decline' });
                      }}
                      style={{
                        padding: '16px 40px',
                        borderRadius: 12,
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: 18,
                        fontWeight: 'bold',
                        boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)'
                      }}
                    >
                      ✗ DECLINE
                    </button>
                  </div>
                </div>
              ) : (
                // Waiting State (for non-active teams or other states)
                <div style={{
                  background: 'rgba(255,255,255,0.05)',
                  padding: 16,
                  borderRadius: 12,
                  textAlign: 'center',
                  color: '#9ca3af'
                }}>
                  {room.auctionState === 'RTM_FINAL_PENDING' ? (
                    <span>Waiting for <strong style={{ color: '#f59e0b' }}>{room.rtmPending.rtmTeamName}</strong> to decide on counter...</span>
                  ) : room.auctionState === 'RTM_COUNTER_PENDING' ? (
                    <span>Waiting for <strong style={{ color: '#60a5fa' }}>{room.rtmPending.buyingTeamName}</strong> to counter...</span>
                  ) : (
                    <span>Waiting for <strong style={{ color: '#f59e0b' }}>{room.rtmPending.rtmTeamName}</strong>...</span>
                  )}
                </div>
              )}

              {/* Duplicate RTM Status Logic Removed */}
              {/* Duplicate RTM Status Logic Fully Removed */}
            </div>
          </div>
        )
      }
      {/* Main Content Grid - Split Screen Command Center */}
      <div className="auction-layout">

        {/* Left Side - The STAGE (Visual Focus + Controls) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          gap: isMobile ? 4 : 16 // Tighter gap on mobile
        }}>
          <div style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Player Card takes main space - Will resize in component */}
            <div style={{ flex: 1, minHeight: 0 }}>
              <PlayerCard
                player={room.currentPlayer}
                currentBid={room.currentBid}
                teams={room.teams}
                onSkip={() => socket.emit("skip-player", { roomId: room.id })}
                canSkip={isHost && !room.currentBid}
                myTeam={myTeam}
                roomId={room.id}
                lastBidTeamId={room.lastBidTeamId}
              />
            </div>

            {/* Timer below card */}
            <div style={{ marginTop: 16 }}>
              <Timer endsAt={room.bidEndsAt} duration={20} />
            </div>
          </div>
        </div>

        {/* Right Side - Team Panels (Sidebar) */}
        <div style={{
          height: '100%',
          overflowY: 'auto',
          paddingRight: 8
        }}>
          <TeamPanel teams={room.teams} hostSocketId={room.hostSocketId} />
        </div>
        {/* Right Side - The CONSOLE (Data Only) */}

      </div>


      {/* Sets Modal - Enhanced with Player List */}
      {
        activeModal === 'sets' && (
          <div style={modalOverlay} onClick={() => { setActiveModal(null); setSelectedSet(null); }}>
            <div style={{
              ...modalContent,
              width: window.innerWidth < 768 ? '95%' : '80%',
              maxWidth: 900,
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh'
            }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ color: '#fff', margin: 0 }}>📋 Auction Sets</h2>
                <button onClick={() => { setActiveModal(null); setSelectedSet(null); }} style={{
                  background: 'none', border: 'none', color: '#9ca3af', fontSize: 24, cursor: 'pointer'
                }}>×</button>
              </div>

              {/* Main Content Area */}
              {/* Main Content Area */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '250px 1fr',
                gridTemplateRows: window.innerWidth < 768 ? 'auto 1fr' : 'auto',
                gap: 20,
                height: '100%', // Fill the modal height
                overflow: 'hidden'
              }}>

                {/* Left Sidebar - Set Navigation */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: 12,
                  padding: 12,
                  display: 'flex',
                  flexDirection: window.innerWidth < 768 ? 'column' : 'column',
                  gap: 12,
                  height: window.innerWidth < 768 ? 'auto' : '100%',
                  flexShrink: 0,
                  minWidth: 0, // CRITICAL: Prevent grid item from expanding to content width
                  width: '100%', // Ensure it takes available space but no more
                  maxWidth: '100vw' // Hard constraint
                }}>
                  {/* Role Tabs */}
                  {/* Role Tabs - Horizontal Scroll with Overlay Buttons */}
                  <div style={{ position: 'relative', width: '100%', maxWidth: '100%' }}>
                    {/* Left Scroll Button - Overlay */}
                    <button
                      onClick={() => {
                        const container = document.getElementById('role-tabs-container');
                        if (container) container.scrollBy({ left: -100, behavior: 'smooth' });
                      }}
                      style={{
                        position: 'absolute', left: 4, top: '50%', transform: 'translateY(-50%)', zIndex: 50,
                        background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.4)',
                        color: '#fff', borderRadius: '50%', width: 28, height: 28,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', backdropFilter: 'blur(4px)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
                      }}
                    >
                      ‹
                    </button>

                    <div id="role-tabs-container" className="sets-scroll-container" style={{
                      display: 'flex',
                      gap: 8,
                      overflowX: 'scroll', // FORCE scroll
                      padding: '4px 32px', // Add padding for buttons
                      width: '100%',
                      flexShrink: 0,
                      scrollbarWidth: 'none', // Hide native scrollbar for cleaner look if buttons exist
                      msOverflowStyle: 'none'
                    }}>
                      {/* Hide scrollbar here to rely on buttons/touch, looks cleaner with overlay */}
                      <style>{`
                        #role-tabs-container::-webkit-scrollbar { display: none; }
                      `}</style>
                      {['BAT', 'BOWL', 'AR', 'WK'].map(role => (
                        <button
                          key={role}
                          onClick={() => setActiveRoleTab(role)}
                          style={{
                            flex: '0 0 auto', // Prevent shrinking
                            padding: '8px 16px',
                            borderRadius: 8,
                            background: activeRoleTab === role ? ROLE_COLORS[role] + '30' : 'rgba(55, 65, 81, 0.3)',
                            border: activeRoleTab === role ? `1px solid ${ROLE_COLORS[role]}` : '1px solid transparent',
                            color: activeRoleTab === role ? ROLE_COLORS[role] : '#9ca3af',
                            cursor: 'pointer', fontSize: 12, fontWeight: 'bold',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {{ BAT: '🏏 BAT', BOWL: '🎳 BOWL', AR: '⭐ AR', WK: '🧤 WK' }[role]}
                        </button>
                      ))}
                    </div>

                    {/* Right Scroll Button - Overlay */}
                    <button
                      onClick={() => {
                        const container = document.getElementById('role-tabs-container');
                        if (container) container.scrollBy({ left: 100, behavior: 'smooth' });
                      }}
                      style={{
                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 50,
                        background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.4)',
                        color: '#fff', borderRadius: '50%', width: 28, height: 28,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', backdropFilter: 'blur(4px)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
                      }}
                    >
                      ›
                    </button>
                  </div>

                  {/* Sets List - Horizontal Scroll with Overlay Buttons */}
                  <div style={{ position: 'relative', width: '100%', maxWidth: '100%', marginTop: 8 }}>
                    {/* Left Scroll Button - Overlay */}
                    <button
                      onClick={() => {
                        const container = document.getElementById('sets-scroll-container');
                        if (container) container.scrollBy({ left: -100, behavior: 'smooth' });
                      }}
                      style={{
                        position: 'absolute', left: 4, top: '50%', transform: 'translateY(-50%)', zIndex: 50,
                        background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.4)',
                        color: '#fff', borderRadius: '50%', width: 28, height: 28,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', backdropFilter: 'blur(4px)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
                      }}
                    >
                      ‹
                    </button>

                    <div id="sets-scroll-container" className="sets-scroll-container" style={{
                      display: 'flex',
                      flexDirection: 'row',
                      overflowX: 'scroll', // FORCE scroll
                      gap: 8,
                      padding: '4px 32px', // Add padding for buttons
                      width: '100%',
                      flexShrink: 0,
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#60a5fa rgba(255, 255, 255, 0.05)',
                      scrollBehavior: 'smooth'
                    }}>
                      {/* Custom Scrollbar Styles for this container */}
                      <style>{`
                        .sets-scroll-container::-webkit-scrollbar {
                          height: 8px;
                          display: block !important;
                          background: rgba(0, 0, 0, 0.2);
                          -webkit-appearance: none;
                        }
                        .sets-scroll-container::-webkit-scrollbar-track {
                          background: rgba(255, 255, 255, 0.05);
                          border-radius: 4px;
                        }
                        .sets-scroll-container::-webkit-scrollbar-thumb {
                          background-color: #60a5fa;
                          border-radius: 4px;
                          border: 2px solid rgba(30, 41, 59, 0.5);
                        }
                        .sets-scroll-container::-webkit-scrollbar-thumb:hover {
                          background-color: #3b82f6;
                        }
                      `}</style>
                      {(room.setOrder || [])
                        .filter(s => activeRoleTab ? s.startsWith(activeRoleTab) : true)
                        .map(setName => {
                          const isSelected = selectedSet === setName;
                          const isCurrent = room.currentSet === setName;
                          return (
                            <button
                              key={setName}
                              onClick={() => setSelectedSet(setName)}
                              style={{
                                flex: '0 0 auto', // CRITICAL: Prevent shrinking to force scroll
                                padding: '8px 16px',
                                borderRadius: 8,
                                background: isSelected ? 'rgba(59, 130, 246, 0.2)' : (isCurrent ? 'rgba(52, 211, 153, 0.1)' : 'rgba(55, 65, 81, 0.3)'),
                                border: isSelected ? '1px solid #3b82f6' : (isCurrent ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid transparent'),
                                color: isSelected ? '#fff' : (isCurrent ? '#34d399' : '#9ca3af'),
                                cursor: 'pointer',
                                minWidth: '80px',
                                textAlign: 'center',
                                fontSize: 13,
                                fontWeight: isSelected || isCurrent ? 'bold' : 'normal',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {setName} {isCurrent && '🔴'}
                            </button>
                          );
                        })}
                    </div>

                    {/* Right Scroll Button - Overlay */}
                    <button
                      onClick={() => {
                        const container = document.getElementById('sets-scroll-container');
                        if (container) container.scrollBy({ left: 100, behavior: 'smooth' });
                      }}
                      style={{
                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 50,
                        background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.4)',
                        color: '#fff', borderRadius: '50%', width: 28, height: 28,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', backdropFilter: 'blur(4px)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
                      }}
                    >
                      ›
                    </button>
                  </div>
                </div>

                {/* Right Content - Players in Selected Set (Compact) */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: 12,
                  padding: 12, // Reduced padding
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  minHeight: 0
                }}>
                  {selectedSet ? (() => {
                    const setPlayers = getPlayersForSet(selectedSet);
                    if (!setPlayers || setPlayers.length === 0) {
                      return <div style={{ color: '#9ca3af', textAlign: 'center', marginTop: 40 }}>No players in this set</div>;
                    }
                    return (

                      <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}> {/* Vertical list on mobile */}
                        {setPlayers.map((player) => {
                          const playerGlobalIdx = room.auctionPool?.findIndex(p => p.id === player.id);
                          const isPassed = playerGlobalIdx !== -1 && playerGlobalIdx < room.currentIndex;
                          const isUnsold = !player.sold && isPassed;

                          return (
                            <div key={player.id} style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              borderRadius: 8,
                              padding: 8,
                              display: 'flex',
                              alignItems: 'center', // Align items horizontally in the row
                              gap: 12, // Increased gap for row layout
                              border: player.sold ? '1px solid #34d399' : (isUnsold ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)'),
                              opacity: (player.sold || isUnsold) ? 0.7 : 1
                            }}>
                              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: 1 }}>
                                <img
                                  src={getPlayerPhotoUrl(player.name)}
                                  alt={player.name}
                                  style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', background: '#1e293b' }}
                                  onError={e => e.target.src = DEFAULT_PLAYER_IMAGE}
                                />
                                <div style={{ overflow: 'hidden' }}>
                                  <div style={{ color: '#fff', fontWeight: 'bold', fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{player.name}</div>
                                  <div style={{ color: '#9ca3af', fontSize: 11 }}>{player.country || 'IND'} • {player.role}</div>
                                </div>
                              </div>

                              {/* Status Badge on the right for vertical list */}
                              <div style={{ flexShrink: 0 }}>
                                {player.sold ? (
                                  <div style={{ fontSize: 10, fontWeight: 'bold', color: '#34d399', background: 'rgba(16, 185, 129, 0.2)', padding: '4px 8px', borderRadius: 4, textAlign: 'center' }}>
                                    SOLD<br /><span style={{ fontSize: 9 }}>{player.soldTo}</span>
                                  </div>
                                ) : isUnsold ? (
                                  <div style={{ fontSize: 10, fontWeight: 'bold', color: '#ef4444', background: 'rgba(239, 68, 68, 0.2)', padding: '4px 8px', borderRadius: 4, textAlign: 'center' }}>
                                    UNSOLD
                                  </div>
                                ) : (
                                  <span style={{ fontSize: 11, color: '#9ca3af', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: 4 }}>
                                    ₹{player.basePrice}Cr
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );

                  })() : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', flexDirection: 'column', gap: 12 }}>
                      <div style={{ fontSize: 32, opacity: 0.5 }}>🏏</div>
                      <div style={{ fontSize: 14 }}>Select a set to view players</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      }




      {/* Retentions Modal */}
      {
        activeModal === 'retentions' && (
          <div style={modalOverlay} onClick={() => setActiveModal(null)}>
            <div style={{
              ...modalContent,
              width: window.innerWidth < 768 ? '95%' : '900px',
              height: '80vh', // Fixed height to allow internal scrolling
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden' // Prevent partial scrolling of modal itself
            }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ color: '#fff', margin: 0 }}>Team Retentions</h2>
                <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 24, cursor: 'pointer' }}>×</button>
              </div>
              <div style={{ overflowY: 'auto', flex: 1, display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fill, minmax(250px, 1fr))', gap: 15 }}>
                {room.teams?.map(team => (
                  <div key={team.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 15 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <img src={TEAM_LOGOS[team.name]} alt={team.name} style={{ width: 32, height: 32 }} />
                      <span style={{ color: '#fff', fontWeight: 'bold' }}>{team.name}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {team.retained?.map((p, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                          <span style={{ color: '#d1d5db' }}>{p.name} {p.overseas && '✈️'}</span>
                          <span style={{ color: '#34d399' }}>₹{p.cost}Cr</span>
                        </div>
                      ))}
                      {(!team.retained || team.retained.length === 0) && <div style={{ color: '#6b7280', fontSize: 13, fontStyle: 'italic' }}>No retentions</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      }

      {/* Team Buys Modal */}
      {
        activeModal === 'teamBuys' && (
          <div style={modalOverlay} onClick={() => setActiveModal(null)}>
            <div style={{
              ...modalContent,
              width: window.innerWidth < 768 ? '95%' : '900px',
              height: '80vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }} onClick={e => e.stopPropagation()}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexShrink: 0 }}>
                <h2 style={{ color: '#fff', margin: 0 }}>Team Squads</h2>
                <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 24, cursor: 'pointer' }}>×</button>
              </div>

              <div style={{ display: 'flex', flex: 1, gap: 20, overflow: 'hidden', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
                {/* Left Sidebar: Team List */}
                <div style={{
                  width: window.innerWidth < 768 ? '100%' : '240px',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: 12,
                  padding: 10,
                  overflowY: 'auto',
                  flexShrink: 0,
                  maxHeight: window.innerWidth < 768 ? '120px' : 'none'
                }}>
                  {room.teams?.map(team => (
                    <div key={team.id} onClick={() => setSelectedTeam(team.name)} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '10px', marginBottom: 6, borderRadius: 8,
                      cursor: 'pointer', background: selectedTeam === team.name ? 'rgba(52, 211, 153, 0.2)' : 'transparent',
                      border: selectedTeam === team.name ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid transparent'
                    }}>
                      <img src={TEAM_LOGOS[team.name]} alt={team.name} style={{ width: 28, height: 28, borderRadius: 4 }} />
                      <span style={{ color: '#fff', fontSize: 14, fontWeight: selectedTeam === team.name ? 'bold' : 'normal' }}>{team.name}</span>
                    </div>
                  ))}
                </div>

                {/* Right Content: Squad Details */}
                <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  {selectedTeam ? (() => {
                    const team = room.teams?.find(t => t.name === selectedTeam);
                    const purchases = team?.players?.filter(p => !p.retained) || [];

                    return (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 15, borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                            <img src={TEAM_LOGOS[team.name]} alt={team.name} style={{ width: 50, height: 50, borderRadius: 8 }} />
                            <div>
                              <div style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>{team.name}</div>
                              <div style={{ color: '#9ca3af', fontSize: 13 }}>{team.players?.length || 0} / 25 Players</div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#9ca3af', fontSize: 12, textTransform: 'uppercase' }}>Remaining Purse</div>
                            <div style={{ color: '#34d399', fontSize: 24, fontWeight: 'bold' }}>₹{team.budget?.toFixed(2)}Cr</div>
                          </div>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                            {purchases.map((player, idx) => (
                              <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                                <img src={getPlayerPhotoUrl(player.name)} alt={player.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                                  onError={e => { e.target.onerror = null; e.target.src = DEFAULT_PLAYER_IMAGE }}
                                />
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                  <div style={{ color: '#fff', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{player.name}</div>
                                  <div style={{ display: 'flex', gap: 8, fontSize: 12, marginTop: 2 }}>
                                    <span style={{ color: '#34d399' }}>₹{player.soldPrice}Cr</span>
                                    {player.overseas && <span style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444', padding: '0 4px', borderRadius: 2, fontSize: 10 }}>OS</span>}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {purchases.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#6b7280', marginTop: 40 }}>No players purchased yet</div>}
                          </div>
                        </div>
                      </>
                    );
                  })() : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6b7280' }}>Select a team to view their squad</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >

  )
}
