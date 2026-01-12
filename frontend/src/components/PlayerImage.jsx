/**
 * PlayerImage Component - Displays player photo with fallback
 * Uses IPL headshots with automatic URL generation
 */

import React, { useState } from 'react';
import { getPlayerPhotoUrl, DEFAULT_PLAYER_IMAGE } from '../data/playerPhotos';

// Role badge colors and emojis
const ROLE_CONFIG = {
    BAT: { color: '#f472b6', emoji: '🏏', label: 'BAT' },
    BOWL: { color: '#60a5fa', emoji: '🎳', label: 'BOWL' },
    AR: { color: '#fbbf24', emoji: '⭐', label: 'AR' },
    WK: { color: '#34d399', emoji: '🧤', label: 'WK' }
};

export default function PlayerImage({
    name,
    role,
    size = 60,
    showRole = true,
    style = {}
}) {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const photoUrl = getPlayerPhotoUrl(name);
    const roleConfig = ROLE_CONFIG[role] || ROLE_CONFIG.BAT;

    // Generate initials from name
    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <div style={{
            position: 'relative',
            width: size,
            height: size,
            borderRadius: '50%',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
            border: `2px solid ${roleConfig.color}40`,
            flexShrink: 0,
            ...style
        }}>
            {/* Player Photo or Fallback */}
            {hasError ? (
                // Fallback: Show silhouette SVG
                <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${roleConfig.color}20, #1e293b)`,
                }}>
                    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                        <circle cx="50" cy="50" r="50" fill="#1e293b" />
                        <circle cx="50" cy="35" r="16" fill={roleConfig.color + '60'} />
                        <ellipse cx="50" cy="78" rx="26" ry="20" fill={roleConfig.color + '60'} />
                    </svg>
                </div>
            ) : (
                <>
                    {/* Loading placeholder */}
                    {isLoading && (
                        <div style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#1e293b'
                        }}>
                            <span style={{ color: '#475569', fontSize: size * 0.3 }}>{roleConfig.emoji}</span>
                        </div>
                    )}

                    {/* Actual photo */}
                    <img
                        src={photoUrl || DEFAULT_PLAYER_IMAGE}
                        alt={name}
                        onLoad={() => setIsLoading(false)}
                        onError={() => {
                            setHasError(true);
                            setIsLoading(false);
                        }}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            opacity: isLoading ? 0 : 1,
                            transition: 'opacity 0.2s ease'
                        }}
                    />
                </>
            )}

            {/* Role badge */}
            {showRole && role && (
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    background: roleConfig.color,
                    color: '#000',
                    fontSize: size * 0.18,
                    fontWeight: 'bold',
                    padding: '1px 4px',
                    borderRadius: 4,
                    transform: 'translate(15%, 15%)'
                }}>
                    {roleConfig.label}
                </div>
            )}
        </div>
    );
}
