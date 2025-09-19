import { createAxiosInstance } from "../../axiosConfig";

const api = createAxiosInstance();

export const isValidApiKey = async (): Promise<boolean> => {
  try {
    await api.get(`/api/v2/me`);
    return true;
  } catch {
    return false;
  }
};
