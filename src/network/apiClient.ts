import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { auth } from '@/config/firebaseconfig';

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
    // Attach Firebase ID token when available
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
    }
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

apiClient.get = async function<T = unknown>(url: string, headers?: Record<string, string>) {
  const defaultHeaders = { "Accept": "application/json" };
  return apiClient<T>(url, { method: 'GET', headers: { ...defaultHeaders, ...headers } });
};

apiClient.post = async function<T = unknown>(url: string, body?: unknown, headers?: Record<string, string>) {
  const defaultHeaders = { "Content-Type": "application/json", "Accept": "application/json" };
  return apiClient<T>(url, { method: 'POST', headers: { ...defaultHeaders, ...headers }, body });
};

apiClient.put = async function<T = unknown>(url: string, body?: unknown, headers?: Record<string, string>) {
  const defaultHeaders = { "Content-Type": "application/json", "Accept": "application/json" };
  return apiClient<T>(url, { method: 'PUT', headers: { ...defaultHeaders, ...headers }, body });
};

apiClient.delete = async function<T = unknown>(url: string, headers?: Record<string, string>) {
  const defaultHeaders = { "Accept": "application/json" };
  return apiClient<T>(url, { method: 'DELETE', headers: { ...defaultHeaders, ...headers } });
};
