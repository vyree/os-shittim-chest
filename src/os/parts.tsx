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
      {/* Stylized angular "S" built from facets */}
      <g fill="#ffffff">
        <path d="M18 8 H86 L104 26 V44 L46 26 Z" />
        <path d="M18 8 L34 26 V70 L18 52 Z" />
        <path d="M34 70 H96 L112 88 V106 L50 88 Z" />
        <path d="M96 88 L112 106 V150 L96 132 Z" />
        <path d="M32 132 H96 L112 150 L94 170 H26 L10 152 Z" />
        <path d="M10 96 L26 114 V70 L10 52 Z" opacity="0.92" />
      </g>
      <g fill="#bfe9ff" opacity="0.85">
        <path d="M46 26 L104 26 L96 34 L46 34 Z" />
        <path d="M50 88 L112 88 L104 96 L50 96 Z" />
      </g>
    </svg>
  );
}

/** 12 drifting triangles for the gate background. */
export function GateTriangles() {
  const tris = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 12; i++) {
      const left = (i * 83 + 13) % 96;
      const top = (i * 47 + 7) % 88;
      const size = 22 + ((i * 29) % 46);
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
