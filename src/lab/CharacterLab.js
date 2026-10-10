import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef, useState, useCallback } from 'react';
import { BaViewer } from '../ba-viewer';
/** Base URL for streaming models via jsDelivr CDN */
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/lihaohong6/BlueArchiveModels@main';
const MODELS_JSON_URL = `${CDN_BASE}/models.json`;
/** Fallback to raw GitHub if jsDelivr fails */
const GH_RAW_BASE = 'https://raw.githubusercontent.com/lihaohong6/BlueArchiveModels/main';
/** Local fallback characters (bundled in public/) if streaming fails */
const LOCAL_FALLBACK = [
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
function parseFilename(filename) {
    const base = filename.replace(/\.glb$/i, '');
    const match = base.match(/^([^(]+?)\s*(?:\((.+)\))?$/);
    if (!match)
        return { name: base, variant: 'Base', display: base };
    const name = match[1].trim();
    const variant = match[2]?.trim() || 'Base';
    // Clean up nested parens: "Arisu (Battle) (Carrier)" -> variant "Battle Carrier"
    const cleanVariant = variant.replace(/\)\s*\(/g, ' ');
    const display = variant === 'Base' ? name : `${name} (${cleanVariant})`;
    return { name, variant: cleanVariant, display };
}
/** Build BaCharacterDef from filename, preserving known special configs */
function buildDef(filename, id) {
    const { display } = parseFilename(filename);
    const url = `${CDN_BASE}/${encodeURIComponent(filename)}`;
    // Preserve special configs for known characters
    const special = {
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
export default function CharacterLab({ onBack }) {
    const viewportRef = useRef(null);
    const viewerRef = useRef(null);
    const wrapRef = useRef(null);
    const [characters, setCharacters] = useState([]);
    const [charId, setCharId] = useState('');
    const [loadingChars, setLoadingChars] = useState(true);
    const [charError, setCharError] = useState(null);
    const [loadingModel, setLoadingModel] = useState(false);
    const [clips, setClips] = useState([]);
    const [clipName, setClipName] = useState('');
    const [mode, setMode] = useState('WALK');
    const [playing, setPlaying] = useState(true);
    const [loop, setLoop] = useState(true);
    const [speed, setSpeed] = useState(100);
    const [zoom, setZoom] = useState(100);
    const [pos, setPos] = useState(0); // 0..1000
    const [stats, setStats] = useState({ time: 0, duration: 0, fps: 0, playing: true });
    const scrubbing = useRef(false);
    // Fetch character list from CDN on mount
    useEffect(() => {
        let cancelled = false;
        async function fetchCharacters() {
            try {
                const res = await fetch(MODELS_JSON_URL);
                if (!res.ok)
                    throw new Error(`HTTP ${res.status}`);
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
            }
            catch (e) {
                console.warn('[CharacterLab] Failed to fetch models.json, using local fallback:', e);
                if (!cancelled) {
                    setCharacters(LOCAL_FALLBACK);
                    setCharError('Gagal load daftar online, pakai model lokal.');
                    setCharId(LOCAL_FALLBACK[0].id);
                }
            }
            finally {
                if (!cancelled)
                    setLoadingChars(false);
            }
        }
        fetchCharacters();
        return () => { cancelled = true; };
    }, []);
    // Create viewer once
    useEffect(() => {
        if (!viewportRef.current || viewerRef.current)
            return;
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
    const loadChar = useCallback(async (id) => {
        const v = viewerRef.current;
        if (!v)
            return;
        const def = characters.find((c) => c.id === id);
        if (!def)
            return;
        setLoadingModel(true);
        try {
            const infos = await v.loadCharacter(def);
            setClips(infos);
            if (infos.length > 0) {
                setClipName(infos[0].name);
                v.playClip(infos[0].name);
            }
            else {
                setClipName('');
            }
        }
        catch (e) {
            console.error('[CharacterLab] Failed to load model:', def.name, e);
            setCharError(`Gagal load ${def.name}. Coba karakter lain.`);
        }
        finally {
            setLoadingModel(false);
        }
        setMode('WALK');
        v.setOrbitEnabled(false);
    }, [characters]);
    // Load character when list is ready and charId is set
    useEffect(() => {
        if (loadingChars || !charId || !viewerRef.current)
            return;
        const t = setTimeout(() => loadChar(charId), 100);
        return () => clearTimeout(t);
    }, [loadingChars, charId, loadChar]);
    const onCharChange = (id) => {
        setCharId(id);
        // loadChar will be triggered by the effect above
    };
    const onClipChange = (name) => {
        setClipName(name);
        viewerRef.current?.playClip(name);
    };
    const setWalk = () => {
        setMode('WALK');
        viewerRef.current?.setOrbitEnabled(false);
        if (clips.length > 0)
            onClipChange(clips[0].name);
    };
    const setRotate = () => {
        setMode('ROTATE');
        viewerRef.current?.setOrbitEnabled(true);
    };
    const togglePlay = () => {
        const v = viewerRef.current;
        if (!v)
            return;
        v.setPlaying(!playing);
    };
    const onSeek = (val) => {
        scrubbing.current = true;
        setPos(val);
        viewerRef.current?.seek01(val / 1000);
    };
    const onSeekEnd = () => {
        scrubbing.current = false;
    };
    const onSpeed = (val) => {
        setSpeed(val);
        viewerRef.current?.setSpeed(val);
    };
    const onZoom = (val) => {
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
        if (!el)
            return;
        if (document.fullscreenElement)
            document.exitFullscreen();
        else
            el.requestFullscreen?.();
    };
    const rangeFill = (val, min, max) => ({ '--fill': `${((val - min) / (max - min)) * 100}%` });
    const charDef = characters.find((c) => c.id === charId);
    return (_jsxs("div", { className: "lab-root", ref: wrapRef, children: [_jsxs("div", { className: "topbar", children: [_jsx("div", { className: "badge", children: _jsxs("span", { children: [playing ? 'PLAYING' : 'PAUSED', " \u00B7 ", stats.fps, " FPS"] }) }), _jsx("button", { className: `btn ${mode === 'WALK' ? 'active' : ''}`, onClick: setWalk, children: _jsx("span", { children: "WALK" }) }), _jsx("button", { className: `btn ${mode === 'ROTATE' ? 'active' : ''}`, onClick: setRotate, children: _jsx("span", { children: "ROTATE" }) }), _jsx("div", { className: "spacer" }), _jsx("div", { className: "char-name", children: _jsx("span", { children: charDef?.name || (loadingChars ? 'Loading...' : 'No character') }) }), _jsx("button", { className: "btn", onClick: onResetView, children: _jsx("span", { children: "\u27F3 Reset View" }) }), _jsx("button", { className: "btn", onClick: onBack, children: _jsx("span", { children: "\u2039 Back" }) })] }), _jsxs("div", { className: "main", children: [_jsxs("div", { className: "side-panel", children: [_jsxs("div", { children: [_jsxs("div", { className: "field-label", children: ["CHARACTER ", characters.length > 0 && `(${characters.length})`] }), loadingChars ? (_jsx("div", { className: "hint", children: "Loading character list..." })) : (_jsx("select", { value: charId, onChange: (e) => onCharChange(e.target.value), children: characters.map((c) => (_jsx("option", { value: c.id, children: c.name }, c.id))) })), charError && _jsx("div", { className: "hint", style: { color: '#f0a' }, children: charError })] }), _jsxs("div", { children: [_jsx("div", { className: "field-label", children: "ANIMATION" }), _jsx("select", { value: clipName, onChange: (e) => onClipChange(e.target.value), children: clips.map((c) => (_jsxs("option", { value: c.name, children: [c.name, " \u00B7 ", c.duration.toFixed(2), "s"] }, c.name))) })] }), _jsx("div", { children: _jsx("div", { className: "clip-buttons", children: clips.map((c) => (_jsx("button", { className: `clip-btn ${c.name === clipName ? 'active' : ''}`, onClick: () => onClipChange(c.name), children: _jsx("span", { children: c.name }) }, c.name))) }) }), _jsxs("div", { className: "hint", children: [_jsx("b", { children: "WALK" }), " \u2014 play the character's animation.", _jsx("br", {}), _jsx("b", { children: "ROTATE" }), " \u2014 drag to orbit manually.", _jsx("br", {}), "No auto-rotate. Character animations only."] })] }), _jsxs("div", { className: "viewport-wrap", children: [_jsx("div", { ref: viewportRef, style: { width: '100%', height: '100%' } }), loadingModel && (_jsx("div", { style: {
                                    position: 'absolute', inset: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: 'rgba(6,11,20,0.7)', color: '#7fb8e8',
                                    fontSize: 14, letterSpacing: '0.1em', zIndex: 5,
                                }, children: "\u23F3 Loading model..." })), mode === 'ROTATE' && (_jsxs("div", { className: "orbit-arrows", children: [_jsx("button", { className: "btn", onClick: () => viewerRef.current?.nudgeAzimuth(-1), children: _jsx("span", { children: "\u2039" }) }), _jsx("button", { className: "btn", onClick: () => viewerRef.current?.nudgeAzimuth(1), children: _jsx("span", { children: "\u203A" }) })] }))] })] }), _jsxs("div", { className: "controlbar", children: [_jsxs("div", { className: "control-row", children: [_jsx("button", { className: "btn", onClick: togglePlay, children: _jsx("span", { children: playing ? '⏸ Pause' : '▶ Play' }) }), _jsx("span", { className: "lbl", children: "POSITION" }), _jsx("input", { type: "range", min: 0, max: 1000, value: pos, className: "range-grow", style: rangeFill(pos, 0, 1000), onChange: (e) => onSeek(Number(e.target.value)), onPointerUp: onSeekEnd, onKeyUp: onSeekEnd }), _jsxs("span", { className: "time-readout", children: [stats.time.toFixed(2), " / ", stats.duration.toFixed(2), " s"] }), _jsx("button", { className: `btn ${loop ? 'active' : ''}`, onClick: onLoop, children: _jsx("span", { children: "\uD83D\uDD01 Loop" }) })] }), _jsxs("div", { className: "control-row", children: [_jsx("span", { className: "lbl", children: "SPEED" }), _jsx("input", { type: "range", min: 0, max: 200, value: speed, className: "range-sm", style: rangeFill(speed, 0, 200), onChange: (e) => onSpeed(Number(e.target.value)) }), _jsxs("span", { className: "pct", children: [speed, "%"] }), _jsx("span", { className: "lbl", children: "ZOOM" }), _jsx("input", { type: "range", min: 75, max: 140, value: zoom, className: "range-sm", style: rangeFill(zoom, 75, 140), onChange: (e) => onZoom(Number(e.target.value)) }), _jsxs("span", { className: "pct", children: [zoom, "%"] }), _jsx("div", { className: "spacer" }), _jsx("button", { className: "btn", onClick: onFullscreen, children: _jsx("span", { children: "\u26F6 Fullscreen" }) })] })] })] }));
}
