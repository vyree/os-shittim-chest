import React, { useState } from 'react';
import { GateTriangles } from './parts';

export function BootGate({ onOpen }: { onOpen: () => void }) {
  const [leaving, setLeaving] = useState(false);

  const handleTap = () => {
    if (leaving) return;
    setLeaving(true);
    // match gate-leave animation (.72s + .18s delay)
    setTimeout(onOpen, 880);
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
      {/* Glitch overlay on S logo area */}
      <div className="gate-s-glitch" />
    </div>
  );
}
