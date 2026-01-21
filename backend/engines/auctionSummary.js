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
/**
 * Calculate team score for ranking
 */
function calculateTeamScore(team, totalBudget = 120) {
    const players = team.players || [];
    let score = 0;

    // Value from players
    players.forEach(p => {
        const value = getPlayerValue(p);
        // Score based on QUALITY, not PRICE. 
        // 5-star player = 50 points. 1-star player = 10 points.
        score += value * 10;
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
    // Threshold scales with budget: >16% of budget is "too much" (approx 20Cr for 120 budget)
    const penaltyThreshold = totalBudget * 0.166;
    if (team.budget > penaltyThreshold) score -= 3;

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
/**
 * Get team strengths and weaknesses
 */
function getTeamAnalysis(team, totalBudget = 120) {
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

    // Budget analysis
    // < 4% of total budget is "well spent" (approx 5Cr for 120)
    if (team.budget < (totalBudget * 0.04)) strengths.push('Budget well spent');

    // > 25% of total budget is "underspent" (approx 30Cr for 120)
    if (team.budget > (totalBudget * 0.25)) weaknesses.push('Underspent budget');

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

    // Get room budget
    const totalBudget = room.config?.budget || room.rules?.purse || 120;

    // Best Team
    const rankedTeams = teams.map(team => ({
        ...team,
        score: calculateTeamScore(team, totalBudget),
        analysis: getTeamAnalysis(team, totalBudget)
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

    // Best Value Picks - Players sold at or near base price
    // Priority: 1) Auction buys at base price, 2) Autofill players (low price)
    // Always show exactly 5 picks

    const valuePicks = [];

    // 1. Find players sold at their base price (real value picks from auction)
    const basePriceBuys = auctionBuys
        .filter(p => !p.autoFilled) // Only actual auction buys
        .map(p => {
            // Get true base price from golden source
            let trueBasePrice = p.basePrice || 0.3;
            if (playersData && playersData.players) {
                const original = playersData.players.find(op => op.id === p.id);
                if (original) trueBasePrice = original.basePrice || 0.3;
            }

            const soldPrice = p.soldPrice || trueBasePrice;
            // Value pick = sold price is exactly base price (or within 5%)
            const isSoldAtBase = soldPrice <= trueBasePrice * 1.05;

            return {
                ...p,
                trueBasePrice,
                soldPrice,
                isSoldAtBase,
                // Higher value = lower price relative to quality
                valueScore: isSoldAtBase ? (getPlayerValue(p) * 10) : getPlayerValue(p)
            };
        })
        .filter(p => p.isSoldAtBase) // Only players sold at base price
        .sort((a, b) => b.valueScore - a.valueScore); // Best quality first

    // Add base price buys to value picks
    basePriceBuys.forEach(p => {
        if (valuePicks.length < 5) {
            valuePicks.push({
                name: p.name,
                role: p.role,
                team: p.teamName,
                price: p.soldPrice,
                basePrice: p.trueBasePrice,
                overseas: p.overseas,
                isAutoFill: false
            });
        }
    });

    // 2. If less than 5 value picks, add autofill players (sorted by base price)
    if (valuePicks.length < 5) {
        const autoFillPlayers = allPlayers
            .filter(p => p.autoFilled)
            .map(p => {
                let trueBasePrice = p.basePrice || 0.3;
                if (playersData && playersData.players) {
                    const original = playersData.players.find(op => op.id === p.id);
                    if (original) trueBasePrice = original.basePrice || 0.3;
                }
                return { ...p, trueBasePrice };
            })
            .sort((a, b) => a.trueBasePrice - b.trueBasePrice); // Cheapest first

        autoFillPlayers.forEach(p => {
            if (valuePicks.length < 5) {
                valuePicks.push({
                    name: p.name,
                    role: p.role,
                    team: p.teamName,
                    price: p.trueBasePrice,
                    basePrice: p.trueBasePrice,
                    overseas: p.overseas,
                    isAutoFill: true
                });
            }
        });
    }

    const bestPicks = valuePicks;

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
