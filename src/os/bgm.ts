/**
 * YouTube Low-Bitrate Background Music Player
 * Streams https://youtu.be/SHkF48SgiSA?si=aekTGy31wFvbeLdy (ID: SHkF48SgiSA)
 * at lowest playback quality ('small' / 'tiny') for lightweight audio-only background loop.
 */

const YT_VIDEO_ID = 'SHkF48SgiSA';

interface YTPlayerInstance {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  setVolume: (volume: number) => void;
  setPlaybackQuality: (suggestedQuality: string) => void;
  getPlayerState: () => number;
  destroy: () => void;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string | HTMLElement,
        options: {
          height?: string | number;
          width?: string | number;
          videoId: string;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (event: { target: YTPlayerInstance }) => void;
            onStateChange?: (event: { data: number; target: YTPlayerInstance }) => void;
          };
        }
      ) => YTPlayerInstance;
      PlayerState?: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export interface BgmController {
  play: () => Promise<void>;
  pause: () => void;
  isPaused: () => boolean;
  dispose: () => void;
}

let apiLoadPromise: Promise<void> | null = null;

function loadYouTubeAPI(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.YT && window.YT.Player) return Promise.resolve();
  if (apiLoadPromise) return apiLoadPromise;

  apiLoadPromise = new Promise<void>((resolve) => {
    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prevCallback?.();
      resolve();
    };
    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    );
    if (!existingScript) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      document.head.appendChild(tag);
    }
  });

  return apiLoadPromise;
}

export function createYouTubeBgm(onPlayStateChange?: (playing: boolean) => void): BgmController {
  let player: YTPlayerInstance | null = null;
  let ready = false;
  let wantPlaying = true;
  let currentlyPlaying = false;
  let disposed = false;

  const host = document.createElement('div');
  host.style.cssText =
    'position:fixed;width:1px;height:1px;left:-9999px;bottom:0;opacity:0.01;pointer-events:none;z-index:-1;overflow:hidden;';
  const mountEl = document.createElement('div');
  host.appendChild(mountEl);
  document.body.appendChild(host);

  const enforceLowQuality = (target: YTPlayerInstance) => {
    try {
      target.setPlaybackQuality('small');
    } catch {}
  };

  loadYouTubeAPI().then(() => {
    if (disposed || !window.YT) return;
    player = new window.YT.Player(mountEl, {
      width: 1,
      height: 1,
      videoId: YT_VIDEO_ID,
      playerVars: {
        autoplay: 1,
        loop: 1,
        playlist: YT_VIDEO_ID,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        vq: 'small',
      },
      events: {
        onReady: (e) => {
          if (disposed) return;
          ready = true;
          enforceLowQuality(e.target);
          try {
            e.target.setVolume(60);
            if (wantPlaying) {
              e.target.playVideo();
            }
          } catch {}
        },
        onStateChange: (e) => {
          if (disposed) return;
          // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
          if (e.data === 1) {
            currentlyPlaying = true;
            enforceLowQuality(e.target);
            onPlayStateChange?.(true);
          } else if (e.data === 2) {
            currentlyPlaying = false;
            onPlayStateChange?.(false);
          } else if (e.data === 0) {
            // Loop continuously
            try {
              e.target.seekTo(0, true);
              e.target.playVideo();
            } catch {}
          }
        },
      },
    });
  });

  return {
    play: async () => {
      wantPlaying = true;
      if (ready && player) {
        try {
          enforceLowQuality(player);
          player.playVideo();
        } catch {}
      }
    },
    pause: () => {
      wantPlaying = false;
      currentlyPlaying = false;
      if (ready && player) {
        try {
          player.pauseVideo();
        } catch {}
      }
      onPlayStateChange?.(false);
    },
    isPaused: () => !currentlyPlaying,
    dispose: () => {
      disposed = true;
      try {
        player?.destroy();
      } catch {}
      host.remove();
    },
  };
}
