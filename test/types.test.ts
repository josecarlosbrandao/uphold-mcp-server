/**
 * Module imports.
 */

import { UpholdApiError } from '../src/types';
import { describe, expect, it } from 'vitest';

describe('UpholdApiError', () => {
  it('should create an error with correct properties', () => {
    const error = new UpholdApiError('Test error', 404, '/test');

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('UpholdApiError');
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(404);
    expect(error.endpoint).toBe('/test');
  });

  it('should extend Error class', () => {
    const error = new UpholdApiError('Test error', 500, '/test');

    expect(error).toBeInstanceOf(Error);
    expect(error.stack).toBeDefined();
  });

  it('should handle different status codes', () => {
    const badRequestError = new UpholdApiError('Bad request', 400, '/bad');
    const serverError = new UpholdApiError('Server error', 500, '/error');
    const rateLimitedError = new UpholdApiError('Rate limited', 429, '/limited');

    expect(badRequestError.statusCode).toBe(400);
    expect(serverError.statusCode).toBe(500);
    expect(rateLimitedError.statusCode).toBe(429);
  });
});
