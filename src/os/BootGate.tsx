import React, { useState } from 'react';
import { GateTriangles, GateSGlitchOverlay } from './parts';

export function BootGate({
  onOpen,
  onUnlock,
}: {
  onOpen: () => void;
  onUnlock?: () => void;
}) {
  const [leaving, setLeaving] = useState(false);

  const handleTap = async () => {
    if (leaving) return;
    onUnlock?.();
    setLeaving(true);
    // match gate-leave animation (.72s + .18s delay)
    setTimeout(onOpen, 880);
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
      {/* Reference image pasted exactly */}
      <div className="gate-bg" />

      {/* Overlay animations */}
      <GateTriangles />
      <div className="gate-scan" />

      {/* SVG "S" RGB-split glitch overlay positioned directly over the S logo */}
      <GateSGlitchOverlay />
    </div>
  );
}
