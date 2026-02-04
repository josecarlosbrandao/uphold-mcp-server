/**
 * API Error class for Uphold-specific errors.
 */

export class UpholdApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public endpoint: string
  ) {
    super(message);
    this.name = 'UpholdApiError';
  }
}

/**
 * Asset response from Uphold API.
 */

export interface Asset {
  code: string;
  name: string;
  status: string;
  type: string;
}

/**
 * Country response from Uphold API.
 */

export interface Country {
  code: string;
  currency: string;
  name: string;
}

/**
 * Ticker response from Uphold API.
 */

export interface Ticker {
  ask: string;
  bid: string;
  currency: string;
  pair: string;
}
