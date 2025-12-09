export type AspectRatio = `${number}:${number}`;

export type DesignVariant = {
  id: string;
  name: string;
  aspectRatio: AspectRatio;
  duration: number;
  examples: { [key: string]: { videoUrl: string } };
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

export type Design<V extends DesignVariant = DesignVariant> = {
  id: string;
  name: string;
  description: string;
  category: string;
  renderUiDisabled: boolean;
  variants: V[];
};

export type Project<T extends ProjectTemplate = ProjectTemplate> = {
  id: string;
  name: string;
  description: string | null;
  analyzed: boolean;
  attributes?: {
    tags?: string[];
    folder?: string;
  };
  templates: T[];
};

export type RenderableTemplate = {
  id: string;
  name: string;
  aspectRatio: AspectRatio | null;
  durationSeconds: number;
};

export type RenderableItemsListOptions = {
  excludeDesigns?: boolean;
  excludeProjects?: boolean;
};

export type RenderableItem = {
  isDesign: boolean;
  id: string;
  name: string;
  description: string | null;
  metadata: {
    category: string | null;
    attributes: { [key: string]: unknown } | null;
  };
  templates: RenderableTemplate[];
};

export type ParameterType = "STRING" | "MEDIA" | "COLOR" | "NUMBER" | "BOOLEAN" | "COMPLEX";

export type DesignVariantDetails = DesignVariant & {};

export type DesignDetails = Design<DesignVariantDetails> & {
  parameters: {
    key: string;
    type: ParameterType;
    name: string;
    description: string;
    optional: boolean;
    defaultValue: unknown;
    sampleValue: unknown;
  }[];
};

enum LayerType {
  DATA = "DATA",
  MEDIA = "MEDIA",
  SOLID_COLOR = "SOLID_COLOR",
}

type Parametrization = {
  value: string;
  defaultValue?: string;
  expression: boolean;
  mandatory: boolean;
};

type AbstractLayer<T extends LayerType> = {
  layerType: T;
  internalId: string;
  label?: string;
  layerName: string;
  parametrization?: Parametrization;
};

type DataLayer = AbstractLayer<LayerType.DATA>;

type MediaLayer = AbstractLayer<LayerType.MEDIA> & {
  mediaType: "image" | "video" | "audio";
};

type SolidColorLayer = AbstractLayer<LayerType.SOLID_COLOR>;

export type Layer = DataLayer | MediaLayer | SolidColorLayer;

export type ProjectTemplateDetails = ProjectTemplate & {
  layers: Layer[];
};

export type ProjectDetails = Project<ProjectTemplateDetails> & {};

export type RenderableItemParameterType =
  | "STRING"
  | "MEDIA"
  | "MEDIA (image)"
  | "MEDIA (audio)"
  | "MEDIA (video)"
  | "COLOR";

export type RenderableItemDetails = {
  isDesign: boolean;
  projectDesignId: string;
  templateVariantId: string;
  exampleVideoUrl?: string;
  parameters: {
    key: string;
    mandatory: boolean;
    // Used to understand what parameter changes in the video
    type: RenderableItemParameterType;
    description: string | null;
    label: string | null;
    defaultValue?: unknown | null;
  }[];
};

enum RenderState {
  PENDING = "PENDING",
  THROTTLED = "THROTTLED",
  QUEUED = "QUEUED",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
  FAILED = "FAILED",
  INVALID = "INVALID",
  CANCELLED = "CANCELLED",
}

export type AbstractRenderDto = {
  parameters?: { [key: string]: unknown };
  attributes?: { [key: string]: unknown };
};

export type ProjectRenderDto = AbstractRenderDto & {
  projectId: string;
  templateId: string;
};

export type ParametrizationResult = {
  parametrization?: Parametrization;
  mandatoryNotResolved: boolean;
  fatalError: boolean;
  errorMessages?: string[];
};

export type RenderItemParams = {
  isDesign: boolean;
  projectDesignId: string;
  templateVariantId: string;
  parameters?: { [key: string]: unknown };
};

export type Render = {
  id: string;
  publicDesign: boolean;
  projectId: string;
  templateId: string;
  expirationDate?: string;
  state: RenderState;
  output?: string;
  projectName: string;
  templateName: string;
  error: { [key: string]: string | object };
  parametrizationResults: ParametrizationResult[];
};
