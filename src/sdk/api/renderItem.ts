import { AxiosResponse } from "axios";
import { createAxiosInstance } from "../../axiosConfig";
import { ProjectRenderDto, Render } from "../types";

// get name from package.json
import { name } from "../../../package.json";

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
      [name]: true,
    },
  });

  return response.data;
};
