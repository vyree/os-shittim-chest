import React from 'react';

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

interface GateTriDef {
  left: number;
  top: number;
  dir: 'up' | 'down';
  delay: number;
  dur: number;
  opacity: number;
}

/**
 * Triangles mapped to cover the background triangles on gate-bg.jpg
 * with a slight, gentle floating motion.
 */
const GATE_TRIANGLES: GateTriDef[] = [
  // Upper-left cluster
  { left: 11.2, top: 2.5, dir: 'up', delay: -0.4, dur: 4.8, opacity: 0.24 },
  { left: 18.8, top: 3.2, dir: 'down', delay: -1.7, dur: 5.2, opacity: 0.22 },
  { left: 26.6, top: 3.2, dir: 'down', delay: -2.9, dur: 4.6, opacity: 0.18 },
  { left: 7.4, top: 12.2, dir: 'up', delay: -1.1, dur: 5.4, opacity: 0.22 },
  { left: 15.0, top: 12.2, dir: 'up', delay: -3.3, dur: 5.0, opacity: 0.20 },
  { left: 11.2, top: 21.8, dir: 'down', delay: -2.2, dur: 4.9, opacity: 0.22 },
  { left: 18.8, top: 21.8, dir: 'down', delay: -0.8, dur: 5.5, opacity: 0.22 },
  { left: 34.4, top: 21.8, dir: 'down', delay: -3.7, dur: 4.7, opacity: 0.18 },
  { left: 22.8, top: 31.2, dir: 'up', delay: -1.5, dur: 5.1, opacity: 0.24 },
  { left: 18.8, top: 40.5, dir: 'down', delay: -2.6, dur: 5.3, opacity: 0.22 },

  // Lower-left cluster
  { left: 3.5, top: 49.5, dir: 'up', delay: -0.9, dur: 5.0, opacity: 0.22 },
  { left: 7.4, top: 58.8, dir: 'down', delay: -2.4, dur: 4.8, opacity: 0.20 },
  { left: 18.8, top: 58.8, dir: 'down', delay: -3.8, dur: 5.2, opacity: 0.18 },
  { left: 11.2, top: 68.0, dir: 'up', delay: -1.3, dur: 5.4, opacity: 0.20 },
  { left: 15.0, top: 83.5, dir: 'up', delay: -2.8, dur: 4.9, opacity: 0.22 },
  { left: 26.6, top: 83.5, dir: 'up', delay: -0.6, dur: 5.3, opacity: 0.18 },

  // Upper-right cluster
  { left: 57.6, top: 3.2, dir: 'down', delay: -1.9, dur: 5.0, opacity: 0.18 },
  { left: 61.5, top: 12.2, dir: 'up', delay: -0.7, dur: 4.8, opacity: 0.22 },
  { left: 65.4, top: 21.8, dir: 'down', delay: -3.1, dur: 5.3, opacity: 0.22 },
  { left: 61.5, top: 36.5, dir: 'up', delay: -2.0, dur: 4.9, opacity: 0.22 },
  { left: 73.2, top: 3.2, dir: 'down', delay: -1.2, dur: 5.1, opacity: 0.22 },
  { left: 77.0, top: 12.2, dir: 'up', delay: -2.7, dur: 4.7, opacity: 0.25 },
  { left: 73.2, top: 21.8, dir: 'down', delay: -0.3, dur: 5.4, opacity: 0.20 },
  { left: 69.3, top: 31.2, dir: 'up', delay: -3.5, dur: 5.0, opacity: 0.20 },
  { left: 81.0, top: 21.8, dir: 'down', delay: -1.6, dur: 4.8, opacity: 0.22 },
  { left: 84.8, top: 31.2, dir: 'up', delay: -2.3, dur: 5.2, opacity: 0.26 },
  { left: 88.8, top: 3.2, dir: 'down', delay: -0.9, dur: 5.5, opacity: 0.18 },

  // Lower-right cluster
  { left: 88.8, top: 49.5, dir: 'up', delay: -1.4, dur: 4.9, opacity: 0.22 },
  { left: 77.0, top: 58.8, dir: 'down', delay: -3.0, dur: 5.1, opacity: 0.22 },
  { left: 92.6, top: 58.8, dir: 'down', delay: -0.5, dur: 4.8, opacity: 0.24 },
  { left: 84.8, top: 68.0, dir: 'up', delay: -2.1, dur: 5.3, opacity: 0.20 },
  { left: 92.6, top: 74.5, dir: 'up', delay: -3.4, dur: 5.0, opacity: 0.26 },
  { left: 88.8, top: 83.5, dir: 'down', delay: -1.8, dur: 4.7, opacity: 0.22 },
];

export function GateTriangles() {
  return (
    <div className="gate-triangles" aria-hidden="true">
      {GATE_TRIANGLES.map((t, idx) => (
        <div
          key={idx}
          className={`gate-tri gate-tri-${t.dir}`}
          style={{
            left: `${t.left}%`,
            top: `${t.top}%`,
            opacity: t.opacity,
            animationDelay: `${t.delay}s`,
            animationDuration: `${t.dur}s`,
          }}
        />
      ))}
    </div>
  );
}
