import React from 'react';

export default function Terms() {
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
                    <a href="/how-to-play" style={{ color: '#9ca3af', textDecoration: 'none' }}>How to Play</a>
                    <a href="/privacy" style={{ color: '#9ca3af', textDecoration: 'none' }}>Privacy</a>
                    <a href="/contact" style={{ color: '#9ca3af', textDecoration: 'none' }}>Contact</a>
                </nav>
            </header>

            {/* Main Content */}
            <main style={{ maxWidth: 900, margin: '0 auto', padding: '60px 24px' }}>
                <h1 style={{ fontSize: 48, marginBottom: 16, color: '#f59e0b' }}>Terms of Service</h1>
                <p style={{ color: '#9ca3af', marginBottom: 40 }}>Last updated: January 2026</p>

                <section style={{ marginBottom: 40 }}>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db' }}>
                        Welcome to IPL Mock Auction. By accessing or using our website and services, you agree to be bound by these Terms of Service. Please read them carefully before using our platform.
                    </p>
                </section>

                <section style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: 24, marginBottom: 16, color: '#34d399' }}>1. Acceptance of Terms</h2>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db' }}>
                        By accessing and using IPL Mock Auction, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
                    </p>
                </section>

                <section style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: 24, marginBottom: 16, color: '#34d399' }}>2. Description of Service</h2>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db', marginBottom: 16 }}>
                        IPL Mock Auction is a free online simulation platform that allows users to:
                    </p>
                    <ul style={{ paddingLeft: 24, lineHeight: 2, color: '#d1d5db' }}>
                        <li>Create and participate in simulated IPL player auctions</li>
                        <li>Compete with friends or AI-controlled teams in real-time</li>
                        <li>Experience the excitement of building a fantasy cricket team</li>
                        <li>Learn about IPL auction mechanics and player valuations</li>
                    </ul>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db', marginTop: 16 }}>
                        This is a fan-made simulation for entertainment and educational purposes only.
                    </p>
                </section>

                <section style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: 24, marginBottom: 16, color: '#34d399' }}>3. User Conduct</h2>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db', marginBottom: 16 }}>
                        You agree to use our service responsibly and not to:
                    </p>
                    <ul style={{ paddingLeft: 24, lineHeight: 2, color: '#d1d5db' }}>
                        <li>Use offensive, abusive, or inappropriate usernames</li>
                        <li>Harass, threaten, or harm other users</li>
                        <li>Attempt to hack, exploit, or disrupt the service</li>
                        <li>Use bots or automated systems to gain unfair advantages</li>
                        <li>Violate any applicable laws or regulations</li>
                        <li>Impersonate other individuals or entities</li>
                        <li>Collect or store personal data about other users</li>
                    </ul>

                    <h3 style={{ fontSize: 18, color: '#fff', marginBottom: 12, marginTop: 24 }}>3.1 Communication Conduct</h3>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db' }}>
                        When using Voice or Text Chat, you must not hate speech, harassment, or sharing inappropriate content. We reserve the right to ban users who violate these communication guidelines.
                    </p>
                </section>

                <section style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: 24, marginBottom: 16, color: '#34d399' }}>4. Intellectual Property</h2>
                    <h3 style={{ fontSize: 18, color: '#fff', marginBottom: 12 }}>4.1 Our Content</h3>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db', marginBottom: 16 }}>
                        The website design, code, graphics, and original content are the property of IPL Mock Auction and are protected by intellectual property laws.
                    </p>

                    <h3 style={{ fontSize: 18, color: '#fff', marginBottom: 12 }}>4.2 Third-Party Content</h3>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db' }}>
                        Player names, team names, and logos are the property of their respective owners (BCCI, IPL, and individual franchises). This is an unofficial fan project and is not affiliated with, endorsed by, or connected to the IPL, BCCI, or any cricket organization.
                    </p>
                </section>

                <section style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: 24, marginBottom: 16, color: '#34d399' }}>5. Disclaimer</h2>
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 12,
                        padding: 20
                    }}>
                        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db', margin: 0 }}>
                            <strong style={{ color: '#f87171' }}>IMPORTANT:</strong> IPL Mock Auction is provided "as is" without warranties of any kind. We do not guarantee that the service will be uninterrupted, error-free, or secure. We are not responsible for any losses, damages, or issues arising from your use of the service.
                        </p>
                    </div>
                </section>

                <section style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: 24, marginBottom: 16, color: '#34d399' }}>6. No Gambling or Real Money</h2>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db' }}>
                        IPL Mock Auction is a free simulation game. No real money is involved in any aspect of the game. Any references to "budget," "crores," or "money" are purely fictional game mechanics. We do not encourage, facilitate, or support gambling in any form.
                    </p>
                </section>

                <section style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: 24, marginBottom: 16, color: '#34d399' }}>7. Third-Party Links and Advertisements</h2>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db' }}>
                        Our service may display advertisements through Google AdSense and may contain links to third-party websites. We are not responsible for the content, accuracy, or practices of any third-party websites. Your interaction with any third-party content is at your own risk.
                    </p>
                </section>

                <section style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: 24, marginBottom: 16, color: '#34d399' }}>8. Limitation of Liability</h2>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db' }}>
                        To the maximum extent permitted by law, IPL Mock Auction and its creator shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service.
                    </p>
                </section>

                <section style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: 24, marginBottom: 16, color: '#34d399' }}>9. Termination</h2>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db' }}>
                        We reserve the right to terminate or suspend access to our service immediately, without prior notice, for any reason whatsoever, including breach of these Terms. Upon termination, your right to use the service will immediately cease.
                    </p>
                </section>

                <section style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: 24, marginBottom: 16, color: '#34d399' }}>10. Changes to Terms</h2>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db' }}>
                        We reserve the right to modify these Terms at any time. We will notify users of any material changes by updating the "Last updated" date. Your continued use of the service after such modifications constitutes acceptance of the new Terms.
                    </p>
                </section>

                <section style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: 24, marginBottom: 16, color: '#34d399' }}>11. Governing Law</h2>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db' }}>
                        These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts in India.
                    </p>
                </section>

                <section style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: 16,
                    padding: 24
                }}>
                    <h2 style={{ fontSize: 24, marginBottom: 16, color: '#60a5fa' }}>12. Contact Information</h2>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db' }}>
                        If you have any questions about these Terms of Service, please contact us through our <a href="/contact" style={{ color: '#60a5fa' }}>Contact page</a>.
                    </p>
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
