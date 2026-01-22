import React from 'react';

export default function About() {
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
                    <a href="/about" style={{ color: '#60a5fa', textDecoration: 'none' }}>About</a>
                    <a href="/how-to-play" style={{ color: '#9ca3af', textDecoration: 'none' }}>How to Play</a>
                    <a href="/privacy" style={{ color: '#9ca3af', textDecoration: 'none' }}>Privacy</a>
                    <a href="/contact" style={{ color: '#9ca3af', textDecoration: 'none' }}>Contact</a>
                </nav>
            </header>

            {/* Main Content */}
            <main style={{ maxWidth: 900, margin: '0 auto', padding: '60px 24px' }}>
                <h1 style={{ fontSize: 48, marginBottom: 24, color: '#60a5fa' }}>About IPL Mock Auction</h1>

                <section style={{ marginBottom: 40 }}>
                    <p style={{ fontSize: 18, lineHeight: 1.8, color: '#d1d5db', marginBottom: 24 }}>
                        Welcome to <strong style={{ color: '#fff' }}>IPL Mock Auction</strong> – the ultimate fantasy cricket auction simulator that brings the thrill of the Indian Premier League auction to your fingertips!
                    </p>

                    <p style={{ fontSize: 18, lineHeight: 1.8, color: '#d1d5db', marginBottom: 24 }}>
                        Whether you're a cricket enthusiast, a fantasy sports lover, or just looking for a fun multiplayer experience with friends, our platform lets you experience the high-stakes excitement of building your dream IPL team through live auctions.
                    </p>
                </section>

                <section style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: 28, marginBottom: 16, color: '#34d399' }}>🎯 Our Mission</h2>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db' }}>
                        We created IPL Mock Auction to give cricket fans a realistic simulation of the actual IPL auction experience. Our goal is to provide an engaging, educational, and entertaining platform where fans can:
                    </p>
                    <ul style={{ fontSize: 16, lineHeight: 2, color: '#d1d5db', paddingLeft: 24, marginTop: 16 }}>
                        <li>Experience the pressure of building a balanced squad within budget constraints</li>
                        <li>Understand player valuations and auction strategies</li>
                        <li>Compete with friends in real-time multiplayer auctions</li>
                        <li>Learn about IPL rules including Right to Match (RTM) and retention policies</li>
                        <li>Have fun while testing your cricketing knowledge and strategic thinking</li>
                    </ul>
                </section>

                <section style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: 28, marginBottom: 16, color: '#f59e0b' }}>⚡ Key Features</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
                        {[
                            { emoji: '🎮', title: 'Real-Time Multiplayer', desc: 'Play with up to 10 friends in live auction rooms' },
                            { emoji: '🤖', title: 'AI Teams', desc: 'Fill empty slots with intelligent AI bidders' },
                            { emoji: '📊', title: '600+ Players', desc: 'Complete player database with realistic base prices' },
                            { emoji: '🔄', title: 'RTM System', desc: 'Authentic Right to Match mechanics' },
                            { emoji: '💰', title: 'Budget Management', desc: 'Configurable team budgets (120-200 Cr)' },
                            { emoji: '📱', title: 'Mobile Friendly', desc: 'Play anywhere on any device' }
                        ].map((feature, idx) => (
                            <div key={idx} style={{
                                background: 'rgba(255,255,255,0.05)',
                                padding: 20,
                                borderRadius: 12,
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <div style={{ fontSize: 32, marginBottom: 8 }}>{feature.emoji}</div>
                                <h3 style={{ color: '#fff', marginBottom: 8 }}>{feature.title}</h3>
                                <p style={{ color: '#9ca3af', fontSize: 14 }}>{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: 28, marginBottom: 16, color: '#ec4899' }}>👨‍💻 About the Creator</h2>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db' }}>
                        IPL Mock Auction was created by <strong style={{ color: '#fff' }}>Surendhar</strong>, a passionate cricket fan and software developer. The platform was built using modern web technologies including React, Node.js, and Socket.io to deliver a seamless real-time experience.
                    </p>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db', marginTop: 16 }}>
                        This project is a labor of love, designed to bring the excitement of IPL auctions to fans worldwide. We're constantly working on improvements and new features based on user feedback.
                    </p>
                </section>

                <section style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    padding: 32,
                    borderRadius: 16,
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    textAlign: 'center'
                }}>
                    <h2 style={{ fontSize: 24, marginBottom: 16, color: '#60a5fa' }}>Ready to Start Your Auction?</h2>
                    <p style={{ color: '#9ca3af', marginBottom: 24 }}>
                        Create a room, invite your friends, and experience the thrill of building your dream IPL team!
                    </p>
                    <a href="/" style={{
                        display: 'inline-block',
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        color: '#fff',
                        padding: '14px 32px',
                        borderRadius: 12,
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        fontSize: 16
                    }}>
                        🚀 Start Playing Now
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
                <p style={{ fontSize: 12, marginTop: 8 }}>
                    Disclaimer: This is a fan-made simulation. Not affiliated with IPL, BCCI, or any official cricket organization.
                </p>
            </footer>
        </div>
    );
}
