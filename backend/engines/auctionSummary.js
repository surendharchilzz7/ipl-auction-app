/**
 * Auction Summary Engine
 * Generates post-auction analytics and predictions
 */

const playersData = require('../data/reference/players_2025.json'); // GOLDEN SOURCE for base prices

/**
 * Get player value rating (1-5 stars) based on base price
 */
function getPlayerValue(player) {
    // Look up true base price from Golden Source if possible
    let base = player.basePrice || 0;

    // Attempt to find in Golden Source to ensure accuracy
    if (playersData && playersData.players) {
        const original = playersData.players.find(p => p.id === player.id);
        if (original) {
            base = original.basePrice;
        }
    }

    if (base >= 2) return 5;   // Star player
    if (base >= 1.5) return 4; // Premium
    if (base >= 1) return 3;   // Good
    if (base >= 0.5) return 2; // Regular
    return 1;                   // Budget
}

/**
 * Calculate team score for ranking
 */
function calculateTeamScore(team) {
    const players = team.players || [];
    let score = 0;

    // Value from players
    players.forEach(p => {
        const value = getPlayerValue(p);
        score += value * (p.soldPrice || p.basePrice || 0.5);
    });

    // Role balance bonus
    const roles = { BAT: 0, BOWL: 0, AR: 0, WK: 0 };
    players.forEach(p => {
        if (roles[p.role] !== undefined) roles[p.role]++;
    });

    // Ideal: 5+ BAT, 5+ BOWL, 3+ AR, 2 WK
    if (roles.BAT >= 5) score += 5;
    if (roles.BOWL >= 5) score += 5;
    if (roles.AR >= 3) score += 3;
    if (roles.WK >= 2) score += 2;

    // Squad size bonus
    if (players.length >= 18) score += 10;
    if (players.length >= 22) score += 5;

    // Budget remaining penalty (too much left = bad picks)
    if (team.budget > 20) score -= 3;

    return Math.round(score * 10) / 10;
}

/**
 * Calculate value buy score (how good a deal)
 * Higher score = Better value
 */
function getValueBuyScore(player, effectivePrice) {
    const baseValue = getPlayerValue(player);
    const pricePaid = effectivePrice || player.soldPrice || player.basePrice || 0.5;

    // Value = Quality (Stars) per Crore spent
    return baseValue / pricePaid;
}

/**
 * Get team strengths and weaknesses
 */
function getTeamAnalysis(team) {
    const players = team.players || [];
    const roles = { BAT: 0, BOWL: 0, AR: 0, WK: 0 };
    let totalValue = 0;
    let totalSpent = 0;

    players.forEach(p => {
        if (roles[p.role] !== undefined) roles[p.role]++;
        totalValue += getPlayerValue(p);
        totalSpent += p.soldPrice || p.basePrice || 0;
    });

    const strengths = [];
    const weaknesses = [];

    if (roles.BAT >= 6) strengths.push('Strong batting');
    else if (roles.BAT < 4) weaknesses.push('Weak batting');

    if (roles.BOWL >= 6) strengths.push('Deep bowling');
    else if (roles.BOWL < 4) weaknesses.push('Limited bowling');

    if (roles.AR >= 4) strengths.push('Good all-rounders');
    else if (roles.AR < 2) weaknesses.push('Few all-rounders');

    if (roles.WK >= 2) strengths.push('WK options');
    else if (roles.WK < 1) weaknesses.push('WK shortage');

    if (totalValue / players.length > 3) strengths.push('High quality squad');
    if (team.budget < 5) strengths.push('Budget well spent');
    if (team.budget > 30) weaknesses.push('Underspent budget');

    return { strengths, weaknesses };
}

/**
 * Generate full auction summary
 */
function generateAuctionSummary(room) {
    const teams = room.teams || [];
    const allPlayers = [];

    // Collect all sold players
    teams.forEach(team => {
        (team.players || []).forEach(p => {
            allPlayers.push({
                ...p,
                teamName: team.name
            });
        });
    });

    // Best Team
    const rankedTeams = teams.map(team => ({
        ...team,
        score: calculateTeamScore(team),
        analysis: getTeamAnalysis(team)
    })).sort((a, b) => b.score - a.score);

    const bestTeam = rankedTeams[0];

    // Separate retained players and RTM purchases
    const auctionBuys = allPlayers.filter(p => !p.retained && !p.rtmUsed);
    const retainedAndRTM = allPlayers.filter(p => p.retained || p.rtmUsed);

    // Top Buys
    const topBuys = [...auctionBuys]
        .sort((a, b) => (b.soldPrice || 0) - (a.soldPrice || 0))
        .slice(0, 5)
        .map(p => ({
            name: p.name,
            role: p.role,
            team: p.teamName,
            price: p.soldPrice || p.basePrice || 0,
            overseas: p.overseas
        }));

    // Top Retentions
    const topRetentions = [...retainedAndRTM]
        .sort((a, b) => (b.soldPrice || b.cost || 0) - (a.soldPrice || a.cost || 0))
        .slice(0, 10)
        .map(p => ({
            name: p.name,
            role: p.role,
            team: p.teamName,
            price: p.soldPrice || p.cost || 0,
            isRTM: p.rtmUsed || false,
            overseas: p.overseas
        }));

    // Best Picks (Best Value Logic)
    const bestPicks = [...auctionBuys]
        .map(p => {
            // GOLDEN SOURCE LOOKUP
            let trueBasePrice = 0.2;

            if (playersData && playersData.players) {
                const original = playersData.players.find(op => op.id === p.id);
                if (original) {
                    trueBasePrice = original.basePrice || 0.2;
                } else {
                    trueBasePrice = p.basePrice || 0.2;
                }
            } else {
                trueBasePrice = p.basePrice || 0.2;
            }

            // Auto-Correct logic (already present)
            const effectivePrice = Math.max(p.soldPrice || 0, trueBasePrice);
            const valueScore = getValueBuyScore(p, effectivePrice);
            const val = getPlayerValue(p);

            // Debug Log for Warner/Williamson
            if (p.name.includes("Warner") || p.name.includes("Williamson")) {
                console.log(`[BestValue Debug] ${p.name}: Base=${trueBasePrice}, Sold=${p.soldPrice}, Effective=${effectivePrice}, Rating=${val}, IsStarSteal=${(val >= 5) && (effectivePrice <= trueBasePrice * 1.05)}`);
            }

            return {
                ...p,
                basePrice: trueBasePrice,
                soldPrice: effectivePrice, // Use corrected price for logic
                originalSoldPrice: p.soldPrice, // Keep original for display
                valueScore: valueScore,
                rating: val
            };
        })
        .filter(p => {
            // 1. Sanity Check
            if (p.soldPrice < p.basePrice) return false;

            // 2. Hybrid Price Filter
            // General Rule: Exclude players >= 1 Cr
            if (p.soldPrice >= 1) {
                // EXCEPTION: Allow "Elite Stars" ONLY (Rating 5 / Base 2 Cr) bought at Base Price
                // User considers 1.5 Cr players (Powell) "not worth showing" vs 0.2 Cr players
                const isStarAtBase = (p.rating >= 5) && (p.soldPrice <= p.basePrice * 1.05); // Changed to >= 5

                if (!isStarAtBase) {
                    return false; // Filter out if expensive AND not an "Elite Star at Base"
                }
            }

            return true;
        })
        .sort((a, b) => {
            // Priority 1: Elite Star Steals (Rating 5 AND Sold near Base) get Top Priority
            const isStarStealA = (a.rating >= 5) && (a.soldPrice <= a.basePrice * 1.05); // Changed to >= 5
            const isStarStealB = (b.rating >= 5) && (b.soldPrice <= b.basePrice * 1.05); // Changed to >= 5

            if (isStarStealA && !isStarStealB) return -1; // A is Star Steal -> Top
            if (!isStarStealA && isStarStealB) return 1;  // B is Star Steal -> Top

            // Priority 2: ROI (Best Value Score) - This handles the 0.2 Cr players
            return b.valueScore - a.valueScore;
        })
        .slice(0, 5)
        .map(p => ({
            name: p.name,
            role: p.role,
            team: p.teamName,
            price: p.soldPrice, // FORCE EFFECTIVE PRICE: Shows 2.0 Cr (corrected) instead of 0.2 Cr (buggy)
            basePrice: p.basePrice,
            valueScore: Math.round(p.valueScore * 10) / 10,
            overseas: p.overseas
        }));

    // Team Predictions
    const teamPredictions = rankedTeams.map((team, idx) => ({
        name: team.name,
        rank: idx + 1,
        score: team.score,
        playerCount: team.players?.length || 0,
        budgetRemaining: team.budget || 0,
        strengths: team.analysis.strengths,
        weaknesses: team.analysis.weaknesses,
        prediction: idx === 0 ? 'Title Contender' :
            idx < 3 ? 'Playoff Contender' :
                idx < 6 ? 'Mid-Table' : 'Rebuilding'
    }));

    // Calculate total pool size
    const totalInPool = room.auctionPool?.length || 0;
    const soldCount = allPlayers.filter(p => !p.autoFilled).length;
    const autoFilledCount = allPlayers.filter(p => p.autoFilled).length;
    const unsoldCount = totalInPool - soldCount;

    return {
        bestTeam: {
            name: bestTeam?.name,
            score: bestTeam?.score,
            playerCount: bestTeam?.players?.length || 0,
            reason: bestTeam?.analysis.strengths.join(', ') || 'Balanced squad'
        },
        topBuys,
        topRetentions,
        bestPicks,
        teamPredictions,
        totalInPool,
        totalPlayersSold: soldCount,
        totalUnsold: unsoldCount > 0 ? unsoldCount : 0,
        totalPlayersAutoFilled: autoFilledCount,
        totalRetained: allPlayers.filter(p => p.retained).length,
        totalRTM: allPlayers.filter(p => p.rtmUsed).length
    };
}

module.exports = {
    generateAuctionSummary,
    calculateTeamScore,
    getPlayerValue,
    getValueBuyScore,
    getTeamAnalysis
};
