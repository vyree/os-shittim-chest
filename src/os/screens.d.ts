import React from 'react';
export type OsView = 'home' | 'features' | 'lab';
export declare function TopConsole({ onInfo }: {
    onInfo: () => void;
}): React.JSX.Element;
export declare function BottomDock({ view, onNav }: {
    view: OsView;
    onNav: (v: OsView) => void;
}): React.JSX.Element;
export declare function HomeScreen(): React.JSX.Element;
export declare function FeaturesScreen(): React.JSX.Element;
