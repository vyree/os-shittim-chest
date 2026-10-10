import React, { useState } from 'react';
import { Icon } from './icons';
import { usePWAInstall, WEBAPP_ICON_URL } from './usePWAInstall';

export type OsView = 'home' | 'features' | 'lab';

export function TopConsole({ onInfo }: { onInfo: () => void }) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  return (
    <div className="top-console">
      <div className="brand-ribbon">
        <img
          src={WEBAPP_ICON_URL}
          alt="Arona OS Icon"
          className="brand-webapp-icon"
          referrerPolicy="no-referrer"
        />
        <span className="notch" />
        <span>ARONA <span className="slash">//</span> OS SHITTIM CHEST</span>
      </div>

      <div className="top-console-actions">
        {!isInstalled && isInstallable && (
          <button className="install-webapp-btn" onClick={install} title="Install Arona OS">
            <span>INSTALL APP</span>
          </button>
        )}
        {!isInstalled && !isInstallable && isIOS && (
          <button
            className="install-webapp-btn"
            onClick={() => setShowIOSGuide(true)}
            title="Install on iOS"
          >
            <span>INSTALL iOS</span>
          </button>
        )}
        <button className="icon-btn" onClick={onInfo} aria-label="Info">
          <Icon name="info" />
        </button>
      </div>

      {showIOSGuide && (
        <div className="ios-guide-modal" onClick={() => setShowIOSGuide(false)}>
          <div className="ios-guide-card" onClick={(e) => e.stopPropagation()}>
            <img
              src={WEBAPP_ICON_URL}
              alt="Arona OS Icon"
              className="ios-guide-icon"
              referrerPolicy="no-referrer"
            />
            <h3>Install Arona OS</h3>
            <p>
              1. Tap tombol <strong>Share</strong> di bar Safari.<br />
              2. Pilih <strong>Add to Home Screen</strong> untuk memasang Arona OS.
            </p>
            <button className="install-webapp-btn" onClick={() => setShowIOSGuide(false)}>
              <span>TUTUP</span>
            </button>
          </div>
        </div>
      )}
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

      <div className="home-webapp-badge">
        <img
          src={WEBAPP_ICON_URL}
          alt="Arona OS WebApp Icon"
          className="home-webapp-img"
          referrerPolicy="no-referrer"
        />
        <div className="home-webapp-meta">
          <div className="kicker">ARONA OS // SYSTEM CORE</div>
          <div className="home-webapp-title">Arona OS</div>
          <div className="home-webapp-sub">Arona - OS Shittim Chest</div>
        </div>
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
