import { useState, useMemo, useEffect } from "react";
import { socket } from "../socket";
import { getPlayerPhotoUrl, DEFAULT_PLAYER_IMAGE } from "../data/playerPhotos";

// Role colors
const ROLE_COLORS = {
    BAT: '#60a5fa',
    BOWL: '#34d399',
    AR: '#fbbf24',
    WK: '#f472b6'
};

const ROLE_EMOJIS = {
    BAT: '🏏',
    BOWL: '🎳',
    AR: '⭐',
    WK: '🧤'
};

// Set sizes for organizing players
const SET_SIZE = {
    BAT: 10,
    WK: 5,
    AR: 10,
    BOWL: 10
};

const SET_ORDER = ['BAT', 'WK', 'AR', 'BOWL'];

export default function PoolFilter({ room }) {
    const [selectedPlayers, setSelectedPlayers] = useState({});
    const [activeSet, setActiveSet] = useState(null);
    const [activeRoleTab, setActiveRoleTab] = useState('BAT'); // New: Role Tabs
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageErrors, setImageErrors] = useState({});

    const isHost = socket.id === room.hostSocketId;
    const availablePlayers = room.unsoldPlayers || [];

    // Organize players into sets
    const playerSets = useMemo(() => {
        const sets = {};
        const playersByRole = { BAT: [], WK: [], AR: [], BOWL: [] };

        // Group players by role
        availablePlayers.forEach(p => {
            if (playersByRole[p.role]) {
                playersByRole[p.role].push(p);
            }
        });

        // Sort each role by base price descending
        SET_ORDER.forEach(role => {
            playersByRole[role].sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0));
        });

        // Create numbered sets
        SET_ORDER.forEach(role => {
            const players = playersByRole[role];
            const size = SET_SIZE[role];
            let setNum = 1;

            for (let i = 0; i < players.length; i += size) {
                const setName = `${role}${setNum}`;
                sets[setName] = players.slice(i, i + size);
                setNum++;
            }
        });

        return sets;
    }, [availablePlayers]);

    // Initialize all players as selected by default
    useMemo(() => {
        if (Object.keys(selectedPlayers).length === 0 && availablePlayers.length > 0) {
            const initial = {};
            availablePlayers.forEach(p => {
                initial[p.id] = true;
            });
            setSelectedPlayers(initial);
        }
    }, [availablePlayers]);

    // Get ordered set names
    const orderedSets = useMemo(() => {
        const maxSets = Math.max(
            ...SET_ORDER.map(role =>
                Math.ceil((availablePlayers.filter(p => p.role === role).length) / SET_SIZE[role])
            ), 1
        );

        const ordered = [];
        for (let i = 1; i <= maxSets; i++) {
            SET_ORDER.forEach(role => {
                const setName = `${role}${i}`;
                if (playerSets[setName] && playerSets[setName].length > 0) {
                    ordered.push(setName);
                }
            });
        }
        return ordered;
    }, [playerSets, availablePlayers]);

    // New: Filter sets by active role
    const filteredSets = useMemo(() => {
        return orderedSets.filter(setName => setName.startsWith(activeRoleTab));
    }, [orderedSets, activeRoleTab]);

    // Set active set to first set by default or when role changes
    useMemo(() => {
        if (filteredSets.length > 0 && (!activeSet || !activeSet.startsWith(activeRoleTab))) {
            setActiveSet(filteredSets[0]);
        }
    }, [filteredSets, activeRoleTab]);

    function togglePlayer(playerId) {
        setSelectedPlayers(prev => ({
            ...prev,
            [playerId]: !prev[playerId]
        }));
    }

    function selectAllInSet(setName) {
        const players = playerSets[setName] || [];
        setSelectedPlayers(prev => {
            const updated = { ...prev };
            players.forEach(p => { updated[p.id] = true; });
            return updated;
        });
    }

    function deselectAllInSet(setName) {
        const players = playerSets[setName] || [];
        setSelectedPlayers(prev => {
            const updated = { ...prev };
            players.forEach(p => { updated[p.id] = false; });
            return updated;
        });
    }

    function selectAll() {
        const all = {};
        availablePlayers.forEach(p => { all[p.id] = true; });
        setSelectedPlayers(all);
    }

    function deselectAll() {
        const all = {};
        availablePlayers.forEach(p => { all[p.id] = false; });
        setSelectedPlayers(all);
    }

    function applyFilter() {
        if (!isHost) return;

        const selectedPlayerIds = Object.entries(selectedPlayers)
            .filter(([_, isSelected]) => isSelected)
            .map(([id]) => id);

        setIsSubmitting(true);
        socket.emit("filter-pool", {
            roomId: room.id,
            filters: { selectedPlayerIds }
        });
    }

    function skipFilter() {
        if (!isHost) return;
        socket.emit("skip-pool-filter", { roomId: room.id });
    }

    function handleImageError(playerId) {
        setImageErrors(prev => ({ ...prev, [playerId]: true }));
    }

    // Calculate stats
    const selectedCount = Object.values(selectedPlayers).filter(Boolean).length;
    const totalPlayers = availablePlayers.length;

    // Mobile Responsive State
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Get selected count for a set
    function getSetSelectedCount(setName) {
        const players = playerSets[setName] || [];
        return players.filter(p => selectedPlayers[p.id]).length;
    }

    return (
        <div style={{ minHeight: '100vh', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>

                {/* Header */}
                <div style={{
                    background: 'rgba(30, 41, 59, 0.95)',
                    borderRadius: 16,
                    padding: 24,
                    marginBottom: 20,
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
                    <h1 style={{ color: '#fff', fontSize: 28, margin: 0 }}>Customize Auction Pool</h1>
                    <p style={{ color: '#9ca3af', marginTop: 8 }}>
                        Select players to include in the auction
                    </p>
                    <div style={{
                        marginTop: 16,
                        padding: '12px 24px',
                        background: 'rgba(59, 130, 246, 0.2)',
                        borderRadius: 8,
                        display: 'inline-block'
                    }}>
                        <span style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: 24 }}>
                            {selectedCount}
                        </span>
                        <span style={{ color: '#9ca3af' }}> / {totalPlayers} players selected</span>
                    </div>
                </div>

                {isHost ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '280px 1fr',
                        gap: 20
                    }}>

                        {/* Left Sidebar - Set Navigation */}
                        <div style={{
                            background: 'rgba(30, 41, 59, 0.95)',
                            borderRadius: 16,
                            padding: 16,
                            height: 'fit-content',
                            position: window.innerWidth < 768 ? 'relative' : 'sticky',
                            top: 20,
                            maxHeight: window.innerWidth < 768 ? 'auto' : '90vh',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <h3 style={{ color: '#fff', margin: '0 0 12px 0', fontSize: 16 }}>📋 Player Sets</h3>

                            {/* Role Tabs */}
                            <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                                {SET_ORDER.map(role => (
                                    <button
                                        key={role}
                                        onClick={() => setActiveRoleTab(role)}
                                        style={{
                                            flex: 1, padding: '8px 4px', borderRadius: 8,
                                            background: activeRoleTab === role ? ROLE_COLORS[role] + '30' : 'rgba(55, 65, 81, 0.3)',
                                            border: activeRoleTab === role ? `1px solid ${ROLE_COLORS[role]}` : '1px solid transparent',
                                            color: activeRoleTab === role ? ROLE_COLORS[role] : '#9ca3af',
                                            cursor: 'pointer', fontSize: 12, fontWeight: 'bold'
                                        }}
                                    >
                                        {ROLE_EMOJIS[role]} {role}
                                    </button>
                                ))}
                            </div>

                            {/* Quick Actions */}
                            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                                <button onClick={selectAll} style={{
                                    flex: 1, padding: '8px', borderRadius: 6,
                                    background: 'rgba(52, 211, 153, 0.2)', border: '1px solid #34d399',
                                    color: '#34d399', cursor: 'pointer', fontSize: 12
                                }}>✓ All {totalPlayers}</button>
                                <button onClick={deselectAll} style={{
                                    flex: 1, padding: '8px', borderRadius: 6,
                                    background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444',
                                    color: '#ef4444', cursor: 'pointer', fontSize: 12
                                }}>✗ None</button>
                            </div>

                            {/* Set Grid (Compact) */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: 8,
                                overflowY: 'auto',
                                paddingRight: 4
                            }}>
                                {filteredSets.map(setName => {
                                    const role = setName.replace(/[0-9]/g, '');
                                    const players = playerSets[setName] || [];
                                    const setSelected = getSetSelectedCount(setName);
                                    const isActive = activeSet === setName;

                                    return (
                                        <button
                                            key={setName}
                                            onClick={() => setActiveSet(setName)}
                                            style={{
                                                padding: '8px',
                                                borderRadius: 8,
                                                background: isActive
                                                    ? `${ROLE_COLORS[role]}30`
                                                    : 'rgba(55, 65, 81, 0.3)',
                                                border: isActive
                                                    ? `2px solid ${ROLE_COLORS[role]}`
                                                    : '1px solid rgba(255, 255, 255, 0.1)',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: 4
                                            }}
                                        >
                                            <span style={{
                                                color: isActive ? ROLE_COLORS[role] : '#d1d5db',
                                                fontWeight: 500,
                                                fontSize: 13
                                            }}>
                                                {setName}
                                            </span>
                                            <span style={{
                                                color: setSelected === players.length ? '#34d399' : '#9ca3af',
                                                fontSize: 11,
                                                background: 'rgba(0,0,0,0.2)',
                                                padding: '2px 6px',
                                                borderRadius: 4
                                            }}>
                                                {setSelected}/{players.length}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right Content - Player Grid */}
                        <div>
                            {activeSet && (
                                <div style={{
                                    background: 'rgba(30, 41, 59, 0.95)',
                                    borderRadius: 16,
                                    padding: 20,
                                    marginBottom: 20
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: 16
                                    }}>
                                        <h3 style={{
                                            color: ROLE_COLORS[activeSet.replace(/[0-9]/g, '')],
                                            margin: 0,
                                            fontSize: 20
                                        }}>
                                            {ROLE_EMOJIS[activeSet.replace(/[0-9]/g, '')]} {activeSet} Players
                                        </h3>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button onClick={() => selectAllInSet(activeSet)} style={{
                                                padding: '6px 12px', borderRadius: 6,
                                                background: 'rgba(52, 211, 153, 0.2)', border: '1px solid #34d399',
                                                color: '#34d399', cursor: 'pointer', fontSize: 12
                                            }}>Select All</button>
                                            <button onClick={() => deselectAllInSet(activeSet)} style={{
                                                padding: '6px 12px', borderRadius: 6,
                                                background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444',
                                                color: '#ef4444', cursor: 'pointer', fontSize: 12
                                            }}>Deselect All</button>
                                        </div>
                                    </div>

                                    {/* Player Cards Grid */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                        gap: 12
                                    }}>
                                        {(playerSets[activeSet] || []).map(player => {
                                            const isSelected = selectedPlayers[player.id];
                                            const role = player.role;
                                            const photoUrl = getPlayerPhotoUrl(player.name);

                                            return (
                                                <div
                                                    key={player.id}
                                                    onClick={() => togglePlayer(player.id)}
                                                    style={{
                                                        padding: 12,
                                                        borderRadius: 12,
                                                        background: isSelected
                                                            ? `linear-gradient(135deg, ${ROLE_COLORS[role]}20, ${ROLE_COLORS[role]}10)`
                                                            : 'rgba(55, 65, 81, 0.3)',
                                                        border: isSelected
                                                            ? `2px solid ${ROLE_COLORS[role]}`
                                                            : '2px solid rgba(75, 85, 99, 0.5)',
                                                        cursor: 'pointer',
                                                        opacity: isSelected ? 1 : 0.5,
                                                        transition: 'all 0.2s',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 12
                                                    }}
                                                >
                                                    {/* Player Photo */}
                                                    <div style={{
                                                        width: 50,
                                                        height: 50,
                                                        borderRadius: '50%',
                                                        background: `linear-gradient(135deg, ${ROLE_COLORS[role]}40, ${ROLE_COLORS[role]}20)`,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: 24,
                                                        border: `2px solid ${ROLE_COLORS[role]}60`,
                                                        overflow: 'hidden',
                                                        flexShrink: 0
                                                    }}>
                                                        <img
                                                            src={!imageErrors[player.id] && photoUrl ? photoUrl : DEFAULT_PLAYER_IMAGE}
                                                            alt={player.name}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover',
                                                                objectPosition: 'top'
                                                            }}
                                                            onError={() => handleImageError(player.id)}
                                                        />
                                                    </div>

                                                    {/* Player Info */}
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{
                                                            color: isSelected ? '#fff' : '#9ca3af',
                                                            fontWeight: 500,
                                                            fontSize: 14,
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        }}>
                                                            {player.name}
                                                        </div>
                                                        <div style={{
                                                            color: ROLE_COLORS[role],
                                                            fontSize: 12
                                                        }}>
                                                            ₹{player.basePrice || 0.5} Cr
                                                        </div>
                                                    </div>

                                                    {/* Checkbox */}
                                                    <div style={{
                                                        width: 24,
                                                        height: 24,
                                                        borderRadius: 6,
                                                        background: isSelected ? ROLE_COLORS[role] : '#374151',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#fff',
                                                        fontSize: 14,
                                                        flexShrink: 0
                                                    }}>
                                                        {isSelected ? '✓' : ''}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div style={{
                                background: 'rgba(30, 41, 59, 0.95)',
                                borderRadius: 16,
                                padding: 20,
                                display: 'flex',
                                gap: 12
                            }}>
                                <button onClick={skipFilter} style={{
                                    flex: 1, padding: '16px',
                                    background: 'rgba(55, 65, 81, 0.5)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 10, color: '#9ca3af',
                                    fontSize: 16, cursor: 'pointer'
                                }}>
                                    ⏭️ Skip (Use All {totalPlayers})
                                </button>
                                <button
                                    onClick={applyFilter}
                                    disabled={selectedCount === 0 || isSubmitting}
                                    style={{
                                        flex: 2, padding: '16px',
                                        background: selectedCount === 0
                                            ? 'rgba(55, 65, 81, 0.5)'
                                            : 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                                        border: 'none', borderRadius: 10,
                                        color: '#fff', fontSize: 16, fontWeight: 'bold',
                                        cursor: selectedCount === 0 ? 'not-allowed' : 'pointer',
                                        opacity: selectedCount === 0 ? 0.5 : 1
                                    }}
                                >
                                    {isSubmitting ? '⏳ Starting...' : `✅ Start Auction (${selectedCount} players)`}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.95)',
                        borderRadius: 16,
                        padding: 48,
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
                        <p style={{ color: '#9ca3af' }}>Waiting for host to configure auction pool...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
