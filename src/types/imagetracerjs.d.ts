declare module 'imagetracerjs' {
    interface ImageTracerOptions {
      ltres?: number;
      qtres?: number;
      pathomit?: number;
      colorsampling?: number;
      numberofcolors?: number;
      colorquantcycles?: number;
      mincolorratio?: number;
      quantclustersize?: number;
      scale?: number;
      simplify?: number;
      roundcoords?: number;
      // 根据需要添加更多选项
    }
  
    interface ImageTracer {
      imageToSVG(img: string | HTMLImageElement, options?: ImageTracerOptions): string;
      imageToSVG(img: string | HTMLImageElement, callback: (svg: string) => void, options?: ImageTracerOptions): void;
      // 根据需要添加更多方法
    }
  
    const ImageTracer: ImageTracer;
    export default ImageTracer;
  }