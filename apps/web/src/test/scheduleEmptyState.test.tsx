import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import DashboardSchedule from '@/pages/DashboardSchedule';
import { toLocalDateString } from '@/lib/utils';

vi.mock('@/hooks/usePrayerTimes', async (original) => ({
  ...await original<typeof import('@/hooks/usePrayerTimes')>(),
  usePrayerTimes: () => ({ prayerTimes: null as import('@/hooks/usePrayerTimes').PrayerTimes | null, loading: false }),
  usePrayerTimesForDate: () => ({ prayerTimes: null as import('@/hooks/usePrayerTimes').PrayerTimes | null, loading: false }),
  useRamadanPrayerTimes: () => ({ prayerTimesMap: {}, loading: false, refetch: vi.fn() }),
}));
vi.mock('@/hooks/useLocation', async (original) => ({
  ...await original<typeof import('@/hooks/useLocation')>(),
  useAutoLocation: () => ({ location: null as import('@/hooks/useLocation').LocationResult | null, loading: false }),
}));

describe('Schedule without prayer times', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('tryramadan-preferences', JSON.stringify({ onboardingComplete: true, userType: 'muslim' }));
  });
  function show() {
    return render(<TooltipProvider><MemoryRouter><DashboardSchedule /></MemoryRouter></TooltipProvider>);
  }
  it('shows unavailable times rather than a fabricated countdown', () => {
    show();
    expect(screen.getByText('Prayer times unavailable')).toBeInTheDocument();
    expect(screen.queryByText('00:00:00')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /I'm fasting/i })).toBeEnabled();
  });
  it.each([['illness', 'Broke fast'], ['menstruation', 'Excused (menstruation)']])(
    'shows a recorded %s day instead of not logged', (reason, label) => {
      localStorage.setItem('tryramadan-progress', JSON.stringify({
        completedDays: [], skippedDays: [], fastingLog: [{
          date: toLocalDateString(new Date()), status: 'broken', brokenReason: reason,
        }],
      }));
      show();
      expect(screen.getByText(label)).toBeInTheDocument();
      expect(screen.queryByText('Not logged yet')).not.toBeInTheDocument();
    }
  );
});
