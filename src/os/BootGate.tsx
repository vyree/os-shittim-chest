import React, { useState } from 'react';
import { GateTriangles } from './parts';

export function BootGate({
  onOpen,
  onUnlock,
}: {
  onOpen: () => void;
  onUnlock?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const handleTap = async () => {
    if (loading || leaving) return;
    onUnlock?.();
    setLoading(true);

    // Show soft-blue bottom loading animation first, then fade out and open the gate
    setTimeout(() => {
      setLeaving(true);
    }, 1050);
    setTimeout(() => {
      onOpen();
    }, 1650);

    try { await document.documentElement.requestFullscreen(); } catch {}
    try { await (screen.orientation as unknown as { lock: (m: string) => Promise<void> }).lock('landscape'); } catch {}
  };

  return (
    <div
      className={`welcome-gate${leaving ? ' leaving' : ''}`}
      onClick={handleTap}
      role="button"
      aria-label="Tap untuk membuka"
    >
      {/* Gate wallpaper */}
      <div className="gate-bg" />

      {/* Triangles covering image triangles with slight movement */}
      <GateTriangles />

      {/* Top-to-bottom scanning animation every 4-5s */}
      <div className="gate-scan" aria-hidden="true" />

      {/* Full-screen glitch animation every 4-5s (offset timing from scan) */}
      <div className="gate-screen-glitch" aria-hidden="true" />

      {/* Soft blue loading animation at bottom of screen when clicked */}
      {loading && (
        <div className="gate-loading-bottom" aria-live="polite">
          <div className="gate-loading-label">CONNECTING // SHITTIM CHEST OS</div>
          <div className="gate-loading-track">
            <div className="gate-loading-bar" />
          </div>
        </div>
      )}
    </div>
  );
}
