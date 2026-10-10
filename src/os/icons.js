import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* Custom 24x24 line icons, stroke 1.8, round caps — Shittim Chest OS set */
const paths = {
    home: _jsx("path", { d: "M3 11.5 12 4l9 7.5M5.5 10.5V20h13v-9.5" }),
    grid: (_jsxs(_Fragment, { children: [_jsx("rect", { x: "4", y: "4", width: "7", height: "7", rx: "1.5" }), _jsx("rect", { x: "13", y: "4", width: "7", height: "7", rx: "1.5" }), _jsx("rect", { x: "4", y: "13", width: "7", height: "7", rx: "1.5" }), _jsx("rect", { x: "13", y: "13", width: "7", height: "7", rx: "1.5" })] })),
    info: (_jsxs(_Fragment, { children: [_jsx("circle", { cx: "12", cy: "12", r: "8.5" }), _jsx("path", { d: "M12 11v5M12 7.8v.4" })] })),
    close: _jsx("path", { d: "M6 6l12 12M18 6 6 18" }),
    music: (_jsxs(_Fragment, { children: [_jsx("path", { d: "M9 18.5V6l10-2.5V15" }), _jsx("circle", { cx: "6.8", cy: "18.5", r: "2.4" }), _jsx("circle", { cx: "16.8", cy: "15", r: "2.4" })] })),
    lock: (_jsxs(_Fragment, { children: [_jsx("rect", { x: "5.5", y: "10.5", width: "13", height: "9.5", rx: "2" }), _jsx("path", { d: "M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" })] })),
    settings: (_jsxs(_Fragment, { children: [_jsx("circle", { cx: "12", cy: "12", r: "3.2" }), _jsx("path", { d: "M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M18.5 5.5l-2.1 2.1M7.6 16.4l-2.1 2.1" })] })),
    task: (_jsxs(_Fragment, { children: [_jsx("rect", { x: "5", y: "4.5", width: "14", height: "16", rx: "2" }), _jsx("path", { d: "M9 4.5a3 3 0 0 1 6 0M9 11.5l2 2 3.5-4" })] })),
    cube: (_jsxs(_Fragment, { children: [_jsx("path", { d: "M12 2.8 20 7.5v9L12 21.2 4 16.5v-9Z" }), _jsx("path", { d: "M12 12 20 7.5M12 12v9.2M12 12 4 7.5" })] })),
    volume: (_jsxs(_Fragment, { children: [_jsx("path", { d: "M4 9.5v5h3.5L12 18.5v-13L7.5 9.5Z" }), _jsx("path", { d: "M15.5 9.5a4 4 0 0 1 0 5M18 7.5a7.5 7.5 0 0 1 0 9" })] })),
    volumeOff: (_jsxs(_Fragment, { children: [_jsx("path", { d: "M4 9.5v5h3.5L12 18.5v-13L7.5 9.5Z" }), _jsx("path", { d: "M16 9.5l5 5M21 9.5l-5 5" })] })),
    rotate: (_jsxs(_Fragment, { children: [_jsx("path", { d: "M20 12a8 8 0 1 1-2.3-5.6" }), _jsx("path", { d: "M20 3.5V8h-4.5" })] })),
    chevR: _jsx("path", { d: "M9.5 6 15.5 12 9.5 18" }),
};
export function Icon({ name, size = 22 }) {
    return (_jsx("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: paths[name] }));
}
