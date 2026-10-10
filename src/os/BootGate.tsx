import React, { useState } from 'react';
import { AronaSLogo, GateTriangles } from './parts';

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
      <div className="gate-bg" />
      <GateTriangles />
      <div className="gate-grid" />
      <div className="gate-floor" />
      <div className="gate-scan" />

      <div className="gate-content">
        <div className="gate-ver">ver. アロナ</div>
        <AronaSLogo />
        <div className="gate-motto">WE THIRST FOR KNOWLEDGE</div>
        <button className="gate-prompt">
          <span>• TAP UNTUK MEMBUKA •</span>
        </button>
        <div className="gate-caption">SHITTIM CHEST // ACCESS GATE</div>
      </div>
    </div>
  );
}
