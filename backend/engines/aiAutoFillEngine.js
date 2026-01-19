/**
 * Auto-Fill Engine - Fills teams to minimum squad size after auction
 * 
 * Features:
 * - Minimum 18 players per team
 * - Role-balanced distribution (WK, BAT, AR, BOWL)
 * - Prioritizes teams with fewer players
 * - Only runs when AI is disabled
 */

const MIN_SQUAD = 18;
const MAX_SQUAD = 25;

// List of top players who should command high prices
const TOP_PLAYERS = [
  "Virat Kohli", "MS Dhoni", "Rohit Sharma", "Jasprit Bumrah",
  "Hardik Pandya", "Ravindra Jadeja", "Suryakumar Yadav", "Rishabh Pant",
  "Sanju Samson", "KL Rahul", "Shubman Gill", "Shreyas Iyer",
  "Pat Cummins", "Mitchell Starc", "Travis Head", "Heinrich Klaasen",
  "Rashid Khan", "Andre Russell", "Sunil Narine", "Nicholas Pooran",
  "Jos Buttler", "Yashasvi Jaiswal", "Ruturaj Gaikwad", "Axar Patel",
  "Kuldeep Yadav", "Mohammed Shami", "Mohammed Siraj", "Arshdeep Singh"
];

// Target role distribution for balanced squad
const ROLE_TARGETS = {
  WK: 2,
  BAT: 5,
  AR: 4,
  BOWL: 5
};

const ROLE_ORDER = ["WK", "BAT", "AR", "BOWL"];

/**
 * Get role counts for a team
 * @param {Object} team - Team object
 * @returns {Object} - Role counts
 */
function getRoleCounts(team) {
  const counts = { WK: 0, BAT: 0, AR: 0, BOWL: 0 };
  (team.players || []).forEach(p => {
    if (counts[p.role] !== undefined) counts[p.role]++;
  });
  return counts;
}

/**
 * Find which role a team needs most
 * @param {Object} team - Team object
 * @returns {string} - Most needed role
 */
function getMostNeededRole(team) {
  const counts = getRoleCounts(team);
  let maxNeed = 0;
  let neededRole = "BAT";

  for (const role of ROLE_ORDER) {
    const need = ROLE_TARGETS[role] - counts[role];
    if (need > maxNeed) {
      maxNeed = need;
      neededRole = role;
    }
  }

  return neededRole;
}

const MAX_OVERSEAS = 8;

/**
 * Calculate a realistic price for auto-filled players
 * @param {Object} player 
 * @param {Object} team
 * @param {number} slotsToFill - Number of players needed to reach MIN_SQUAD
 * @returns {number} Calculated price in Cr
 */
function calculateAutoFillPrice(player, team, slotsToFill) {
  const basePrice = player.basePrice || 0.2;
  const remainingBudget = team.budget || 0;

  // Reserve minimum amount for other slots to fill (0.2 Cr per slot)
  const reservedForOthers = Math.max(0, (slotsToFill - 1)) * 0.2;
  const maxAffordable = Math.max(0.2, remainingBudget - reservedForOthers);

  let desiredPrice = basePrice;

  // Check if player is in top list
  if (TOP_PLAYERS.includes(player.name)) {
    // Top players go for 30-40 Cr
    desiredPrice = 30 + (Math.random() * 10);
  } else if (basePrice >= 2) {
    // 2 Cr base price players go for 5-10 Cr
    desiredPrice = 5 + (Math.random() * 5);
  }

  // Ensure desired price is at least the base price
  desiredPrice = Math.max(desiredPrice, basePrice);

  // If desired price is more than we can afford, cap it
  // But ensure it doesn't go below base price if possible (unless base price itself is unaffordable)
  let finalPrice = Math.min(desiredPrice, maxAffordable);

  // Strict check: If we can afford the base price, NEVER go below it.
  if (finalPrice < basePrice && maxAffordable >= basePrice) {
    finalPrice = basePrice;
  }

  // Dynamic Floor: 
  // If it's a mandatory slot (to reach MIN_SQUAD), we prioritize the budget not going negative.
  // Otherwise, we use the standard 0.2 Cr floor.
  if (slotsToFill > 0) {
    // For mandatory slots, the absolute floor is 0.01 if the budget is very tight.
    // This prevents negative budgets while still reaching the minimum squad size.
    finalPrice = Math.max(0.01, Math.min(finalPrice, remainingBudget));
  } else {
    // For optional slots (above MIN_SQUAD), the absolute floor is 0.2 Cr.
    finalPrice = Math.max(0.2, finalPrice);
  }

  return finalPrice;
}

/**
 * Auto-fill teams to minimum squad size
 * Runs after auction ends to fill teams to minimum 18 players
 * @param {Object} room - Room object
 */
function autoFillTeams(room) {
  console.log("[AutoFill] Starting auto-fill to minimum squad of", MIN_SQUAD);

  // Collect unsold players
  const pool = [];

  // Add remaining players from auction pool
  room.auctionPool.forEach(p => {
    if (!p.sold && !p.retained) {
      pool.push({ ...p });
    }
  });

  // Add originally unsold players
  room.unsoldPlayers.forEach(p => {
    if (!pool.find(existing => existing.id === p.id)) {
      pool.push({ ...p });
    }
  });

  // CRITICAL: Sort pool to prioritize TOP_PLAYERS so they are definitely picked
  pool.sort((a, b) => {
    const isTopA = TOP_PLAYERS.includes(a.name);
    const isTopB = TOP_PLAYERS.includes(b.name);
    if (isTopA && !isTopB) return -1; // A comes first
    if (!isTopA && isTopB) return 1;  // B comes first
    return 0;
  });

  console.log("[AutoFill] Available pool:", pool.length, "players");

  // Sort teams by number of players (fewest first)
  const sortedTeams = [...room.teams].sort((a, b) =>
    (a.players?.length || 0) - (b.players?.length || 0)
  );

  // Helper to count overseas players in a team
  const getOverseasCount = (team) => (team.players || []).filter(p => p.overseas).length;

  // Fill each team to minimum
  for (const team of sortedTeams) {
    // CRITICAL: Skip if team already has MAX_SQUAD players
    if ((team.players?.length || 0) >= MAX_SQUAD) {
      console.log(`[AutoFill] ${team.name} already at MAX_SQUAD (${team.players.length}), skipping.`);
      continue;
    }

    while ((team.players?.length || 0) < MIN_SQUAD && pool.length > 0) {
      // Double-check MAX_SQUAD limit
      if ((team.players?.length || 0) >= MAX_SQUAD) break;

      // Find most needed role
      const neededRole = getMostNeededRole(team);

      // Calculate affordability for this slot
      const remainingBudget = team.budget || 0;

      // STRICT BUDGET CHECK: If budget is 0 or negative, stop filling
      if (remainingBudget <= 0) {
        console.log(`[AutoFill] ${team.name} has no budget (${remainingBudget} Cr), stopping fill.`);
        break;
      }

      const slotsToFill = Math.max(1, MIN_SQUAD - (team.players ? team.players.length : 0));
      const reservedForOthers = Math.max(0, (slotsToFill - 1)) * 0.2;
      const maxAffordableForThisSlot = Math.max(0.2, remainingBudget - reservedForOthers);

      // Helper to find tailored player
      // Priority: 1. Role match + Budget fit -> 2. Any + Budget fit -> 3. Role match + Cheapest -> 4. Any + Cheapest
      const findBestAffordablePlayer = (role) => {
        const canTakeOverseas = getOverseasCount(team) < MAX_OVERSEAS;

        // Filter valid candidates (respecting overseas limit)
        const validCandidates = pool.filter(p => !p.overseas || canTakeOverseas);
        if (validCandidates.length === 0) return -1;

        // 1. Try to find player of needed role within budget
        let candidates = validCandidates.filter(p =>
          (p.role === role) &&
          ((p.basePrice || 0.2) <= maxAffordableForThisSlot)
        );

        // 2. If no role match within budget, try any role within budget
        if (candidates.length === 0) {
          candidates = validCandidates.filter(p =>
            ((p.basePrice || 0.2) <= maxAffordableForThisSlot)
          );
        }

        // 3. Fallback to cheapest among valid candidates
        if (candidates.length === 0) {
          const roleMatches = validCandidates.filter(p => p.role === role);
          if (roleMatches.length > 0) {
            candidates = roleMatches.sort((a, b) => (a.basePrice || 0.2) - (b.basePrice || 0.2));
          } else {
            candidates = validCandidates.sort((a, b) => (a.basePrice || 0.2) - (b.basePrice || 0.2));
          }
        }

        if (candidates.length > 0) {
          return pool.findIndex(p => p.id === candidates[0].id);
        }
        return -1;
      };

      const playerIdx = findBestAffordablePlayer(neededRole);
      if (playerIdx === -1) break;

      const player = pool.splice(playerIdx, 1)[0];
      const soldPrice = calculateAutoFillPrice(player, team, slotsToFill);

      const finalizedPrice = Number(soldPrice.toFixed(2));

      // STRICT CHECK: Don't buy if we can't afford it
      if (finalizedPrice > team.budget) {
        console.log(`[AutoFill] ${team.name} can't afford ${player.name} (${finalizedPrice} > ${team.budget}), skipping.`);
        pool.unshift(player); // Put back in pool
        break;
      }

      // Add to team
      team.players.push({
        ...player,
        sold: true,
        soldTo: team.name,
        soldPrice: finalizedPrice,
        autoFilled: true
      });

      // DEDUCT BUDGET
      team.budget = Number((team.budget - finalizedPrice).toFixed(2));

      // Mark in room pools to prevent double-dipping if engine restarted
      const inAuction = room.auctionPool.find(p => p.id === player.id);
      if (inAuction) {
        inAuction.sold = true;
        inAuction.soldTo = team.name;
        inAuction.soldPrice = finalizedPrice;
        inAuction.autoFilled = true;
      }
      const inUnsold = room.unsoldPlayers.find(p => p.id === player.id);
      if (inUnsold) {
        inUnsold.sold = true;
        inUnsold.soldTo = team.name;
        inUnsold.soldPrice = finalizedPrice;
        inUnsold.autoFilled = true;
      }
    }
    console.log(`[AutoFill] ${team.name}: ${team.players.length} players, Budget Left: ${team.budget} Cr`);
  }

  // Continue filling to distribute remaining players evenly (Round Robin)
  // THIS PHASE IS OPTIONAL - only fill if team has budget AND has fewer than MAX_SQUAD
  while (pool.length > 0) {
    let assignedAny = false;
    for (const team of sortedTeams) {
      // STRICT MAX_SQUAD CHECK - critical to prevent exceeding 25 players
      const currentSquad = team.players?.length || 0;
      if (currentSquad >= MAX_SQUAD) {
        // This team is full, skip it entirely
        continue;
      }
      if (pool.length === 0) break;

      const canTakeOverseas = getOverseasCount(team) < MAX_OVERSEAS;
      const remainingBudget = team.budget || 0;

      // STRICT BUDGET CHECK for optional extra players
      // Must have enough budget to afford at least the base price
      if (remainingBudget <= 0) {
        console.log(`[AutoFill] ${team.name} has no budget (${remainingBudget} Cr), skipping.`);
        continue;
      }

      // Try to find affordable player - STRICT: basePrice must be <= remaining budget
      let playerIdx = pool.findIndex(p =>
        (!p.overseas || canTakeOverseas) &&
        ((p.basePrice || 0.3) <= remainingBudget)
      );

      // If no affordable player, this team can't take any more optional players
      if (playerIdx === -1) continue;

      const player = pool.splice(playerIdx, 1)[0];
      const soldPrice = calculateAutoFillPrice(player, team, 0); // Pass 0 for optional slots
      const finalizedPrice = Number(soldPrice.toFixed(2));

      // FINAL SAFETY CHECK: Don't make budget negative
      if (finalizedPrice > team.budget) {
        console.log(`[AutoFill] ${team.name} would go negative buying ${player.name}, skipping.`);
        pool.unshift(player); // Put back in pool
        continue;
      }

      // FINAL SQUAD SIZE CHECK before adding
      if ((team.players?.length || 0) >= MAX_SQUAD) {
        console.log(`[AutoFill] ${team.name} reached MAX_SQUAD, stopping.`);
        pool.unshift(player); // Put back in pool
        continue;
      }

      team.players.push({
        ...player,
        sold: true,
        soldTo: team.name,
        soldPrice: finalizedPrice,
        autoFilled: true
      });

      team.budget = Number((team.budget - finalizedPrice).toFixed(2));

      // Update source pools
      const inAuction = room.auctionPool.find(p => p.id === player.id);
      if (inAuction) {
        inAuction.sold = true;
        inAuction.soldTo = team.name;
        inAuction.soldPrice = finalizedPrice;
        inAuction.autoFilled = true;
      }
      const inUnsold = room.unsoldPlayers.find(p => p.id === player.id);
      if (inUnsold) {
        inUnsold.sold = true;
        inUnsold.soldTo = team.name;
        inUnsold.soldPrice = finalizedPrice;
        inUnsold.autoFilled = true;
      }

      assignedAny = true;
    }

    if (!assignedAny) {
      console.log(`[AutoFill] No more valid assignments possible. ${pool.length} remain.`);
      break;
    }
  }

  console.log("[AutoFill] Complete");
}

module.exports = {
  autoFillTeams,
  MIN_SQUAD,
  MAX_SQUAD,
  getRoleCounts,
  getMostNeededRole
};
