/**
 * Socket.io event handlers for the auction application
 * All events are wrapped in try-catch for error resilience
 */

const serializeRoom = require("./utils/serializeRoom");

// serializeRoom now includes serverTime internally, so we use it directly.
const serializeRoomWithTime = serializeRoom;
const {
  rooms,
  createRoom,
  joinRoom,
  selectTeam,
  buildTeamsFromHumans,
  handleDisconnect
} = require("./roomManager");

const { buildAuctionSets } = require("./engines/buildAuctionSets");
const {
  startTimer,
  placeBid,
  skipPlayer,
  resolveRTM,
  handleRTMDisconnect,
  skipAIBidding
} = require("./engines/auctionEngine");

const {
  retainPlayers,
  autoFinalizeRetention
} = require("./engines/retentionEngine");

const {
  getStats,
  incrementAuctionsStarted,
  incrementAuctionsEnded,
  incrementTotalViews,
  initStats
} = require("./utils/statsManager");

// Initialize stats on server start
initStats();

module.exports = server => {
  const io = require("socket.io")(server, {
    cors: { origin: "*" },
    pingInterval: 2000,
    pingTimeout: 5000
  });

  io.on("connection", socket => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Increment total views and broadcast to all clients
    const updatedStats = incrementTotalViews();
    io.emit("stats-update", updatedStats);

    // Handle stats request
    socket.on("get-stats", () => {
      socket.emit("stats-update", getStats());
    });

    // Create a new room
    socket.on("create-room", ({ username, config }) => {
      try {
        const room = createRoom(username, socket.id, config);
        socket.join(room.id);
        console.log(`[Room] Created: ${room.id} by ${username}`);
        io.to(room.id).emit("room-update", serializeRoom(room));
      } catch (err) {
        console.error("[create-room] Error:", err);
        socket.emit("error", {
          message: "Failed to create room: " + (err.message || "Unknown error"),
          details: err.stack
        });
      }
    });

    // Join an existing room
    socket.on("join-room", ({ roomId, username }) => {
      try {
        const room = joinRoom(roomId, username, socket.id);
        if (!room) {
          socket.emit("error", { message: "Unable to join room. Room may not exist or username is already in use." });
          return;
        }
        socket.join(roomId);
        console.log(`[Room] ${username} joined ${roomId}`);
        io.to(roomId).emit("room-update", serializeRoom(room));
      } catch (err) {
        console.error("[join-room] Error:", err);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    // Select a team
    socket.on("select-team", (data) => {
      try {
        console.log("------------------------------------------------");
        console.log("[SOCKET DEBUG] select-team received:", JSON.stringify(data));
        console.log("[SOCKET DEBUG] Socket ID:", socket.id);

        const { roomId, teamName } = data || {};

        if (!roomId || !teamName) {
          console.log("[SOCKET DEBUG] Missing roomId or teamName");
          return;
        }

        console.log(`[select-team] Handing to roomManager...`);
        const room = selectTeam(roomId, socket.id, teamName);

        if (room) {
          console.log(`[select-team] SUCCESS: ${teamName} in room ${roomId}. Emitting update.`);
          io.to(roomId).emit("room-update", serializeRoom(room));
        } else {
          console.log(`[select-team] FAILED: selectTeam returned null. Check roomManager logs.`);
        }
      } catch (err) {
        console.error("[select-team] EXCEPTION:", err);
      }
    });

    // Lock teams - goes to RETENTION if enabled, otherwise POOL_FILTER
    socket.on("lock-teams", ({ roomId }) => {
      try {
        const room = rooms[roomId];
        if (!room) {
          console.log("[lock-teams] Room not found:", roomId);
          return;
        }
        if (socket.id !== room.hostSocketId) {
          console.log("[lock-teams] Not host, rejecting");
          return;
        }

        buildTeamsFromHumans(room);
        console.log(`[Room] Teams locked in ${roomId}`);

        // If retention enabled, go to RETENTION first
        if (room.config.retentionEnabled) {
          room.state = "RETENTION";
          io.to(roomId).emit("room-update", serializeRoom(room));

          // Auto-finalize retentions after 30 seconds, then go to POOL_FILTER
          setTimeout(() => {
            try {
              autoFinalizeRetention(room);
              room.state = "POOL_FILTER";
              console.log(`[Room] Retention done, moving to Pool Filter in ${roomId}`);
              io.to(roomId).emit("room-update", serializeRoom(room));
            } catch (err) {
              console.error("[lock-teams:retention] Error:", err);
            }
          }, 30000);
        } else {
          // No retention mode - RTM is also disabled
          // Set RTM cards to 0 for all teams
          room.rtmCardsRemaining = {};
          room.teams.forEach(team => {
            room.rtmCardsRemaining[team.name] = 0;
            team.rtmCardsRemaining = 0;
          });
          console.log(`[RTM] RTM disabled (no retention mode)`);
          room.state = "POOL_FILTER";
          io.to(roomId).emit("room-update", serializeRoom(room));
        }
      } catch (err) {
        console.error("[lock-teams] Error:", err);
      }
    });

    // Filter pool - apply filters and start auction
    socket.on("filter-pool", ({ roomId, filters }) => {
      try {
        const room = rooms[roomId];
        if (!room || room.state !== "POOL_FILTER") return;
        if (socket.id !== room.hostSocketId) return;

        // Apply filters
        room.poolFilters = filters;
        console.log(`[Pool] Applying filters with ${filters.selectedPlayerIds?.length || 0} selected players`);

        // Build sets and start auction
        startAuctionFromPoolFilter(room, roomId, io);
      } catch (err) {
        console.error("[filter-pool] Error:", err);
      }
    });

    // Skip pool filter - use all players
    socket.on("skip-pool-filter", ({ roomId }) => {
      try {
        const room = rooms[roomId];
        if (!room || room.state !== "POOL_FILTER") return;
        if (socket.id !== room.hostSocketId) return;

        console.log(`[Pool] Skipping filter, using all players`);
        room.poolFilters = null;

        // Build sets and start auction
        startAuctionFromPoolFilter(room, roomId, io);
      } catch (err) {
        console.error("[skip-pool-filter] Error:", err);
      }
    });

    // Helper: start auction after pool filter
    function startAuctionFromPoolFilter(room, roomId, io) {
      buildAuctionSets(room);
      applyPoolFilters(room);
      room.state = "AUCTION_RUNNING";
      console.log(`[Auction] Started in room ${roomId} with ${room.auctionPool.length} players`);

      // Increment and broadcast auction counter to ALL connected clients
      const stats = incrementAuctionsStarted();
      io.emit("stats-update", stats); // Broadcast to all, not just room

      io.to(roomId).emit("room-update", serializeRoom(room));
      startTimer(room, io);
    }

    // Apply pool filters to reduce auction pool
    function applyPoolFilters(room) {
      const filters = room.poolFilters;
      if (!filters) return;

      const originalCount = room.auctionPool.length;

      // Filter by selected player IDs (from set selection)
      if (filters.selectedPlayerIds && filters.selectedPlayerIds.length > 0) {
        const selectedSet = new Set(filters.selectedPlayerIds);
        room.auctionPool = room.auctionPool.filter(p => selectedSet.has(p.id));
      }

      // Legacy: Filter by roles (if no selectedPlayerIds)
      else if (filters.roles && filters.roles.length > 0) {
        room.auctionPool = room.auctionPool.filter(p => filters.roles.includes(p.role));
      }

      // Filter by minimum base price
      if (filters.minBasePrice > 0) {
        room.auctionPool = room.auctionPool.filter(p => (p.basePrice || 0) >= filters.minBasePrice);
      }

      // Limit max players
      if (filters.maxPlayers && room.auctionPool.length > filters.maxPlayers) {
        room.auctionPool = room.auctionPool.slice(0, filters.maxPlayers);
      }

      // Update current player
      room.currentPlayer = room.auctionPool[0] || null;
      room.currentIndex = 0;

      console.log(`[Pool] Filtered: ${originalCount} -> ${room.auctionPool.length} players`);
    }

    // Retain players (during retention phase)
    socket.on("retain-players", ({ roomId, teamName, retainedIds, rtmIds }) => {
      try {
        const room = rooms[roomId];
        if (!room) return;
        retainPlayers(room, teamName, retainedIds, rtmIds || []);
        console.log(`[Retention] ${teamName} retained ${retainedIds.length} players, ${(rtmIds || []).length} RTM`);
        io.to(roomId).emit("room-update", serializeRoom(room));
      } catch (err) {
        console.error("[retain-players] Error:", err);
      }
    });

    // RTM: Match the bid
    socket.on("rtm-match", ({ roomId }) => {
      try {
        const room = rooms[roomId];
        if (!room || !room.rtmPending) return;
        console.log(`[RTM] Team ${room.rtmPending.rtmTeamName} matching bid`);
        resolveRTM(room, io, 'match');
      } catch (err) {
        console.error("[rtm-match] Error:", err);
      }
    });

    // RTM: Decline the match
    socket.on("rtm-decline", ({ roomId }) => {
      try {
        const room = rooms[roomId];
        if (!room || !room.rtmPending) return;
        console.log(`[RTM] Team ${room.rtmPending.rtmTeamName} declining RTM`);
        resolveRTM(room, io, 'decline');
      } catch (err) {
        console.error("[rtm-decline] Error:", err);
      }
    });

    // RTM: Buying team makes counter offer
    socket.on("rtm-counter", ({ roomId, counterAmount }) => {
      try {
        const room = rooms[roomId];
        if (!room || !room.rtmPending) return;
        console.log(`[RTM] Counter offer: ${counterAmount} Cr`);
        resolveRTM(room, io, 'match', counterAmount);
      } catch (err) {
        console.error("[rtm-counter] Error:", err);
      }
    });

    // RTM: Final decision after counter
    socket.on("rtm-final", ({ roomId, decision }) => {
      try {
        const room = rooms[roomId];
        if (!room || !room.rtmPending) return;
        const counter = room.rtmPending.buyingTeamCounter;
        console.log(`[RTM] Final decision: ${decision} (counter was ${counter})`);
        resolveRTM(room, io, 'match', counter, decision);
      } catch (err) {
        console.error("[rtm-final] Error:", err);
      }
    });

    // RTM: Buying team skips counter (accepts RTM team's match)
    socket.on("rtm-skip-counter", ({ roomId }) => {
      try {
        const room = rooms[roomId];
        if (!room || !room.rtmPending) return;
        console.log(`[RTM] Buying team skipped counter`);
        resolveRTM(room, io, 'skip-counter');
      } catch (err) {
        console.error("[rtm-skip-counter] Error:", err);
      }
    });

    // Place a bid
    socket.on("place-bid", ({ roomId, teamId }) => {
      try {
        const room = rooms[roomId];
        if (!room) {
          console.log("[place-bid] Room not found:", roomId);
          return;
        }

        const success = placeBid(room, teamId, io);
        if (success) {
          io.to(roomId).emit("room-update", serializeRoom(room));
        }
      } catch (err) {
        console.error("[place-bid] Error:", err);
      }
    });

    // Skip current player
    socket.on("skip-player", ({ roomId }) => {
      try {
        const room = rooms[roomId];
        if (!room) {
          console.log("[skip-player] Room not found:", roomId);
          return;
        }

        // skipPlayer handles its own room update emission
        skipPlayer(room, io);
      } catch (err) {
        console.error("[skip-player] Error:", err);
      }
    });

    // Skip AI bidding - instantly show AI's max bid
    socket.on("skip-ai-bidding", ({ roomId }) => {
      try {
        const room = rooms[roomId];
        if (!room) {
          console.log("[skip-ai-bidding] Room not found:", roomId);
          return;
        }

        // skipAIBidding handles its own room update emission
        skipAIBidding(room, io);
      } catch (err) {
        console.error("[skip-ai-bidding] Error:", err);
      }
    });

    // End auction early (host only)
    socket.on("end-auction", ({ roomId }) => {
      try {
        console.log("[end-auction] Received event for room:", roomId);

        const room = rooms[roomId];
        if (!room) {
          console.log("[end-auction] Room not found:", roomId);
          return;
        }

        // Only host can end auction
        if (socket.id !== room.hostSocketId) {
          console.log("[end-auction] Not host. socket.id:", socket.id, "host:", room.hostSocketId);
          return;
        }

        // Only end if auction is running
        if (room.state !== "AUCTION_RUNNING") {
          console.log("[end-auction] Auction not running. State:", room.state);
          return;
        }

        console.log(`[end-auction] Host ending auction in room ${roomId}`);

        // Import required modules
        const { destroyTimer } = require("./engines/auctionEngine");
        const { autoFillTeams } = require("./engines/aiAutoFillEngine");
        const { generateAuctionSummary } = require("./engines/auctionSummary");

        // Stop any running timer
        console.log("[end-auction] Destroying timer...");
        destroyTimer(room);

        // Update state
        console.log("[end-auction] Updating state to COMPLETED...");
        room.currentPlayer = null;
        room.auctionState = "ENDED";
        room.state = "COMPLETED";

        // Auto-fill teams
        console.log("[end-auction] Starting auto-fill...");
        autoFillTeams(room);
        console.log("[end-auction] Auto-fill complete");

        // Generate summary
        console.log("[end-auction] Generating summary...");
        room.summary = generateAuctionSummary(room);
        console.log("[end-auction] Summary generated. Best team:", room.summary?.bestTeam?.name);

        // Increment auctions ended counter and broadcast to all clients
        const stats = incrementAuctionsEnded();
        io.emit("stats-update", stats);

        // Emit final update
        console.log("[end-auction] Emitting room-update...");
        io.to(roomId).emit("room-update", serializeRoom(room));
        console.log("[end-auction] Done! Auction ended successfully.");
      } catch (err) {
        console.error("[end-auction] ERROR:", err);
        console.error("[end-auction] Stack:", err.stack);
      }
    });

    // ============ TEXT CHAT ============
    socket.on("send-chat-message", ({ roomId, username, text }) => {
      try {
        const room = rooms[roomId];
        if (!room) return;

        const message = {
          username: username || 'Anonymous',
          text: text.substring(0, 500), // Limit message length
          timestamp: Date.now()
        };

        // Broadcast to all users in the room including sender
        io.to(roomId).emit("chat-message", message);
        console.log(`[Chat] ${username} in ${roomId}: ${text.substring(0, 50)}...`);
      } catch (err) {
        console.error("[send-chat-message] Error:", err);
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);

      // Handle Voice Chat disconnect
      // Handle Voice Chat disconnect
      const disconnectResult = handleDisconnect(socket.id);
      const room = disconnectResult ? disconnectResult.room : null;
      const newHostId = disconnectResult ? disconnectResult.newHostId : undefined;

      if (room) {
        // If user was in voice, notify others
        if (room.voiceUsers && room.voiceUsers[socket.id]) {
          delete room.voiceUsers[socket.id];
          socket.broadcast.to(room.id).emit('user-left-voice', socket.id);
        }

        io.to(room.id).emit("room-update", serializeRoom(room));

        // Notify new host specifically
        if (newHostId) {
          io.to(newHostId).emit("notification", {
            type: "success",
            message: "You are now the HOST of this auction!"
          });
          io.to(room.id).emit("notification", {
            type: "info",
            message: "Host disconnected. A new host has been assigned."
          });
        }
      }

      // Handle RTM Disconnect
      if (room) {
        handleRTMDisconnect(room, socket.id, io);
      } else {
        // Iterate all rooms to check for RTM holder disconnect?
        // Ideally handleDisconnect covers the room the user was "in".
        // If the user had multiple tabs or rooms, handleDisconnect might need to be robust.
        // For now, assuming user is in one room which handleDisconnect returns.
      }
    });

    // --- Voice Chat Signaling (WebRTC Mesh) ---

    // User joins voice channel
    socket.on("join-voice", ({ roomId }) => {
      try {
        const room = rooms[roomId];
        if (!room) return;

        if (!room.voiceUsers) room.voiceUsers = {}; // Initialize if missing

        // Add user to voice list
        room.voiceUsers[socket.id] = true;

        // Get list of *other* users in voice
        const usersInThisRoom = Object.keys(room.voiceUsers).filter(id => id !== socket.id);

        // Tell the new user who else is here (so they can initiate calls)
        socket.emit("all-voice-users", usersInThisRoom);

      } catch (err) {
        console.error("[join-voice] Error:", err);
      }
    });

    // Relay signaling data (offer/answer/candidate)
    socket.on("sending-signal", payload => {
      try {
        // payload: { userToSignal, callerID, signal }
        io.to(payload.userToSignal).emit('user-joined-voice', {
          signal: payload.signal,
          callerID: payload.callerID
        });
      } catch (err) {
        console.error("Error sending signal", err);
      }
    });

    socket.on("returning-signal", payload => {
      try {
        // payload: { callerID, signal }
        io.to(payload.callerID).emit('receiving-returned-signal', {
          signal: payload.signal,
          id: socket.id
        });
      } catch (err) {
        console.error("Error returning signal", err);
      }
    });

    // Explicit leave
    socket.on("leave-voice", ({ roomId }) => {
      try {
        const room = rooms[roomId];
        if (room && room.voiceUsers) {
          delete room.voiceUsers[socket.id];
          socket.broadcast.to(roomId).emit('user-left-voice', socket.id);
        }
      } catch (err) {
        console.error("Error leave voice", err);
      }
    });
  });

  // Periodic check for AI RTM auto-decisions
  setInterval(() => {
    for (const roomId in rooms) {
      const room = rooms[roomId];
      if (!room.rtmPending) continue;

      // Handle AI auto-decision for initial RTM match/decline
      if (room.rtmAutoDecision) {
        const decision = room.rtmAutoDecision;
        room.rtmAutoDecision = null;
        console.log(`[RTM AI] Processing auto-decision for ${room.rtmPending.rtmTeamName}: ${decision}`);
        resolveRTM(room, io, decision);
        continue;
      }

      // Handle RTM_COUNTER_PENDING - AI buying team should auto-counter or skip
      if (room.auctionState === 'RTM_COUNTER_PENDING') {
        const buyingTeam = room.teams.find(t => t.id === room.rtmPending.buyingTeamId);
        if (buyingTeam && buyingTeam.isAI && !room._aiCounterProcessed) {
          room._aiCounterProcessed = true;

          // AI counter logic: 50% chance to counter, up to 1 Cr more
          const shouldCounter = Math.random() < 0.5 && buyingTeam.budget > room.rtmPending.currentBid + 0.5;

          setTimeout(() => {
            if (room.auctionState === 'RTM_COUNTER_PENDING') {
              if (shouldCounter) {
                const counterAmount = room.rtmPending.currentBid + (Math.random() < 0.5 ? 0.25 : 0.5);
                console.log(`[RTM AI] ${buyingTeam.name} counter-offering ₹${counterAmount}Cr`);
                resolveRTM(room, io, 'match', counterAmount);
              } else {
                console.log(`[RTM AI] ${buyingTeam.name} skipping counter`);
                resolveRTM(room, io, 'skip-counter');
              }
              room._aiCounterProcessed = false;
            }
          }, 1500);
        }
      }

      // Handle RTM_FINAL_PENDING - AI RTM team should auto-decide on counter
      if (room.auctionState === 'RTM_FINAL_PENDING') {
        const rtmTeam = room.teams.find(t => t.name === room.rtmPending.rtmTeamName);
        if (rtmTeam && rtmTeam.isAI && !room._aiFinalProcessed) {
          room._aiFinalProcessed = true;

          // AI final decision: match if can afford and price < 5x base
          const player = room.currentPlayer;
          const canAfford = rtmTeam.budget >= room.rtmPending.buyingTeamCounter;
          const priceRatio = room.rtmPending.buyingTeamCounter / (player?.basePrice || 0.5);
          const shouldMatch = canAfford && priceRatio < 5;

          setTimeout(() => {
            if (room.auctionState === 'RTM_FINAL_PENDING') {
              console.log(`[RTM AI] ${rtmTeam.name} final decision on counter: ${shouldMatch ? 'MATCH' : 'DECLINE'}`);
              resolveRTM(room, io, 'match', room.rtmPending.buyingTeamCounter, shouldMatch ? 'match' : 'decline');
              room._aiFinalProcessed = false;
            }
          }, 1500);
        }
      }
    }
  }, 500); // Check every 500ms
};
