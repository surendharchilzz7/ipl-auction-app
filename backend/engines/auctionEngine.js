/**
 * Auction Engine - Core auction logic with FSM state management
 * 
 * States: INIT, PLAYER_ACTIVE, SOLD, SKIPPED, ENDED
 * 
 * Timer Lifecycle:
 * - Only ONE timer instance at any time
 * - Timer is destroyed before creating a new one
 * - Timer emits timeout events, never mutates state directly
 */

const { autoFillTeams } = require("./aiAutoFillEngine");
const { smartAIBid } = require("./aiBidEngine");
const { generateAuctionSummary } = require("./auctionSummary");
const { checkRTMEligibility, consumeRTMCard } = require("./retentionEngine");
const serializeRoom = require("../utils/serializeRoom");

// FSM States
const STATES = {
  INIT: "INIT",
  PLAYER_ACTIVE: "PLAYER_ACTIVE",
  SOLD: "SOLD",
  SKIPPED: "SKIPPED",
  ENDED: "ENDED"
};

// Auction configuration
const BID_DURATION = 20; // seconds
const MAX_OVERSEAS_PER_TEAM = 8; // IPL rule: max 8 overseas players per team

/**
 * Destroys any existing timer on the room
 * @param {Object} room - Room object
 */
function destroyTimer(room) {
  if (room._timer) {
    clearInterval(room._timer);
    room._timer = null;
  }
}

/**
 * Starts the bid timer for current player
 * Guarantees only one timer instance exists
 * @param {Object} room - Room object  
 * @param {Object} io - Socket.io instance
 */
function startTimer(room, io) {
  // Single-timer guarantee: destroy existing timer first
  destroyTimer(room);

  // Don't start timer if no current player
  if (!room.currentPlayer) {
    console.log("[Timer] No current player, skipping timer start");
    return;
  }

  // Set auction state and timer end time
  room.auctionState = STATES.PLAYER_ACTIVE;
  room.bidEndsAt = Date.now() + BID_DURATION * 1000;

  console.log(`[Timer] Started for player: ${room.currentPlayer.name}`);

  // Create new timer interval
  room._timer = setInterval(() => {
    try {
      const now = Date.now();

      if (now >= room.bidEndsAt) {
        // Timer expired - handle timeout
        destroyTimer(room);
        handleTimerExpiry(room, io);
      } else {
        // Trigger AI bidding if enabled
        if (room.config.allowAI) {
          smartAIBid(room, io, placeBid);
        }

        // Emit room update for countdown
        io.to(room.id).emit("room-update", serializeRoom(room));
      }
    } catch (err) {
      console.error("[Timer] Error in timer interval:", err);
      destroyTimer(room);
    }
  }, 1000);
}

// Display duration for sold/unsold result (in seconds)
const RESULT_DISPLAY_DURATION = 5;

/**
 * Handles timer expiry - finalizes current player and shows result
 * @param {Object} room - Room object
 * @param {Object} io - Socket.io instance
 */
function handleTimerExpiry(room, io) {
  console.log("[Timer] Expired, finalizing player");

  // Save the player info before finalizing for display
  const finalizedPlayer = { ...room.currentPlayer };

  finalizePlayer(room, io);

  // If RTM was triggered, don't advance - wait for RTM resolution
  if (room.auctionState === 'RTM_PENDING') {
    console.log("[Timer] RTM triggered - waiting for RTM resolution before advancing");
    io.to(room.id).emit("room-update", serializeRoom(room));
    return; // Don't continue - RTM resolution will handle the rest
  }

  // Store the finalized player for display
  room.lastFinalizedPlayer = {
    ...finalizedPlayer,
    sold: room.auctionState === STATES.SOLD,
    soldTo: room.auctionState === STATES.SOLD ? room.teams.find(t => t.players?.some(p => p.id === finalizedPlayer.id))?.name : null,
    soldPrice: room.auctionState === STATES.SOLD ? room.teams.find(t => t.players?.some(p => p.id === finalizedPlayer.id))?.players?.find(p => p.id === finalizedPlayer.id)?.soldPrice : null
  };

  // Emit update showing the result
  io.to(room.id).emit("room-update", serializeRoom(room));

  console.log(`[Finalize] Showing result for ${RESULT_DISPLAY_DURATION} seconds...`);

  // Wait 5 seconds before advancing to next player
  setTimeout(() => {
    room.lastFinalizedPlayer = null; // Clear after display
    advancePlayer(room, io);
    io.to(room.id).emit("room-update", serializeRoom(room));
  }, RESULT_DISPLAY_DURATION * 1000);
}

/**
 * Places a bid on the current player
 * @param {Object} room - Room object
 * @param {string} teamId - ID of bidding team
 * @param {Object} io - Socket.io instance (optional, for future use)
 * @returns {boolean} - Whether bid was successful
 */
function placeBid(room, teamId, io) {
  // Validate auction state
  if (room.auctionState !== STATES.PLAYER_ACTIVE) {
    console.log("[Bid] Rejected: Auction state is not PLAYER_ACTIVE");
    return false;
  }

  if (!room.currentPlayer) {
    console.log("[Bid] Rejected: No current player");
    return false;
  }

  // Prevent same team from bidding twice in a row
  if (room.lastBidTeamId === teamId) {
    console.log("[Bid] Rejected: Same team cannot bid twice in a row");
    return false;
  }

  // Find the bidding team
  const team = room.teams.find(t => t.id === teamId);
  if (!team) {
    console.log("[Bid] Rejected: Team not found");
    return false;
  }

  // Check squad size limit (max 25 players)
  if ((team.players?.length || 0) >= 25) {
    console.log(`[Bid] Rejected: ${team.name} already has 25 players`);
    return false;
  }

  // Check overseas player limit (max 8 overseas players per team)
  if (room.currentPlayer.overseas) {
    const currentOverseasCount = (team.players || []).filter(p => p.overseas).length;
    if (currentOverseasCount >= MAX_OVERSEAS_PER_TEAM) {
      console.log(`[Bid] Rejected: ${team.name} already has ${MAX_OVERSEAS_PER_TEAM} overseas players`);
      return false;
    }
  }

  // Calculate next bid amount
  const currentAmount = room.currentBid?.amount || 0;
  const basePrice = room.currentPlayer.basePrice || 0.2;
  let nextBid;

  if (currentAmount === 0 || currentAmount < basePrice) {
    // First bid: Start at base price
    nextBid = basePrice;
  } else {
    // Subsequent bids: Increment by 0.25
    nextBid = currentAmount + 0.25;
  }

  // Check budget
  if (team.budget < nextBid) {
    console.log(`[Bid] Rejected: Insufficient budget (${team.budget} < ${nextBid})`);
    return false;
  }

  // Place the bid
  room.currentBid = { teamId, amount: nextBid };
  room.lastBidTeamId = teamId;

  // Reset timer on valid bid
  room.bidEndsAt = Date.now() + BID_DURATION * 1000;

  console.log(`[Bid] ${team.name} bid ${nextBid} Cr on ${room.currentPlayer.name}`);
  return true;
}

/**
 * Finalizes the current player (sold or unsold)
 * @param {Object} room - Room object
 */
function finalizePlayer(room, io) {
  const player = room.currentPlayer;
  if (!player) return;

  // Update the player in the auction pool and sets
  const poolPlayer = room.auctionPool?.find(p => p.id === player.id);

  // Also find in auctionSets for sync
  let setPlayer = null;
  if (room.auctionSets) {
    for (const setName of Object.keys(room.auctionSets)) {
      const found = room.auctionSets[setName].find(p => p.id === player.id);
      if (found) {
        setPlayer = found;
        break;
      }
    }
  }

  // Debug: Log current state before finalization
  console.log(`[Finalize] Processing ${player?.name}. currentBid:`, room.currentBid ? `${room.currentBid.amount} by team ${room.currentBid.teamId}` : 'NULL');

  if (room.currentBid) {
    // Debug logging for RTM
    console.log(`[RTM Debug] Checking RTM for player: ${player.name} (ID: ${player.id})`);
    console.log(`[RTM Debug] soldPlayersByTeam keys:`, Object.keys(room.soldPlayersByTeam || {}));
    console.log(`[RTM Debug] rtmCardsRemaining:`, room.rtmCardsRemaining);

    // Check for RTM eligibility before finalizing sale
    const rtmInfo = checkRTMEligibility(room, player.id);
    const buyingTeam = room.teams.find(t => t.id === room.currentBid.teamId);

    console.log(`[RTM Debug] RTM info result:`, rtmInfo);
    console.log(`[RTM Debug] Buying team:`, buyingTeam?.name);

    // If RTM is applicable and buying team is different from RTM team
    if (rtmInfo && buyingTeam && rtmInfo.teamName !== buyingTeam.name) {
      // Set RTM pending state - this will be resolved by user action or AI
      room.rtmPending = {
        playerId: player.id,
        playerName: player.name,
        rtmTeamName: rtmInfo.teamName,
        buyingTeamName: buyingTeam.name,
        buyingTeamId: buyingTeam.id,
        currentBid: room.currentBid.amount,
        rtmTeamDecision: null, // 'match' | 'decline' | null
        buyingTeamCounter: null // counter-offer amount if RTM is matched
      };
      room.auctionState = 'RTM_PENDING';
      console.log(`[RTM] Triggered for ${player.name}! ${rtmInfo.teamName} can match ${room.currentBid.amount} Cr bid by ${buyingTeam.name}`);

      // Start the RTM decision timer
      if (io) startRTMTimer(room, io);

      // Check if RTM team is AI - if so, auto-decide
      const rtmTeam = room.teams.find(t => t.name === rtmInfo.teamName);
      if (rtmTeam && rtmTeam.isAI) {
        // AI RTM decision logic
        const canAfford = rtmTeam.budget >= room.currentBid.amount;
        const playerValue = player.basePrice || 0.5;
        const priceRatio = room.currentBid.amount / playerValue;

        // AI matches if: can afford AND price isn't too inflated (< 4x base price)
        const shouldMatch = canAfford && priceRatio < 4;

        console.log(`[RTM AI] ${rtmTeam.name} auto-deciding: canAfford=${canAfford}, priceRatio=${priceRatio.toFixed(1)}, decision=${shouldMatch ? 'MATCH' : 'DECLINE'}`);

        // Auto-resolve after a short delay
        room._rtmAutoResolveTimeout = setTimeout(() => {
          // This will be handled by socket.js calling resolveRTM
          // For now, set a flag for socket.js to pick up
          room.rtmAutoDecision = shouldMatch ? 'match' : 'decline';
        }, 1500); // 1.5 second delay for realism
      }

      return; // Don't finalize yet - wait for RTM resolution
    }

    // Player sold to highest bidder (no RTM or same team)
    room.auctionState = STATES.SOLD;

    const team = room.teams.find(t => t.id === room.currentBid.teamId);
    if (team) {
      // Add to team
      team.players.push({
        ...player,
        basePrice: player.basePrice || 0.2, // Explicitly ensure basePrice is set
        sold: true,
        soldTo: team.name,
        soldPrice: room.currentBid.amount
      });
      team.budget -= room.currentBid.amount;



      // Update data
      if (poolPlayer) {
        poolPlayer.sold = true;
        poolPlayer.soldTo = team.name;
        poolPlayer.soldPrice = room.currentBid.amount;
      }

      if (setPlayer) {
        setPlayer.sold = true;
        setPlayer.soldTo = team.name;
        setPlayer.soldPrice = room.currentBid.amount;
      }

      console.log(`[Finalize] ${player.name} SOLD to ${team.name} for ${room.currentBid.amount} Cr`);

      // AUTO-END CHECK: 
      // If all "Active" teams (teams that have participated and bought at least 1 player) 
      // have reached MAX_SQUAD (25), we assume the live auction is over.
      // The remaining empty teams are assumed to be inactive/waiting for auto-fill.
      const activeTeams = room.teams.filter(t => (t.players?.length || 0) > 0);
      const allActiveTeamsFull = activeTeams.length > 0 && activeTeams.every(t => (t.players?.length || 0) >= 25);

      if (allActiveTeamsFull) {
        console.log("[Finalize] All teams reached max capacity (25 players). Ending auction!");

        // Destroy timer and set state to ENDED
        destroyTimer(room);
        room.auctionState = STATES.ENDED;
        room.state = "COMPLETED";

        // Auto-fill (no-op if full, but good for safety)
        autoFillTeams(room);

        // Generate summary
        room.summary = generateAuctionSummary(room);

        // Emit update
        if (io) io.to(room.id).emit("room-update", serializeRoom(room));
        return; // Stop further processing
      }

    } else {
      // Player unsold (skipped or no bids)
      room.auctionState = STATES.SKIPPED;

      // Update pool object
      if (poolPlayer) {
        poolPlayer.sold = false;
        poolPlayer.soldTo = null;
        poolPlayer.soldPrice = null;
      }

      // Update auctionSets object
      if (setPlayer) {
        setPlayer.sold = false;
        setPlayer.soldTo = null;
        setPlayer.soldPrice = null;
      }

      console.log(`[Finalize] ${player.name} UNSOLD`);
    }

    // Clear bid state
    room.currentBid = null;
    room.lastBidTeamId = null;
  }
}

/**
 * Advances to the next player in the auction pool
 * @param {Object} room - Room object
 * @param {Object} io - Socket.io instance
 */
function advancePlayer(room, io) {
  room.currentIndex++;

  // Check if there are more players
  if (room.currentIndex < room.auctionPool.length) {
    room.currentPlayer = room.auctionPool[room.currentIndex];

    // Determine and update Current Set
    if (room.auctionSets) {
      for (const [setName, players] of Object.entries(room.auctionSets)) {
        if (players.some(p => p.id === room.currentPlayer.id)) {
          room.currentSet = setName;
          break;
        }
      }
    }

    console.log(`[Advance] Next player: ${room.currentPlayer.name} (${room.currentIndex + 1}/${room.auctionPool.length}) - Set: ${room.currentSet}`);

    // Start timer for new player
    startTimer(room, io);
  } else {
    // All players processed - auction ended
    room.currentPlayer = null;
    room.auctionState = STATES.ENDED;
    room.state = "COMPLETED";

    console.log("[Advance] Auction COMPLETED - all players processed");

    // Auto-fill teams if needed
    autoFillTeams(room);

    // Generate auction summary
    room.summary = generateAuctionSummary(room);
    console.log("[Summary] Generated auction summary:", room.summary.bestTeam?.name);

    // Emit final update
    io.to(room.id).emit("room-update", serializeRoom(room));
  }
}

/**
 * Skips the current player (only if no bids placed)
 * @param {Object} room - Room object
 * @param {Object} io - Socket.io instance
 * @returns {boolean} - Whether skip was successful
 */
function skipPlayer(room, io) {
  // Validate state
  if (room.auctionState !== STATES.PLAYER_ACTIVE) {
    console.log("[Skip] Rejected: Auction state is not PLAYER_ACTIVE");
    return false;
  }

  // Can only skip if no bids placed
  if (room.currentBid) {
    console.log("[Skip] Rejected: Cannot skip player with active bids");
    return false;
  }

  console.log(`[Skip] Skipping player: ${room.currentPlayer?.name}`);

  // Destroy timer and finalize as skipped
  destroyTimer(room);

  // Save the player info before finalizing for display
  const finalizedPlayer = { ...room.currentPlayer };

  finalizePlayer(room);

  // Set lastFinalizedPlayer so frontend sees the "Unsold" result/sound
  room.lastFinalizedPlayer = {
    ...finalizedPlayer,
    sold: false,
    soldTo: null,
    soldPrice: null
  };

  // Emit update showing the result (SKIPPED state)
  io.to(room.id).emit("room-update", serializeRoom(room));

  console.log(`[Skip] Showing result for 5 seconds...`);

  // Wait 5 seconds before advancing to next player
  setTimeout(() => {
    room.lastFinalizedPlayer = null; // Clear after display
    advancePlayer(room, io);
    io.to(room.id).emit("room-update", serializeRoom(room));
  }, 5000);

  return true;
}

/**
 * Resolve RTM (Right to Match) situation
 * @param {Object} room - Room object
 * @param {Object} io - Socket.io instance
 * @param {string} rtmAction - 'match' or 'decline'
 * @param {number} counterOffer - Optional counter offer from buying team (if RTM matched)
 * @param {string} finalDecision - 'match' or 'decline' for RTM team's final decision after counter
 */
function resolveRTM(room, io, rtmAction, counterOffer = null, finalDecision = null) {
  if (!room.rtmPending) {
    console.log("[RTM] No pending RTM to resolve");
    return false;
  }

  const rtm = room.rtmPending;
  const player = room.currentPlayer;
  const rtmTeam = room.teams.find(t => t.name === rtm.rtmTeamName);
  const buyingTeam = room.teams.find(t => t.id === rtm.buyingTeamId);

  if (!rtmTeam || !buyingTeam || !player) {
    console.log("[RTM] Invalid RTM state - missing team or player");
    room.rtmPending = null;
    return false;
  }

  // Get pool and set player references for updating
  const poolPlayer = room.auctionPool?.find(p => p.id === player.id);
  let setPlayer = null;
  if (room.auctionSets) {
    for (const setName of Object.keys(room.auctionSets)) {
      const found = room.auctionSets[setName].find(p => p.id === player.id);
      if (found) { setPlayer = found; break; }
    }
  }

  // Helper to sell player to a team (rtmUsed = true if RTM team matched)
  const sellPlayerTo = (team, price, rtmUsed = false) => {
    team.players.push({
      ...player,
      sold: true,
      soldTo: team.name,
      soldPrice: price,
      rtmUsed: rtmUsed
    });
    team.budget -= price;
    if (poolPlayer) { poolPlayer.sold = true; poolPlayer.soldTo = team.name; poolPlayer.soldPrice = price; poolPlayer.rtmUsed = rtmUsed; }
    if (setPlayer) { setPlayer.sold = true; setPlayer.soldTo = team.name; setPlayer.soldPrice = price; setPlayer.rtmUsed = rtmUsed; }
    console.log(`[RTM] ${player.name} SOLD to ${team.name} for ${price} Cr${rtmUsed ? ' (via RTM)' : ''}`);
  };

  if (rtmAction === 'decline') {
    // RTM team declined (or timed out) - player goes to buying team
    // If a counter offer exists, sell at THAT price. Otherwise original bid.
    const finalPrice = (rtm.buyingTeamCounter && rtm.buyingTeamCounter > 0) ? rtm.buyingTeamCounter : rtm.currentBid;

    sellPlayerTo(buyingTeam, finalPrice);
    room.auctionState = STATES.SOLD;

    if (rtm.buyingTeamCounter) {
      console.log(`[RTM] ${rtm.rtmTeamName} declined Counter Offer. Sold to ${buyingTeam.name} for ₹${finalPrice}Cr`);
    } else {
      console.log(`[RTM] ${rtm.rtmTeamName} declined RTM. Sold to ${buyingTeam.name} for ₹${finalPrice}Cr`);
    }
  } else if (rtmAction === 'match') {
    // Check if buying team has made a counter offer
    if (rtm.buyingTeamCounter && rtm.buyingTeamCounter > rtm.currentBid) {
      // We're in the final decision phase after counter
      if (finalDecision === 'match') {
        // RTM team matched the counter offer - they get the player
        sellPlayerTo(rtmTeam, rtm.buyingTeamCounter, true);
        consumeRTMCard(room, rtm.rtmTeamName);
        room.auctionState = STATES.SOLD;
        console.log(`[RTM] ${rtm.rtmTeamName} matched counter of ₹${rtm.buyingTeamCounter}Cr for ${player.name}`);
      } else if (finalDecision === 'decline') {
        // RTM team declined counter - player goes to buying team at counter price
        // RTM card is NOT consumed
        sellPlayerTo(buyingTeam, rtm.buyingTeamCounter);
        room.auctionState = STATES.SOLD;
        console.log(`[RTM] ${rtm.rtmTeamName} declined counter of ₹${rtm.buyingTeamCounter}Cr - ${player.name} to ${buyingTeam.name}`);
      } else {
        // This shouldn't happen - invalid state
        console.log(`[RTM] ERROR: Counter exists but no final decision provided`);
        return false;
      }
    } else if (counterOffer && counterOffer > rtm.currentBid) {
      // Buying team just made a counter offer - update state and wait for RTM decision
      rtm.buyingTeamCounter = counterOffer;
      room.auctionState = 'RTM_FINAL_PENDING';
      console.log(`[RTM] ${buyingTeam.name} countered with ₹${counterOffer}Cr - waiting for ${rtm.rtmTeamName} final decision`);

      startRTMTimer(room, io); // Restart timer for final decision

      io.to(room.id).emit("room-update", serializeRoom(room));
      return true;
    } else if (!rtm.rtmMatchedAt) {
      // RTM team just matched for the first time - give buying team chance to counter
      rtm.rtmMatchedAt = Date.now();
      room.auctionState = 'RTM_COUNTER_PENDING';
      console.log(`[RTM] ${rtm.rtmTeamName} matched! ${buyingTeam.name} can now counter or accept`);

      startRTMTimer(room, io); // Restart timer for counter decision

      io.to(room.id).emit("room-update", serializeRoom(room));
      return true;
    } else {
      // RTM already matched, no counter made - RTM team gets player at original bid
      sellPlayerTo(rtmTeam, rtm.currentBid, true);
      consumeRTMCard(room, rtm.rtmTeamName);
      room.auctionState = STATES.SOLD;
      stopRTMTimer(room); // Stop timer
      console.log(`[RTM] ${rtm.rtmTeamName} matched ₹${rtm.currentBid}Cr for ${player.name} (no counter from ${buyingTeam.name})`);
    }
  } else if (rtmAction === 'skip-counter') {
    // Buying team chose not to counter - RTM team gets player
    sellPlayerTo(rtmTeam, rtm.currentBid, true);
    consumeRTMCard(room, rtm.rtmTeamName);
    room.auctionState = STATES.SOLD;
    stopRTMTimer(room); // Stop timer
    console.log(`[RTM] ${buyingTeam.name} skipped counter - ${player.name} to ${rtm.rtmTeamName} for ₹${rtm.currentBid}Cr`);
  }

  // Store last finalized player for display
  room.lastFinalizedPlayer = {
    ...player,
    sold: true,
    soldTo: room.auctionState === STATES.SOLD ?
      (rtmAction === 'decline' ? buyingTeam.name :
        (counterOffer && finalDecision === 'decline' ? buyingTeam.name : rtmTeam.name)) : null,
    soldPrice: counterOffer || rtm.currentBid,
    rtmUsed: rtmAction === 'match' && (finalDecision !== 'decline' || !counterOffer)
  };

  if (room.auctionState === STATES.SOLD) {
    stopRTMTimer(room);
  }

  // Clear RTM pending and bid state
  room.rtmPending = null;
  room.currentBid = null;
  room.lastBidTeamId = null;

  // Emit update
  io.to(room.id).emit("room-update", serializeRoom(room));

  // Wait then advance to next player
  setTimeout(() => {
    room.lastFinalizedPlayer = null;
    advancePlayer(room, io);
    io.to(room.id).emit("room-update", serializeRoom(room));
  }, 5000);

  return true;
}

/**
 * Starts the RTM decision timer
 * @param {Object} room - Room object
 * @param {Object} io - Socket.io instance
 */
/**
 * Stops the RTM decision timer
 * @param {Object} room - Room object
 */
function stopRTMTimer(room) {
  if (room._rtmTimer) {
    clearTimeout(room._rtmTimer);
    room._rtmTimer = null;
  }
}

/**
 * Starts the RTM decision timer
 * @param {Object} room - Room object
 * @param {Object} io - Socket.io instance
 */
function startRTMTimer(room, io) {
  stopRTMTimer(room); // Reset if exists

  const RTM_TIMEOUT = 15; // 15 seconds to decide

  room.rtmEndsAt = Date.now() + RTM_TIMEOUT * 1000;

  console.log(`[RTM] Timer started: ${RTM_TIMEOUT}s to decide`);

  // We can treat this similar to the bid timer if we want countdowns
  // For now, just a hard timeout to prevent deadlocks
  room._rtmTimer = setTimeout(() => {
    console.log(`[RTM] Timer expired! Auto-declining RTM.`);
    const rtm = room.rtmPending;
    if (rtm) {
      // Auto-decline - but strictly decline the CURRENT phase
      // If we are in RTM_FINAL_PENDING, declining means declining the match (player go to Buying Team)
      // If we are in RTM_COUNTER_PENDING, declining means skipping counter? No, timeout on counter -> skip counter

      if (room.auctionState === 'RTM_COUNTER_PENDING') {
        resolveRTM(room, io, 'skip-counter'); // Buying team took too long -> matched
      } else {
        resolveRTM(room, io, 'decline'); // RTM team took too long -> declined
      }

      // Notify everyone
      io.to(room.id).emit("notification", {
        type: "info",
        message: `RTM time expired! Action auto-processed.`
      });
    }
  }, RTM_TIMEOUT * 1000);
}

/**
 * Handles potential RTM-holder disconnection
 * @param {Object} room - Room object
 * @param {string} socketId - The disconnected socket ID
 * @param {Object} io - Socket.io instance
 */
function handleRTMDisconnect(room, socketId, io) {
  if (!room.rtmPending) return;

  const rtm = room.rtmPending;
  const rtmTeam = room.teams.find(t => t.name === rtm.rtmTeamName);

  // Check if the disconnected socket belongs to the RTM holding team
  // Note: users map is stored in room.users usually, linked to teamId/name
  // We need to check if this socket was the 'owner' of that team
  // Assuming room structure has mapping or we scan users

  // Logic: scan room.users, find user with this socketId
  // Check if that user owns the rtmTeam

  // Simple check: if the room host is the RTM holder? No, any team can hold RTM.
  // We need to know which socket controls the RTM team.
  // In `roomManager.js`, `joinRoom` maps socketId to user. `selectTeam` maps user/socket to team.
  // We'll rely on `room.teams` having a `socketId` property if we implemented that, OR check `room.users`.

  // Ideally, room.teams should track the current socketId of the owner.
  // If not, we iterate room.users
  const user = Object.values(room.users || {}).find(u => u.socketId === socketId);
  if (!user || !user.teamId) return; // Not a team owner

  const team = room.teams.find(t => t.id === user.teamId);
  if (!team) return;

  if (team.name === rtm.rtmTeamName) {
    console.log(`[RTM] RTM Holder (${team.name}) disconnected! Auto-declining.`);
    resolveRTM(room, io, 'decline');
    io.to(room.id).emit("notification", {
      type: "warning",
      message: `RTM Team (${team.name}) disconnected. Sold to highest bidder.`
    });
  }
}

module.exports = {
  STATES,
  startTimer,
  placeBid,
  skipPlayer,
  destroyTimer,
  resolveRTM,
  startRTMTimer,
  handleRTMDisconnect,
  MAX_OVERSEAS_PER_TEAM
};
