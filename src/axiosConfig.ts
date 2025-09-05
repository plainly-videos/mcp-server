import axios, { AxiosInstance } from "axios";
import env from "./env";

export function createAxiosInstance(config?: {
  baseUrl?: string;
  apiKey?: string;
}): AxiosInstance {
  const baseUrl = config?.baseUrl || env.PLAINLY_API_URL;
  const apiKey = config?.apiKey || env.PLAINLY_API_KEY;

  const instance = axios.create({
    baseURL: baseUrl,
    auth: {
      username: apiKey,
      password: "",
    },
    headers: {
      "User-Agent": "plainly-mcp-server/1.0",
    },
    timeout: 10000,
  });

  // Global error handler
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        const { status, data } = error.response;
        const message =
          data?.message || `API request failed with status ${status}`;
        return Promise.reject({
          status,
          message,
          details: data,
        });
      }
      return Promise.reject(error);
    }
  );

  return instance;
}
