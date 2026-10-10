import React from 'react';
import { Icon } from './icons';

export type OsView = 'home' | 'features' | 'lab';

export function TopConsole({ onInfo }: { onInfo: () => void }) {
  return (
    <div className="top-console">
      <div className="brand-ribbon">
        <span className="notch" />
        <span>SHITTIM CHEST <span className="slash">//</span> OS</span>
      </div>
      <button className="icon-btn" onClick={onInfo} aria-label="Info">
        <Icon name="info" />
      </button>
    </div>
  );
}

export function BottomDock({ view, onNav }: { view: OsView; onNav: (v: OsView) => void }) {
  return (
    <div className="bottom-dock">
      <div className="dock-pill">
        <button
          className={`dock-tab ${view === 'home' ? 'active' : ''}`}
          onClick={() => onNav('home')}
        >
          <Icon name="home" size={20} />
          <span>HOME</span>
        </button>
        <button
          className={`dock-tab ${view === 'features' ? 'active' : ''}`}
          onClick={() => onNav('features')}
        >
          <Icon name="grid" size={20} />
          <span>FEATURES</span>
          <span className="soon">SOON</span>
        </button>
      </div>
    </div>
  );
}

export function HomeScreen() {
  return (
    <>
      <div className="page-intro">
        <div className="kicker">DASH / 01</div>
        <h1 className="page-title">Home</h1>
      </div>
      <div className="os-ornament" aria-hidden>
        <div className="ring" />
        <div className="sq" />
        <div className="bar" />
      </div>
    </>
  );
}

export function FeaturesScreen() {
  return (
    <>
      <div className="page-intro">
        <div className="kicker">DASH / 02</div>
        <h1 className="page-title">Feature Bay</h1>
      </div>
      <div className="feature-center">
        <div className="kicker">02</div>
        <div className="hex-tile">
          <Icon name="grid" size={38} />
        </div>
        <h2 className="page-title">Features</h2>
        <p className="feature-desc">Ruang fitur sedang disiapkan untuk fase berikutnya.</p>
        <div className="soon-badge"><span>SEGERA HADIR</span></div>
      </div>
    </>
  );
}
