declare module '@cycjimmy/jsmpeg-player' {
    export interface JSMpegOptions {
      canvas?: HTMLCanvasElement;
      autoplay?: boolean;
      audio?: boolean;
      loop?: boolean;
      progressive?: boolean;
      throttled?: boolean;
      chunkSize?: number;
      decodeFirstFrame?: boolean;
      maxAudioLag?: number;
      videoBufferSize?: number;
      audioBufferSize?: number;
    }
  
    export class Player {
      constructor(url: string, options?: JSMpegOptions);
      destroy(): void;
      play(): void;
      pause(): void;
      stop(): void;
      volume: number;
    }
  
    const JSMpeg: {
      Player: typeof Player;
    };
  
    export default JSMpeg;
  }