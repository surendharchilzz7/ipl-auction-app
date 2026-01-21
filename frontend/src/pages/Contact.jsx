import React, { useState } from 'react';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real app, you'd send this to a backend
        console.log('Contact form submitted:', formData);
        setSubmitted(true);
    };

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
                    <a href="/contact" style={{ color: '#60a5fa', textDecoration: 'none' }}>Contact</a>
                </nav>
            </header>

            {/* Main Content */}
            <main style={{ maxWidth: 900, margin: '0 auto', padding: '60px 24px' }}>
                <h1 style={{ fontSize: 48, marginBottom: 24, color: '#ec4899' }}>Contact Us</h1>

                <p style={{ fontSize: 18, lineHeight: 1.8, color: '#d1d5db', marginBottom: 40 }}>
                    Have questions, feedback, or suggestions? We'd love to hear from you! Fill out the form below and we'll get back to you as soon as possible.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40 }}>
                    {/* Contact Form */}
                    <div>
                        {submitted ? (
                            <div style={{
                                background: 'rgba(52, 211, 153, 0.1)',
                                border: '1px solid rgba(52, 211, 153, 0.3)',
                                borderRadius: 16,
                                padding: 40,
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: 60, marginBottom: 16 }}>✅</div>
                                <h2 style={{ color: '#34d399', marginBottom: 12 }}>Thank You!</h2>
                                <p style={{ color: '#d1d5db' }}>
                                    Your message has been received. We'll get back to you soon.
                                </p>
                                <button
                                    onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }); }}
                                    style={{
                                        marginTop: 24,
                                        background: 'rgba(255,255,255,0.1)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        color: '#fff',
                                        padding: '12px 24px',
                                        borderRadius: 8,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Send Another Message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} style={{
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: 16,
                                padding: 32,
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <div style={{ marginBottom: 20 }}>
                                    <label style={{ display: 'block', color: '#9ca3af', marginBottom: 8, fontSize: 14 }}>
                                        Your Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            background: 'rgba(0,0,0,0.3)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: 8,
                                            color: '#fff',
                                            fontSize: 16
                                        }}
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div style={{ marginBottom: 20 }}>
                                    <label style={{ display: 'block', color: '#9ca3af', marginBottom: 8, fontSize: 14 }}>
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            background: 'rgba(0,0,0,0.3)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: 8,
                                            color: '#fff',
                                            fontSize: 16
                                        }}
                                        placeholder="john@example.com"
                                    />
                                </div>

                                <div style={{ marginBottom: 20 }}>
                                    <label style={{ display: 'block', color: '#9ca3af', marginBottom: 8, fontSize: 14 }}>
                                        Subject *
                                    </label>
                                    <select
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            background: 'rgba(0,0,0,0.3)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: 8,
                                            color: '#fff',
                                            fontSize: 16
                                        }}
                                    >
                                        <option value="">Select a subject</option>
                                        <option value="general">General Inquiry</option>
                                        <option value="bug">Bug Report</option>
                                        <option value="feature">Feature Request</option>
                                        <option value="feedback">Feedback</option>
                                        <option value="partnership">Partnership / Business</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div style={{ marginBottom: 24 }}>
                                    <label style={{ display: 'block', color: '#9ca3af', marginBottom: 8, fontSize: 14 }}>
                                        Message *
                                    </label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={5}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            background: 'rgba(0,0,0,0.3)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: 8,
                                            color: '#fff',
                                            fontSize: 16,
                                            resize: 'vertical'
                                        }}
                                        placeholder="Tell us what's on your mind..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    style={{
                                        width: '100%',
                                        padding: '14px 24px',
                                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                        border: 'none',
                                        borderRadius: 10,
                                        color: '#fff',
                                        fontSize: 16,
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                >
                                    📧 Send Message
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Contact Info */}
                    <div>
                        <div style={{
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            borderRadius: 16,
                            padding: 32,
                            marginBottom: 24
                        }}>
                            <h3 style={{ color: '#60a5fa', marginBottom: 16 }}>📍 About the Platform</h3>
                            <p style={{ color: '#d1d5db', lineHeight: 1.8 }}>
                                IPL Mock Auction is a fan-made project created by Surendhar. It's designed to bring the excitement of IPL auctions to cricket fans worldwide.
                            </p>
                        </div>

                        <div style={{
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: 16,
                            padding: 32,
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <h3 style={{ color: '#fff', marginBottom: 20 }}>🔗 Quick Links</h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                <li style={{ marginBottom: 16 }}>
                                    <a href="/how-to-play" style={{ color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span>📖</span> How to Play Guide
                                    </a>
                                </li>
                                <li style={{ marginBottom: 16 }}>
                                    <a href="/about" style={{ color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span>ℹ️</span> About Us
                                    </a>
                                </li>
                                <li style={{ marginBottom: 16 }}>
                                    <a href="/privacy" style={{ color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span>🔒</span> Privacy Policy
                                    </a>
                                </li>
                                <li>
                                    <a href="/terms" style={{ color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span>📜</span> Terms of Service
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div style={{
                            background: 'rgba(251, 191, 36, 0.1)',
                            border: '1px solid rgba(251, 191, 36, 0.3)',
                            borderRadius: 16,
                            padding: 24,
                            marginTop: 24,
                            textAlign: 'center'
                        }}>
                            <h4 style={{ color: '#fbbf24', marginBottom: 8 }}>⏱️ Response Time</h4>
                            <p style={{ color: '#d1d5db', fontSize: 14, margin: 0 }}>
                                We typically respond within 24-48 hours.
                            </p>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <section style={{ marginTop: 60 }}>
                    <h2 style={{ fontSize: 28, marginBottom: 24, color: '#34d399' }}>❓ Frequently Asked Questions</h2>

                    <div style={{ display: 'grid', gap: 16 }}>
                        {[
                            { q: 'Is IPL Mock Auction free to use?', a: 'Yes! IPL Mock Auction is completely free to play. We are supported by advertisements.' },
                            { q: 'Can I play on my mobile phone?', a: 'Yes, our platform is fully responsive and works on all devices including smartphones and tablets.' },
                            { q: 'How many players can join a room?', a: 'Up to 10 players can join a room, each controlling one IPL franchise. Empty slots can be filled with AI teams.' },
                            { q: 'Is this affiliated with the official IPL?', a: 'No, this is an independent fan-made project. We are not affiliated with BCCI, IPL, or any official cricket organization.' },
                            { q: 'I found a bug. How do I report it?', a: 'Use the contact form above and select "Bug Report" as the subject. Please provide as much detail as possible.' }
                        ].map((faq, idx) => (
                            <div key={idx} style={{
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: 12,
                                padding: 20,
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <h4 style={{ color: '#fff', marginBottom: 8 }}>{faq.q}</h4>
                                <p style={{ color: '#9ca3af', margin: 0, fontSize: 14 }}>{faq.a}</p>
                            </div>
                        ))}
                    </div>
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
                <p>© 2024 IPL Mock Auction. Created by Surendhar. All rights reserved.</p>
            </footer>
        </div>
    );
}
