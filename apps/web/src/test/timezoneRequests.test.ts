import { afterEach, describe, expect, it, vi } from 'vitest';
import { getTimezoneFromCoords } from '../hooks/useLocation';

afterEach(() => vi.restoreAllMocks());
describe('timezone request resilience', () => {
  it('deduplicates concurrent requests across mounted consumers', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, json: async () => ({ timeZone: 'Europe/London' }) } as Response);
    expect(await Promise.all([getTimezoneFromCoords(51.5, -0.12), getTimezoneFromCoords(51.5, -0.12)])).toEqual(['Europe/London', 'Europe/London']);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('negative-caches failures rather than retrying on every render', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false } as Response);
    expect(await getTimezoneFromCoords(10, 20)).toBeNull();
    expect(await getTimezoneFromCoords(10, 20)).toBeNull();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('rejects invalid coordinates before sending a request', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch');
    expect(await getTimezoneFromCoords(NaN, 20)).toBeNull();
    expect(await getTimezoneFromCoords(91, 20)).toBeNull();
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('does not persist an invalid IANA timezone from the API', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, json: async () => ({ timeZone: 'not/a-zone' }) } as Response);
    expect(await getTimezoneFromCoords(12, 30)).toBeNull();
  });
});
