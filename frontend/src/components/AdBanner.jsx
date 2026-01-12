import React, { useEffect } from 'react';

const AdBanner = ({ slotId, format = 'auto', style = {} }) => {
    useEffect(() => {
        try {
            if (window.adsbygoogle) {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch (e) {
            // Ignore known AdSense re-render "error" which is actually harmless
            if (e.message && e.message.includes("All 'ins' elements in the DOM with class=adsbygoogle already have ads")) {
                return;
            }
            console.error("AdSense Error:", e);
        }
    }, []);

    // Development Placeholder (Mock Ad)
    // Use Vite's native environment variable
    if (import.meta.env.DEV) {
        return (
            <div style={{
                background: '#1f2937', // Dark gray
                color: '#9ca3af',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 'bold',
                border: '1px dashed #4b5563',
                ...style
            }}>
                AD SPACE ({format})
            </div>
        );
    }

    return (
        <div style={{ overflow: 'hidden', ...style }}>
            <ins className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Placeholder Client ID
                data-ad-slot={slotId}
                data-ad-format={format}
                data-full-width-responsive="true"></ins>
        </div>
    );
};

export default AdBanner;
