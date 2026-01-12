/**
 * Retention Engine - Handles player retentions and RTM before auction
 * 
 * IPL 2025 Rules:
 * - Max 6 total between retentions + RTM
 * - RTM cards = 6 - number of retentions
 * - Retention costs: [15, 11, 7, 4, 4] Cr
 * - RTM has no upfront cost
 * - RTM allows matching highest bid during auction
 * 
 * RTM Flow:
 * 1. When a team uses RTM to match the highest bid, bidding team can counter once
 * 2. RTM team must then match the new higher bid or decline
 * 3. If RTM team matches = player goes to RTM team
 * 4. If RTM team declines = player goes to bidding team, RTM card is NOT consumed
 */

const RETENTION_COSTS = [15, 11, 7, 4, 4];
const MAX_TOTAL_RETENTION_RTM = 6; // Total of retentions + RTM cannot exceed 6

/**
 * Get players available for retention for a team
 * @param {Object} room - Room object
 * @param {string} teamName - Team name
 * @returns {Array} - Players available for retention/RTM
 */
function getRetainablePlayers(room, teamName) {
  // Get players from previous season who were on this team
  const soldPlayers = room.soldPlayersByTeam[teamName] || [];
  return soldPlayers.map(p => ({
    id: p.id,
    name: p.name,
    role: p.role,
    soldPrice: p.soldPrice,
    basePrice: p.basePrice,
    overseas: p.overseas || false
  }));
}

/**
 * Retain selected players and set RTM players for a team
 * @param {Object} room - Room object
 * @param {string} teamName - Team name
 * @param {Array} retainedIds - IDs of players to retain
 * @param {Array} rtmIds - IDs of players to designate for RTM (optional)
 */
function retainPlayers(room, teamName, retainedIds, rtmIds = []) {
  if (!room || room.state !== "RETENTION") {
    console.log(`[Retention] Cannot retain - room state: ${room?.state}`);
    return;
  }

  const maxRetention = room.rules?.maxRetention || 5;
  const maxTotal = room.rules?.maxTotalRetentionRTM || MAX_TOTAL_RETENTION_RTM;

  // Apply "6 total" rule - retentions count first, RTM fills remaining slots
  const validRetainedIds = retainedIds.slice(0, Math.min(retainedIds.length, maxTotal));
  const remainingSlots = Math.max(0, maxTotal - validRetainedIds.length);
  const validRTMIds = rtmIds.slice(0, remainingSlots);

  const soldPlayers = room.soldPlayersByTeam[teamName] || [];

  // Reset all 'retained' flags for this team's players first
  soldPlayers.forEach(p => {
    p.retained = false;
  });

  // Mark retained players
  const retained = soldPlayers.filter(p => validRetainedIds.includes(p.id));
  retained.forEach(p => {
    p.retained = true;
  });

  room.retainedPlayers[teamName] = retained;

  // RTM Cards = 6 - number of retentions (IPL 2025 rule)
  // RTM can be used for ANY ex-player during auction, not pre-selected
  if (!room.rtmCardsRemaining) room.rtmCardsRemaining = {};
  const rtmCards = Math.max(0, maxTotal - retained.length);
  room.rtmCardsRemaining[teamName] = rtmCards;

  console.log(`[Retention] ${teamName} retained ${retained.length} players:`,
    retained.map(p => p.name).join(', '));
  console.log(`[RTM] ${teamName} has ${rtmCards} RTM cards (can use for any ex-player during auction)`);
}

/**
 * Check if a player is eligible for RTM by any team
 * IPL Rules: RTM can be used for ANY player who was on your team last season (not retained)
 * NOTE: RTM only applies if the team has an active controller (human or AI)
 * @param {Object} room - Room object
 * @param {string} playerId - Player ID
 * @returns {Object|null} - { teamName, player } or null
 */
function checkRTMEligibility(room, playerId) {
  // Check each team's ex-players (soldPlayersByTeam from last season)
  if (!room.soldPlayersByTeam) return null;

  for (const [teamName, players] of Object.entries(room.soldPlayersByTeam)) {
    // Find the player in this team's ex-players
    const player = players.find(p => p.id === playerId);

    // Skip if player wasn't on this team, is retained, or has been marked for no RTM
    if (!player || player.retained) continue;

    // Check if team has RTM cards remaining
    const rtmCardsLeft = room.rtmCardsRemaining?.[teamName] || 0;
    if (rtmCardsLeft <= 0) continue;

    // IMPORTANT: Only allow RTM if the team has an active controller
    // (human player with socketId OR AI-controlled team)
    const team = room.teams?.find(t => t.name === teamName);
    if (!team) continue;

    // USER REQUEST: AI teams should NOT use RTM.
    // Explicitly check for human owner (socketId) ONLY.
    if (team.isAI) {
      console.log(`[RTM Check] ${player.name} - ${teamName} is AI, skipping RTM (AI RTM disabled)`);
      continue;
    }

    const hasActiveController = !!team.socketId;
    if (!hasActiveController) {
      console.log(`[RTM Check] ${player.name} - ${teamName} has no active human controller, skipping RTM`);
      continue;
    }

    // NEW: Check overseas limit
    // If player is overseas, team must have room for them
    if (player.overseas) {
      const MAX_OVERSEAS = 8;
      const currentOverseas = (team.players || []).filter(p => p.overseas).length;
      if (currentOverseas >= MAX_OVERSEAS) {
        console.log(`[RTM Check] ${player.name} - ${teamName} reached overseas limit (${currentOverseas}/8), skipping RTM`);
        continue;
      }
    }

    console.log(`[RTM Check] ${player.name} eligible for RTM by ${teamName} (${rtmCardsLeft} cards left, controller: ${team.socketId ? 'human' : 'AI'})`);
    return { teamName, player };
  }
  return null;
}

/**
 * Use RTM card - marks as used (only if team confirms match)
 * @param {Object} room - Room object
 * @param {string} teamName - Team name using RTM
 */
function consumeRTMCard(room, teamName) {
  if (room.rtmCardsRemaining && room.rtmCardsRemaining[teamName] > 0) {
    room.rtmCardsRemaining[teamName]--;
    console.log(`[RTM] ${teamName} used RTM card. Remaining: ${room.rtmCardsRemaining[teamName]}`);
  }
}

/**
 * Finalize all retentions - deduct purse and add to teams
 * Also sets RTM cards for ALL teams (6 - retentions)
 * @param {Object} room - Room object
 */
function autoFinalizeRetention(room) {
  const retentionCosts = room.rules?.retentionCost || RETENTION_COSTS;
  const maxTotal = room.rules?.maxTotalRetentionRTM || MAX_TOTAL_RETENTION_RTM;

  // Initialize rtmCardsRemaining if not exists
  if (!room.rtmCardsRemaining) room.rtmCardsRemaining = {};

  // Process each team (not just those with retentions)
  room.teams.forEach(team => {
    const teamName = team.name;
    const players = room.retainedPlayers[teamName] || [];

    let totalCost = 0;

    players.forEach((player, idx) => {
      const cost = retentionCosts[idx] || retentionCosts[retentionCosts.length - 1];
      totalCost += cost;

      // Mark player as retained
      player.retained = true;
      player.retentionCost = cost;

      // Add to team's players
      team.players.push({
        ...player,
        sold: true,
        soldTo: teamName,
        soldPrice: cost,
        retained: true
      });

      // Also mark in soldPlayersByTeam
      const originalPlayer = room.soldPlayersByTeam[teamName]?.find(p => p.id === player.id);
      if (originalPlayer) {
        originalPlayer.retained = true;
      }
    });

    // Deduct from team budget
    team.budget -= totalCost;
    team.retained = players.map(p => ({ name: p.name, role: p.role, cost: p.retentionCost, overseas: p.overseas }));

    // SET RTM CARDS FOR ALL TEAMS: RTM cards = 6 - retentions
    const rtmCards = Math.max(0, maxTotal - players.length);
    room.rtmCardsRemaining[teamName] = rtmCards;
    team.rtmCardsRemaining = rtmCards;

    console.log(`[Retention] ${teamName}: ${players.length} retained, cost: ₹${totalCost}Cr, remaining: ₹${team.budget}Cr`);
    console.log(`[RTM] ${teamName}: ${rtmCards} RTM cards available (can use for any ex-player)`);
  });
}

/**
 * Calculate retention cost for given number of retentions
 * @param {number} count - Number of retentions
 * @param {Array} costs - Cost structure
 * @returns {number} - Total cost
 */
function calculateRetentionCost(count, costs = RETENTION_COSTS) {
  let total = 0;
  for (let i = 0; i < count && i < costs.length; i++) {
    total += costs[i];
  }
  return total;
}

module.exports = {
  getRetainablePlayers,
  retainPlayers,
  autoFinalizeRetention,
  calculateRetentionCost,
  checkRTMEligibility,
  consumeRTMCard,
  RETENTION_COSTS,
  MAX_TOTAL_RETENTION_RTM
};
