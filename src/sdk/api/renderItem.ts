import { AxiosResponse } from "axios";
import { createAxiosInstance } from "../../axiosConfig";
import { ProjectRenderDto, Render } from "../types";
import { PACKAGE_NAME } from "../../contants";

const api = createAxiosInstance();

type RenderParams = {
  isDesign: boolean;
  projectDesignId: string;
  templateVariantId: string;
  parameters?: { [key: string]: any };
};

export const renderItem = async (params: RenderParams): Promise<Render> => {
  const response = await api.post<
    Render,
    AxiosResponse<Render>,
    ProjectRenderDto
  >("/api/v2/renders", {
    projectId: params.projectDesignId,
    templateId: params.templateVariantId,
    parameters: params.parameters,
    attributes: {
      [PACKAGE_NAME]: "true",
    },
  });

  return response.data;
};
