import React, { useMemo } from 'react';

/** Tablet bezel frame — wraps every screen. */
export function TabletFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <div className="shittim-device">
        <div className="device-speaker" />
        <div className="device-home" />
        <div className="device-screen">{children}</div>
      </div>
    </div>
  );
}

/** The glowing Arona "S" logo as inline SVG (glitch handled by CSS). */
export function AronaSLogo({ glitch = true }: { glitch?: boolean }) {
  return (
    <svg
      className={`gate-logo${glitch ? ' glitching' : ''}`}
      viewBox="0 0 129 178"
      fill="none"
      aria-label="Arona S logo"
    >
      {/* Stylized faceted "S" matching the reference */}
      <g fill="#ffffff">
        {/* Top bar */}
        <path d="M28 12 H88 L106 28 L92 42 H28 Z" />
        <path d="M28 12 L42 28 V42 H28 Z" opacity="0.95" />
        {/* Top-right facet */}
        <path d="M88 12 L106 28 V44 L92 42 Z" fill="#e8f6ff" />
        {/* Upper diagonal */}
        <path d="M42 42 H92 L78 68 H42 Z" />
        <path d="M42 42 L56 68 V84 L42 68 Z" opacity="0.9" />
        {/* Middle bar */}
        <path d="M42 68 H92 L106 84 L92 100 H42 Z" />
        <path d="M92 68 L106 84 V100 L92 100 Z" fill="#e8f6ff" />
        {/* Lower diagonal */}
        <path d="M56 100 H92 L78 126 H56 Z" />
        <path d="M56 100 L70 126 V142 L56 126 Z" opacity="0.9" />
        {/* Bottom bar */}
        <path d="M28 126 H78 L96 142 L82 158 H28 Z" />
        <path d="M28 126 L42 142 V158 H28 Z" opacity="0.95" />
        <path d="M78 126 L96 142 V158 L82 158 Z" fill="#e8f6ff" />
      </g>
      {/* Cyan edge highlights */}
      <g stroke="#4de3ff" strokeWidth="2.5" opacity="0.9" fill="none">
        <path d="M92 42 L106 28" />
        <path d="M92 100 L106 84" />
        <path d="M42 68 L56 84" />
      </g>
    </svg>
  );
}

/** Small drifting triangles overlay for the gate. */
export function GateTriangles() {
  const tris = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 12; i++) {
      const left = (i * 83 + 13) % 96;
      const top = (i * 47 + 7) % 88;
      const size = 16 + ((i * 13) % 20);
      const delay = -(1 + ((i * 1.7) % 7));
      const dur = 6.4 + ((i * 0.9) % 4.1);
      arr.push({ left, top, size, delay, dur, key: i });
    }
    return arr;
  }, []);
  return (
    <div className="gate-triangles">
      {tris.map((t) => (
        <div
          key={t.key}
          className="gate-tri"
          style={{
            left: `${t.left}%`,
            top: `${t.top}%`,
            borderLeftWidth: t.size / 2,
            borderRightWidth: t.size / 2,
            borderBottomWidth: t.size * 0.86,
            animationDelay: `${t.delay}s`,
            animationDuration: `${t.dur}s`,
          }}
        />
      ))}
    </div>
  );
}
