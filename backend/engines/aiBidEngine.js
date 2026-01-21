/**
 * AI Bidding Engine - Balanced AI bidding behavior
 * 
 * Features:
 * - Budget management (keeps reasonable reserve)
 * - Player value assessment based on role and base price
 * - Reasonable max bid caps
 * - Active bidding on needed roles
 */

// Base maximum prices AI will pay for different player types (at 120 Cr budget)
const BASE_MAX_BID_CAPS = {
  star: 18,      // High base price players (≥2 Cr)
  premium: 10,   // Medium base price (1-2 Cr)
  regular: 5,    // Low base price (0.5-1 Cr)
  budget: 2      // Minimum base price (<0.5 Cr)
};

// For backward compatibility
const MAX_BID_CAPS = BASE_MAX_BID_CAPS;

/**
 * Get scaled bid caps based on room budget
 * Higher budget = AI willing to pay more for players
 * @param {number} roomBudget - Room's total budget (120-200)
 */
function getScaledMaxBidCaps(roomBudget) {
  const budgetRatio = (roomBudget || 120) / 120; // Base is 120 Cr
  return {
    star: Math.round(BASE_MAX_BID_CAPS.star * budgetRatio),      // 18 → 30 (at 200 Cr)
    premium: Math.round(BASE_MAX_BID_CAPS.premium * budgetRatio), // 10 → 17 (at 200 Cr)
    regular: Math.round(BASE_MAX_BID_CAPS.regular * budgetRatio), // 5 → 8 (at 200 Cr)
    budget: Math.round(BASE_MAX_BID_CAPS.budget * budgetRatio)    // 2 → 3 (at 200 Cr)
  };
}

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
 * Get dynamic reserve based on team needs and room budget
 * @param {Object} team - Team object
 * @param {number} roomBudget - Optional room budget (default 120)
 */
function getDynamicReserve(team, roomBudget = 120) {
  const playerCount = team.players?.length || 0;
  const playersNeeded = 18 - playerCount;

  // Scale reserve per player based on room budget
  // Higher budget = need to reserve more per player for balanced spending
  const reservePerPlayer = (roomBudget / 120) * 1.5; // 1.5 Cr per player at 120, 2.1 at 170, 2.5 at 200
  const neededReserve = Math.max(0, playersNeeded) * reservePerPlayer;

  // Base reserve also scales with budget (12.5% of total budget)
  const scaledBaseReserve = roomBudget * 0.125;

  return Math.max(scaledBaseReserve, neededReserve);
}

/**
 * Get maximum bid AI will place for a player
 * @param {Object} player - Player object
 * @param {Object} team - Team object
 * @param {number} roomBudget - Optional room budget for scaling (default 120)
 */
function getMaxBidForPlayer(player, team, roomBudget = 120) {
  const tier = getPlayerTier(player);
  const scaledCaps = getScaledMaxBidCaps(roomBudget);
  const baseCap = scaledCaps[tier];

  // Adjust based on role needs
  const roleNeed = getRoleNeed(team);
  const needMultiplier = roleNeed[player.role] > 0 ? 1.3 : 0.8; // Reduced from 1.5

  // Adjust based on squad size - more conservative early to save for later
  const playerCount = team.players?.length || 0;
  let squadMultiplier = 1.0;
  if (playerCount < 5) squadMultiplier = 1.3;      // Reduced from 1.8
  else if (playerCount < 10) squadMultiplier = 1.1; // Reduced from 1.4
  else if (playerCount < 15) squadMultiplier = 0.9;
  else squadMultiplier = 0.6;

  let maxBid = baseCap * needMultiplier * squadMultiplier;

  // ABSOLUTE CAP: Never spend more than 20% of total budget on any single player
  // This ensures AI can build a balanced squad of 18+ players
  const absoluteMaxCap = roomBudget * 0.20; // 20% of total budget
  maxBid = Math.min(maxBid, absoluteMaxCap);

  // Also cap at 15% of current remaining budget to be extra conservative
  const currentBudgetCap = team.budget * 0.25;
  maxBid = Math.min(maxBid, currentBudgetCap);

  return Math.round(maxBid * 4) / 4; // Round to nearest 0.25
}

/**
 * Calculate the maximum bid any AI team would place for a player (for skip feature)
 * Returns the highest bid from interested AI teams, null if no AI interested
 * @param {Object} room - Room object
 * @returns {Object|null} { teamId, teamName, maxBid } or null
 */
function calculateAIMaxBid(room) {
  if (!room.config.allowAI) return null;
  if (!room.currentPlayer) return null;

  const player = room.currentPlayer;
  const roomBudget = room.config.budget || room.rules?.purse || 120;

  // Get all eligible AI teams
  const aiTeams = room.teams.filter(t => {
    if (!t.isAI) return false;
    if (t.players.length >= 25) return false;

    // Check overseas limit
    if (player.overseas) {
      const osCount = t.players.filter(p => p.overseas).length;
      if (osCount >= 8) return false;
    }

    // Check if team has enough budget
    const reserve = getDynamicReserve(t, roomBudget);
    if (t.budget <= reserve) return false;

    return true;
  });

  if (!aiTeams.length) return null;

  // Calculate max bid for each AI team
  let bestBid = null;

  for (const team of aiTeams) {
    const maxBid = getMaxBidForPlayer(player, team, roomBudget);
    const reserve = getDynamicReserve(team, roomBudget);
    const affordableBid = Math.min(maxBid, team.budget - reserve);

    // Must be at least base price
    const effectiveBid = Math.max(player.basePrice || 0.5, affordableBid);

    // Round to nearest 0.25
    const roundedBid = Math.floor(effectiveBid / 0.25) * 0.25;

    if (!bestBid || roundedBid > bestBid.maxBid) {
      bestBid = {
        teamId: team.id,
        teamName: team.name,
        maxBid: roundedBid
      };
    }
  }

  // Ensure AI bid is higher than current bid
  if (bestBid) {
    const currentBid = room.currentBid?.amount || 0;
    if (bestBid.maxBid <= currentBid) {
      return null; // AI can't outbid current bid
    }
  }

  return bestBid;
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
  const roomBudget = room.config?.budget || room.rules?.purse || 120;
  const reserve = getDynamicReserve(team, roomBudget);
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

  // Get max bid cap for this player (roomBudget already defined above)
  const maxBid = getMaxBidForPlayer(player, team, roomBudget);

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

  // Skip if AI bidding was skipped for this player
  if (room.aiSkipped) {
    return;
  }

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
  calculateAIMaxBid,
  getScaledMaxBidCaps,
  MAX_BID_CAPS
};
