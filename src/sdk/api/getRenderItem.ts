import { AxiosResponse } from "axios";
import { createAxiosInstance } from "../../axiosConfig";
import { Render } from "../types";

const api = createAxiosInstance();

export const getRenderItem = async (renderingId: string): Promise<Render> => {
  const response = await api.get<Render, AxiosResponse<Render>, void>(
    `/api/v2/renders/${renderingId}`
  );

  return response.data;
};
