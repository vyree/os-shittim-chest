import { useEffect, useRef, useState, useCallback } from 'react';
import './os/os.css';
import { TabletFrame } from './os/parts';
import { BootGate } from './os/BootGate';
import { TopConsole, BottomDock, HomeScreen, FeaturesScreen, OsView } from './os/screens';
import { ControlPanel } from './os/ControlPanel';
import { Icon } from './os/icons';
import { createYouTubeBgm, BgmController } from './os/bgm';
import CharacterLab from './lab/CharacterLab';

export default function App() {
  const [gateOpen, setGateOpen] = useState(false);
  const [view, setView] = useState<OsView>('home');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [musicOn, setMusicOn] = useState(true);
  const [musicBlocked, setMusicBlocked] = useState(false);
  const [isPortrait, setIsPortrait] = useState(() =>
    typeof window !== 'undefined' ? window.innerHeight > window.innerWidth : false
  );
  const bgmRef = useRef<BgmController | null>(null);

  // Detect portrait orientation to enforce landscape mode
  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Music engine — YouTube lowest quality autoplay & loop
  useEffect(() => {
    const bgm = createYouTubeBgm((playing) => {
      if (playing) {
        setMusicBlocked(false);
      }
    });
    bgmRef.current = bgm;
    return () => {
      bgm.dispose();
      bgmRef.current = null;
    };
  }, []);

  const ensurePlaying = useCallback(() => {
    const b = bgmRef.current;
    if (!b || !musicOn) return;
    b.play()
      .then(() => {
        setMusicBlocked(false);
      })
      .catch(() => {
        setMusicBlocked(true);
      });
  }, [musicOn]);

  // Unlock autoplay & landscape orientation on user interaction
  useEffect(() => {
    const unlockOnGesture = async () => {
      const b = bgmRef.current;
      if (musicOn && b && b.isPaused()) {
        b.play()
          .then(() => setMusicBlocked(false))
          .catch(() => {});
      }
      try { await document.documentElement.requestFullscreen(); } catch {}
      try { await (screen.orientation as unknown as { lock: (m: string) => Promise<void> }).lock('landscape'); } catch {}
    };
    window.addEventListener('pointerdown', unlockOnGesture, { passive: true });
    window.addEventListener('touchstart', unlockOnGesture, { passive: true });
    window.addEventListener('click', unlockOnGesture, { passive: true });
    window.addEventListener('keydown', unlockOnGesture, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', unlockOnGesture);
      window.removeEventListener('touchstart', unlockOnGesture);
      window.removeEventListener('click', unlockOnGesture);
      window.removeEventListener('keydown', unlockOnGesture);
    };
  }, [musicOn]);

  // Synchronous gesture handler on BootGate tap to unlock audio & landscape immediately
  const handleGateUnlock = async () => {
    ensurePlaying();
    try { await document.documentElement.requestFullscreen(); } catch {}
    try { await (screen.orientation as unknown as { lock: (m: string) => Promise<void> }).lock('landscape'); } catch {}
  };

  const handleGateOpen = () => {
    setGateOpen(true);
    ensurePlaying();
  };

  const toggleMusic = () => {
    const b = bgmRef.current;
    if (!b) return;
    if (musicOn && !b.isPaused()) {
      b.pause();
      setMusicOn(false);
      setMusicBlocked(false);
    } else {
      setMusicOn(true);
      b.play()
        .then(() => setMusicBlocked(false))
        .catch(() => setMusicBlocked(true));
    }
  };

  const handleLock = () => {
    setSheetOpen(false);
    setGateOpen(false);
    setView('home');
  };

  // Escape closes sheet
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSheetOpen(false);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const handleRotateOverlayTap = async () => {
    ensurePlaying();
    try { await document.documentElement.requestFullscreen(); } catch {}
    try { await (screen.orientation as unknown as { lock: (m: string) => Promise<void> }).lock('landscape'); } catch {}
  };

  return (
    <>
      {/* Portrait Orientation Blocker — forces Landscape mode */}
      <div
        className={`portrait-lock-overlay${isPortrait ? ' active' : ''}`}
        role="alert"
        aria-live="assertive"
        onClick={handleRotateOverlayTap}
      >
        <div className="portrait-lock-inner">
          <svg
            className="rotate-phone-icon"
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="18" y="8" width="28" height="48" rx="5" />
            <line x1="29" y1="49" x2="35" y2="49" />
            <path d="M52 24a20 20 0 0 1 0 16" stroke="#36a4f8" />
            <polyline points="55 36 52 41 47 38" stroke="#36a4f8" />
          </svg>
          <div className="portrait-lock-title">ROTATE TO CONTINUE</div>
          <div className="portrait-lock-sub">
            Arona - OS Shittim Chest hanya dapat dibuka dalam posisi Landscape.
          </div>

          <div className="headphones-badge">
            <svg
              className="headphones-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
            </svg>
            <span>BEST EXPERIENCE WITH HEADPHONES</span>
          </div>
        </div>
      </div>

      <TabletFrame>
        {!gateOpen && <BootGate onUnlock={handleGateUnlock} onOpen={handleGateOpen} />}

        {gateOpen && (
          <div className="os-interface">
            <div className="os-wallpaper" />
            <div className="os-grid" />

            {view !== 'lab' && <TopConsole onInfo={() => setSheetOpen(true)} />}

            <div className="main-content" style={view === 'lab' ? { padding: 0, display: 'flex' } : undefined}>
              {view === 'home' && <HomeScreen />}
              {view === 'features' && <FeaturesScreen />}
              {view === 'lab' && (
                <div className="lab-view">
                  <CharacterLab onBack={() => setView('home')} />
                </div>
              )}
            </div>

            {view !== 'lab' && <BottomDock view={view} onNav={setView} />}

            {/* music FAB */}
            <button
              className="music-fab"
              onClick={toggleMusic}
              aria-label={musicOn ? 'Mute music' : 'Play music'}
              title="Connected Sky"
            >
              <Icon name={musicOn && !musicBlocked ? 'volume' : 'volumeOff'} size={22} />
            </button>

            {sheetOpen && (
              <ControlPanel
                onClose={() => setSheetOpen(false)}
                onNav={setView}
                onLock={handleLock}
                musicOn={musicOn && !musicBlocked}
                onToggleMusic={toggleMusic}
                musicLabel={musicBlocked ? 'Tap to Play Music' : 'Now Playing'}
              />
            )}
          </div>
        )}
      </TabletFrame>
    </>
  );
}
