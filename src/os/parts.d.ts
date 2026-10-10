import React from 'react';
/** Tablet bezel frame — wraps every screen. */
export declare function TabletFrame({ children }: {
    children: React.ReactNode;
}): React.JSX.Element;
/** The glowing Arona "S" logo as inline SVG (glitch handled by CSS). */
export declare function AronaSLogo({ glitch }: {
    glitch?: boolean;
}): React.JSX.Element;
/** Small drifting triangles overlay for the gate. */
export declare function GateTriangles(): React.JSX.Element;
