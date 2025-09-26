import axios, { AxiosInstance } from "axios";
import { PACKAGE_NAME, PACKAGE_VERSION } from "./contants";
import { PlainlyApiAuthenticationError, PlainlyApiError } from "./sdk/errors";

export function createApiClient(config: {
  baseUrl: string;
  apiKey: string;
}): AxiosInstance {
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

        // Other server errors
        if (status >= 400 && status < 600) {
          return Promise.reject(new PlainlyApiError(status, data?.message));
        }

        // Other errors
        if (status >= 400 && status < 600) {
          const message =
            data?.message || `API request failed with status ${status}`;
          return Promise.reject({
            status,
            message,
            details: data,
          });
        }

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
