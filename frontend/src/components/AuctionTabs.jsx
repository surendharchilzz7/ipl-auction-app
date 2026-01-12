export default function AuctionTabs({ room }) {
  if (!room) return null;

  // 🔥 SAFETY: always work with arrays
  const auctionPlayers = Array.isArray(room.auctionPool)
    ? room.auctionPool
    : [];

  const soldPlayersCount = Object.values(room.soldPlayersByTeam || {})
    .flat()
    .length;

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Auction Info</h3>

      <ul>
        <li>Total Players in Auction Pool: {auctionPlayers.length}</li>
        <li>Sold Players (Initial Squads): {soldPlayersCount}</li>
        <li>Room State: {room.state}</li>
      </ul>

      {room.currentPlayer && (
        <p>
          Current Player: <b>{room.currentPlayer.name}</b>{" "}
          ({room.currentPlayer.role})
        </p>
      )}
    </div>
  );
}
