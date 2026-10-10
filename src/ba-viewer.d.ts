export interface BaClipInfo {
    name: string;
    duration: number;
}
export interface BaCharacterDef {
    id: string;
    name: string;
    /** URL of the .glb, e.g. '/airi_band.glb' (served from public/) or https://cdn.jsdelivr.net/... */
    url: string;
    /** clip names to expose, in order — ONLY clips from this character's own GLB.
     * If empty and loadAllClips is true, all animations in the GLB are exposed. */
    clips: string[];
    /** If true and clips is empty, expose all animations found in the GLB. */
    loadAllClips?: boolean;
    /** per-clip Y-rotation correction in radians (e.g. Airi Normal_Idle spins -90°) */
    facingCorrections?: Record<string, number>;
    /**
     * Node names to remove from the scene. For props whose bones aren't animated
     * in the exposed clips (e.g. Airi's piano + piano bag) — they'd otherwise
     * render stuck at bind pose, floating over the character. The wiki viewer
     * hides such parts via its hide-parts system; this is our equivalent.
     */
    hiddenMeshes?: string[];
}
export interface BaStats {
    time: number;
    duration: number;
    fps: number;
    playing: boolean;
}
export declare class BaViewer {
    private container;
    private onStats;
    private renderer;
    private scene;
    private camera;
    private controls;
    private clock;
    private raf;
    private ro;
    private loader;
    private modelRoot;
    private mixer;
    private clips;
    private action;
    private def;
    private playing;
    private speedPct;
    private loop;
    private baseDistance;
    private zoomPct;
    private loadToken;
    private fpsEMA;
    private lastStatsPush;
    private disposed;
    constructor(container: HTMLElement, onStats: (s: BaStats) => void);
    /** Load a character's GLB; returns the exposed clips with real durations. */
    loadCharacter(def: BaCharacterDef): Promise<BaClipInfo[]>;
    /** Convert every material to unlit (raw texture colors) + add inverted-hull outline. */
    private applyWikiLook;
    private clearModel;
    /** Wiki framing: FOV 35, az 0 / el 5, character ~92.6% of viewport height. */
    private frameCamera;
    resetView(): void;
    /** Slider zoom 75..140 (%). Dollies along the current view direction. */
    setZoom(pct: number): void;
    /** ROTATE mode: manual drag orbit (no auto-rotate). */
    setOrbitEnabled(enabled: boolean): void;
    /** Arrow-button nudge: rotate azimuth by 15°. */
    nudgeAzimuth(dir: 1 | -1): void;
    playClip(name: string): void;
    setPlaying(playing: boolean): void;
    togglePlaying(): void;
    /** 0..200 (%). 0% = frozen. */
    setSpeed(pct: number): void;
    /** Scrub to a fraction of the clip; pauses while scrubbing (wiki behavior). */
    seek01(f: number): void;
    setLoop(loop: boolean): void;
    getDuration(): number;
    getTime(): number;
    private tick;
    private pushStats;
    private resize;
    dispose(): void;
}
