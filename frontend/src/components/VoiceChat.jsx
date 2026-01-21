import React, { useEffect, useState, useRef, useCallback } from 'react';
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
    const [connectionState, setConnectionState] = useState('idle'); // idle, connecting, connected, weak, error
    const [retryCount, setRetryCount] = useState(0);

    const userAudioRef = useRef();
    const peersRef = useRef([]); // Keep track of peer instances to destroy them
    const socketRef = useRef(socket);
    const connectionTimeoutRef = useRef(null);
    const MAX_RETRIES = 3;

    // Update mute state on stream
    useEffect(() => {
        if (stream) {
            stream.getAudioTracks().forEach(track => track.enabled = !isMuted);
        }
    }, [isMuted, stream]);

    // Monitor connection state
    useEffect(() => {
        if (isJoined) {
            if (peers.length > 0) {
                setConnectionState('connected');
                // Clear any weak connection timeout
                if (connectionTimeoutRef.current) {
                    clearTimeout(connectionTimeoutRef.current);
                    connectionTimeoutRef.current = null;
                }
            } else if (connectionState === 'connecting') {
                // Set timeout to show "weak" after 5 seconds of no peers
                connectionTimeoutRef.current = setTimeout(() => {
                    if (peers.length === 0 && isJoined) {
                        setConnectionState('weak');
                    }
                }, 5000);
            }
        }
        return () => {
            if (connectionTimeoutRef.current) {
                clearTimeout(connectionTimeoutRef.current);
            }
        };
    }, [peers.length, isJoined, connectionState]);

    const cleanupVoice = useCallback(() => {
        peersRef.current.forEach(p => {
            if (p.peer) p.peer.destroy();
        });
        peersRef.current = [];
        setPeers([]);

        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }

        socketRef.current.off("all-voice-users");
        socketRef.current.off("user-joined-voice");
        socketRef.current.off("receiving-returned-signal");
        socketRef.current.off("user-left-voice");
    }, [stream]);

    const joinVoice = useCallback(async () => {
        setConnectionState('connecting');
        setRetryCount(0);

        try {
            const currentStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
            setStream(currentStream);
            setIsJoined(true);

            // Tell server we joined
            socketRef.current.emit("join-voice", { roomId });

            // 1. Receive list of existing users => We initiate call to them
            socketRef.current.on("all-voice-users", users => {
                const peersArr = [];
                users.forEach(userID => {
                    const peer = createPeer(userID, socketRef.current.id, currentStream);
                    peersRef.current.push({ peerID: userID, peer });
                    peersArr.push({ peerID: userID, peer });
                });
                setPeers(peersArr);
                if (users.length > 0) {
                    setConnectionState('connected');
                }
            });

            // 2. Someone else joined after us => They initiated, we receive signal
            socketRef.current.on("user-joined-voice", payload => {
                const peer = addPeer(payload.signal, payload.callerID, currentStream);
                peersRef.current.push({ peerID: payload.callerID, peer });
                setPeers(users => [...users, { peerID: payload.callerID, peer }]);
            });

            // 3. Receive answer from the person we called
            socketRef.current.on("receiving-returned-signal", payload => {
                const item = peersRef.current.find(p => p.peerID === payload.id);
                if (item && item.peer) {
                    try {
                        item.peer.signal(payload.signal);
                    } catch (e) {
                        console.warn('[Voice] Signal error:', e);
                    }
                }
            });

            // 4. Peer disconnected
            socketRef.current.on("user-left-voice", id => {
                const peerObj = peersRef.current.find(p => p.peerID === id);
                if (peerObj && peerObj.peer) {
                    peerObj.peer.destroy();
                }
                const updatedPeers = peersRef.current.filter(p => p.peerID !== id);
                peersRef.current = updatedPeers;
                setPeers(updatedPeers);
            });
        } catch (err) {
            console.error("Failed to get local stream", err);
            setConnectionState('error');
            alert("Could not access microphone. Please allow permissions.");
        }
    }, [roomId]);

    const leaveVoice = useCallback(() => {
        setIsJoined(false);
        setConnectionState('idle');
        cleanupVoice();
        socketRef.current.emit("leave-voice", { roomId });
    }, [roomId, cleanupVoice]);

    // Auto-reconnect on error
    const handlePeerError = useCallback((peerID, err) => {
        console.warn(`[Voice] Peer ${peerID} error:`, err);

        // Remove failed peer
        const updatedPeers = peersRef.current.filter(p => p.peerID !== peerID);
        peersRef.current = updatedPeers;
        setPeers(updatedPeers);

        // If no peers left and still joined, attempt reconnect
        if (updatedPeers.length === 0 && isJoined && retryCount < MAX_RETRIES) {
            console.log(`[Voice] Attempting reconnect (${retryCount + 1}/${MAX_RETRIES})...`);
            setRetryCount(prev => prev + 1);
            setConnectionState('connecting');

            // Rejoin after delay
            setTimeout(() => {
                socketRef.current.emit("join-voice", { roomId });
            }, 2000);
        } else if (retryCount >= MAX_RETRIES) {
            setConnectionState('weak');
        }
    }, [isJoined, retryCount, roomId]);

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

        peer.on("error", err => handlePeerError(userToSignal, err));

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

        peer.on("error", err => handlePeerError(callerID, err));

        peer.signal(incomingSignal);

        return peer;
    }

    const getStatusText = () => {
        switch (connectionState) {
            case 'connecting': return '🔄 Connecting...';
            case 'connected': return `✅ ${peers.length} active`;
            case 'weak': return '⏳ Waiting for others...';
            case 'error': return '❌ Error';
            default: return '';
        }
    };

    const getStatusColor = () => {
        switch (connectionState) {
            case 'connecting': return '#60a5fa';
            case 'connected': return '#34d399';
            case 'weak': return '#9ca3af'; // Neutral gray instead of warning orange
            case 'error': return '#ef4444';
            default: return '#9ca3af';
        }
    };

    // UI Component for Floating Control
    return (
        <div style={{
            position: 'fixed',
            bottom: 24,
            left: 24,
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
                    <div style={{
                        fontSize: 12,
                        color: getStatusColor(),
                        marginRight: 4,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                    }}>
                        {connectionState === 'connecting' && (
                            <span style={{
                                display: 'inline-block',
                                animation: 'spin 1s linear infinite',
                                fontSize: 10
                            }}>⟳</span>
                        )}
                        {getStatusText()}
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

                    {/* Retry Button (when weak) */}
                    {connectionState === 'weak' && (
                        <button
                            onClick={() => {
                                setRetryCount(0);
                                setConnectionState('connecting');
                                socketRef.current.emit("join-voice", { roomId });
                            }}
                            style={{
                                width: 32, height: 32, borderRadius: '50%',
                                border: '1px solid #f59e0b',
                                background: 'rgba(245, 158, 11, 0.2)',
                                color: '#f59e0b',
                                fontSize: 14,
                                cursor: 'pointer'
                            }}
                            title="Retry Connection"
                        >
                            🔄
                        </button>
                    )}

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

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
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

