import { useEffect, useRef, useState, useCallback } from 'react';
import { BaViewer, BaCharacterDef, BaClipInfo, BaStats } from '../ba-viewer';

const CHARACTERS: BaCharacterDef[] = [
  {
    id: 'airi',
    name: 'Kurimura Airi',
    url: '/airi_band.glb',
    clips: ['Cafe_Walk', 'Normal_Idle', 'Cafe_Reaction'],
    facingCorrections: { 'Normal_Idle': Math.PI / 2 },
    // Piano + piano bag are not animated in the cafe clips; they'd float at
    // bind pose over her torso, so we remove them (wiki hide-parts equivalent).
    hiddenMeshes: ['CH0251_Instrument_Mesh', 'CH0251_Prop_Mesh'],
  },
  {
    id: 'miku',
    name: 'Hatsune Miku',
    url: '/miku_fixed.glb',
    clips: ['Cafe_Walk', 'Cafe_Idle', 'Cafe_Reaction'],
  },
  {
    id: 'arisu',
    name: 'Arisu — Battle Carrier',
    url: '/arisu_carrier_fixed.glb',
    clips: ['Walk', 'Idle'],
  },
];

export default function CharacterLab({ onBack }: { onBack: () => void }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<BaViewer | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const [charId, setCharId] = useState('airi');
  const [clips, setClips] = useState<BaClipInfo[]>([]);
  const [clipName, setClipName] = useState('');
  const [mode, setMode] = useState<'WALK' | 'ROTATE'>('WALK');
  const [playing, setPlaying] = useState(true);
  const [loop, setLoop] = useState(true);
  const [speed, setSpeed] = useState(100);
  const [zoom, setZoom] = useState(100);
  const [pos, setPos] = useState(0); // 0..1000
  const [stats, setStats] = useState<BaStats>({ time: 0, duration: 0, fps: 0, playing: true });
  const scrubbing = useRef(false);

  // Create viewer once
  useEffect(() => {
    if (!viewportRef.current || viewerRef.current) return;
    const v = new BaViewer(viewportRef.current, (s) => {
      setStats(s);
      if (!scrubbing.current) {
        setPos(s.duration > 0 ? Math.round((s.time / s.duration) * 1000) : 0);
      }
      setPlaying(s.playing);
    });
    viewerRef.current = v;
    return () => {
      v.dispose();
      viewerRef.current = null;
    };
  }, []);

  const loadChar = useCallback(async (id: string) => {
    const v = viewerRef.current;
    if (!v) return;
    const def = CHARACTERS.find((c) => c.id === id)!;
    const infos = await v.loadCharacter(def);
    setClips(infos);
    if (infos.length > 0) {
      setClipName(infos[0].name);
      v.playClip(infos[0].name);
    }
    setMode('WALK');
    v.setOrbitEnabled(false);
  }, []);

  // Load initial character when viewer is ready
  useEffect(() => {
    const t = setTimeout(() => loadChar(charId), 100);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCharChange = (id: string) => {
    setCharId(id);
    loadChar(id);
  };

  const onClipChange = (name: string) => {
    setClipName(name);
    viewerRef.current?.playClip(name);
  };

  const setWalk = () => {
    setMode('WALK');
    viewerRef.current?.setOrbitEnabled(false);
    if (clips.length > 0) onClipChange(clips[0].name);
  };

  const setRotate = () => {
    setMode('ROTATE');
    viewerRef.current?.setOrbitEnabled(true);
  };

  const togglePlay = () => {
    const v = viewerRef.current;
    if (!v) return;
    v.setPlaying(!playing);
  };

  const onSeek = (val: number) => {
    scrubbing.current = true;
    setPos(val);
    viewerRef.current?.seek01(val / 1000);
  };
  const onSeekEnd = () => {
    scrubbing.current = false;
  };

  const onSpeed = (val: number) => {
    setSpeed(val);
    viewerRef.current?.setSpeed(val);
  };

  const onZoom = (val: number) => {
    setZoom(val);
    viewerRef.current?.setZoom(val);
  };

  const onLoop = () => {
    const next = !loop;
    setLoop(next);
    viewerRef.current?.setLoop(next);
  };

  const onResetView = () => {
    setZoom(100);
    viewerRef.current?.resetView();
  };

  const onFullscreen = () => {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  };

  const rangeFill = (val: number, min: number, max: number) =>
    ({ '--fill': `${((val - min) / (max - min)) * 100}%` } as React.CSSProperties);

  const charDef = CHARACTERS.find((c) => c.id === charId)!;

  return (
    <div className="lab-root" ref={wrapRef}>
      {/* top bar */}
      <div className="topbar">
        <div className="badge">
          <span>{playing ? 'PLAYING' : 'PAUSED'} · {stats.fps} FPS</span>
        </div>
        <button className={`btn ${mode === 'WALK' ? 'active' : ''}`} onClick={setWalk}>
          <span>WALK</span>
        </button>
        <button className={`btn ${mode === 'ROTATE' ? 'active' : ''}`} onClick={setRotate}>
          <span>ROTATE</span>
        </button>
        <div className="spacer" />
        <div className="char-name"><span>{charDef.name}</span></div>
        <button className="btn" onClick={onResetView}><span>⟳ Reset View</span></button>
        <button className="btn" onClick={onBack}><span>‹ Back</span></button>
      </div>

      <div className="main">
        {/* side panel */}
        <div className="side-panel">
          <div>
            <div className="field-label">CHARACTER</div>
            <select value={charId} onChange={(e) => onCharChange(e.target.value)}>
              {CHARACTERS.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="field-label">ANIMATION</div>
            <select value={clipName} onChange={(e) => onClipChange(e.target.value)}>
              {clips.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} · {c.duration.toFixed(2)}s
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="clip-buttons">
              {clips.map((c) => (
                <button
                  key={c.name}
                  className={`clip-btn ${c.name === clipName ? 'active' : ''}`}
                  onClick={() => onClipChange(c.name)}
                >
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="hint">
            <b>WALK</b> — play the character's animation.<br />
            <b>ROTATE</b> — drag to orbit manually.<br />
            No auto-rotate. Character animations only.
          </div>
        </div>

        {/* 3D viewport */}
        <div className="viewport-wrap">
          <div ref={viewportRef} style={{ width: '100%', height: '100%' }} />
          {mode === 'ROTATE' && (
            <div className="orbit-arrows">
              <button className="btn" onClick={() => viewerRef.current?.nudgeAzimuth(-1)}>
                <span>‹</span>
              </button>
              <button className="btn" onClick={() => viewerRef.current?.nudgeAzimuth(1)}>
                <span>›</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* bottom controls */}
      <div className="controlbar">
        <div className="control-row">
          <button className="btn" onClick={togglePlay}>
            <span>{playing ? '⏸ Pause' : '▶ Play'}</span>
          </button>
          <span className="lbl">POSITION</span>
          <input
            type="range" min={0} max={1000} value={pos}
            className="range-grow"
            style={rangeFill(pos, 0, 1000)}
            onChange={(e) => onSeek(Number(e.target.value))}
            onPointerUp={onSeekEnd}
            onKeyUp={onSeekEnd}
          />
          <span className="time-readout">
            {stats.time.toFixed(2)} / {stats.duration.toFixed(2)} s
          </span>
          <button className={`btn ${loop ? 'active' : ''}`} onClick={onLoop}>
            <span>🔁 Loop</span>
          </button>
        </div>
        <div className="control-row">
          <span className="lbl">SPEED</span>
          <input
            type="range" min={0} max={200} value={speed}
            className="range-sm"
            style={rangeFill(speed, 0, 200)}
            onChange={(e) => onSpeed(Number(e.target.value))}
          />
          <span className="pct">{speed}%</span>
          <span className="lbl">ZOOM</span>
          <input
            type="range" min={75} max={140} value={zoom}
            className="range-sm"
            style={rangeFill(zoom, 75, 140)}
            onChange={(e) => onZoom(Number(e.target.value))}
          />
          <span className="pct">{zoom}%</span>
          <div className="spacer" />
          <button className="btn" onClick={onFullscreen}><span>⛶ Fullscreen</span></button>
        </div>
      </div>
    </div>
  );
}
