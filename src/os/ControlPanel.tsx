import React, { useState } from 'react';
import { Icon } from './icons';
import type { OsView } from './screens';
import { usePWAInstall, WEBAPP_ICON_URL } from './usePWAInstall';

interface Row {
  id: string;
  icon: 'settings' | 'task' | 'cube' | 'music' | 'lock';
  title: string;
  desc: string;
  action?: OsView | 'lock';
}

const ROWS: Row[] = [
  { id: 'setting', icon: 'settings', title: 'Setting', desc: 'System preferences' },
  { id: 'task', icon: 'task', title: 'Task', desc: 'Task console' },
  { id: 'optA', icon: 'cube', title: 'Option A', desc: '3D Character Lab', action: 'lab' },
  { id: 'optB', icon: 'cube', title: 'Option B', desc: 'Module slot B' },
];

export function ControlPanel({
  onClose,
  onNav,
  onLock,
  musicOn,
  onToggleMusic,
  musicLabel,
}: {
  onClose: () => void;
  onNav: (v: OsView) => void;
  onLock: () => void;
  musicOn: boolean;
  onToggleMusic: () => void;
  musicLabel: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const { isInstallable, isInstalled, install } = usePWAInstall();

  const handleRow = (row: Row) => {
    setSelected(row.id);
    if (row.action === 'lab') {
      onNav('lab');
      onClose();
    } else if (row.action === 'lock') {
      onLock();
    }
  };

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="side-sheet" role="dialog" aria-label="Control Panel">
        <div className="sheet-head">
          <div className="sheet-head-brand">
            <img
              src={WEBAPP_ICON_URL}
              alt="Shittim Chest OS Icon"
              className="sheet-webapp-icon"
              referrerPolicy="no-referrer"
              onError={(e) => {
                if (!e.currentTarget.src.endsWith('/icon-180.png')) {
                  e.currentTarget.src = '/icon-180.png';
                }
              }}
            />
            <div>
              <div className="kicker">SYSTEM MENU</div>
              <h2>Control Panel</h2>
            </div>
          </div>
          <button className="sheet-close" onClick={onClose} aria-label="Close">
            <span>✕</span>
          </button>
        </div>

        <div className="sheet-rows">
          {ROWS.map((row) => (
            <button
              key={row.id}
              className={`sheet-row ${selected === row.id ? 'active' : ''}`}
              onClick={() => handleRow(row)}
            >
              <span className="hex"><Icon name={row.icon} size={20} /></span>
              <span className="meta">
                <span className="t">{row.title}</span><br />
                <span className="d">{row.desc}</span>
              </span>
              <span className="chev">›</span>
            </button>
          ))}

          {!isInstalled && isInstallable && (
            <button className="sheet-row accent" onClick={install}>
              <span className="hex"><Icon name="cube" size={20} /></span>
              <span className="meta">
                <span className="t">Install WebApp</span><br />
                <span className="d">Pasang Shittim Chest OS ke perangkat</span>
              </span>
              <span className="pill on">INSTALL</span>
            </button>
          )}

          {/* Now Playing / music toggle */}
          <button className="sheet-row accent" onClick={onToggleMusic}>
            <span className="hex"><Icon name="music" size={20} /></span>
            <span className="meta">
              <span className="t">{musicLabel}</span><br />
              <span className="d">Connected Sky</span>
            </span>
            <span className={`pill ${musicOn ? 'on' : ''}`}>{musicOn ? 'ON' : 'MUTED'}</span>
          </button>

          {/* Lock Screen */}
          <button
            className="sheet-row lock-row"
            onClick={() => handleRow({ id: 'lock', icon: 'lock', title: '', desc: '', action: 'lock' })}
          >
            <span className="hex"><Icon name="lock" size={20} /></span>
            <span className="meta">
              <span className="t">Lock Screen</span><br />
              <span className="d">Kembali ke access gate</span>
            </span>
            <span className="chev">›</span>
          </button>

          {selected && (
            <div className="module-strip">MODULE SELECTED: {selected.toUpperCase()}</div>
          )}
        </div>
      </div>
    </>
  );
}
