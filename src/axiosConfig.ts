import axios, { AxiosInstance } from "axios";

export function createAxiosInstance(config?: {
  baseUrl?: string;
  apiKey?: string;
}): AxiosInstance {
  const baseUrl = config?.baseUrl || process.env.PLAINLY_API_URL;
  const apiKey = config?.apiKey || process.env.PLAINLY_API_KEY;

  if (!baseUrl) {
    throw new Error(
      "Base URL is required. Set PLAINLY_API_URL environment variable or provide it in config."
    );
  }

  if (!apiKey) {
    throw new Error(
      "API key is required. Set PLAINLY_API_KEY environment variable or provide it in config."
    );
  }

  const instance = axios.create({
    baseURL: baseUrl,
    headers: {
      Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`,
      "Content-Type": "application/json",
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
