/**
 * Serializes a room object for client transmission
 * Includes all necessary state for UI rendering
 */
module.exports = room => {
  try {
    if (!room) return null;

    return {
      id: room.id,
      hostSocketId: room.hostSocketId,
      state: room.state,
      season: room.season,
      rules: room.rules,
      config: room.config,

      // Server Time for Clock Sync (VITAL)
      serverTime: Date.now(),

      // Timer state
      bidEndsAt: room.bidEndsAt,
      rtmEndsAt: room.rtmEndsAt,

      // FSM auction state
      auctionState: room.auctionState || "INIT",

      // Human players with socketId for identification
      humans: (room.humans || []).map(h => ({
        username: h.username,
        team: h.team,
        socketId: h.socketId
      })),

      // Teams with players, budgets, and retentions
      teams: (room.teams || []).map(t => ({
        id: t.id,
        name: t.name,
        owner: t.owner,
        budget: t.budget,
        players: t.players || [],
        retained: t.retained || [],
        isAI: t.isAI,
        socketId: t.socketId,
        rtmCardsRemaining: t.rtmCardsRemaining
      })),

      // UNSOLD PLAYERS: Only sent during POOL_FILTER state to save bandwidth
      unsoldPlayers: room.state === "POOL_FILTER"
        ? (() => {
          try {
            const players = [];
            const seenIds = new Set();

            // Add unsold players
            (room.unsoldPlayers || []).forEach(p => {
              if (p && !seenIds.has(p.id)) {
                players.push({
                  id: p.id,
                  name: p.name,
                  role: p.role,
                  basePrice: p.basePrice || 0.5
                });
                seenIds.add(p.id);
              }
            });

            // Add sold players that aren't retained (if any context requires it, usually they stay in sold lists)
            Object.values(room.soldPlayersByTeam || {}).forEach(teamPlayers => {
              teamPlayers.forEach(p => {
                if (!p.retained && !seenIds.has(p.id)) {
                  players.push({
                    id: p.id,
                    name: p.name,
                    role: p.role,
                    basePrice: p.basePrice || 0.5
                  });
                  seenIds.add(p.id);
                }
              });
            });

            return players;
          } catch (e) {
            console.error("Error serializing unsold players:", e);
            return [];
          }
        })()
        : null,

      // Retention phase data
      retainablePlayers: room.state === "RETENTION"
        ? Object.fromEntries(
          Object.entries(room.soldPlayersByTeam || {}).map(([team, players]) => [
            team,
            players.map(p => ({
              id: p.id,
              name: p.name,
              role: p.role,
              soldPrice: p.soldPrice,
              overseas: p.overseas || false
            }))
          ])
        )
        : null,
      retentionCosts: room.rules?.retentionCost || [15, 11, 7, 4, 4],
      maxRetention: room.rules?.maxRetention || 5,
      maxTotalRetentionRTM: room.rules?.maxTotalRetentionRTM || 6,

      // Current auction state
      currentPlayer: room.currentPlayer,
      currentBid: room.currentBid,
      lastBidTeamId: room.lastBidTeamId,

      // Last finalized player (for 5-second result display)
      lastFinalizedPlayer: room.lastFinalizedPlayer || null,

      // RTM pending state
      rtmPending: room.rtmPending || null,
      rtmCardsRemaining: room.rtmCardsRemaining || {},

      // Auction pool for sets modal (during running auction)
      auctionPool: room.state === "AUCTION_RUNNING"
        ? (room.auctionPool || []).map(p => ({
          id: p.id,
          name: p.name,
          role: p.role,
          basePrice: p.basePrice,
          sold: p.sold,
          soldTo: p.soldTo,
          soldPrice: p.soldPrice,
          overseas: p.overseas
        }))
        : null,

      // Set information
      currentSet: room.currentSet,
      setOrder: room.setOrder,

      // Auction sets for sets modal (proper set structure)
      auctionSets: room.state === "AUCTION_RUNNING" && room.auctionSets
        ? Object.fromEntries(
          Object.entries(room.auctionSets).map(([setName, players]) => [
            setName,
            players.map(p => ({
              id: p.id,
              name: p.name,
              role: p.role,
              basePrice: p.basePrice,
              sold: p.sold,
              soldTo: p.soldTo,
              soldPrice: p.soldPrice
            }))
          ])
        )
        : null,

      // Auction summary for COMPLETED state
      summary: room.state === "COMPLETED" ? room.summary : null,

      // Progress tracking
      auctionPoolSize: room.auctionPool?.length || 0,
      currentIndex: room.currentIndex || 0,
      totalPlayers: room.auctionPool?.length || 0
    };
  } catch (err) {
    console.error("Error serializing room:", err);
    return null;
  }
};
