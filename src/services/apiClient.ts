import axios from 'axios';

// Generic API client for HTTP requests
export async function apiClient<T = any>(url: string, options: {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
} = {}): Promise<{ data: T; status: number; raw: any }> {
  try {
    const { method = 'GET', headers = {}, body } = options;
    const config: any = {
      method,
      url,
      headers,
      data: body,
      validateStatus: () => true,
    };
    const response = await axios(config);
    return {
      data: response.data,
      status: response.status,
      raw: response,
    };
  } catch (error: any) {
    return {
      data: error.response?.data,
      status: error.response?.status || 500,
      raw: error,
    };
  }
}
