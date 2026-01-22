import { socket } from "../socket";

const TEAM_COLORS = {
  CSK: '#f9cd05', MI: '#004ba0', RCB: '#ec1c24', KKR: '#3a225d', SRH: '#ff822a',
  RR: '#ea1a85', DC: '#0078bc', PBKS: '#ed1b24', LSG: '#00b7eb', GT: '#1c1c1c'
};

// Verified Local Logos
const TEAM_LOGOS = {
  // Short Codes
  CSK: '/team-logos/CSK.png',
  MI: '/team-logos/MI.png',
  RCB: '/team-logos/RCB.png',
  KKR: '/team-logos/KKR.png',
  SRH: '/team-logos/SRH.png',
  RR: '/team-logos/RR.png',
  DC: '/team-logos/DC.png',
  PBKS: '/team-logos/PBKS.png',
  LSG: '/team-logos/LSG.png',
  GT: '/team-logos/GT.png',

  // Full Names (Mapping for safety)
  "Chennai Super Kings": '/team-logos/CSK.png',
  "Mumbai Indians": '/team-logos/MI.png',
  "Royal Challengers Bengaluru": '/team-logos/RCB.png',
  "Royal Challengers Bangalore": '/team-logos/RCB.png',
  "Kolkata Knight Riders": '/team-logos/KKR.png',
  "Sunrisers Hyderabad": '/team-logos/SRH.png',
  "Rajasthan Royals": '/team-logos/RR.png',
  "Delhi Capitals": '/team-logos/DC.png',
  "Punjab Kings": '/team-logos/PBKS.png',
  "Lucknow Super Giants": '/team-logos/LSG.png',
  "Gujarat Titans": '/team-logos/GT.png',

  // Historical
  DD: '/team-logos/DD.png',
  DEC: '/team-logos/DEC.png',
  PWI: '/team-logos/PWI.png',
  KTK: '/team-logos/KTK.png',
  GL: '/team-logos/GL.png',
  RPS: '/team-logos/RPS.png'
};

export default function BidControls({
  roomId, teamId, myTeam, currentBid, lastBidTeamId, isHost, player, allowAI, aiSkipped
}) {
  const canBid = myTeam && lastBidTeamId !== teamId;
  const basePrice = player?.basePrice || 0;
  const nextBid = (currentBid?.amount || basePrice) + 0.25;
  const hasEnoughBudget = myTeam && myTeam.budget >= nextBid;

  // Overseas Limit Check
  const MAX_OVERSEAS = 8;
  const isOverseasPlayer = player?.overseas;
  const currentOverseasCount = myTeam?.players?.filter(p => p.overseas).length || 0;
  const overseasLimitReached = isOverseasPlayer && currentOverseasCount >= MAX_OVERSEAS;

  const canSkip = isHost && !currentBid;

  // Can skip AI if: AI is enabled, not already skipped, and user has a team
  const canSkipAI = allowAI && !aiSkipped && myTeam;

  function placeBid() {
    if (!canBid || !hasEnoughBudget) return;
    socket.emit("place-bid", { roomId, teamId });
  }

  function skipPlayer() {
    if (!canSkip) return;
    socket.emit("skip-player", { roomId });
  }

  function skipAIBidding() {
    if (!canSkipAI) return;
    socket.emit("skip-ai-bidding", { roomId });
  }

  const buttonBase = {
    padding: '16px 32px',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    width: '100%',
    marginBottom: 12,
    transition: 'all 0.2s ease',
    textTransform: 'uppercase',
    letterSpacing: 1
  };

  return (
    <div style={{
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(20px)',
      borderRadius: 'var(--radius-xl)',
      padding: 24,
      border: '1px solid var(--glass-border)',
      boxShadow: 'var(--glass-shadow)'
    }}>
      {myTeam ? (
        <div>
          {/* Team Info */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 16,
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: 20,
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Official Team Logo */}
              <img
                src={TEAM_LOGOS[myTeam.name]}
                alt={myTeam.name}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 10,
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div>
                <div style={{ color: '#fff', fontWeight: 'bold' }}>{myTeam.name}</div>
                <div style={{ color: '#9ca3af', fontSize: 12 }}>Your Team</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#9ca3af', fontSize: 12 }}>BUDGET</div>
              <div style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: myTeam.budget < 10 ? '#f87171' : '#34d399'
              }}>
                ₹{myTeam.budget?.toFixed(2)} Cr
              </div>
            </div>
          </div>

          {/* Bid Button */}
          <button
            onClick={placeBid}
            disabled={!canBid || !hasEnoughBudget || overseasLimitReached}
            style={{
              ...buttonBase,
              background: overseasLimitReached
                ? '#ef4444' // Red warning
                : canBid && hasEnoughBudget
                  ? 'linear-gradient(135deg, #059669, #10b981)'
                  : '#4b5563',
              color: '#fff',
              opacity: (canBid && hasEnoughBudget && !overseasLimitReached) ? 1 : 0.6,
              cursor: (canBid && hasEnoughBudget && !overseasLimitReached) ? 'pointer' : 'not-allowed',
              boxShadow: (canBid && hasEnoughBudget && !overseasLimitReached) ? '0 4px 20px rgba(16, 185, 129, 0.4)' : 'none'
            }}
          >
            {overseasLimitReached ? (
              '🚫 Limit Reached (Max 8 OS)'
            ) : !hasEnoughBudget ? (
              '❌ Insufficient Budget'
            ) : lastBidTeamId === teamId ? (
              '⏳ Your Bid is Active'
            ) : (
              `💰 Place Bid (₹${nextBid.toFixed(2)} Cr)`
            )}
          </button>

          {/* Skip AI Bidding Button */}
          {canSkipAI && (
            <button
              onClick={skipAIBidding}
              style={{
                ...buttonBase,
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#fff',
                boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)'
              }}
            >
              ⏩ Skip AI Bidding
            </button>
          )}

          {/* AI Skipped Indicator */}
          {aiSkipped && (
            <div style={{
              padding: 12,
              background: 'rgba(245, 158, 11, 0.2)',
              border: '1px solid rgba(245, 158, 11, 0.5)',
              borderRadius: 10,
              textAlign: 'center',
              color: '#fbbf24',
              marginBottom: 12
            }}>
              ⚡ AI bid locked - won't counter!
            </div>
          )}

          {/* Active Bid Indicator */}
          {lastBidTeamId === teamId && (
            <div style={{
              padding: 12,
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.5)',
              borderRadius: 10,
              textAlign: 'center',
              color: '#34d399'
            }}>
              ✅ You have the highest bid!
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>👀</div>
          <p style={{ color: '#9ca3af' }}>You are spectating</p>
          <p style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>
            Only team owners can place bids
          </p>
        </div>
      )}
    </div>
  );
}
