import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Icon } from './icons';
const ROWS = [
    { id: 'setting', icon: 'settings', title: 'Setting', desc: 'System preferences' },
    { id: 'task', icon: 'task', title: 'Task', desc: 'Task console' },
    { id: 'optA', icon: 'cube', title: 'Option A', desc: '3D Character Lab', action: 'lab' },
    { id: 'optB', icon: 'cube', title: 'Option B', desc: 'Module slot B' },
];
export function ControlPanel({ onClose, onNav, onLock, musicOn, onToggleMusic, musicLabel, }) {
    const [selected, setSelected] = useState(null);
    const handleRow = (row) => {
        setSelected(row.id);
        if (row.action === 'lab') {
            onNav('lab');
            onClose();
        }
        else if (row.action === 'lock') {
            onLock();
        }
    };
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "sheet-backdrop", onClick: onClose }), _jsxs("div", { className: "side-sheet", role: "dialog", "aria-label": "Control Panel", children: [_jsxs("div", { className: "sheet-head", children: [_jsxs("div", { children: [_jsx("div", { className: "kicker", children: "SYSTEM MENU" }), _jsx("h2", { children: "Control Panel" })] }), _jsx("button", { className: "sheet-close", onClick: onClose, "aria-label": "Close", children: _jsx("span", { children: "\u2715" }) })] }), _jsxs("div", { className: "sheet-rows", children: [ROWS.map((row) => (_jsxs("button", { className: `sheet-row ${selected === row.id ? 'active' : ''}`, onClick: () => handleRow(row), children: [_jsx("span", { className: "hex", children: _jsx(Icon, { name: row.icon, size: 20 }) }), _jsxs("span", { className: "meta", children: [_jsx("span", { className: "t", children: row.title }), _jsx("br", {}), _jsx("span", { className: "d", children: row.desc })] }), _jsx("span", { className: "chev", children: "\u203A" })] }, row.id))), _jsxs("button", { className: "sheet-row accent", onClick: onToggleMusic, children: [_jsx("span", { className: "hex", children: _jsx(Icon, { name: "music", size: 20 }) }), _jsxs("span", { className: "meta", children: [_jsx("span", { className: "t", children: musicLabel }), _jsx("br", {}), _jsx("span", { className: "d", children: "Connected Sky" })] }), _jsx("span", { className: `pill ${musicOn ? 'on' : ''}`, children: musicOn ? 'ON' : 'MUTED' })] }), _jsxs("button", { className: "sheet-row lock-row", onClick: () => handleRow({ id: 'lock', icon: 'lock', title: '', desc: '', action: 'lock' }), children: [_jsx("span", { className: "hex", children: _jsx(Icon, { name: "lock", size: 20 }) }), _jsxs("span", { className: "meta", children: [_jsx("span", { className: "t", children: "Lock Screen" }), _jsx("br", {}), _jsx("span", { className: "d", children: "Kembali ke access gate" })] }), _jsx("span", { className: "chev", children: "\u203A" })] }), selected && (_jsxs("div", { className: "module-strip", children: ["MODULE SELECTED: ", selected.toUpperCase()] }))] })] })] }));
}
