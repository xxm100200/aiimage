declare module 'potrace' {
    interface PotraceOptions {
      turnPolicy?: 'black' | 'white' | 'left' | 'right' | 'minority' | 'majority';
      turdSize?: number;
      alphaMax?: number;
      optCurve?: boolean;
      optTolerance?: number;
      threshold?: number;
      blackOnWhite?: boolean;
      color?: string;
      background?: string;
    }
  
    interface Potrace {
      trace: (
        input: string | Buffer | ImageData,
        options: PotraceOptions,
        callback: (err: Error | null, svg: string) => void
      ) => void;
      // 如果你需要其他方法，可以在这里添加
    }
  
    const potrace: Potrace;
    export = potrace;
  }