import axios, { type AxiosInstance } from "axios";
import { PACKAGE_NAME, PACKAGE_VERSION } from "./contants";
import { PlainlyApiAuthenticationError, PlainlyApiError } from "./sdk/errors";

export function createApiClient(config: { baseUrl: string; apiKey: string }): AxiosInstance {
  const baseUrl = config.baseUrl;
  const apiKey = config.apiKey;

  const instance = axios.create({
    baseURL: baseUrl,
    auth: {
      username: apiKey,
      password: "",
    },
    headers: {
      "User-Agent": `${PACKAGE_NAME}/${PACKAGE_VERSION}`,
    },
    timeout: 10000,
  });

  // Global error handler
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        const { status, data } = error.response;

        // Authentication errors
        if (status === 401 || status === 403) {
          return Promise.reject(new PlainlyApiAuthenticationError(status));
        }

        // Other API errors
        if (status >= 400 && status < 600) {
          return Promise.reject(new PlainlyApiError(status, data?.message));
        }
      }
      // Network or other errors
      return Promise.reject(error);
    },
  );

  return instance;
}
