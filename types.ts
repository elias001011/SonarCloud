export interface Sound {
  name: string;
  url: string;
  duration?: string;
}

export interface Category {
  name: string;
  sounds: Sound[];
}

export enum Theme {
  Light = 'light',
  Dark = 'dark',
  Translucent = 'translucent',
}

export type FadeOutOption = 0 | 5 | 10 | 15 | 20 | 30 | 60;


export interface SoundCloudWidget {
  load: (url: string, options: any) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  setVolume: (volume: number) => void;
  getVolume: (callback: (volume: number) => void) => void;
  // Fix: Add missing getDuration method to the SoundCloudWidget interface.
  getDuration: (callback: (duration: number) => void) => void;
  bind: (event: string, callback: (...args: any[]) => void) => void;
  unbind: (event: string) => void;
}

declare global {
  interface Window {
    SC?: {
      Widget: {
        (iframe: HTMLElement | string): SoundCloudWidget;
        Events: {
          READY: string;
          PLAY: string;
          PAUSE: string;
          FINISH: string;
          PLAY_PROGRESS: string;
        };
      };
    };
  }
}