import React from 'react';
declare const paths: Record<string, React.ReactNode>;
export declare function Icon({ name, size }: {
    name: keyof typeof paths;
    size?: number;
}): React.JSX.Element;
export {};
