export declare type ColorPalette = {
  group: string;
  defaultPalette: boolean;
  primary: string;
  secondary?: string;
  tertiary?: string;
};

export declare type Design = {
  id: string;
  name: string;
  description: string;
  category: string;
  renderUiDisabled: boolean;
  palettes: ColorPalette[];
};

export interface DesignRenderDto {
  designId: string;
  variantId?: string;
  colorPalette?: string;
  parameters?: Record<string, string>;
}

export interface DestructedRender {
  id: string;
  [key: string]: unknown;
}

export interface DesignExample {
  thumbnailUrl: string;
  videoUrl: string;
}

export interface DesignVariant {
  aspectRatio: string;
  defaultVariant: boolean;
  duration: number;
  examples: Record<string, DesignExample>;
}

export interface DesignParameter {
  key: string;
  name: string;
  description: string;
  optional: boolean;
}

export interface DesignDetails {
  id: string;
  name: string;
  description: string;
  category: string;
  renderUiDisabled: boolean;
  publishedDate: string;
  palettes: ColorPalette[];
  variants: DesignVariant[];
  parameters: DesignParameter[];
  defaultExample: DesignExample;
}
