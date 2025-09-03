export type AspectRatio = `${number}:${number}`;

export type DesignVariant = {
  id: string;
  name: string;
  aspectRatio: AspectRatio;
  duration: number;
};

export type ProjectTemplate = {
  id: string;
  name: string;
  duration: number;
  resolution: {
    width: number;
    height: number;
  };
};

export type Design = {
  id: string;
  name: string;
  description: string;
  category: string;
  renderUiDisabled: boolean;
  variants: DesignVariant[];
};

export type Project = {
  id: string;
  name: string;
  description: string | null;
  analyzed: boolean;
  attributes?: {
    tags?: string[];
    folder?: string;
  };
  templates: ProjectTemplate[];
};

export type RenderableTemplate = {
  id: string;
  name: string;
  aspectRatio: AspectRatio;
  duration: number;
};

export type RenderableItem = {
  isDesign: boolean;
  id: string;
  name: string;
  description: string | null;
  metadata: {
    category?: string;
    attributes?: { [key: string]: any };
  };
  templates: RenderableTemplate[];
};
