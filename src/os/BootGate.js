import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { GateTriangles } from './parts';
export function BootGate({ onOpen }) {
    const [leaving, setLeaving] = useState(false);
    const handleTap = () => {
        if (leaving)
            return;
        setLeaving(true);
        // match gate-leave animation (.72s + .18s delay)
        setTimeout(onOpen, 880);
    };
    return (_jsxs("div", { className: `welcome-gate${leaving ? ' leaving' : ''}`, onClick: handleTap, role: "button", "aria-label": "Tap untuk membuka", children: [_jsx("div", { className: "gate-bg" }), _jsx(GateTriangles, {}), _jsx("div", { className: "gate-scan" }), _jsx("div", { className: "gate-s-glitch" })] }));
}
