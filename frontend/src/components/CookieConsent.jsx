import { useState, useEffect } from 'react';

/**
 * GDPR-compliant Cookie Consent Banner
 * Required for Google AdSense approval.
 * Shows once, then persists user's choice in localStorage.
 */
export default function CookieConsent() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Show banner only if user hasn't made a choice yet
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            // Small delay so it doesn't flash on page load
            const timer = setTimeout(() => setVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        setVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookieConsent', 'declined');
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 99999,
            animation: 'slideUp 0.4s ease-out'
        }}>
            <div style={{
                maxWidth: 900,
                margin: '0 auto',
                padding: '16px 24px',
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98))',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderTop: '1px solid rgba(96, 165, 250, 0.3)',
                borderLeft: '1px solid rgba(255,255,255,0.05)',
                borderRight: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '16px 16px 0 0',
                fontFamily: '"Outfit", system-ui, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                flexWrap: 'wrap',
                boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.4)'
            }}>
                <div style={{ flex: 1, minWidth: 250 }}>
                    <p style={{
                        color: '#e2e8f0',
                        fontSize: 13,
                        lineHeight: 1.6,
                        margin: 0
                    }}>
                        🍪 We use cookies to improve your experience and display relevant ads via Google AdSense.
                        By continuing, you agree to our{' '}
                        <a href="/privacy" style={{ color: '#60a5fa', textDecoration: 'underline' }}>Privacy Policy</a>.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                    <button
                        onClick={handleDecline}
                        style={{
                            padding: '8px 20px',
                            background: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: 8,
                            color: '#9ca3af',
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Decline
                    </button>
                    <button
                        onClick={handleAccept}
                        style={{
                            padding: '8px 24px',
                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            border: 'none',
                            borderRadius: 8,
                            color: '#fff',
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 2px 12px rgba(59, 130, 246, 0.4)',
                            transition: 'all 0.2s'
                        }}
                    >
                        Accept All
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(100%); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
