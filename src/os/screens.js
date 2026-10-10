import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Icon } from './icons';
export function TopConsole({ onInfo }) {
    return (_jsxs("div", { className: "top-console", children: [_jsxs("div", { className: "brand-ribbon", children: [_jsx("span", { className: "notch" }), _jsxs("span", { children: ["SHITTIM CHEST ", _jsx("span", { className: "slash", children: "//" }), " OS"] })] }), _jsx("button", { className: "icon-btn", onClick: onInfo, "aria-label": "Info", children: _jsx(Icon, { name: "info" }) })] }));
}
export function BottomDock({ view, onNav }) {
    return (_jsx("div", { className: "bottom-dock", children: _jsxs("div", { className: "dock-pill", children: [_jsxs("button", { className: `dock-tab ${view === 'home' ? 'active' : ''}`, onClick: () => onNav('home'), children: [_jsx(Icon, { name: "home", size: 20 }), _jsx("span", { children: "HOME" })] }), _jsxs("button", { className: `dock-tab ${view === 'features' ? 'active' : ''}`, onClick: () => onNav('features'), children: [_jsx(Icon, { name: "grid", size: 20 }), _jsx("span", { children: "FEATURES" }), _jsx("span", { className: "soon", children: "SOON" })] })] }) }));
}
export function HomeScreen() {
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "page-intro", children: [_jsx("div", { className: "kicker", children: "DASH / 01" }), _jsx("h1", { className: "page-title", children: "Home" })] }), _jsxs("div", { className: "os-ornament", "aria-hidden": true, children: [_jsx("div", { className: "ring" }), _jsx("div", { className: "sq" }), _jsx("div", { className: "bar" })] })] }));
}
export function FeaturesScreen() {
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "page-intro", children: [_jsx("div", { className: "kicker", children: "DASH / 02" }), _jsx("h1", { className: "page-title", children: "Feature Bay" })] }), _jsxs("div", { className: "feature-center", children: [_jsx("div", { className: "kicker", children: "02" }), _jsx("div", { className: "hex-tile", children: _jsx(Icon, { name: "grid", size: 38 }) }), _jsx("h2", { className: "page-title", children: "Features" }), _jsx("p", { className: "feature-desc", children: "Ruang fitur sedang disiapkan untuk fase berikutnya." }), _jsx("div", { className: "soon-badge", children: _jsx("span", { children: "SEGERA HADIR" }) })] })] }));
}
