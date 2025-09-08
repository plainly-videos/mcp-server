import { createAxiosInstance } from "../../axiosConfig";
import {
  DesignDetails,
  Layer,
  ProjectDetails,
  RenderableItemDetails,
  RenderableItemParameterType,
} from "../types";

const api = createAxiosInstance();

export const getRenderableItemsDetails = async (
  renderableItemId: string,
  isDesign: boolean
): Promise<RenderableItemDetails[]> => {
  if (isDesign) {
    return await getDesignVariants(renderableItemId);
  } else {
    return await getProjectTemplates(renderableItemId);
  }
};

const getDesignVariants = async (
  designId: string
): Promise<RenderableItemDetails[]> => {
  const response = await api.get<DesignDetails>(`/api/v2/designs/${designId}`);
  const designDetails = response.data;

  // flatten variants into renderable items with parameter details
  return designDetails.variants.map((variant) => ({
    isDesign: true,
    id: designDetails.id,
    variantId: variant.id,
    parameters: designDetails.parameters.map((param) => ({
      key: param.key,
      mandatory: !param.optional,
      type: getDesignParameterType(param.type),
      description: param.description,
      label: null,
    })),
  }));
};

const getProjectTemplates = async (
  projectId: string
): Promise<RenderableItemDetails[]> => {
  const response = await api.get<ProjectDetails>(
    `/api/v2/projects/${projectId}`
  );
  const projectDetails = response.data;

  // flatten templates into renderable items with parameter details
  return projectDetails.templates.map((template) => ({
    isDesign: false,
    id: projectDetails.id,
    variantId: template.id,
    parameters: template.layers.map((layer) => ({
      key: layer.parametrization.value.replace("#", ""),
      mandatory: layer.parametrization.mandatory,
      type: getProjectParameterType(layer),
      description: null,
      label: layer.label || null,
    })),
  }));
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
