import { useEffect, useRef, useState, useCallback } from 'react';
import { BaViewer, BaCharacterDef, BaClipInfo, BaStats } from '../ba-viewer';

/** Base URL for streaming models via jsDelivr CDN */
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/lihaohong6/BlueArchiveModels@main';
const MODELS_JSON_URL = `${CDN_BASE}/models.json`;
/** Fallback to raw GitHub if jsDelivr fails */
const GH_RAW_BASE = 'https://raw.githubusercontent.com/lihaohong6/BlueArchiveModels/main';

/** Local fallback characters (bundled in public/) if streaming fails */
const LOCAL_FALLBACK: BaCharacterDef[] = [
  {
    id: 'airi',
    name: 'Kurimura Airi (Band) [Local]',
    url: '/airi_band.glb',
    clips: ['Cafe_Walk', 'Normal_Idle', 'Cafe_Reaction'],
    facingCorrections: { 'Normal_Idle': Math.PI / 2 },
    hiddenMeshes: ['CH0251_Instrument_Mesh', 'CH0251_Prop_Mesh'],
  },
  {
    id: 'miku',
    name: 'Hatsune Miku [Local]',
    url: '/miku_fixed.glb',
    clips: ['Cafe_Walk', 'Cafe_Idle', 'Cafe_Reaction'],
  },
  {
    id: 'arisu',
    name: 'Arisu — Battle Carrier [Local]',
    url: '/arisu_carrier_fixed.glb',
    clips: ['Walk', 'Idle'],
  },
];

/** Parse "Airi (Band).glb" -> { name: "Airi", variant: "Band" } */
function parseFilename(filename: string): { name: string; variant: string; display: string } {
  const base = filename.replace(/\.glb$/i, '');
  const match = base.match(/^([^(]+?)\s*(?:\((.+)\))?$/);
  if (!match) return { name: base, variant: 'Base', display: base };
  const name = match[1].trim();
  const variant = match[2]?.trim() || 'Base';
  // Clean up nested parens: "Arisu (Battle) (Carrier)" -> variant "Battle Carrier"
  const cleanVariant = variant.replace(/\)\s*\(/g, ' ');
  const display = variant === 'Base' ? name : `${name} (${cleanVariant})`;
  return { name, variant: cleanVariant, display };
}

/** Build BaCharacterDef from filename, preserving known special configs */
function buildDef(filename: string, id: string): BaCharacterDef {
  const { display } = parseFilename(filename);
  const url = `${CDN_BASE}/${encodeURIComponent(filename)}`;
  
  // Preserve special configs for known characters
  const special: Record<string, Partial<BaCharacterDef>> = {
    'Airi (Band).glb': {
      clips: ['Cafe_Walk', 'Normal_Idle', 'Cafe_Reaction'],
      facingCorrections: { 'Normal_Idle': Math.PI / 2 },
      hiddenMeshes: ['CH0251_Instrument_Mesh', 'CH0251_Prop_Mesh'],
    },
  };
  
  const spec = special[filename] || {};
  return {
    id,
    name: display,
    url,
    clips: spec.clips || [],
    loadAllClips: !spec.clips,
    facingCorrections: spec.facingCorrections,
    hiddenMeshes: spec.hiddenMeshes,
  };
}

export default function CharacterLab({ onBack }: { onBack: () => void }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<BaViewer | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const [characters, setCharacters] = useState<BaCharacterDef[]>([]);
  const [charId, setCharId] = useState('');
  const [loadingChars, setLoadingChars] = useState(true);
  const [charError, setCharError] = useState<string | null>(null);
  const [loadingModel, setLoadingModel] = useState(false);
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

  // Fetch character list from CDN on mount
  useEffect(() => {
    let cancelled = false;
    async function fetchCharacters() {
      try {
        const res = await fetch(MODELS_JSON_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const filenames = Object.keys(data).filter((f) => f.toLowerCase().endsWith('.glb'));
        // Sort alphabetically by display name
        filenames.sort((a, b) => {
          const da = parseFilename(a).display;
          const db = parseFilename(b).display;
          return da.localeCompare(db);
        });
        const defs = filenames.map((fn, idx) => buildDef(fn, `stream_${idx}`));
        if (!cancelled) {
          setCharacters(defs);
          setCharError(null);
          // Auto-select first character
          if (defs.length > 0) {
            setCharId(defs[0].id);
          }
        }
      } catch (e) {
        console.warn('[CharacterLab] Failed to fetch models.json, using local fallback:', e);
        if (!cancelled) {
          setCharacters(LOCAL_FALLBACK);
          setCharError('Gagal load daftar online, pakai model lokal.');
          setCharId(LOCAL_FALLBACK[0].id);
        }
      } finally {
        if (!cancelled) setLoadingChars(false);
      }
    }
    fetchCharacters();
    return () => { cancelled = true; };
  }, []);

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
    const def = characters.find((c) => c.id === id);
    if (!def) return;
    setLoadingModel(true);
    try {
      const infos = await v.loadCharacter(def);
      const uniqueInfos = infos.filter(
        (c, idx, arr) => arr.findIndex((x) => x.name === c.name) === idx
      );
      setClips(uniqueInfos);
      if (uniqueInfos.length > 0) {
        setClipName(uniqueInfos[0].name);
        v.playClip(uniqueInfos[0].name);
      } else {
        setClipName('');
      }
    } catch (e) {
      console.error('[CharacterLab] Failed to load model:', def.name, e);
      setCharError(`Gagal load ${def.name}. Coba karakter lain.`);
    } finally {
      setLoadingModel(false);
    }
    setMode('WALK');
    v.setOrbitEnabled(false);
  }, [characters]);

  // Load character when list is ready and charId is set
  useEffect(() => {
    if (loadingChars || !charId || !viewerRef.current) return;
    const t = setTimeout(() => loadChar(charId), 100);
    return () => clearTimeout(t);
  }, [loadingChars, charId, loadChar]);

  const onCharChange = (id: string) => {
    setCharId(id);
    // loadChar will be triggered by the effect above
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

  const charDef = characters.find((c) => c.id === charId);

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
        <div className="char-name"><span>{charDef?.name || (loadingChars ? 'Loading...' : 'No character')}</span></div>
        <button className="btn" onClick={onResetView}><span>⟳ Reset View</span></button>
        <button className="btn" onClick={onBack}><span>‹ Back</span></button>
      </div>

      <div className="main">
        {/* side panel */}
        <div className="side-panel">
          <div>
            <div className="field-label">CHARACTER {characters.length > 0 && `(${characters.length})`}</div>
            {loadingChars ? (
              <div className="hint">Loading character list...</div>
            ) : (
              <select value={charId} onChange={(e) => onCharChange(e.target.value)}>
                {characters.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
            {charError && <div className="hint" style={{ color: '#f0a' }}>{charError}</div>}
          </div>
          <div>
            <div className="field-label">ANIMATION</div>
            <select value={clipName} onChange={(e) => onClipChange(e.target.value)}>
              {clips.map((c, idx) => (
                <option key={`${c.name}-${idx}`} value={c.name}>
                  {c.name} · {c.duration.toFixed(2)}s
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="clip-buttons">
              {clips.map((c, idx) => (
                <button
                  key={`${c.name}-${idx}`}
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
          {loadingModel && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(6,11,20,0.7)', color: '#7fb8e8',
              fontSize: 14, letterSpacing: '0.1em', zIndex: 5,
            }}>
              ⏳ Loading model...
            </div>
          )}
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
