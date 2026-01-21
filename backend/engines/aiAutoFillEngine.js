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
 * @param {number} roomBudget - Room's configured budget (default 120)
 * @param {number} slotsToFill - Number of players to fill (Mandatory or Optional count)
 * @param {number} roomBudget - Room's configured budget (default 120)
 * @param {boolean} isOptional - Whether this is for optional slots (>18)
 * @returns {number} Calculated price in Cr
 */
function calculateAutoFillPrice(player, team, slotsToFill, roomBudget = 120, isOptional = false) {
  const basePrice = player.basePrice || 0.2;
  const remainingBudget = team.budget || 0;

  // Calculate how much we can spend on average per remaining slot
  const avgBudgetPerSlot = remainingBudget / Math.max(1, slotsToFill);

  // Reserve minimum amount for other slots (0.25 Cr per slot)
  const reservedForOthers = Math.max(0, (slotsToFill - 1)) * 0.25;
  const maxAffordable = Math.max(0.2, remainingBudget - reservedForOthers);

  let desiredPrice = basePrice;

  // LOGIC: Rich teams should spend aggressively
  // If a team has huge budget per slot (> 5 Cr), they should pay inflated prices
  let wealthMultiplier = 1.0;
  if (avgBudgetPerSlot > 15) wealthMultiplier = 3.0;      // Very rich
  else if (avgBudgetPerSlot > 10) wealthMultiplier = 2.0; // Rich
  else if (avgBudgetPerSlot > 5) wealthMultiplier = 1.5;  // Comfortable
  else if (avgBudgetPerSlot < 1) wealthMultiplier = 0.8;  // Poor - tries to save

  // Base valuation based on player status
  if (TOP_PLAYERS.includes(player.name)) {
    // Top players: 30-40% of TOTAL room budget
    // We do NOT apply wealthMultiplier here effectively, as these prices are already ceiling
    const roomScale = roomBudget * 0.35;
    const teamScale = remainingBudget * 0.40;

    // Use a much milder multiplier for stars (max 1.2x) to show "rich team tax" but not insanity
    const starMultiplier = 1.0 + ((wealthMultiplier - 1.0) * 0.2);

    desiredPrice = Math.min(teamScale, roomScale) * starMultiplier;

    // Randomize
    desiredPrice += (Math.random() * 5);
  } else if (basePrice >= 2) {
    // Premium players: 5-10 Cr + wealth bonus
    desiredPrice = (5 + (Math.random() * 5)) * wealthMultiplier;
  } else if (basePrice >= 0.5) {
    // Mid players: 1-3 Cr + wealth bonus
    desiredPrice = (1 + (Math.random() * 2)) * wealthMultiplier;
  } else {
    // Uncapped / Low base: 
    if (wealthMultiplier > 1.5) desiredPrice = 0.5 + Math.random();
    else desiredPrice = basePrice + (Math.random() * 0.2);
  }

  // Ensure desired price is at least the base price
  desiredPrice = Math.max(desiredPrice, basePrice);

  // If desired price is more than we can afford, cap it
  let finalPrice = Math.min(desiredPrice, maxAffordable);

  // STRICT RULE: If we can afford base price, we ensure we don't go below it 
  // (Handled by rounding later, but good to clamp here)
  if (finalPrice < basePrice && maxAffordable >= basePrice) {
    finalPrice = basePrice;
  }

  // Dynamic Floor: 
  if (!isOptional && slotsToFill > 0) {
    // For MANDATORY slots check, allow draining down to fit
    finalPrice = Math.max(0.01, Math.min(finalPrice, remainingBudget));
  } else {
    // For optional slots, strict floor of 0.2
    finalPrice = Math.max(0.2, finalPrice);
  }

  // Final safeguard to preserve a tiny bit of purse if possible (unless forced)
  if (remainingBudget - finalPrice < 0.5 && remainingBudget > basePrice + 1.0) {
    // If we are about to drain the purse but have plenty, reduce bid slightly
    finalPrice = remainingBudget - 0.5;
  }

  // CRITICAL: Round to nearest 0.25 to match auction rules
  let rounded = Math.round(finalPrice * 4) / 4;

  // STRICT RULE: Price cannot be lower than base price
  if (rounded < basePrice) {
    rounded = basePrice;
  }

  finalPrice = rounded;

  return finalPrice;
}

/**
 * Auto-fill teams to minimum squad size
 * Runs after auction ends to fill teams to minimum 18 players
 * @param {Object} room - Room object
 */
function autoFillTeams(room) {
  console.log("[AutoFill] Starting auto-fill to minimum squad of", MIN_SQUAD);

  // Get room budget for scaling
  const roomBudget = room.config?.budget || room.rules?.purse || 120;

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
      const soldPrice = calculateAutoFillPrice(player, team, slotsToFill, roomBudget);

      const finalizedPrice = Number(soldPrice.toFixed(2));

      // STRICT CHECK: Don't buy if we can't afford it
      // STRICT CHECK: Don't buy if we can't afford it
      if (finalizedPrice > team.budget) {
        console.log(`[AutoFill] ${team.name} can't afford ${player.name} (${finalizedPrice} > ${team.budget}), skipping.`);
        // If we can't afford even the base price, we stop filling for this team.
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

      // Calculate remaining capacity to split budget evenly
      const optionalSlotsToFill = MAX_SQUAD - (team.players ? team.players.length : 0);

      // Pass optionalSlotsToFill and true for isOptional
      const soldPrice = calculateAutoFillPrice(player, team, optionalSlotsToFill, roomBudget, true);
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
