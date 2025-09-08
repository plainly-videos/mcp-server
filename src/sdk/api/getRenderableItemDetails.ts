import { createAxiosInstance } from "../../axiosConfig";
import {
  DesignDetails,
  Layer,
  ParameterType,
  ProjectDetails,
  RenderableItemDetails,
} from "../types";

const api = createAxiosInstance();

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
      type: param.type,
      description: param.description,
      label: null,
    })),
  }));
};

const getLayerType = (layer: Layer): ParameterType => {
  switch (layer.layerType) {
    case "DATA":
      return "STRING";
    case "MEDIA":
      return "MEDIA";
    case "SOLID_COLOR":
      return "COLOR";
    default:
      return "STRING"; // Fallback to STRING if unknown
  }
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
      type: getLayerType(layer),
      description: null,
      label: layer.label || null,
    })),
  }));
};

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
