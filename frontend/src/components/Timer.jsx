import { useEffect, useState } from "react";

export default function Timer({ endsAt, duration = 20, style = {} }) {
  const [seconds, setSeconds] = useState(duration);

  useEffect(() => {
    if (!endsAt) {
      setSeconds(duration); // Reset to full duration if waiting
      return;
    }

    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setSeconds(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 100);
    return () => clearInterval(interval);
  }, [endsAt, duration]);

  const isUrgent = seconds <= 5;
  const progress = (seconds / duration) * 100;

  return (
    <div style={{
      background: 'rgba(30, 41, 59, 0.95)',
      borderRadius: 12,
      padding: '8px 16px', // Slightly reduced padding for compactness default
      textAlign: 'center',
      marginBottom: 0,
      border: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12, // Reduced gap
      ...style // Allow overrides
    }}>
      <div style={{ textAlign: 'left' }}>
        <div style={{ color: '#9ca3af', fontSize: 10, textTransform: 'uppercase', marginBottom: 2 }}>
          Time Left
        </div>

        {/* Progress Bar Mini */}
        <div style={{
          width: 80,
          height: 4,
          background: '#374151',
          borderRadius: 2,
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: isUrgent
              ? 'linear-gradient(90deg, #ef4444, #f97316)'
              : 'linear-gradient(90deg, #f59e0b, #fcd34d)',
            transition: 'width 0.1s linear'
          }} />
        </div>
      </div>

      <div style={{
        fontSize: 32,
        fontWeight: 800,
        color: isUrgent ? '#ef4444' : '#fbbf24',
        textShadow: isUrgent ? '0 0 15px rgba(239, 68, 68, 0.5)' : '0 0 15px rgba(251, 191, 36, 0.3)',
        animation: isUrgent ? 'pulse 0.5s infinite' : 'none',
        lineHeight: 1,
        minWidth: 60,
        textAlign: 'right'
      }}>
        {seconds}s
      </div>
    </div>
  );
}
