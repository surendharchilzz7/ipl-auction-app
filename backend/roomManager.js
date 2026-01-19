const data2025 = require("./data/reference/players_2025.json");
const season2025 = require("./data/seasons/2025.json");
const rules = require("./data/rules/auctionRules.json");

const rooms = {};
const roomCleanupTimers = {}; // Track cleanup timers for empty rooms
const IPL_TEAMS = Object.keys(season2025.teams || season2025);

// Fallback if teams object is empty
const DEFAULT_TEAMS = ["CSK", "MI", "RCB", "KKR", "SRH", "RR", "DC", "PBKS", "LSG", "GT"];

function splitPlayers(players) {
  const soldByTeam = {};
  const unsold = [];

  // DEEP CLONE each player to prevent modifications from affecting original data
  players.forEach(p => {
    // Create a fresh copy of the player object
    const playerCopy = { ...p, retained: false, sold: p.sold, soldTo: null, soldPrice: null };

    // Check both 'team' and 'soldTo' fields - some players have one or the other
    const teamName = p.team || p.soldTo;

    if (p.sold && teamName) {
      if (!soldByTeam[teamName]) soldByTeam[teamName] = [];
      soldByTeam[teamName].push(playerCopy);
    } else {
      unsold.push(playerCopy);
    }
  });

  return { soldByTeam, unsold };
}

function createRoom(username, socketId, config = {}) {
  const id = Math.random().toString(36).substring(2, 8);
  // Each room gets a FRESH copy of all players
  const { soldByTeam, unsold } = splitPlayers(data2025.players || []);

  // Use default teams if IPL_TEAMS is empty
  const teamsToUse = IPL_TEAMS.length > 0 ? IPL_TEAMS : DEFAULT_TEAMS;

  const room = {
    id,
    hostSocketId: socketId,
    season: season2025.season,
    seasonSquads: season2025.teams || {},
    rules,

    config: {
      allowAI: !!config.allowAI,
      retentionEnabled: !!config.retentionEnabled
    },

    state: "TEAM_SELECTION",

    humans: [{ username, socketId, team: null }],

    teams: teamsToUse.map(t => ({
      id: `team-${t}`,
      name: t,
      owner: null,
      socketId: null,
      budget: rules.purse || 120,
      players: [],
      retained: [],
      isAI: false
    })),

    soldPlayersByTeam: soldByTeam,
    unsoldPlayers: unsold,

    retainedPlayers: {},

    auctionPool: [],
    currentIndex: 0,
    currentPlayer: null,
    currentBid: null,
    lastBidTeamId: null,

    _timer: null,
    bidEndsAt: null
  };

  rooms[id] = room;
  console.log(`[Room] Created: ${id} by ${username} (socket: ${socketId})`);
  console.log(`[Room] Teams: ${teamsToUse.join(', ')}`);
  console.log(`[Room] Players in pool: ${unsold.length} unsold, ${Object.keys(soldByTeam).length} teams with sold players`);

  return room;
}

function joinRoom(roomId, username, socketId) {
  const room = rooms[roomId];
  if (!room) {
    console.log(`[Join] Room not found: ${roomId}`);
    return null;
  }

  // Cancel any pending cleanup for this room since someone is joining
  if (roomCleanupTimers[roomId]) {
    clearTimeout(roomCleanupTimers[roomId]);
    delete roomCleanupTimers[roomId];
    console.log(`[Join] Room ${roomId} cleanup cancelled - User joined`);
  }

  let human = room.humans.find(h => h.username === username);

  if (human) {
    // User with same username exists - check if they're still online
    if (human.socketId && human.socketId !== socketId) {
      // SECURITY: Original user is still online - reject duplicate username
      console.log(`[Join] REJECTED: Username "${username}" is already in use by socket ${human.socketId}`);
      return null; // Return null to indicate join failure
    }

    // Original user is OFFLINE (socketId is null) - allow reconnection
    console.log(`[Join] Player ${username} reconnecting to room ${roomId}`);

    // Check if this user was the original host (first human in the list)
    const wasHost = room.humans[0]?.username === username;

    // Update socket ID for reconnecting user
    human.socketId = socketId;

    // Update host socket ID if this was the host OR if the room is currently leaderless
    if (wasHost || !room.hostSocketId) {
      room.hostSocketId = socketId;
      console.log(`[Join] Host assigned to ${username} (socket: ${socketId}). Reason: ${wasHost ? 'Original Host Reconnected' : 'Room was Leaderless'}`);
    }

    // Also update team socketId if they had a team
    if (human.team) {
      const team = room.teams.find(t => t.name === human.team);
      if (team) {
        team.socketId = socketId;
        console.log(`[Join] Team ${team.name} reactivated for reconnecting user`);
      }
    }
  } else {
    // New user - add them
    human = { username, socketId, team: null };
    room.humans.push(human);
    console.log(`[Join] New player ${username} joined room ${roomId}`);
  }

  return room;
}

function selectTeam(roomId, socketId, teamName) {
  console.log(`[SelectTeam] ========================================`);
  console.log(`[SelectTeam] Attempting: room=${roomId}, socket=${socketId}, team=${teamName}`);

  const room = rooms[roomId];
  if (!room) {
    console.log(`[SelectTeam] FAILED: Room not found`);
    return null;
  }

  console.log(`[SelectTeam] Room state: ${room.state}`);
  console.log(`[SelectTeam] Humans in room:`, room.humans.map(h => ({ username: h.username, socketId: h.socketId, team: h.team })));

  if (room.state !== "TEAM_SELECTION") {
    console.log(`[SelectTeam] FAILED: Room state is ${room.state}, not TEAM_SELECTION`);
    return null;
  }

  const team = room.teams.find(t => t.name === teamName);
  if (!team) {
    console.log(`[SelectTeam] FAILED: Team ${teamName} not found`);
    return null;
  }

  console.log(`[SelectTeam] Team ${teamName} status: owner=${team.owner}, socketId=${team.socketId}, disconnectedAt=${team.disconnectedAt}`);

  // First, find the human player by socketId (needed for isReclaiming check)
  let human = room.humans.find(h => h.socketId === socketId);

  // If human not found by socketId, try to find unassigned human or add them
  if (!human) {
    console.log(`[SelectTeam] Human not found by socketId ${socketId}`);

    // Try to find any human without a socket assignment (edge case - reconnection)
    const unassignedHuman = room.humans.find(h => !h.socketId);
    if (unassignedHuman) {
      unassignedHuman.socketId = socketId;
      human = unassignedHuman;
      console.log(`[SelectTeam] Assigned socket to existing human: ${human.username}`);
    } else {
      // Add this socket as a new human (they may have joined via direct URL)
      console.log(`[SelectTeam] Adding new human for socket ${socketId}`);
      human = { username: `Player${room.humans.length + 1}`, socketId, team: null };
      room.humans.push(human);
      console.log(`[SelectTeam] Created new human: ${human.username}`);
    }
  }

  // Now check if team is available using the human's username
  const username = human.username;
  const isReclaiming = team.owner === username;
  const isAbandoned = team.disconnectedAt && (Date.now() - team.disconnectedAt > 15 * 60 * 1000); // 15 minutes

  console.log(`[SelectTeam] isReclaiming=${isReclaiming}, isAbandoned=${isAbandoned}, username=${username}`);

  // Check if team is currently online with a different socket
  if (team.socketId && team.socketId !== socketId) {
    console.log(`[SelectTeam] Rejected: Team ${teamName} is currently online with socket ${team.socketId}`);
    return null;
  }

  // Check if team belongs to someone else (not AI/AUTO/self) and not abandoned
  if (team.owner && team.owner !== "AI" && team.owner !== "AUTO" && !isReclaiming && !isAbandoned) {
    console.log(`[SelectTeam] Rejected: Team ${teamName} belongs to ${team.owner} (not abandoned yet)`);
    return null;
  }

  // Clear previous team selection if player was on another team
  if (human.team && human.team !== teamName) {
    const prev = room.teams.find(t => t.name === human.team);
    if (prev) {
      prev.socketId = null;
      prev.owner = null;
      prev.isAI = false;
      console.log(`[SelectTeam] Cleared previous team: ${human.team}`);
    }
  }

  // Assign team to human
  human.team = teamName;
  team.socketId = socketId;
  team.owner = human.username;
  team.isAI = false;
  team.disconnectedAt = null; // Reset timeout

  console.log(`[SelectTeam] SUCCESS: ${human.username} selected ${teamName}`);
  console.log(`[SelectTeam] ========================================`);
  return room;
}

function buildTeamsFromHumans(room) {
  room.teams.forEach(t => {
    const human = room.humans.find(h => h.team === t.name);
    if (!human) {
      t.isAI = room.config.allowAI;
      t.owner = t.isAI ? "AI" : "AUTO";
      t.socketId = null;
    }
  });
  console.log(`[BuildTeams] Finalized teams for room ${room.id}`);
}

function handleDisconnect(socketId) {
  let affectedRoom = null;

  for (const roomId in rooms) {
    const room = rooms[roomId];
    const human = room.humans.find(h => h.socketId === socketId);

    if (human) {
      console.log(`[Disconnect] User ${human.username} (socket: ${socketId}) disconnected from room ${roomId}`);
      human.socketId = null; // Mark as offline

      // Clear socket from team if they had one AND set timestamp
      if (human.team) {
        const team = room.teams.find(t => t.name === human.team);
        if (team && team.socketId === socketId) {
          team.socketId = null;
          team.disconnectedAt = Date.now(); // Start the 15-minute timer
          console.log(`[Disconnect] Team ${team.name} marked as disconnected at ${new Date(team.disconnectedAt).toISOString()}`);
        }
      }

      // Check if this was the host
      if (room.hostSocketId === socketId) {
        console.log(`[Disconnect] Host disconnected. Looking for new host...`);
        // Find next available online human
        const nextHost = room.humans.find(h => h.socketId);
        if (nextHost) {
          room.hostSocketId = nextHost.socketId;
          console.log(`[Disconnect] Host transferred to ${nextHost.username} (socket: ${nextHost.socketId})`);
          affectedRoom = { room, newHostId: nextHost.socketId };
        } else {
          console.log(`[Disconnect] No other humans online. Room has no active host.`);
          room.hostSocketId = null;
          affectedRoom = { room, newHostId: null };
        }
      } else {
        affectedRoom = { room, newHostId: undefined };
      }

      break; // User can only be in one room at a time usually
    }
  }

  // Check if room is empty (no active sockets)
  if (affectedRoom && affectedRoom.room) {
    const room = affectedRoom.room;
    const activeUsers = room.humans.filter(h => h.socketId).length;

    if (activeUsers === 0) {
      console.log(`[Disconnect] Room ${room.id} is empty. Scheduling cleanup in 5 minutes...`);

      // Clear existing timer if any (debounce)
      if (roomCleanupTimers[room.id]) clearTimeout(roomCleanupTimers[room.id]);

      roomCleanupTimers[room.id] = setTimeout(() => {
        console.log(`[Cleanup] Deleting empty room ${room.id}`);

        // Stop auction timer if running
        if (room._timer) {
          clearInterval(room._timer);
        }

        // Delete room
        delete rooms[room.id];
        delete roomCleanupTimers[room.id];
      }, 5 * 60 * 1000); // 5 minutes grace period
    }
  }

  return affectedRoom;
}

module.exports = {
  rooms,
  createRoom,
  joinRoom,
  selectTeam,
  buildTeamsFromHumans,
  handleDisconnect
};
