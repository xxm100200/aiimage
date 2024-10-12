declare module 'svgo/dist/svgo.browser' {
    export interface OptimizeOptions {
      path?: string;
      multipass?: boolean;
      plugins?: Array<string | PluginConfig>;
      js2svg?: JS2SVGOptions;
    }
  
    export interface PluginConfig {
      name: string;
      params?: Record<string, any>;
    }
  
    export interface JS2SVGOptions {
      indent?: number;
      pretty?: boolean;
    }
  
    export interface OptimizedSvg {
      data: string;
      info: {
        width: string;
        height: string;
      };
    }
  
    export function optimize(
      svg: string,
      options?: OptimizeOptions
    ): OptimizedSvg;
  }