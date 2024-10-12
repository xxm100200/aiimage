declare module 'quantize' {
    function quantize(pixels: number[][], maxColors: number): {
      map: (pixel: number[]) => number;
      palette: () => number[][];
    };
    export = quantize;
  }