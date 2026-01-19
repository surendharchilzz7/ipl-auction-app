import { useState, useEffect } from 'react';
import { getPlayerPhotoUrl, DEFAULT_PLAYER_IMAGE } from '../data/playerPhotos';
import { socket } from "../socket";
import Timer from './Timer';

const ROLE_INFO = {
  BAT: { label: 'Batsman', emoji: '🏏', color: '#60a5fa' },
  BOWL: { label: 'Bowler', emoji: '🎳', color: '#34d399' },
  AR: { label: 'All-Rounder', emoji: '⭐', color: '#a78bfa' },
  WK: { label: 'Wicket Keeper', emoji: '🧤', color: '#fbbf24' }
};

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

export default function PlayerCard({
  player, currentBid, teams, onSkip, canSkip,
  myTeam, roomId, lastBidTeamId, bidEndsAt // Added props
}) {
  const [imageError, setImageError] = useState(false);

  // Reset image error state when player changes
  useEffect(() => {
    setImageError(false);
  }, [player?.name]);

  const role = ROLE_INFO[player?.role] || { label: player?.role, emoji: '🏏', color: '#9ca3af' };
  const highestTeam = currentBid && teams?.find(t => t.id === currentBid.teamId);
  const basePrice = player?.basePrice || 0;
  const currentAmount = currentBid?.amount || basePrice;
  const photoUrl = getPlayerPhotoUrl(player?.name);

  // --- Bidding Logic ---
  const teamId = myTeam?.id;
  const canBid = myTeam && lastBidTeamId !== teamId;
  const nextBid = (currentBid?.amount || basePrice) + 0.25;
  const hasEnoughBudget = myTeam && myTeam.budget >= nextBid;

  const MAX_OVERSEAS = 8;
  const isOverseasPlayer = player?.overseas;
  const currentOverseasCount = myTeam?.players?.filter(p => p.overseas).length || 0;
  const overseasLimitReached = isOverseasPlayer && currentOverseasCount >= MAX_OVERSEAS;

  function placeBid() {
    if (!canBid || !hasEnoughBudget || overseasLimitReached) return;
    socket.emit("place-bid", { roomId, teamId });
  }
  // ---------------------

  return (
    <div style={{
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(24px)',
      borderRadius: 'var(--radius-lg)',
      padding: 20,
      marginBottom: 0,
      border: '1px solid var(--glass-border)',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: 'var(--glass-shadow)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Background Glow */}
      <div style={{
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        background: `radial-gradient(circle, ${role.color}15, transparent 70%)`,
        borderRadius: '50%',
        zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Top: Header Info */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          paddingBottom: 12
        }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', margin: 0, lineHeight: 1.1 }}>
              {player?.name}
            </h2>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
              <p style={{
                color: role.color,
                fontWeight: 500,
                margin: 0,
                fontSize: 11,
                display: 'flex',
                alignItems: 'center',
                background: `${role.color}20`,
                padding: '2px 6px',
                borderRadius: 4
              }}>
                {role.emoji} {role.label}
              </p>
              {/* Overseas Tag */}
              {player?.overseas && (
                <span style={{
                  background: 'linear-gradient(90deg, #ef4444, #b91c1c)',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 'bold',
                  padding: '2px 6px',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  ✈️ OVERSEAS
                </span>
              )}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#9ca3af', fontSize: 9, marginBottom: 0 }}>BASE PRICE</div>
            <div style={{ color: '#d1d5db', fontSize: 14, fontWeight: 'bold' }}>
              ₹{basePrice === 0 ? 'RTM' : `${basePrice} Cr`}
            </div>
          </div>
        </div>

        {/* Middle: Player Image (Massive) */}
        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 0 // Allow shrink
        }}>
          <div style={{
            width: 'clamp(140px, 25vw, 200px)', // Responsive size
            height: 'clamp(140px, 25vw, 200px)',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${role.color}20, ${role.color}05)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `4px solid ${role.color}`,
            boxShadow: `0 0 30px ${role.color}30`,
            overflow: 'hidden',
            flexShrink: 0
          }}>
            <img
              src={photoUrl && !imageError ? photoUrl : DEFAULT_PLAYER_IMAGE}
              alt={player?.name}
              style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center' }}
              onError={() => setImageError(true)}
            />
          </div>
        </div>

        {/* Skip Button - Centered between Photo and Status */}
        {canSkip && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <button
              onClick={onSkip}
              style={{
                background: 'rgba(220, 38, 38, 0.8)', // Red
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '6px 16px', // Compact
                borderRadius: 20,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                backdropFilter: 'blur(4px)',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              ⏭️ Skip Player
            </button>
          </div>
        )}



        {/* Timer (Always Visible) */}
        <div className="player-card-timer">
          <Timer
            endsAt={bidEndsAt} // Can be null, Timer handles it
            duration={20}
            style={{
              padding: '4px 10px',
              minWidth: 100,
              fontSize: 14,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              background: 'rgba(15, 23, 42, 0.95)'
            }}
          />
        </div>

        {/* Bottom: Bid Controls & Status */}
        <div style={{
          padding: 16,
          borderRadius: 'var(--radius-lg)',
          marginTop: 'auto',
          background: 'rgba(30, 41, 59, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          overflow: 'hidden'
        }}>
          {currentBid ? (
            // --- Active Bid State ---
            <div style={{ padding: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={{ color: '#34d399', fontSize: 10, letterSpacing: 1, fontWeight: 700, textTransform: 'uppercase' }}>Current Bid</div>
                  <div style={{ color: '#34d399', fontSize: 32, fontWeight: 900, fontFamily: '"Outfit", sans-serif' }}>
                    ₹{currentBid.amount} <span style={{ fontSize: 14, fontWeight: 600, color: '#10b981' }}>Cr</span>
                  </div>
                </div>
                <div style={{
                  textAlign: 'right',
                  background: 'rgba(0,0,0,0.2)',
                  padding: '6px 10px',
                  borderRadius: 10,
                  border: `1px solid ${TEAM_COLORS[highestTeam?.name]}40`
                }}>
                  <div style={{ color: '#9ca3af', fontSize: 9, marginBottom: 2 }}>HIGHEST BIDDER</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                    <span style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>{highestTeam?.name}</span>
                    <img src={TEAM_LOGOS[highestTeam?.name]} alt={highestTeam?.name} style={{ width: 24, height: 24, borderRadius: 4 }} />
                  </div>
                </div>
              </div>

              {/* Place Next Bid Button */}
              {myTeam && (
                <button
                  onClick={placeBid}
                  disabled={!canBid || !hasEnoughBudget || overseasLimitReached}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: overseasLimitReached ? '#ef4444' : (!canBid ? '#4b5563' : 'linear-gradient(135deg, #059669, #10b981)'),
                    border: 'none',
                    borderRadius: 10,
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: 16,
                    cursor: (canBid && hasEnoughBudget && !overseasLimitReached) ? 'pointer' : 'not-allowed',
                    opacity: (canBid && hasEnoughBudget && !overseasLimitReached) ? 1 : 0.7
                  }}
                >
                  {overseasLimitReached ? '🚫 Overseas Limit Reached' : (lastBidTeamId === teamId ? '⏳ You hold the bid' : `💰 Bid ₹${nextBid.toFixed(2)} Cr`)}
                </button>
              )}
            </div>
          ) : (
            // --- No Bid (Waiting / Place Opening Bid) ---
            <div style={{ padding: 0 }}>
              {myTeam ? (
                <button
                  onClick={placeBid}
                  disabled={!hasEnoughBudget || overseasLimitReached}
                  style={{
                    width: '100%',
                    padding: '14px', // Reduced from 20px for better visibility
                    background: overseasLimitReached ? '#ef4444' : (!hasEnoughBudget ? '#4b5563' : 'linear-gradient(135deg, #3b82f6, #2563eb)'),
                    border: 'none',
                    borderRadius: 12,
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: 16, // Reduced from 18px
                    cursor: (hasEnoughBudget && !overseasLimitReached) ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
                    opacity: (hasEnoughBudget && !overseasLimitReached) ? 1 : 0.7
                  }}
                >
                  {overseasLimitReached ? '🚫 Overseas Limit Reached' : `👋 Place Opening Bid (₹${basePrice} Cr)`}
                </button>
              ) : (
                <div style={{ textAlign: 'center', color: '#9ca3af', padding: 10 }}>
                  Waiting for opening bid...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
