import React from 'react';

export default function Privacy() {
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
                    <a href="/privacy" style={{ color: '#60a5fa', textDecoration: 'none' }}>Privacy</a>
                    <a href="/contact" style={{ color: '#9ca3af', textDecoration: 'none' }}>Contact</a>
                </nav>
            </header>

            {/* Main Content */}
            <main style={{ maxWidth: 900, margin: '0 auto', padding: '60px 24px' }}>
                <h1 style={{ fontSize: 48, marginBottom: 16, color: '#60a5fa' }}>Privacy Policy</h1>
                <p style={{ color: '#9ca3af', marginBottom: 40 }}>Last updated: January 2026</p>

                <section style={{ marginBottom: 40 }}>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db' }}>
                        Welcome to IPL Mock Auction. We are committed to protecting your privacy and ensuring transparency about how we collect, use, and protect your information. This Privacy Policy explains our practices regarding data collection and usage.
                    </p>
                </section>

                <section style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: 24, marginBottom: 16, color: '#34d399' }}>1. Information We Collect</h2>
                    <h3 style={{ fontSize: 18, color: '#fff', marginBottom: 12 }}>1.1 Information You Provide</h3>
                    <ul style={{ paddingLeft: 24, lineHeight: 2, color: '#d1d5db' }}>
                        <li><strong style={{ color: '#fff' }}>Username:</strong> When you create or join a room, you provide a display name</li>
                        <li><strong style={{ color: '#fff' }}>Google Account Info:</strong> If you sign in with Google, we receive your name, email, and profile picture</li>
                        <li><strong style={{ color: '#fff' }}>Contact Information:</strong> If you contact us, we collect the information you provide in your message</li>
                    </ul>

                    <h3 style={{ fontSize: 18, color: '#fff', marginBottom: 12, marginTop: 24 }}>1.2 Information Collected Automatically</h3>
                    <ul style={{ paddingLeft: 24, lineHeight: 2, color: '#d1d5db' }}>
                        <li><strong style={{ color: '#fff' }}>Session Data:</strong> Room codes and session identifiers stored locally in your browser</li>
                        <li><strong style={{ color: '#fff' }}>Usage Data:</strong> How you interact with our platform (pages visited, features used)</li>
                        <li><strong style={{ color: '#fff' }}>Device Information:</strong> Browser type, operating system, and device identifiers</li>
                        <li><strong style={{ color: '#fff' }}>Cookies:</strong> Essential cookies for session management and optional analytics cookies</li>
                    </ul>
                    <h3 style={{ fontSize: 18, color: '#fff', marginBottom: 12, marginTop: 24 }}>1.3 Voice & Chat Data</h3>
                    <ul style={{ paddingLeft: 24, lineHeight: 2, color: '#d1d5db' }}>
                        <li><strong style={{ color: '#fff' }}>Voice Data:</strong> Audio transmitted during voice chat is ephemeral and peer-to-peer (via WebRTC). We do not record or store your voice conversations on our servers.</li>
                        <li><strong style={{ color: '#fff' }}>Chat Messages:</strong> Text messages are transmitted in real-time. We do not permanently log or store chat history after the room is closed.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: 24, marginBottom: 16, color: '#34d399' }}>2. How We Use Your Information</h2>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db', marginBottom: 16 }}>
                        We use the collected information for the following purposes:
                    </p>
                    <ul style={{ paddingLeft: 24, lineHeight: 2, color: '#d1d5db' }}>
                        <li>To provide and maintain our auction simulation service</li>
                        <li>To enable multiplayer functionality and real-time communication</li>
                        <li>To identify you in auction rooms and display your team selection to other players</li>
                        <li>To save your session so you can rejoin rooms if disconnected</li>
                        <li>To improve our platform based on usage patterns</li>
                        <li>To display relevant advertisements through Google AdSense</li>
                        <li>To respond to your inquiries and provide customer support</li>
                    </ul>
                </section>

                <section style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: 24, marginBottom: 16, color: '#34d399' }}>3. Third-Party Services</h2>
                    <h3 style={{ fontSize: 18, color: '#fff', marginBottom: 12 }}>3.1 Google Services</h3>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db', marginBottom: 16 }}>
                        We use the following Google services:
                    </p>
                    <ul style={{ paddingLeft: 24, lineHeight: 2, color: '#d1d5db' }}>
                        <li><strong style={{ color: '#fff' }}>Google Sign-In:</strong> For optional account authentication</li>
                        <li><strong style={{ color: '#fff' }}>Google AdSense:</strong> To display advertisements and support the platform</li>
                    </ul>
                    <p style={{ fontSize: 14, color: '#9ca3af', marginTop: 16 }}>
                        Please review Google's Privacy Policy at <a href="https://policies.google.com/privacy" style={{ color: '#60a5fa' }}>https://policies.google.com/privacy</a>
                    </p>

                    <h3 style={{ fontSize: 18, color: '#fff', marginBottom: 12, marginTop: 24 }}>3.2 Advertising</h3>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db' }}>
                        We use Google AdSense to display ads. AdSense may use cookies to display personalized ads based on your browsing history. You can opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" style={{ color: '#60a5fa' }}>Google Ads Settings</a>.
                    </p>
                </section>

                <section style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: 24, marginBottom: 16, color: '#34d399' }}>4. Data Storage & Security</h2>
                    <ul style={{ paddingLeft: 24, lineHeight: 2, color: '#d1d5db' }}>
                        <li>Session data is stored locally in your browser (localStorage and sessionStorage)</li>
                        <li>Room data is stored temporarily on our servers during active games only</li>
                        <li>We do not permanently store auction game data after rooms are closed</li>
                        <li>We implement industry-standard security measures to protect your data</li>
                        <li>Data transmission is encrypted using HTTPS/SSL protocols</li>
                    </ul>
                </section>

                <section style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: 24, marginBottom: 16, color: '#34d399' }}>5. Cookies</h2>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db', marginBottom: 16 }}>
                        We use the following types of cookies:
                    </p>
                    <ul style={{ paddingLeft: 24, lineHeight: 2, color: '#d1d5db' }}>
                        <li><strong style={{ color: '#fff' }}>Essential Cookies:</strong> Required for basic platform functionality</li>
                        <li><strong style={{ color: '#fff' }}>Advertising Cookies:</strong> Used by Google AdSense to serve relevant ads</li>
                    </ul>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db', marginTop: 16 }}>
                        You can control cookie preferences through your browser settings. Disabling cookies may affect some platform features.
                    </p>
                </section>

                <section style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: 24, marginBottom: 16, color: '#34d399' }}>6. Your Rights</h2>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db', marginBottom: 16 }}>
                        You have the following rights regarding your personal data:
                    </p>
                    <ul style={{ paddingLeft: 24, lineHeight: 2, color: '#d1d5db' }}>
                        <li><strong style={{ color: '#fff' }}>Access:</strong> Request a copy of your personal data</li>
                        <li><strong style={{ color: '#fff' }}>Deletion:</strong> Request deletion of your personal data</li>
                        <li><strong style={{ color: '#fff' }}>Correction:</strong> Request correction of inaccurate data</li>
                        <li><strong style={{ color: '#fff' }}>Opt-out:</strong> Opt out of personalized advertising</li>
                    </ul>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db', marginTop: 16 }}>
                        To exercise these rights, please contact us at the email address provided in the Contact section.
                    </p>
                </section>

                <section style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: 24, marginBottom: 16, color: '#34d399' }}>7. Children's Privacy</h2>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db' }}>
                        Our service is not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
                    </p>
                </section>

                <section style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: 24, marginBottom: 16, color: '#34d399' }}>8. Changes to This Policy</h2>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db' }}>
                        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                    </p>
                </section>

                <section style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: 16,
                    padding: 24
                }}>
                    <h2 style={{ fontSize: 24, marginBottom: 16, color: '#60a5fa' }}>9. Contact Us</h2>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: '#d1d5db' }}>
                        If you have any questions about this Privacy Policy or our data practices, please contact us:
                    </p>
                    <ul style={{ paddingLeft: 24, lineHeight: 2, color: '#d1d5db', marginTop: 16 }}>
                        <li><strong style={{ color: '#fff' }}>Website:</strong> <a href="/contact" style={{ color: '#60a5fa' }}>Contact Form</a></li>
                        <li><strong style={{ color: '#fff' }}>Platform:</strong> IPL Mock Auction (mockauction.in)</li>
                    </ul>
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
