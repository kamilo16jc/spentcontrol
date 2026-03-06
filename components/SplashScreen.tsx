'use client'

import { useEffect, useState } from 'react'

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'show' | 'fadeout'>('show')

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase('fadeout'), 2200)
    const timer2 = setTimeout(() => onDone(), 2900)
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [onDone])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #ff6b35 0%, #ff8c5a 60%, #ffb347 100%)',
        opacity: phase === 'fadeout' ? 0 : 1,
        transition: 'opacity 0.7s ease-in-out',
      }}
    >
      {/* Circles decoration */}
      <div style={{
        position: 'absolute', top: '-80px', right: '-80px',
        width: '300px', height: '300px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)',
      }} />
      <div style={{
        position: 'absolute', bottom: '-60px', left: '-60px',
        width: '220px', height: '220px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)',
      }} />

      {/* Logo */}
      <div
        style={{
          animation: 'splashPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        {/* Icon */}
        <div style={{
          width: '96px',
          height: '96px',
          borderRadius: '28px',
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          border: '1.5px solid rgba(255,255,255,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>
          <span style={{ fontSize: '52px', animation: 'coinSpin 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>💰</span>
        </div>

        {/* App name */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: '900',
            letterSpacing: '-0.5px',
            margin: 0,
          }}>
            <span style={{ color: 'white' }}>Spent</span>
            <span style={{ color: '#1a1a2e' }}>Control</span>
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.65)',
            fontSize: '15px',
            marginTop: '6px',
            fontWeight: '400',
          }}>
            Tu dinero, bajo control
          </p>
        </div>

        {/* Loading dots */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.8)',
                animation: `splashDot 1.2s ${i * 0.2}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes splashPop {
          0% { opacity: 0; transform: scale(0.8) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes splashDot {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes coinSpin {
          0% { opacity: 0; transform: scale(0.5) rotate(-20deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
      `}</style>
    </div>
  )
}
