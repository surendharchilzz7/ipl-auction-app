/**
 * AI Bidding Engine - Balanced AI bidding behavior
 * 
 * Features:
 * - Budget management (keeps reasonable reserve)
 * - Player value assessment based on role and base price
 * - Reasonable max bid caps
 * - Active bidding on needed roles
 */

// Maximum price AI will pay for different player types
const MAX_BID_CAPS = {
  star: 18,      // High base price players (≥2 Cr)
  premium: 10,   // Medium base price (1-2 Cr)
  regular: 5,    // Low base price (0.5-1 Cr)
  budget: 2      // Minimum base price (<0.5 Cr)
};

// Minimum budget AI must keep - scaled by how many players still needed
const BASE_RESERVE = 15; // ₹15 Cr base reserve

/**
 * Get player tier based on base price
 */
function getPlayerTier(player) {
  const base = player?.basePrice || 0;
  if (base >= 2) return 'star';
  if (base >= 1) return 'premium';
  if (base >= 0.5) return 'regular';
  return 'budget';
}

/**
 * Get role needs for a team
 */
function getRoleNeed(team) {
  const players = team.players || [];
  const counts = { BAT: 0, BOWL: 0, AR: 0, WK: 0 };

  players.forEach(p => {
    if (counts[p.role] !== undefined) counts[p.role]++;
  });

  // Ideal: 5 BAT, 5 BOWL, 4 AR, 2 WK
  return {
    BAT: Math.max(0, 5 - counts.BAT),
    BOWL: Math.max(0, 5 - counts.BOWL),
    AR: Math.max(0, 4 - counts.AR),
    WK: Math.max(0, 2 - counts.WK)
  };
}

/**
 * Get dynamic reserve based on team needs
 */
function getDynamicReserve(team) {
  const playerCount = team.players?.length || 0;
  const playersNeeded = 18 - playerCount;

  // Need ~₹1 Cr per player for basic squad
  const neededReserve = Math.max(0, playersNeeded) * 1;

  return Math.max(BASE_RESERVE, neededReserve);
}

/**
 * Get maximum bid AI will place for a player
 */
function getMaxBidForPlayer(player, team) {
  const tier = getPlayerTier(player);
  const baseCap = MAX_BID_CAPS[tier];

  // Adjust based on role needs
  const roleNeed = getRoleNeed(team);
  const needMultiplier = roleNeed[player.role] > 0 ? 1.5 : 0.8;

  // Adjust based on squad size - more aggressive early
  const playerCount = team.players?.length || 0;
  let squadMultiplier = 1.0;
  if (playerCount < 5) squadMultiplier = 1.8;
  else if (playerCount < 10) squadMultiplier = 1.4;
  else if (playerCount < 15) squadMultiplier = 1.0;
  else squadMultiplier = 0.6;

  return baseCap * needMultiplier * squadMultiplier;
}

/**
 * Determine if AI should bid
 */
function shouldAIBid(room, team) {
  const player = room.currentPlayer;
  if (!player) return false;

  // Don't bid if already winning
  if (room.lastBidTeamId === team.id) return false;

  // Calculate next bid amount
  const currentBid = room.currentBid?.amount || player.basePrice || 0.5;
  const nextBid = currentBid + 0.25;

  // Dynamic reserve check
  const reserve = getDynamicReserve(team);
  if (team.budget - nextBid < reserve) {
    return false;
  }

  // Squad full check
  if (team.players.length >= 25) return false;

  // Overseas limit check
  if (player.overseas) {
    const osCount = team.players.filter(p => p.overseas).length;
    if (osCount >= 8) {
      console.log(`[AI] ${team.name} skipping ${player.name} (Overseas Limit Reached: ${osCount}/8)`);
      return false;
    }
  }

  // Get max bid cap for this player
  const maxBid = getMaxBidForPlayer(player, team);

  // Don't bid if price exceeds our max cap
  if (nextBid > maxBid) {
    return false;
  }

  // Calculate bid probability
  const roleNeed = getRoleNeed(team);
  const needsRole = roleNeed[player.role] > 0;

  // Base probability - higher for needed roles
  let bidChance = needsRole ? 0.7 : 0.4;

  // Increase probability early in auction (team needs players)
  if (team.players.length < 5) bidChance += 0.2;
  else if (team.players.length < 10) bidChance += 0.1;

  // Reduce probability as price increases relative to base
  const priceRatio = nextBid / (player.basePrice || 0.5);
  if (priceRatio > 2) bidChance *= 0.7;
  if (priceRatio > 3) bidChance *= 0.5;
  if (priceRatio > 5) bidChance *= 0.3;

  // Cap at 85%
  bidChance = Math.min(0.85, bidChance);

  console.log(`[AI] ${team.name} evaluating ${player.name}: chance=${(bidChance * 100).toFixed(0)}%, maxBid=₹${maxBid.toFixed(1)}Cr, next=₹${nextBid}Cr`);

  return Math.random() < bidChance;
}

/**
 * Smart AI bidding logic - called from timer
 */
function smartAIBid(room, io, placeBid) {
  if (!room.config.allowAI) return;
  if (!room.currentPlayer) return;

  const reserve = BASE_RESERVE;
  const aiTeams = room.teams.filter(t =>
    t.isAI &&
    t.players.length < 25 &&
    t.budget > reserve
  );

  if (!aiTeams.length) return;

  // Shuffle for fairness
  aiTeams.sort(() => Math.random() - 0.5);

  for (const team of aiTeams) {
    if (shouldAIBid(room, team)) {
      // Random delay for realism (300-900ms)
      const delay = 300 + Math.random() * 600;

      setTimeout(() => {
        // Double check still valid
        if (room.currentPlayer && room.lastBidTeamId !== team.id) {
          const nextBid = (room.currentBid?.amount || room.currentPlayer.basePrice || 0.5) + 0.25;
          console.log(`[AI] ${team.name} bidding ₹${nextBid}Cr on ${room.currentPlayer.name}`);
          placeBid(room, team.id, io);
        }
      }, delay);

      break; // Only one AI bids per cycle
    }
  }
}

module.exports = {
  smartAIBid,
  getMaxBidForPlayer,
  getRoleNeed,
  shouldAIBid,
  getDynamicReserve,
  MAX_BID_CAPS
};
