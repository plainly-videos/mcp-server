import { AxiosInstance, AxiosResponse } from "axios";
import { ProjectRenderDto, Render, RenderItemParams } from "../types";
import { PACKAGE_NAME } from "../../contants";

export const renderItem = async (
  client: AxiosInstance,
  params: RenderItemParams
): Promise<Render> => {
  const response = await client.post<
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
