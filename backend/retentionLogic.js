function startRetention(room) {
  room.state = "RETENTION";

  room.teams.forEach(team => {
    team.defaultSquad = room.seasonSquads[team.name] || [];
    team.retained = [];
    team.budget = room.rules.purse;
  });
}

function retainPlayer(room, socketId, playerId) {
  if (!room || room.state !== "RETENTION") return;

  const team = room.teams.find(t => t.socketId === socketId);
  if (!team) return;

  if (!team.defaultSquad.includes(playerId)) return;
  if (team.retained.includes(playerId)) return;
  if (team.retained.length >= room.rules.maxRetention) return;

  const cost = room.rules.retentionCost[team.retained.length];
  if (team.budget < cost) return;

  team.retained.push(playerId);
  team.budget -= cost;
}

module.exports = {
  startRetention,
  retainPlayer
};
