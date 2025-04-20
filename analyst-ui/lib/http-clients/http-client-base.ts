import { z } from "zod";
import { HttpException } from "../errors/HttpException";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method: HttpMethod;
  headers: Record<string, string>;
  body?: string;
}

class HttpClient {
  private baseUrl: string;

  constructor(baseUrl: string = "") {
    this.baseUrl = baseUrl;
  }

  private async request<T, D = unknown>(
    endpoint: string,
    method: HttpMethod,
    data: D | null = null,
    accessToken: string = "",
    headers: Record<string, string> = {},
    validationSchema?: z.Schema
  ): Promise<T> {
    // Check if we have a token in localStorage when running in browser
    if (typeof window !== 'undefined' && !accessToken) {
      const localStorageToken = localStorage.getItem('accessToken');
      if (localStorageToken) {
        console.log(`[HttpClient] Using token from localStorage for ${endpoint}`);
        accessToken = localStorageToken;
      }
    }
    const url = this.baseUrl + endpoint;

    console.log(`[HttpClient] ${method} request to ${endpoint}`, {
      hasAccessToken: !!accessToken,
      hasData: !!data,
      headers: Object.keys(headers)
    });

    const options: RequestOptions = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...headers,
      },
    };

    if (data !== null) {
      options.body = JSON.stringify(data);
    }

    try {
      console.log(`[HttpClient] Sending ${method} request to ${url}`);
      const response = await fetch(url, options);
      console.log(`[HttpClient] Response received from ${endpoint}`, {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      if (!response.ok) {
        const responseJSON = await response.json();
        const errorData = responseJSON.details ? responseJSON.details : responseJSON;
        console.error(`[HttpClient] Error response from ${endpoint}:`, errorData);
        throw new HttpException(errorData.error, response.status);
      }

      if (response.status == 200) {
        const responseJSON = await response.json();
        const responseData = responseJSON.data ? responseJSON.data : responseJSON;
        console.log(`[HttpClient] Successful response from ${endpoint}`, {
          hasData: !!responseData,
          isWrapped: !!responseJSON.data
        });

        if (validationSchema) {
          return validationSchema.parse(responseData) as T;
        }
        return responseData as T;
      }

      console.log(`[HttpClient] Empty response from ${endpoint}`);
      return null as T;
    } catch (error) {
      console.error(`[HttpClient] Fetch error for ${endpoint}:`, error);
      throw error;
    }
  }

  validate<T extends z.Schema>(schema: T) {
    // R: Response, D: Input Data
    return {
      get: <R>(endpoint: string, accessToken: string = "", headers: Record<string, string> = {}) =>
        this.request<R>(endpoint, "GET", null, accessToken, headers, schema),
      post: <R, D>(endpoint: string, data: D, accessToken: string = "", headers: Record<string, string> = {}) =>
        this.request<R, D>(endpoint, "POST", data, accessToken, headers, schema),
      put: <R, D>(endpoint: string, data: D, accessToken: string = "", headers: Record<string, string> = {}) =>
        this.request<R, D>(endpoint, "PUT", data, accessToken, headers, schema),
      delete: <R>(endpoint: string, accessToken: string = "", headers: Record<string, string> = {}) =>
        this.request<R>(endpoint, "DELETE", null, accessToken, headers, schema),
      patch: <R, D>(endpoint: string, data: D, accessToken: string = "", headers: Record<string, string> = {}) =>
        this.request<R, D>(endpoint, "PATCH", data, accessToken, headers, schema),
    };
  }

  async get<T>(endpoint: string, accessToken: string = "", headers: Record<string, string> = {}): Promise<T> {
    return this.request<T>(endpoint, "GET", null, accessToken, headers);
  }

  async post<T, D = unknown>(
    endpoint: string,
    data: D,
    accessToken: string = "",
    headers: Record<string, string> = {}
  ): Promise<T> {
    return this.request<T, D>(endpoint, "POST", data, accessToken, headers);
  }

  async put<T, D = unknown>(
    endpoint: string,
    data: D,
    accessToken: string = "",
    headers: Record<string, string> = {}
  ): Promise<T> {
    return this.request<T, D>(endpoint, "PUT", data, accessToken, headers);
  }

  async patch<T, D = unknown>(
    endpoint: string,
    data: D,
    accessToken: string = "",
    headers: Record<string, string> = {}
  ): Promise<T> {
    return this.request<T, D>(endpoint, "PATCH", data, accessToken, headers);
  }

  async delete<T>(endpoint: string, accessToken: string = "", headers: Record<string, string> = {}): Promise<T> {
    return this.request<T>(endpoint, "DELETE", null, accessToken, headers);
  }
}

export default HttpClient;
