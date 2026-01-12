import React, { useEffect, useState, useRef } from 'react';
import SimplePeer from 'simple-peer';
import { socket } from '../socket';

// Polyfill for simple-peer in Vite environment
if (typeof global === 'undefined') {
    window.global = window;
}

const VoiceChat = ({ roomId }) => {
    const [peers, setPeers] = useState([]); // Array of peer objects { peerID, peer }
    const [stream, setStream] = useState(null); // My audio stream
    const [isJoined, setIsJoined] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    const userAudioRef = useRef();
    const peersRef = useRef([]); // Keep track of peer instances to destroy them
    const socketRef = useRef(socket);

    // Filter out our own echoes
    useEffect(() => {
        if (stream) {
            // Initially mute our own audio track if we are muted
            stream.getAudioTracks().forEach(track => track.enabled = !isMuted);
        }
    }, [isMuted, stream]);

    const joinVoice = () => {
        navigator.mediaDevices.getUserMedia({ video: false, audio: true }).then(currentStream => {
            setStream(currentStream);
            setIsJoined(true);

            // Tell server we joined
            socketRef.current.emit("join-voice", { roomId });

            // 1. Receive list of existing users => We initiate call to them
            socketRef.current.on("all-voice-users", users => {
                const peersArr = [];
                users.forEach(userID => {
                    const peer = createPeer(userID, socketRef.current.id, currentStream);
                    peersRef.current.push({
                        peerID: userID,
                        peer,
                    });
                    peersArr.push({
                        peerID: userID,
                        peer
                    });
                });
                setPeers(peersArr);
            });

            // 2. Someone else joined after us => They initiated, we receive signal
            socketRef.current.on("user-joined-voice", payload => {
                const peer = addPeer(payload.signal, payload.callerID, currentStream);
                peersRef.current.push({
                    peerID: payload.callerID,
                    peer,
                });

                setPeers(users => [...users, { peerID: payload.callerID, peer }]);
            });

            // 3. Receive answer from the person we called
            socketRef.current.on("receiving-returned-signal", payload => {
                const item = peersRef.current.find(p => p.peerID === payload.id);
                if (item) {
                    item.peer.signal(payload.signal);
                }
            });

            // 4. Peer disconnected
            socketRef.current.on("user-left-voice", id => {
                const peerObj = peersRef.current.find(p => p.peerID === id);
                if (peerObj) {
                    peerObj.peer.destroy();
                }
                const peers = peersRef.current.filter(p => p.peerID !== id);
                peersRef.current = peers;
                setPeers(peers);
            });
        }).catch(err => {
            console.error("Failed to get local stream", err);
            alert("Could not access microphone. Please allow permissions.");
        });
    };

    const leaveVoice = () => {
        setIsJoined(false);
        setPeers([]);
        peersRef.current.forEach(p => p.peer.destroy());
        peersRef.current = [];

        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }

        socketRef.current.emit("leave-voice", { roomId });
        socketRef.current.off("all-voice-users");
        socketRef.current.off("user-joined-voice");
        socketRef.current.off("receiving-returned-signal");
        socketRef.current.off("user-left-voice");
    };

    function createPeer(userToSignal, callerID, stream) {
        const peer = new SimplePeer({
            initiator: true,
            trickle: false,
            stream,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:global.stun.twilio.com:3478' }
                ]
            }
        });

        peer.on("signal", signal => {
            socketRef.current.emit("sending-signal", { userToSignal, callerID, signal });
        });

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new SimplePeer({
            initiator: false,
            trickle: false,
            stream,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:global.stun.twilio.com:3478' }
                ]
            }
        });

        peer.on("signal", signal => {
            socketRef.current.emit("returning-signal", { signal, callerID });
        });

        peer.signal(incomingSignal);

        return peer;
    }

    // UI Component for Floating Control
    return (
        <div style={{
            position: 'fixed',
            bottom: 24,
            left: 24, // Bottom Left
            zIndex: 3000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8
        }}>
            {/* Audio Elements for Peers */}
            {peers.map((peerObj) => (
                <AudioPlayer key={peerObj.peerID} peer={peerObj.peer} />
            ))}

            {isJoined ? (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#1e293b',
                    padding: '6px 12px',
                    borderRadius: 30,
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    gap: 8
                }}>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginRight: 4 }}>
                        {peers.length > 0 ? `${peers.length} active` : 'Weak Connection'}
                    </div>

                    {/* Mute Toggle */}
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        style={{
                            width: 40, height: 40, borderRadius: '50%',
                            border: 'none',
                            background: isMuted ? '#ef4444' : '#34d399',
                            color: '#fff',
                            fontSize: 20,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        title={isMuted ? "Unmute Mic" : "Mute Mic"}
                    >
                        {isMuted ? '🔇' : '🎙️'}
                    </button>

                    {/* Leave Button */}
                    <button
                        onClick={leaveVoice}
                        style={{
                            width: 32, height: 32, borderRadius: '50%',
                            border: '1px solid #475569',
                            background: 'rgba(255,255,255,0.1)',
                            color: '#fff',
                            fontSize: 14,
                            cursor: 'pointer'
                        }}
                        title="Disconnect Voice"
                    >
                        ❌
                    </button>
                </div>
            ) : (
                <button
                    onClick={joinVoice}
                    style={{
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        color: '#fff',
                        border: 'none',
                        padding: '12px 20px',
                        borderRadius: 30,
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <span>🎙️</span> Join Voice
                </button>
            )}
        </div>
    );
};

// Helper component to render audio stream
const AudioPlayer = ({ peer }) => {
    const ref = useRef();

    useEffect(() => {
        peer.on("stream", stream => {
            if (ref.current) {
                ref.current.srcObject = stream;
            }
        });
    }, [peer]);

    return (
        <audio
            ref={ref}
            autoPlay
            style={{ display: 'none' }}
        />
    );
};

export default VoiceChat;
