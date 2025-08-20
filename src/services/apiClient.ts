import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export async function apiClient<T = unknown>(
  url: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: unknown;
  } = {}
): Promise<{ data: T; status: number; raw: AxiosResponse<T> }> {
  try {
    const { method = 'GET', headers = {}, body } = options;
    const config: AxiosRequestConfig = {
      method,
      url,
      headers,
      data: body,
      validateStatus: () => true,
    };
    const response = await axios<T>(config);
    return {
      data: response.data,
      status: response.status,
      raw: response,
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        data: error.response.data as T,
        status: error.response.status,
        raw: error.response,
      };
    }
    throw error;
  }
}
