import { useEffect, useState } from "react";
import { socket } from "./socket";

import Lobby from "./pages/Lobby";
import TeamSelection from "./pages/TeamSelection";
import PoolFilter from "./pages/PoolFilter";
import Retention from "./pages/Retention";
import Auction from "./pages/Auction";

export default function App() {
  const [room, setRoom] = useState(null);
  const [connected, setConnected] = useState(socket.connected);

  useEffect(() => {
    // Check for room code in URL on mount
    const urlParams = new URLSearchParams(window.location.search);
    const urlRoomCode = urlParams.get('room') || window.location.pathname.split('/room/')[1];

    // Check for saved session
    const savedRoomId = localStorage.getItem("auctionRoomId");
    const savedUsername = sessionStorage.getItem("auctionUsername");

    if (socket.connected) {
      setConnected(true);
      // Priority: URL room code > saved room ID
      if (urlRoomCode && savedUsername) {
        console.log("Joining room from URL:", urlRoomCode);
        socket.emit("join-room", { roomId: urlRoomCode.toLowerCase(), username: savedUsername });
      } else if (savedRoomId && savedUsername) {
        console.log("Auto-rejoining saved room:", savedRoomId);
        socket.emit("join-room", { roomId: savedRoomId, username: savedUsername });
      }
    }

    socket.on("connect", () => {
      setConnected(true);
      console.log("Socket connected:", socket.id);

      // Attempt to rejoin if we have a saved ID
      const currentSavedId = localStorage.getItem("auctionRoomId");
      const currentUsername = sessionStorage.getItem("auctionUsername");
      if (currentSavedId && currentUsername) {
        console.log("Re-connected! Auto-joining:", currentSavedId);
        socket.emit("join-room", { roomId: currentSavedId, username: currentUsername });
      }
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("room-update", updatedRoom => {
      console.log("ROOM UPDATE:", updatedRoom.state, "summary:", !!updatedRoom.summary);

      // Save ID to persist session
      if (updatedRoom?.id) {
        sessionStorage.setItem("auctionRoomId", updatedRoom.id);
        localStorage.setItem("auctionRoomId", updatedRoom.id);

        // Update URL with room code for easy sharing
        const newUrl = `${window.location.origin}?room=${updatedRoom.id.toUpperCase()}`;
        if (window.location.href !== newUrl) {
          window.history.replaceState({}, '', newUrl);
        }
      }

      if (updatedRoom.state === "COMPLETED") {
        console.log("AUCTION COMPLETED - Summary:", updatedRoom.summary);
      }
      setRoom(updatedRoom);
    });

    // Handle invalid room (e.g. server restart cleared memory)
    socket.on("error", (err) => {
      console.error("Socket Error:", err);
      // Fix: err is an object { message: "..." }
      const msg = err?.message || err;
      if (msg === "Room not found") {
        sessionStorage.removeItem("auctionRoomId");
        localStorage.removeItem("auctionRoomId");
        // Clear URL
        window.history.replaceState({}, '', window.location.origin);
        setRoom(null);
      }
    });

    return () => {
      socket.off("room-update");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("error");
    };
  }, []);

  const footerStyle = {
    position: 'fixed',
    bottom: 12,
    right: 24,
    color: 'rgba(255, 255, 255, 0.4)',
    fontFamily: '"Brush Script MT", "Segoe Script", cursive',
    fontSize: 20,
    pointerEvents: 'none',
    zIndex: 9999,
    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
  };

  if (!connected) {
    return (
      <>
        <div style={{ color: '#fff', textAlign: 'center', marginTop: 100 }}>Connecting to server...</div>
        <div style={footerStyle}>By Surendhar</div>
      </>
    );
  }

  let content;
  if (!room) {
    content = <Lobby />;
  } else if (room.state === "TEAM_SELECTION") {
    content = <TeamSelection room={room} />;
  } else if (room.state === "POOL_FILTER") {
    content = <PoolFilter room={room} />;
  } else if (room.state === "RETENTION") {
    content = <Retention room={room} />;
  } else {
    content = <Auction room={room} />;
  }

  return (
    <>
      {content}
      <div style={footerStyle}>By Surendhar</div>
    </>
  );
}
