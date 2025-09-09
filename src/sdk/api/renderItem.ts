import { AxiosResponse } from "axios";
import { createAxiosInstance } from "../../axiosConfig";
import { DesignRenderDto, ProjectRenderDto, Render } from "../types";

const api = createAxiosInstance();

type RenderParams = {
  isDesign: boolean;
  projectDesignId: string;
  templateVariantId: string;
  parameters?: { [key: string]: any };
};

export const renderItem = async (params: RenderParams): Promise<Render> => {
  if (params.isDesign) {
    return await renderDesign(params);
  } else {
    return await renderProject(params);
  }
};

const renderDesign = async (params: RenderParams): Promise<Render> => {
  const response = await api.post<
    Render,
    AxiosResponse<Render>,
    DesignRenderDto
  >("/api/v2/designs", {
    designId: params.projectDesignId,
    variantId: params.templateVariantId,
    parameters: params.parameters,
  });

  return response.data;
};

const renderProject = async (params: RenderParams): Promise<Render> => {
  const response = await api.post<
    Render,
    AxiosResponse<Render>,
    ProjectRenderDto
  >("/api/v2/renders", {
    projectId: params.projectDesignId,
    templateId: params.templateVariantId,
    parameters: params.parameters,
  });

  return response.data;
};
