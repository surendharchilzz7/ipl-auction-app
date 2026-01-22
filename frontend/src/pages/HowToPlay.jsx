import React from 'react';

export default function HowToPlay() {
    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a, #1e293b)',
            fontFamily: '"Outfit", system-ui, sans-serif',
            color: '#fff'
        }}>
            {/* Header */}
            <header style={{
                padding: '20px 40px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                    <span style={{ fontSize: 32 }}>🏏</span>
                    <span style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>IPL Mock Auction</span>
                </a>
                <nav style={{ display: 'flex', gap: 24 }}>
                    <a href="/about" style={{ color: '#9ca3af', textDecoration: 'none' }}>About</a>
                    <a href="/how-to-play" style={{ color: '#60a5fa', textDecoration: 'none' }}>How to Play</a>
                    <a href="/privacy" style={{ color: '#9ca3af', textDecoration: 'none' }}>Privacy</a>
                    <a href="/contact" style={{ color: '#9ca3af', textDecoration: 'none' }}>Contact</a>
                </nav>
            </header>

            {/* Main Content */}
            <main style={{ maxWidth: 900, margin: '0 auto', padding: '60px 24px' }}>
                <h1 style={{ fontSize: 48, marginBottom: 24, color: '#34d399' }}>How to Play IPL Mock Auction</h1>

                <p style={{ fontSize: 18, lineHeight: 1.8, color: '#d1d5db', marginBottom: 40 }}>
                    Learn everything you need to know about hosting and participating in IPL Mock Auctions. This comprehensive guide will walk you through every step of the process, from creating a room to building your championship-winning squad.
                </p>

                {/* Table of Contents */}
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: 24,
                    borderRadius: 12,
                    marginBottom: 40
                }}>
                    <h2 style={{ fontSize: 20, marginBottom: 16, color: '#60a5fa' }}>📑 Table of Contents</h2>
                    <ol style={{ paddingLeft: 24, lineHeight: 2, color: '#9ca3af' }}>
                        <li><a href="#getting-started" style={{ color: '#60a5fa' }}>Getting Started</a></li>
                        <li><a href="#creating-room" style={{ color: '#60a5fa' }}>Creating an Auction Room</a></li>
                        <li><a href="#team-selection" style={{ color: '#60a5fa' }}>Team Selection</a></li>
                        <li><a href="#retention" style={{ color: '#60a5fa' }}>Retention Phase</a></li>
                        <li><a href="#auction" style={{ color: '#60a5fa' }}>The Auction Process</a></li>
                        <li><a href="#bidding" style={{ color: '#60a5fa' }}>Bidding Strategies</a></li>
                        <li><a href="#rtm" style={{ color: '#60a5fa' }}>Right to Match (RTM)</a></li>
                        <li><a href="#tips" style={{ color: '#60a5fa' }}>Pro Tips & Strategies</a></li>
                    </ol>
                </div>

                {/* Section 1 */}
                <section id="getting-started" style={{ marginBottom: 48 }}>
                    <h2 style={{ fontSize: 28, marginBottom: 16, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span>1️⃣</span> Getting Started
                    </h2>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db', marginBottom: 16 }}>
                        IPL Mock Auction is a free-to-play real-time multiplayer auction simulator. You can either create your own auction room or join an existing one using a room code.
                    </p>
                    <h3 style={{ fontSize: 18, color: '#fff', marginBottom: 12 }}>What You Need:</h3>
                    <ul style={{ paddingLeft: 24, lineHeight: 2, color: '#d1d5db' }}>
                        <li>A modern web browser (Chrome, Firefox, Safari, or Edge)</li>
                        <li>A stable internet connection</li>
                        <li>Friends to play with (optional - you can play with AI teams)</li>
                        <li>Basic knowledge of IPL teams and players (helpful but not required)</li>
                    </ul>
                </section>

                {/* Section 2 */}
                <section id="creating-room" style={{ marginBottom: 48 }}>
                    <h2 style={{ fontSize: 28, marginBottom: 16, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span>2️⃣</span> Creating an Auction Room
                    </h2>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db', marginBottom: 16 }}>
                        As the host, you have full control over the auction settings and can customize the experience to your liking.
                    </p>
                    <h3 style={{ fontSize: 18, color: '#fff', marginBottom: 12 }}>Configuration Options:</h3>
                    <ul style={{ paddingLeft: 24, lineHeight: 2, color: '#d1d5db' }}>
                        <li><strong style={{ color: '#fff' }}>Team Budget:</strong> Set from ₹120 Cr to ₹200 Cr per team</li>
                        <li><strong style={{ color: '#fff' }}>AI Teams:</strong> Enable to fill empty team slots with intelligent AI bidders</li>
                        <li><strong style={{ color: '#fff' }}>Retention Mode:</strong> Allow teams to retain players before the auction begins</li>
                    </ul>
                    <div style={{
                        background: 'rgba(52, 211, 153, 0.1)',
                        border: '1px solid rgba(52, 211, 153, 0.3)',
                        borderRadius: 12,
                        padding: 16,
                        marginTop: 16
                    }}>
                        <p style={{ color: '#34d399', margin: 0 }}>
                            💡 <strong>Tip:</strong> Share the room code with friends so they can join. The code appears at the top of the screen once the room is created.
                        </p>
                    </div>
                </section>

                {/* Section 3 */}
                <section id="team-selection" style={{ marginBottom: 48 }}>
                    <h2 style={{ fontSize: 28, marginBottom: 16, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span>3️⃣</span> Team Selection
                    </h2>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db', marginBottom: 16 }}>
                        Once in the room, all players choose their preferred IPL franchise. Each team can only be selected by one player, so choose quickly!
                    </p>
                    <h3 style={{ fontSize: 18, color: '#fff', marginBottom: 12 }}>Available Teams:</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
                        {['Chennai Super Kings', 'Mumbai Indians', 'Royal Challengers Bangalore', 'Kolkata Knight Riders',
                            'Sunrisers Hyderabad', 'Rajasthan Royals', 'Delhi Capitals', 'Punjab Kings',
                            'Lucknow Super Giants', 'Gujarat Titans'].map((team, idx) => (
                                <div key={idx} style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    padding: '12px 16px',
                                    borderRadius: 8,
                                    textAlign: 'center',
                                    color: '#d1d5db',
                                    fontSize: 13
                                }}>{team}</div>
                            ))}
                    </div>
                </section>

                {/* Section 4 */}
                <section id="retention" style={{ marginBottom: 48 }}>
                    <h2 style={{ fontSize: 28, marginBottom: 16, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span>4️⃣</span> Retention Phase
                    </h2>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db', marginBottom: 16 }}>
                        If retention mode is enabled, each team can choose to retain players from the previous season's squad before the main auction begins. Retained players have prices deducted from your budget based on IPL rules for that specific season.
                    </p>
                    <h3 style={{ fontSize: 18, color: '#fff', marginBottom: 12 }}>Retention Rules (2025):</h3>
                    <ul style={{ paddingLeft: 24, lineHeight: 2, color: '#d1d5db' }}>
                        <li>Maximum 6 retentions per team</li>
                        <li>Retention 1: ₹18 Cr</li>
                        <li>Retention 2: ₹14 Cr</li>
                        <li>Retention 3: ₹11 Cr</li>
                        <li>Retentions 4-5: ₹18 Cr / ₹14 Cr</li>
                        <li>Reference 2025 IPL rules for specific uncapped player costs</li>
                        <li>You also receive RTM (Right to Match) cards for retained players</li>
                    </ul>
                    <div style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: 12,
                        padding: 16,
                        marginTop: 16
                    }}>
                        <p style={{ color: '#60a5fa', margin: 0 }}>
                            📅 <strong>Historical Seasons:</strong> For older seasons (e.g., 2018), retention rules adapt to match that year's regulations (including special handling for returning teams like CSK/RR).
                        </p>
                    </div>
                </section>

                {/* Section 4.5 - Historical Auctions */}
                <section id="historical" style={{ marginBottom: 48 }}>
                    <h2 style={{ fontSize: 28, marginBottom: 16, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span>⏳</span> Historical Auctions
                    </h2>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db', marginBottom: 16 }}>
                        Travel back in time! You can choose any season from 2008 to 2025.
                    </p>
                    <ul style={{ paddingLeft: 24, lineHeight: 2, color: '#d1d5db' }}>
                        <li><strong style={{ color: '#fff' }}>Defunct Teams:</strong> Play as iconic past teams like Deccan Chargers, Pune Warriors, or Gujarat Lions in their respective years.</li>
                        <li><strong style={{ color: '#fff' }}>Classic Rosters:</strong> Auction pools contain the exact players available in that year's real auction.</li>
                        <li><strong style={{ color: '#fff' }}>Authentic Rules:</strong> Experience the evolution of IPL auction rules and budget caps.</li>
                    </ul>
                </section>

                {/* Section 5 */}
                <section id="auction" style={{ marginBottom: 48 }}>
                    <h2 style={{ fontSize: 28, marginBottom: 16, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span>5️⃣</span> The Auction Process
                    </h2>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db', marginBottom: 16 }}>
                        The main event! Players are presented one at a time, organized into sets based on their role and base price. You have a limited time to place bids.
                    </p>
                    <h3 style={{ fontSize: 18, color: '#fff', marginBottom: 12 }}>Auction Sets:</h3>
                    <ul style={{ paddingLeft: 24, lineHeight: 2, color: '#d1d5db' }}>
                        <li><strong style={{ color: '#60a5fa' }}>BAT Sets:</strong> Specialist batsmen</li>
                        <li><strong style={{ color: '#34d399' }}>BOWL Sets:</strong> Specialist bowlers</li>
                        <li><strong style={{ color: '#fbbf24' }}>AR Sets:</strong> All-rounders</li>
                        <li><strong style={{ color: '#f472b6' }}>WK Sets:</strong> Wicketkeeper-batsmen</li>
                    </ul>
                    <h3 style={{ fontSize: 18, color: '#fff', marginBottom: 12, marginTop: 24 }}>Timer & Bidding:</h3>
                    <ul style={{ paddingLeft: 24, lineHeight: 2, color: '#d1d5db' }}>
                        <li>Each player has a 20-second bidding window</li>
                        <li>Timer resets to 20 seconds after each valid bid</li>
                        <li>Minimum bid increment is ₹0.25 Cr (25 Lakhs)</li>
                        <li>When timer expires, highest bidder wins the player</li>
                    </ul>
                </section>

                {/* Section 6 */}
                <section id="bidding" style={{ marginBottom: 48 }}>
                    <h2 style={{ fontSize: 28, marginBottom: 16, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span>6️⃣</span> Bidding Strategies
                    </h2>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db', marginBottom: 16 }}>
                        Success in the auction requires careful planning and strategic bidding. Here are some key considerations:
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: 20, borderRadius: 12 }}>
                            <h4 style={{ color: '#60a5fa', marginBottom: 8 }}>💰 Budget Management</h4>
                            <p style={{ color: '#9ca3af', fontSize: 14 }}>
                                Don't blow your budget on the first few players. Keep reserve funds for later sets where you might find bargains.
                            </p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: 20, borderRadius: 12 }}>
                            <h4 style={{ color: '#34d399', marginBottom: 8 }}>⚖️ Squad Balance</h4>
                            <p style={{ color: '#9ca3af', fontSize: 14 }}>
                                Aim for a balanced squad with enough players in each role. Don't overspend on one position.
                            </p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: 20, borderRadius: 12 }}>
                            <h4 style={{ color: '#f59e0b', marginBottom: 8 }}>✈️ Overseas Limit</h4>
                            <p style={{ color: '#9ca3af', fontSize: 14 }}>
                                Maximum 8 overseas players per team. Plan your overseas picks carefully.
                            </p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: 20, borderRadius: 12 }}>
                            <h4 style={{ color: '#ec4899', marginBottom: 8 }}>🎯 Target Players</h4>
                            <p style={{ color: '#9ca3af', fontSize: 14 }}>
                                Identify your must-have players before the auction and set maximum prices you're willing to pay.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section 7 */}
                <section id="rtm" style={{ marginBottom: 48 }}>
                    <h2 style={{ fontSize: 28, marginBottom: 16, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span>7️⃣</span> Right to Match (RTM)
                    </h2>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db', marginBottom: 16 }}>
                        RTM is a powerful tool that allows teams to match the winning bid and retain a player who was previously part of their squad.
                    </p>
                    <h3 style={{ fontSize: 18, color: '#fff', marginBottom: 12 }}>How RTM Works:</h3>
                    <ol style={{ paddingLeft: 24, lineHeight: 2.2, color: '#d1d5db' }}>
                        <li>When a player from your previous squad is won by another team, you can choose to use RTM</li>
                        <li>If you use RTM, you match the winning bid and the player comes to your team instead</li>
                        <li>The buying team can then make a counter-offer to try to keep the player</li>
                        <li>If they counter, you can either match the counter or let them have the player</li>
                        <li>Each RTM card can only be used once</li>
                    </ol>
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 12,
                        padding: 16,
                        marginTop: 16
                    }}>
                        <p style={{ color: '#f87171', margin: 0 }}>
                            ⚠️ <strong>Important:</strong> Use RTM strategically! Once used, you can't get the RTM card back.
                        </p>
                    </div>
                </section>

                {/* Section 8 - Communication */}
                <section id="communication" style={{ marginBottom: 48 }}>
                    <h2 style={{ fontSize: 28, marginBottom: 16, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span>8️⃣</span> Communication Features
                    </h2>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db', marginBottom: 16 }}>
                        Effective communication is key to coordinating with friends or negotiating strategies. We provide two real-time ways to stay connected:
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: 20, borderRadius: 12, border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                            <h3 style={{ fontSize: 20, color: '#60a5fa', marginBottom: 12 }}>🎙️ Voice Chat</h3>
                            <p style={{ color: '#d1d5db', fontSize: 14, lineHeight: 1.6 }}>
                                Real-time voice communication is built-in!
                                <br /><br />
                                • Click "Join Voice" to hop in.<br />
                                • See who's talking with visual indicators.<br />
                                • Auto-reconnects if connection drops.<br />
                                • "Weak Connection" warning helps you troubleshoot.
                            </p>
                        </div>
                        <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: 20, borderRadius: 12, border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                            <h3 style={{ fontSize: 20, color: '#c084fc', marginBottom: 12 }}>💬 Text Chat</h3>
                            <p style={{ color: '#d1d5db', fontSize: 14, lineHeight: 1.6 }}>
                                A dedicated text channel for the room.
                                <br /><br />
                                • Floating chat button for easy access.<br />
                                • Send messages to all participants.<br />
                                • Unread message badges ensuring you never miss a text.<br />
                                • Perfect fallback if voice isn't an option.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section 9 - Auto-Fill */}
                <section id="autofill" style={{ marginBottom: 48 }}>
                    <h2 style={{ fontSize: 28, marginBottom: 16, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span>9️⃣</span> Auto-Fill System
                    </h2>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db', marginBottom: 16 }}>
                        Don't worry if the auction ends early or you miss filling your squad! Our intelligent Auto-Fill system takes over to ensure fair play:
                    </p>
                    <ul style={{ paddingLeft: 24, lineHeight: 2, color: '#d1d5db' }}>
                        <li><strong>Minimum Squad Size:</strong> Ensures every team reaches at least 18 players.</li>
                        <li><strong>Balanced Roles:</strong> Intelligently picks Wicketkeepers, Batsmen, Bowlers, and All-rounders to balance your team.</li>
                        <li><strong>Smart Spending:</strong>
                            <ul style={{ paddingLeft: 20, marginTop: 4, color: '#9ca3af' }}>
                                <li>Rich teams (&gt;10 Cr/slot) will bid aggressively to secure top talent.</li>
                                <li>Budget teams will spend wisely effectively utilizing their purse.</li>
                                <li>Prices are rounded to standard ₹0.25 Cr increments.</li>
                            </ul>
                        </li>
                    </ul>
                </section>

                {/* Section 10 */}
                <section id="tips" style={{ marginBottom: 48 }}>
                    <h2 style={{ fontSize: 28, marginBottom: 16, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span>🔟</span> Pro Tips & Strategies
                    </h2>
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: 16,
                        padding: 24
                    }}>
                        <h3 style={{ color: '#60a5fa', marginBottom: 16 }}>🏆 Expert Tips:</h3>
                        <ul style={{ paddingLeft: 24, lineHeight: 2.5, color: '#d1d5db' }}>
                            <li>💡 Use the "Skip AI Bidding" button when you want AI to show their max bid instantly</li>
                            <li>💡 Watch your opponents' budgets - if they're running low, you can get players cheaper</li>
                            <li>💡 Don't ignore later sets - sometimes the best value picks come at the end</li>
                            <li>💡 Keep at least ₹15-20 Cr in reserve for auto-fill in case auction ends early</li>
                            <li>💡 Study the player pool before the auction - know which sets have your target players</li>
                            <li>💡 If a player goes unsold, they may come back in accelerated bidding - be ready!</li>
                            <li>💡 Form alliances with other teams to drive up prices for opponents' target players</li>
                            <li>💡 Remember: Max 25 players per squad, minimum 18 for valid squad</li>
                        </ul>
                    </div>
                </section>

                {/* CTA */}
                <section style={{
                    background: 'rgba(52, 211, 153, 0.1)',
                    padding: 32,
                    borderRadius: 16,
                    border: '1px solid rgba(52, 211, 153, 0.3)',
                    textAlign: 'center'
                }}>
                    <h2 style={{ fontSize: 24, marginBottom: 16, color: '#34d399' }}>Ready to Test Your Skills?</h2>
                    <p style={{ color: '#9ca3af', marginBottom: 24 }}>
                        Now that you know the rules, it's time to build your championship-winning squad!
                    </p>
                    <a href="/" style={{
                        display: 'inline-block',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: '#fff',
                        padding: '14px 32px',
                        borderRadius: 12,
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        fontSize: 16
                    }}>
                        🏏 Start Your Auction
                    </a>
                </section>
            </main>

            {/* Footer */}
            <footer style={{
                borderTop: '1px solid rgba(255,255,255,0.1)',
                padding: '40px 24px',
                textAlign: 'center',
                color: '#6b7280'
            }}>
                <div style={{ marginBottom: 16 }}>
                    <a href="/about" style={{ color: '#9ca3af', margin: '0 12px', textDecoration: 'none' }}>About</a>
                    <a href="/how-to-play" style={{ color: '#9ca3af', margin: '0 12px', textDecoration: 'none' }}>How to Play</a>
                    <a href="/privacy" style={{ color: '#9ca3af', margin: '0 12px', textDecoration: 'none' }}>Privacy Policy</a>
                    <a href="/terms" style={{ color: '#9ca3af', margin: '0 12px', textDecoration: 'none' }}>Terms of Service</a>
                    <a href="/contact" style={{ color: '#9ca3af', margin: '0 12px', textDecoration: 'none' }}>Contact</a>
                </div>
                <p>© 2026 IPL Mock Auction. Created by Surendhar. All rights reserved.</p>
            </footer>
        </div>
    );
}
