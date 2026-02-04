/**
 * Module imports.
 */

import { UpholdApiError } from '../types';

/**
 * HTTP Client configuration.
 */

export interface HttpClientConfig {
  baseUrl: string;
  userAgent?: string;
}

/**
 * Make a GET request to an API endpoint.
 *
 * @param endpoint - The API endpoint to request.
 * @param config - HTTP client configuration.
 */

export async function request<T>(
  endpoint: string,
  config: HttpClientConfig
): Promise<T> {
  const response = await fetch(`${config.baseUrl}${endpoint}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': config.userAgent || 'http-client/1.0.0'
    }
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new UpholdApiError(
      `API error: ${response.status} ${response.statusText} - ${errorText}`,
      response.status,
      endpoint
    );
  }

  return response.json() as Promise<T>;
}
