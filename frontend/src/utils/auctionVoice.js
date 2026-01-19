/**
 * Auction Voice Announcer
 * Uses Web Speech API to announce auction events
 * 
 * Announces:
 * - Set changes (e.g., "Set BAT 1")
 * - Player intro (e.g., "Virat Kohli, base price 2 crore")
 * - Sale result (e.g., "Sold to Chennai Super Kings")
 * - Unsold (e.g., "Unsold")
 */

// Team full names for announcements
const TEAM_FULL_NAMES = {
    CSK: "Chennai Super Kings",
    MI: "Mumbai Indians",
    RCB: "Royal Challengers Bangalore",
    KKR: "Kolkata Knight Riders",
    SRH: "Sunrisers Hyderabad",
    RR: "Rajasthan Royals",
    DC: "Delhi Capitals",
    PBKS: "Punjab Kings",
    LSG: "Lucknow Super Giants",
    GT: "Gujarat Titans"
};

// Set full names for announcements
const SET_FULL_NAMES = {
    BAT: "Batsmen Set",
    BOWL: "Bowlers Set",
    AR: "All Rounders Set",
    WK: "Wicket Keepers Set"
};

class AuctionVoice {
    constructor() {
        this.synth = window.speechSynthesis;
        this.enabled = true;
        this.voice = null;
        this.rate = 0.9; // Slightly slower for clarity
        this.pitch = 1.0;
        this.volume = 1.0;
        this.lastAnnouncement = null;

        // Find a good male voice
        this.initVoice();
    }

    initVoice() {
        // Wait for voices to load
        if (this.synth.getVoices().length === 0) {
            this.synth.addEventListener('voiceschanged', () => {
                this.selectVoice();
            });
        } else {
            this.selectVoice();
        }
    }

    selectVoice() {
        const voices = this.synth.getVoices();

        // Prefer deep male voices - try these in order
        const preferredVoices = [
            'Google UK English Male',
            'Microsoft David',
            'Microsoft Mark',
            'Alex',
            'Daniel',
            'Google US English'
        ];

        for (const pref of preferredVoices) {
            const found = voices.find(v => v.name.includes(pref));
            if (found) {
                this.voice = found;
                console.log('[Voice] Selected:', found.name);
                return;
            }
        }

        // Fallback: any English male voice
        const englishVoice = voices.find(v =>
            v.lang.startsWith('en') &&
            (v.name.toLowerCase().includes('male') ||
                v.name.includes('David') ||
                v.name.includes('Mark') ||
                v.name.includes('James'))
        );

        if (englishVoice) {
            this.voice = englishVoice;
            console.log('[Voice] Fallback:', englishVoice.name);
        } else {
            // Last resort: first English voice
            this.voice = voices.find(v => v.lang.startsWith('en')) || voices[0];
            console.log('[Voice] Default:', this.voice?.name);
        }
    }

    speak(text, priority = false) {
        if (!this.enabled || !this.synth) return;

        // Removed text === lastAnnouncement check to allow consecutive identical messages 
        // (like Unsold followed by Unsold) which are valid in an auction.
        this.lastAnnouncement = text;

        // Cancel previous if priority
        if (priority) {
            this.synth.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = this.voice;
        utterance.rate = this.rate;
        utterance.pitch = this.pitch;
        utterance.volume = this.volume;

        this.synth.speak(utterance);
    }

    // Announce new set
    announceSet(setName) {
        if (!setName) return;

        // Parse set name (e.g., "BAT1" -> "Batsmen Set 1")
        const match = setName.match(/^([A-Z]+)(\d+)$/);
        if (match) {
            const [, role, num] = match;
            const fullName = SET_FULL_NAMES[role] || role;
            this.speak(`${fullName} ${num}`, true);
        } else {
            this.speak(`Set ${setName}`, true);
        }
    }

    // Announce player intro
    announcePlayer(player, priority = true) {
        if (!player) return;

        const name = player.name || 'Unknown Player';
        const basePrice = player.basePrice || 0.3;

        // Format price
        let priceText;
        if (basePrice >= 1) {
            priceText = `${basePrice} crore`;
        } else {
            priceText = `${Math.round(basePrice * 100)} lakh`;
        }

        this.speak(`${name}. Base price ${priceText}`, priority);
    }

    // Announce sale
    announceSold(teamName, price) {
        const fullName = TEAM_FULL_NAMES[teamName] || teamName;

        let priceText = '';
        if (price >= 1) {
            priceText = ` for ${price} crore`;
        } else if (price > 0) {
            priceText = ` for ${Math.round(price * 100)} lakh`;
        }

        this.speak(`Sold to ${fullName}${priceText}`, true);
    }

    // Announce unsold
    announceUnsold() {
        this.speak('Unsold', true);
    }

    // Toggle voice on/off
    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.synth.cancel();
        }
        return this.enabled;
    }

    // Set enabled state
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.synth.cancel();
        }
    }

    // Cleanup
    stop() {
        this.synth.cancel();
    }
}

// Singleton instance
const auctionVoice = new AuctionVoice();

export default auctionVoice;
export { TEAM_FULL_NAMES, SET_FULL_NAMES };
