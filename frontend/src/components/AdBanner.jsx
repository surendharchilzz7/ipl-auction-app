import React, { useEffect } from 'react';

const AdBanner = ({ slotId, format = 'auto', style = {} }) => {
    useEffect(() => {
        // Small delay to ensure layout (sidebar width) is calculated before requesting ad
        const timer = setTimeout(() => {
            try {
                if (window.adsbygoogle) {
                    (window.adsbygoogle = window.adsbygoogle || []).push({});
                }
            } catch (e) {
                // Ignore known AdSense re-render "error"
                if (e.message && e.message.includes("elements in the DOM")) {
                    return;
                }
                console.error("AdSense Error:", e);
            }
        }, 300); // 300ms delay to fix "availableWidth=0" error

        return () => clearTimeout(timer);
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
                style={{ display: 'block', width: '100%', height: '100%' }}
                data-ad-client="ca-pub-2633612438011552"
                data-ad-slot={slotId}
                data-ad-format={format}
                data-full-width-responsive="false"></ins>
        </div>
    );
};

export default AdBanner;
