const fs = require('fs');
const path = require('path');
const data2025 = require("./data/reference/players_2025.json");
const season2025 = require("./data/seasons/2025.json");
const rules = require("./data/rules/auctionRules.json");

const { getAugmentedData } = require("./data/historicalAugmentation");

const rooms = {};
const roomCleanupTimers = {}; // Track cleanup timers for empty rooms
const IPL_TEAMS = Array.isArray(season2025.teams) ? season2025.teams : Object.keys(season2025.teams || season2025);

// Fallback if teams object is empty
const DEFAULT_TEAMS = ["CSK", "MI", "RCB", "KKR", "SRH", "RR", "DC", "PBKS", "LSG", "GT"];

// Helper to map full names to codes
function getTeamCode(fullName) {
  const map = {
    "Chennai Super Kings": "CSK",
    "Mumbai Indians": "MI",
    "Royal Challengers Bengaluru": "RCB",
    "Royal Challengers Bangalore": "RCB",
    "Kolkata Knight Riders": "KKR",
    "Sunrisers Hyderabad": "SRH",
    "Rajasthan Royals": "RR",
    "Delhi Capitals": "DC",
    "Delhi Daredevils": "DD",
    "Punjab Kings": "PBKS",
    "Kings XI Punjab": "KXIP",
    "Lucknow Super Giants": "LSG",
    "Gujarat Titans": "GT",
    "Deccan Chargers": "DEC",
    "Pune Warriors": "PWI",
    "Kochi Tuskers Kerala": "KTK",
    "Gujarat Lions": "GL",
    "Rising Pune Supergiant": "RPS",
    "Rising Pune Supergiants": "RPS"
  };
  return map[fullName] || fullName; // Fallback to full name if no code found (might break UI but better than null)
}

function splitPlayers(players) {
  const soldByTeam = {};
  const unsold = [];

  // DEEP CLONE each player to prevent modifications from affecting original data
  players.forEach(p => {
    // Create a fresh copy of the player object
    const playerCopy = { ...p, retained: false, sold: p.sold, soldTo: null, soldPrice: null };

    // Use originalTeam for auction preparation - this identifies players from the previous season
    // who are eligible for retention/RTM. For 2025, players have originalTeam set from 2024 squads.
    const teamForRetention = p.originalTeam || p.team || p.soldTo;

    // If player was on a team in the previous season (originalTeam), add to soldByTeam for retention eligibility
    // Also handle legacy sold players (p.sold && teamName)
    if (teamForRetention) {
      if (!soldByTeam[teamForRetention]) soldByTeam[teamForRetention] = [];
      soldByTeam[teamForRetention].push(playerCopy);
    } else {
      unsold.push(playerCopy);
    }
  });

  return { soldByTeam, unsold };
}


function createRoom(username, socketId, config = {}) {
  const id = Math.random().toString(36).substring(2, 8);

  // DETERMINE SEASON AND LOAD DATA
  const seasonYear = config.season || 2025;
  let seasonData = null;
  let seasonTeams = DEFAULT_TEAMS;
  let seasonPlayers = data2025.players || [];

  try {
    if (seasonYear != 2025) {
      const seasonPath = path.join(__dirname, 'data/seasons', `${seasonYear}.json`);
      if (fs.existsSync(seasonPath)) {
        seasonData = JSON.parse(fs.readFileSync(seasonPath, 'utf8'));
        if (seasonData.teams && seasonData.teams.length > 0) {
          seasonTeams = seasonData.teams;
        }
        if (seasonData.players && seasonData.players.length > 0) {
          seasonPlayers = seasonData.players.map(p => {
            const augmented = getAugmentedData(p.name);
            return {
              ...p,
              // Polyfill missing fields via Lookup or defaults
              role: augmented?.role || p.set || "BAT",
              overseas: augmented?.overseas ?? (p.overseas || false),

              // For historical auctions, we want players to be available for bidding
              team: null,
              sold: false,
              // Keep originalTeam for reference/display, ensure it exists
              originalTeam: p.originalTeam
            };
          });
        }
      }
    } else {
      // 2025 Default Logic (uses imports at top)
      seasonTeams = IPL_TEAMS.length > 0 ? IPL_TEAMS : DEFAULT_TEAMS;

      // Explicitly inject 2024 retention data for 2025 players here if not present
      // Because data2025.json usually has null originalTeam
      const iplt20Master = require("./data/iplt20_master_data.json");
      if (iplt20Master['2024']) {
        try {
          const prevSquads = iplt20Master['2024'];
          console.log("[CreateRoom] Injecting 2024 retention data into 2025 players...");
          let seasonPlayersMap = new Map();
          seasonPlayers.forEach(p => seasonPlayersMap.set(p.name.trim().toLowerCase(), p));

          // 1. Map existing players to 2024 teams & RESET State
          seasonPlayers = seasonPlayers.map(p => {
            if (!p || !p.name) return p;
            let prevDetails = prevSquads[p.name] || prevSquads[p.name.trim()];

            // RESET Player (Force Unsold)
            const resetPlayer = {
              ...p,
              sold: false,
              team: null,
              soldTo: null,
              retained: false
            };

            if (prevDetails && prevDetails.team) {
              return { ...resetPlayer, originalTeam: getTeamCode(prevDetails.team) };
            }
            return { ...resetPlayer, originalTeam: null };
          });

          // 2. FIND MISSING STARS: Iterate 2024 retention list and ADD players not in 2025 pool
          Object.keys(prevSquads).forEach(playerName => {
            const pData = prevSquads[playerName];
            const exists = seasonPlayersMap.has(playerName.trim().toLowerCase());

            if (!exists && pData.team) {
              // console.log(`[CreateRoom] Missing 2024 Player Found: ${playerName} (${pData.team}). Injecting to pool.`);
              seasonPlayers.push({
                id: `${playerName.replace(/\s+/g, '_')}_2025_INJECTED`,
                name: playerName,
                role: pData.role || "BAT",
                basePrice: 2, // Default base price for retained stars
                originalTeam: getTeamCode(pData.team),
                sold: false,
                team: null,
                soldTo: null,
                overseas: pData.overseas || false,
                set: "RETENTION_ADDON"
              });
            }
          });

          console.log(`[CreateRoom] Retention Injection Complete. Total Players: ${seasonPlayers.length}`);
        } catch (err) {
          console.error("[CreateRoom] Error injecting retention data:", err);
        }
      }
    }

    // --- RETENTION LOGIC: POPULATE ORIGINAL TEAMS ---
    // IMPORTANT: Preserve originalTeam if already set in JSON (for historical seasons)
    // Only use master data lookup as FALLBACK when originalTeam is null/undefined
    const iplt20Master = require("./data/iplt20_master_data.json");
    const prevYear = seasonYear - 1;

    // SPECIAL CASE: 2018 - CSK and RR returned after 2-year suspension (2016-2017)
    // Their players need to look at 2015 data for retention eligibility
    const suspendedTeamsFallbackYear = 2015;
    const suspendedTeamsIn2018 = ['Chennai Super Kings', 'Rajasthan Royals', 'CSK', 'RR'];

    if (seasonYear > 2008 && iplt20Master[prevYear]) {
      console.log(`[CreateRoom] Processing retention for ${seasonYear}...`);
      const prevSquads = iplt20Master[prevYear];

      // For 2018, also load 2015 data for CSK/RR players
      const fallbackSquads = (seasonYear === 2018 && iplt20Master[suspendedTeamsFallbackYear])
        ? iplt20Master[suspendedTeamsFallbackYear]
        : null;

      seasonPlayers = seasonPlayers.map(p => {
        // PRIORITY 1: If originalTeam is already set in JSON, PRESERVE it
        // This handles pre-configured historical data including defunct teams
        if (p.originalTeam) {
          return p; // Keep existing originalTeam
        }

        // PRIORITY 2: Look up in previous year's master data
        let prevDetails = prevSquads[p.name];
        if (prevDetails && prevDetails.team) {
          const teamCode = getTeamCode(prevDetails.team);
          return { ...p, originalTeam: teamCode };
        }

        // PRIORITY 3 (2018 only): Check 2015 data for CSK/RR players
        if (seasonYear === 2018 && fallbackSquads) {
          const fallbackDetails = fallbackSquads[p.name];
          if (fallbackDetails && fallbackDetails.team) {
            const fallbackTeamCode = getTeamCode(fallbackDetails.team);
            if (suspendedTeamsIn2018.includes(fallbackDetails.team) ||
              suspendedTeamsIn2018.includes(fallbackTeamCode)) {
              console.log(`[CreateRoom] 2018 fallback: ${p.name} -> ${fallbackTeamCode} (from 2015)`);
              return { ...p, originalTeam: fallbackTeamCode };
            }
          }
        }

        // Not found in any source - not retainable
        return { ...p, originalTeam: null };
      });
    } else if (seasonYear === 2008) {
      // 2008: No retention possible (first IPL season)
      seasonPlayers = seasonPlayers.map(p => ({ ...p, originalTeam: null }));
    }
    // If no master data for prevYear exists, preserve whatever originalTeam is in JSON
    // -------------------------------------------------------

  } catch (e) {
    console.error(`[CreateRoom] Failed to load season ${seasonYear}:`, e);
    // Fallback to defaults
  }

  // Each room gets a FRESH copy of players
  const { soldByTeam, unsold } = splitPlayers(seasonPlayers);

  // Use loaded teams
  const teamsToUse = seasonTeams;

  // Validate and set budget (120-200 in steps of 10)
  let budget = parseInt(config.budget) || rules.purse || 120;
  budget = Math.max(120, Math.min(200, budget)); // Clamp to 120-200
  budget = Math.round(budget / 10) * 10; // Round to nearest 10

  // Disable retention for historical seasons (2008-2010 usually, or just if user requested logic)
  // Logic: 2008 definitely had no retention (first season)
  let retentionEnabled = !!config.retentionEnabled;
  if (seasonYear == 2008) {
    retentionEnabled = false;
  }

  const room = {
    id,
    hostSocketId: socketId,
    season: seasonData ? seasonData.season : season2025.season,
    seasonSquads: seasonData ? (seasonData.teams || {}) : (season2025.teams || {}),
    rules: { ...rules, purse: budget }, // Override purse with selected budget

    config: {
      allowAI: !!config.allowAI,
      retentionEnabled: retentionEnabled,
      budget: budget // Store budget in config for reference
    },

    state: "TEAM_SELECTION",

    humans: [{ username, socketId, team: null }],

    teams: teamsToUse.map(t => ({
      id: `team-${t}`,
      name: t,
      owner: null,
      socketId: null,
      budget: budget, // Use configured budget
      players: [],
      retained: [],
      isAI: false
    })),

    soldPlayersByTeam: soldByTeam,
    unsoldPlayers: unsold,

    retainedPlayers: {},

    auctionPool: [],
    auctionSets: unsold.reduce((acc, p) => {
      const set = p.role || p.set || "BAT"; // Use role as priority set now
      if (!acc[set]) acc[set] = [];
      acc[set].push(p);
      return acc;
    }, {}),
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
