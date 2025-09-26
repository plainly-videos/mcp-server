import { AxiosInstance, AxiosResponse } from "axios";
import { Render } from "../types";

export const getRenderItem = async (
  client: AxiosInstance,
  renderingId: string
): Promise<Render> => {
  const response = await client.get<Render, AxiosResponse<Render>, void>(
    `/api/v2/renders/${renderingId}`
  );

  return response.data;
};
