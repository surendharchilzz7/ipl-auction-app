/**
 * Centralized Team Data - Logos and Colors
 * Use this file for all team-related constants to ensure consistency across the app.
 */

// Team colors for styling
export const TEAM_COLORS = {
    CSK: '#f9cd05', MI: '#004ba0', RCB: '#ec1c24', KKR: '#3a225d', SRH: '#ff822a',
    RR: '#ea1a85', DC: '#0078bc', PBKS: '#ed1b24', LSG: '#00b7eb', GT: '#1c1c1c',
    // Historical
    DD: '#dc2626', DEC: '#1f2937', PWI: '#0f766e', KTK: '#ea580c', GL: '#facc15', RPS: '#831843'
};

// Team logos - Using local paths from /team-logos/ directory
export const TEAM_LOGOS = {
    // Short Codes
    CSK: '/team-logos/CSK.png',
    MI: '/team-logos/MI.png',
    RCB: '/team-logos/RCB.png',
    KKR: '/team-logos/KKR.png',
    SRH: '/team-logos/SRH.png',
    RR: '/team-logos/RR.png',
    DC: '/team-logos/DC.png',
    PBKS: '/team-logos/PBKS.png',
    LSG: '/team-logos/LSG.png',
    GT: '/team-logos/GT.png',

    // Full Names (Mapping for safety)
    "Chennai Super Kings": '/team-logos/CSK.png',
    "Mumbai Indians": '/team-logos/MI.png',
    "Royal Challengers Bengaluru": '/team-logos/RCB.png',
    "Royal Challengers Bangalore": '/team-logos/RCB.png',
    "Kolkata Knight Riders": '/team-logos/KKR.png',
    "Sunrisers Hyderabad": '/team-logos/SRH.png',
    "Rajasthan Royals": '/team-logos/RR.png',
    "Delhi Capitals": '/team-logos/DC.png',
    "Punjab Kings": '/team-logos/PBKS.png',
    "Lucknow Super Giants": '/team-logos/LSG.png',
    "Gujarat Titans": '/team-logos/GT.png',

    // Historical
    DD: '/team-logos/DD.png',
    DEC: '/team-logos/DEC.png',
    PWI: '/team-logos/PWI.png',
    KTK: '/team-logos/KTK.png',
    GL: '/team-logos/GL.png',
    RPS: '/team-logos/RPS.png'
};

// Helper to get team logo with fallback
export function getTeamLogo(teamName) {
    return TEAM_LOGOS[teamName] || null;
}

// Helper to get team color with fallback
export function getTeamColor(teamName) {
    return TEAM_COLORS[teamName] || '#374151';
}
