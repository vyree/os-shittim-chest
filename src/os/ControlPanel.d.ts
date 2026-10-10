import React from 'react';
import type { OsView } from './screens';
export declare function ControlPanel({ onClose, onNav, onLock, musicOn, onToggleMusic, musicLabel, }: {
    onClose: () => void;
    onNav: (v: OsView) => void;
    onLock: () => void;
    musicOn: boolean;
    onToggleMusic: () => void;
    musicLabel: string;
}): React.JSX.Element;
