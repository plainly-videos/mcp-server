import { AxiosInstance } from "axios";
import {
  DesignDetails,
  DesignVariant,
  Layer,
  ProjectDetails,
  RenderableItemDetails,
  RenderableItemParameterType,
} from "../types";

export const getRenderableItemsDetails = async (
  client: AxiosInstance,
  renderableItemId: string,
  isDesign: boolean
): Promise<RenderableItemDetails[]> => {
  if (isDesign) {
    return await getDesignVariants(client, renderableItemId);
  } else {
    return await getProjectTemplates(client, renderableItemId);
  }
};

const getDesignVariants = async (
  client: AxiosInstance,
  designId: string
): Promise<RenderableItemDetails[]> => {
  const response = await client.get<DesignDetails>(
    `/api/v2/designs/${designId}`
  );
  const designDetails = response.data;

  // flatten variants into renderable items with parameter details
  return designDetails.variants.map((variant) => ({
    isDesign: true,
    projectDesignId: designDetails.id,
    templateVariantId: variant.id,
    exampleVideoUrl: getExampleVideoUrl(variant),
    parameters: designDetails.parameters.map((param) => ({
      key: param.key,
      mandatory: !param.optional,
      type: getDesignParameterType(param.type),
      description: param.description,
      label: null,
      defaultValue: param.defaultValue || null,
    })),
  }));
};

const getProjectTemplates = async (
  client: AxiosInstance,
  projectId: string
): Promise<RenderableItemDetails[]> => {
  const response = await client.get<ProjectDetails>(
    `/api/v2/projects/${projectId}`
  );
  const projectDetails = response.data;

  // flatten templates into renderable items with parameter details
  return projectDetails.templates.map((template) => ({
    isDesign: false,
    projectDesignId: projectDetails.id,
    templateVariantId: template.id,
    parameters: template.layers.filter(isDynamicLayer).map((layer) => ({
      key: layer.parametrization.value.replace("#", ""),
      mandatory: layer.parametrization.mandatory,
      type: getProjectParameterType(layer),
      description: null,
      label: layer.label || null,
      defaultValue: layer.parametrization.defaultValue || null,
    })),
  }));
};

const isDynamicLayer = (
  layer: Layer
): layer is Layer & {
  parametrization: { value: string; mandatory: boolean };
} => {
  return layer.parametrization != null && layer.parametrization.expression;
};

const getExampleVideoUrl = (variant: DesignVariant): string | undefined => {
  const allVariantExamples = Object.values(variant.examples || {});
  if (allVariantExamples.length === 0) {
    return undefined;
  }

  // Find the first example with a videoUrl
  const videoExample = allVariantExamples.find((example) => example.videoUrl);
  if (videoExample) {
    return videoExample.videoUrl;
  }

  return undefined;
};

const getDesignParameterType = (type: string): RenderableItemParameterType => {
  switch (type) {
    case "STRING":
      return "STRING";
    case "MEDIA":
      return "MEDIA"; // designs do not specify media type
    case "COLOR":
      return "COLOR";
    default:
      return "STRING"; // Fallback to STRING if unknown
  }
};

const getProjectParameterType = (layer: Layer): RenderableItemParameterType => {
  switch (layer.layerType) {
    case "DATA":
      return "STRING";
    case "MEDIA":
      return `MEDIA (${layer.mediaType})`; // specify media type
    case "SOLID_COLOR":
      return "COLOR";
    default:
      return "STRING"; // Fallback to STRING if unknown
  }
};
