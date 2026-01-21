import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../socket';

const TextChat = ({ roomId, username }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const messagesEndRef = useRef(null);

    // Listen for incoming messages
    useEffect(() => {
        const handleMessage = (msg) => {
            setMessages(prev => [...prev, msg]);
            // Increment unread if chat is closed
            if (!isOpen) {
                setUnreadCount(prev => prev + 1);
            }
        };

        socket.on('chat-message', handleMessage);
        return () => socket.off('chat-message', handleMessage);
    }, [isOpen]);

    // Scroll to bottom on new message
    useEffect(() => {
        if (isOpen && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    // Clear unread when opening
    useEffect(() => {
        if (isOpen) {
            setUnreadCount(0);
        }
    }, [isOpen]);

    const sendMessage = () => {
        if (!input.trim()) return;

        socket.emit('send-chat-message', {
            roomId,
            username: username || 'Anonymous',
            text: input.trim()
        });

        setInput('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: 24,
            left: 360, // Moved significantly right to safely clear wide "Weak Connection" voice status
            zIndex: 3001
        }}>
            {/* Chat Panel */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    bottom: 60,
                    left: 0,
                    width: 320,
                    height: 400,
                    background: 'rgba(15, 23, 42, 0.98)',
                    borderRadius: 16,
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '12px 16px',
                        background: 'rgba(255,255,255,0.05)',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>
                            💬 Room Chat
                        </span>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#9ca3af',
                                fontSize: 18,
                                cursor: 'pointer',
                                padding: 4
                            }}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Messages */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: 12,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8
                    }}>
                        {messages.length === 0 ? (
                            <div style={{
                                color: '#6b7280',
                                textAlign: 'center',
                                padding: 40,
                                fontSize: 13
                            }}>
                                No messages yet. Start the conversation!
                            </div>
                        ) : (
                            messages.map((msg, idx) => (
                                <div key={idx} style={{
                                    background: msg.username === username
                                        ? 'rgba(59, 130, 246, 0.2)'
                                        : 'rgba(255,255,255,0.05)',
                                    borderRadius: 12,
                                    padding: '8px 12px',
                                    maxWidth: '85%',
                                    alignSelf: msg.username === username ? 'flex-end' : 'flex-start'
                                }}>
                                    <div style={{
                                        fontSize: 11,
                                        color: msg.username === username ? '#60a5fa' : '#9ca3af',
                                        marginBottom: 4,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        gap: 8
                                    }}>
                                        <span style={{ fontWeight: 500 }}>{msg.username}</span>
                                        <span>{formatTime(msg.timestamp)}</span>
                                    </div>
                                    <div style={{ color: '#fff', fontSize: 13, wordBreak: 'break-word' }}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div style={{
                        padding: 12,
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        gap: 8
                    }}>
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message..."
                            style={{
                                flex: 1,
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 20,
                                padding: '10px 16px',
                                color: '#fff',
                                fontSize: 13,
                                outline: 'none'
                            }}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim()}
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                border: 'none',
                                background: input.trim()
                                    ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                                    : 'rgba(255,255,255,0.1)',
                                color: '#fff',
                                fontSize: 16,
                                cursor: input.trim() ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            ➤
                        </button>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    border: 'none',
                    background: isOpen
                        ? '#3b82f6'
                        : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    color: '#fff',
                    fontSize: 22,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    transition: 'transform 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                title="Room Chat"
            >
                💬
                {/* Unread Badge */}
                {unreadCount > 0 && !isOpen && (
                    <div style={{
                        position: 'absolute',
                        top: -4,
                        right: -4,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: '#ef4444',
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                )}
            </button>
        </div>
    );
};

export default TextChat;
