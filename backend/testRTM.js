// Quick test for RTM logic
const { checkRTMEligibility, autoFinalizeRetention } = require('./engines/retentionEngine');

// Create a mock room
const mockRoom = {
    teams: [
        { name: 'CSK', budget: 120, players: [], retained: [] },
        { name: 'MI', budget: 120, players: [], retained: [] },
        { name: 'RCB', budget: 120, players: [], retained: [] }
    ],
    rules: { maxTotalRetentionRTM: 6 },
    soldPlayersByTeam: {
        CSK: [
            { id: 'devon_conway', name: 'Devon Conway', role: 'WK', sold: true, retained: false },
            { id: 'ms_dhoni', name: 'MS Dhoni', role: 'WK', sold: true, retained: false }
        ],
        MI: [
            { id: 'rohit_sharma', name: 'Rohit Sharma', role: 'BAT', sold: true, retained: false }
        ]
    },
    retainedPlayers: {
        CSK: [], // CSK retains no one
        MI: [],  // MI retains no one
        RCB: []  // RCB retains no one
    },
    rtmCardsRemaining: {} // Will be set by autoFinalizeRetention
};

console.log('=== RTM Test ===\n');

// Step 1: Finalize retentions (this should set RTM cards)
console.log('1. Running autoFinalizeRetention...');
autoFinalizeRetention(mockRoom);

console.log('\n2. Checking rtmCardsRemaining after finalization:');
console.log('   CSK RTM cards:', mockRoom.rtmCardsRemaining.CSK);
console.log('   MI RTM cards:', mockRoom.rtmCardsRemaining.MI);
console.log('   RCB RTM cards:', mockRoom.rtmCardsRemaining.RCB);

// Step 2: Check RTM eligibility for Devon Conway (CSK ex-player)
console.log('\n3. Checking RTM eligibility for Devon Conway (CSK ex-player):');
const rtmResult = checkRTMEligibility(mockRoom, 'devon_conway');
console.log('   Result:', rtmResult);

if (rtmResult) {
    console.log('   ✅ SUCCESS: RTM should trigger for CSK!');
} else {
    console.log('   ❌ FAIL: RTM not triggered!');
    console.log('   Debug - soldPlayersByTeam.CSK:', mockRoom.soldPlayersByTeam.CSK);
    console.log('   Debug - rtmCardsRemaining:', mockRoom.rtmCardsRemaining);
}

// Step 3: Check RTM eligibility for Rohit Sharma (MI ex-player)
console.log('\n4. Checking RTM eligibility for Rohit Sharma (MI ex-player):');
const rtmResult2 = checkRTMEligibility(mockRoom, 'rohit_sharma');
console.log('   Result:', rtmResult2);

if (rtmResult2) {
    console.log('   ✅ SUCCESS: RTM should trigger for MI!');
} else {
    console.log('   ❌ FAIL: RTM not triggered!');
}

console.log('\n=== Test Complete ===');
