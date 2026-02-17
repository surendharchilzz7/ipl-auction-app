/**
 * Stats Manager - Track and persist auction statistics
 * Uses file-based persistence for Render compatibility
 */

const fs = require('fs');
const path = require('path');

const STATS_FILE = path.join(__dirname, '../data/stats.json');

// In-memory set to track unique visitor IPs (resets on server restart)
const seenVisitorIPs = new Set();

// Default stats structure
const DEFAULT_STATS = {
    auctionsStarted: 0,
    auctionsEnded: 0,
    totalViews: 0,
    lastUpdated: new Date().toISOString()
};

/**
 * Read current stats from file
 * @returns {Object} Current stats
 */
function getStats() {
    try {
        if (fs.existsSync(STATS_FILE)) {
            const data = fs.readFileSync(STATS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.error('[Stats] Error reading stats file:', err.message);
    }
    return { ...DEFAULT_STATS };
}

/**
 * Save stats to file
 * @param {Object} stats - Stats object to save
 */
function saveStats(stats) {
    try {
        stats.lastUpdated = new Date().toISOString();
        fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
        console.log('[Stats] Saved:', stats);
    } catch (err) {
        console.error('[Stats] Error saving stats:', err.message);
    }
}

/**
 * Increment auctions started counter
 * @returns {Object} Updated stats
 */
function incrementAuctionsStarted() {
    const stats = getStats();
    stats.auctionsStarted++;
    saveStats(stats);
    return stats;
}

/**
 * Increment auctions ended counter
 * @returns {Object} Updated stats
 */
function incrementAuctionsEnded() {
    const stats = getStats();
    stats.auctionsEnded++;
    saveStats(stats);
    return stats;
}

/**
 * Increment total views counter (legacy - use trackUniqueVisitor instead)
 * @returns {Object} Updated stats
 */
function incrementTotalViews() {
    const stats = getStats();
    stats.totalViews++;
    saveStats(stats);
    return stats;
}

/**
 * Track a unique visitor by IP address.
 * Only increments totalViews if this IP hasn't been seen before.
 * @param {string} ip - The visitor's IP address
 * @returns {{ stats: Object, isNew: boolean }} Updated stats and whether this was a new visitor
 */
function trackUniqueVisitor(ip) {
    // Normalize IP (strip IPv6 prefix if present)
    const normalizedIP = ip ? ip.replace(/^::ffff:/, '') : 'unknown';

    if (seenVisitorIPs.has(normalizedIP)) {
        // Returning visitor — don't increment, just return current stats
        return { stats: getStats(), isNew: false };
    }

    // New unique visitor
    seenVisitorIPs.add(normalizedIP);
    console.log(`[Stats] New unique visitor: ${normalizedIP} (total unique this session: ${seenVisitorIPs.size})`);

    const stats = getStats();
    stats.totalViews++;
    saveStats(stats);
    return { stats, isNew: true };
}

/**
 * Initialize stats file if it doesn't exist
 */
function initStats() {
    if (!fs.existsSync(STATS_FILE)) {
        console.log('[Stats] Creating stats file...');
        saveStats(DEFAULT_STATS);
    } else {
        // Ensure new stats fields exist (migration)
        const stats = getStats();
        let needsSave = false;
        if (typeof stats.auctionsEnded !== 'number') {
            stats.auctionsEnded = 0;
            needsSave = true;
        }
        if (typeof stats.totalViews !== 'number') {
            stats.totalViews = 0;
            needsSave = true;
        }
        if (needsSave) {
            saveStats(stats);
            console.log('[Stats] Migrated stats file with new fields');
        }
        console.log('[Stats] Stats file exists. Current:', stats);
    }
}

module.exports = {
    getStats,
    saveStats,
    incrementAuctionsStarted,
    incrementAuctionsEnded,
    incrementTotalViews,
    trackUniqueVisitor,
    initStats
};
