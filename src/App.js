import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState, useCallback } from 'react';
import './os/os.css';
import { TabletFrame } from './os/parts';
import { BootGate } from './os/BootGate';
import { TopConsole, BottomDock, HomeScreen, FeaturesScreen } from './os/screens';
import { ControlPanel } from './os/ControlPanel';
import { Icon } from './os/icons';
import CharacterLab from './lab/CharacterLab';
export default function App() {
    const [gateOpen, setGateOpen] = useState(false);
    const [view, setView] = useState('home');
    const [sheetOpen, setSheetOpen] = useState(false);
    const [musicOn, setMusicOn] = useState(true);
    const [musicBlocked, setMusicBlocked] = useState(false);
    const audioRef = useRef(null);
    // Music engine — single track: Connected Sky
    useEffect(() => {
        const audio = new Audio('/audio/connected-sky.wav');
        audio.loop = true;
        audio.volume = 0.52;
        audioRef.current = audio;
        return () => {
            audio.pause();
            audioRef.current = null;
        };
    }, []);
    const ensurePlaying = useCallback(() => {
        const a = audioRef.current;
        if (!a)
            return;
        if (musicOn) {
            a.play().catch(() => setMusicBlocked(true));
        }
    }, [musicOn]);
    // Gate tap unlocks music (trusted gesture)
    const handleGateOpen = () => {
        setGateOpen(true);
        ensurePlaying();
    };
    const toggleMusic = () => {
        const a = audioRef.current;
        if (!a)
            return;
        if (musicOn) {
            a.pause();
            setMusicOn(false);
        }
        else {
            setMusicOn(true);
            a.play().catch(() => setMusicBlocked(true));
        }
    };
    const handleLock = () => {
        audioRef.current?.pause();
        setSheetOpen(false);
        setGateOpen(false);
        setView('home');
    };
    // Escape closes sheet
    useEffect(() => {
        const h = (e) => {
            if (e.key === 'Escape')
                setSheetOpen(false);
        };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, []);
    return (_jsxs(TabletFrame, { children: [!gateOpen && _jsx(BootGate, { onOpen: handleGateOpen }), gateOpen && (_jsxs("div", { className: "os-interface", children: [_jsx("div", { className: "os-wallpaper" }), _jsx("div", { className: "os-grid" }), view !== 'lab' && _jsx(TopConsole, { onInfo: () => setSheetOpen(true) }), _jsxs("div", { className: "main-content", style: view === 'lab' ? { padding: 0, display: 'flex' } : undefined, children: [view === 'home' && _jsx(HomeScreen, {}), view === 'features' && _jsx(FeaturesScreen, {}), view === 'lab' && (_jsx("div", { className: "lab-view", children: _jsx(CharacterLab, { onBack: () => setView('home') }) }))] }), view !== 'lab' && _jsx(BottomDock, { view: view, onNav: setView }), _jsx("button", { className: "music-fab", onClick: toggleMusic, "aria-label": musicOn ? 'Mute music' : 'Play music', title: "Connected Sky", children: _jsx(Icon, { name: musicOn ? 'volume' : 'volumeOff', size: 22 }) }), sheetOpen && (_jsx(ControlPanel, { onClose: () => setSheetOpen(false), onNav: setView, onLock: handleLock, musicOn: musicOn, onToggleMusic: toggleMusic, musicLabel: musicBlocked ? 'Tap to retry' : 'Now Playing' }))] }))] }));
}
