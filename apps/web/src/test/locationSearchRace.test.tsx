import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LocationSearch } from '@/components/LocationSearch';
import { searchLocations, type LocationResult } from '@/hooks/useLocation';

vi.mock('@/hooks/useLocation', () => ({ searchLocations: vi.fn(), getLocationFromIP: vi.fn() }));
const location = (name: string): LocationResult => ({ name, displayName: name, lat: 1, lng: 1, country: 'Test' });

describe('Location search asynchronous edge cases', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.mocked(searchLocations).mockReset(); });
  afterEach(() => vi.useRealTimers());

  it('does not replace a newer query with a late response', async () => {
    let resolveOld!: (value: LocationResult[]) => void;
    vi.mocked(searchLocations).mockReturnValueOnce(new Promise(resolve => { resolveOld = resolve; }))
      .mockResolvedValueOnce([location('Paris')]);
    render(<LocationSearch value="" onSelect={() => {}} />);
    const input = screen.getByRole('textbox');
    input.focus();
    fireEvent.change(input, { target: { value: 'London' } });
    await act(async () => { await vi.advanceTimersByTimeAsync(300); });
    fireEvent.change(input, { target: { value: 'Paris' } });
    await act(async () => { await vi.advanceTimersByTimeAsync(300); });
    await act(async () => resolveOld([location('London')]));
    expect(screen.getByRole('button', { name: 'Select Paris, Test' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Select London, Test' })).not.toBeInTheDocument();
  });

  it('clearing search prevents pending results from reopening', async () => {
    let resolve!: (value: LocationResult[]) => void;
    vi.mocked(searchLocations).mockReturnValue(new Promise(done => { resolve = done; }));
    render(<LocationSearch value="" onSelect={() => {}} />);
    const input = screen.getByRole('textbox');
    input.focus();
    fireEvent.change(input, { target: { value: 'London' } });
    await act(async () => { await vi.advanceTimersByTimeAsync(300); });
    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    await act(async () => resolve([location('London')]));
    expect(input).toHaveValue('');
    expect(screen.queryByRole('button', { name: 'Select London, Test' })).not.toBeInTheDocument();
  });
});
