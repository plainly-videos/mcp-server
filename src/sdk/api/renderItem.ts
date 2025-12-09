import type { AxiosInstance, AxiosResponse } from "axios";
import { PACKAGE_NAME } from "../../contants";
import type { ProjectRenderDto, Render, RenderItemParams } from "../types";

export const renderItem = async (client: AxiosInstance, params: RenderItemParams): Promise<Render> => {
  const response = await client.post<Render, AxiosResponse<Render>, ProjectRenderDto>("/api/v2/renders", {
    projectId: params.projectDesignId,
    templateId: params.templateVariantId,
    parameters: params.parameters,
    attributes: {
      [PACKAGE_NAME]: "true",
    },
  });

  return response.data;
};
