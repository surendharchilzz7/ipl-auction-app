/**
 * Build Auction Sets - Organizes players into structured auction sets
 * 
 * Sets Structure:
 * - Set 1: Marquee players (highest value per role)
 * - Set 2-N: Remaining players by category
 * 
 * Categories: BAT, WK, AR, BOWL
 * Order: Star players first, then by base price descending
 */

// Number of players per set for each role
const SET_SIZE = {
  BAT: 10,
  WK: 5,
  AR: 10,
  BOWL: 10
};

// Set order for auction
const SET_ORDER = ["BAT", "WK", "AR", "BOWL"];

/**
 * Fisher-Yates shuffle algorithm
 * @param {Array} array 
 * @returns {Array} Shuffled array
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Organize players into numbered sets
 * @param {Array} players - All players of a role
 * @param {string} role - Player role
 * @returns {Object} - Organized sets { BAT1: [...], BAT2: [...], ... }
 */
function organizeIntoSets(players, role) {
  // Sort by base price descending (star players first) to determine TIERS
  // But strictly randomize WITHIN the tier
  const sorted = [...players].sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0));

  const sets = {};
  const size = SET_SIZE[role] || 10;

  let setNum = 1;
  for (let i = 0; i < sorted.length; i += size) {
    const setName = `${role}${setNum}`;
    // Slice the tier (e.g. top 10), THEN shuffle them so they don't appear in price order
    const tierPlayers = sorted.slice(i, i + size);
    sets[setName] = shuffleArray(tierPlayers);
    setNum++;
  }

  return sets;
}

/**
 * Build auction pool organized by sets
 * @param {Object} room - Room object
 */
function buildAuctionSets(room) {
  console.log("[BuildSets] Starting auction set construction");

  // Initialize player pools by role
  const playersByRole = { BAT: [], WK: [], AR: [], BOWL: [] };

  // Track seen IDs to prevent duplicates
  const seenIds = new Set();

  // Collect unsold players
  room.unsoldPlayers.forEach(p => {
    if (playersByRole[p.role] && !p.retained && !seenIds.has(p.id)) {
      playersByRole[p.role].push({ ...p, sold: false, soldTo: null, soldPrice: null });
      seenIds.add(p.id);
    }
  });

  // Collect sold players who aren't retained
  Object.values(room.soldPlayersByTeam).forEach(players => {
    players.forEach(p => {
      if (!p.retained && playersByRole[p.role] && !seenIds.has(p.id)) {
        playersByRole[p.role].push({
          ...p,
          sold: false,
          soldTo: null,
          soldPrice: null
        });
        seenIds.add(p.id);
      }
    });
  });

  // Log counts
  console.log("[BuildSets] Players by role:", {
    BAT: playersByRole.BAT.length,
    WK: playersByRole.WK.length,
    AR: playersByRole.AR.length,
    BOWL: playersByRole.BOWL.length
  });

  // Organize into sets
  room.auctionSets = {};
  SET_ORDER.forEach(role => {
    const sets = organizeIntoSets(playersByRole[role], role);
    Object.assign(room.auctionSets, sets);
  });

  // Create set order for auction (BAT1, WK1, AR1, BOWL1, BAT2, WK2, AR2, BOWL2, ...)
  room.setOrder = [];
  let maxSets = 0;

  SET_ORDER.forEach(role => {
    const count = Math.ceil(playersByRole[role].length / (SET_SIZE[role] || 10));
    maxSets = Math.max(maxSets, count);
  });

  for (let i = 1; i <= maxSets; i++) {
    SET_ORDER.forEach(role => {
      const setName = `${role}${i}`;
      if (room.auctionSets[setName] && room.auctionSets[setName].length > 0) {
        room.setOrder.push(setName);
      }
    });
  }

  console.log("[BuildSets] Set order:", room.setOrder.join(", "));

  // Build flat auction pool from set order
  room.auctionPool = [];
  room.setOrder.forEach(setName => {
    room.auctionPool.push(...room.auctionSets[setName]);
  });

  // Initialize auction state
  room.currentSetIndex = 0;
  room.currentSet = room.setOrder[0] || null;
  room.currentIndex = 0;
  room.currentPlayer = room.auctionPool[0] || null;

  // FSM state
  room.auctionState = room.currentPlayer ? "PLAYER_ACTIVE" : "ENDED";

  console.log(`[BuildSets] Total players in pool: ${room.auctionPool.length}`);
  console.log(`[BuildSets] Starting with set: ${room.currentSet}`);

  if (room.currentPlayer) {
    console.log(`[BuildSets] First player: ${room.currentPlayer.name}`);
  }
}

/**
 * Get current set info for display
 * @param {Object} room - Room object
 * @returns {Object} - Set info
 */
function getCurrentSetInfo(room) {
  return {
    currentSet: room.currentSet,
    setIndex: room.currentSetIndex,
    totalSets: room.setOrder?.length || 0,
    playersInSet: room.auctionSets?.[room.currentSet]?.length || 0
  };
}

module.exports = {
  buildAuctionSets,
  getCurrentSetInfo,
  SET_ORDER,
  SET_SIZE
};
