import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageSEO } from "@/components/PageSEO";
import { LocationSearch } from "@/components/LocationSearch";
import { fetchPrayerTimesForDateAsync, type PrayerTimes } from "@/hooks/usePrayerTimes";
import { useUserPreferences } from "@/hooks/useLocalStorage";
import { DEFAULT_PRAYER_METHOD_ID } from "@/lib/prayerCalculation";
import { timeStringToSecondsSinceMidnight } from "@/lib/utils";
import { getRamadanStartForYear, getRamadanEndForYear, isRamadanDay } from "@/lib/ramadan";
import type { LocationResult } from "@/hooks/useLocation";
import { MapPin, Trash2, Loader2, Calendar, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { toLocalDateString } from "@/lib/utils";

/** Preset cities for quick comparison (name, lat, lng). */
const PRESET_REGIONS: { name: string; lat: number; lng: number; country?: string }[] = [
  { name: "London", lat: 51.5074, lng: -0.1278, country: "United Kingdom" },
  { name: "New York", lat: 40.7128, lng: -74.006, country: "United States" },
  { name: "Dubai", lat: 25.2048, lng: 55.2708, country: "United Arab Emirates" },
  { name: "Jakarta", lat: -6.2088, lng: 106.8456, country: "Indonesia" },
  { name: "Istanbul", lat: 41.0082, lng: 28.9784, country: "Turkey" },
  { name: "Cairo", lat: 30.0444, lng: 31.2357, country: "Egypt" },
  { name: "Sydney", lat: -33.8688, lng: 151.2093, country: "Australia" },
];

type SortKey = "name" | "fajr" | "maghrib" | "hours";
type SortDir = "asc" | "desc";

interface CompareRegion {
  id: string;
  name: string;
  lat: number;
  lng: number;
  country?: string;
}

interface RowData {
  region: CompareRegion;
  fajr: string;
  maghrib: string;
  hours: number | null;
  error?: boolean;
}

/** Fasting hours from fajr (suhoor end) to maghrib (iftar). */
function fastingHours(fajr: string | undefined, maghrib: string | undefined): number | null {
  if (!fajr?.trim() || !maghrib?.trim()) return null;
  const fajrSec = timeStringToSecondsSinceMidnight(fajr.trim().split(" ")[0] ?? fajr);
  const maghribSec = timeStringToSecondsSinceMidnight(maghrib.trim().split(" ")[0] ?? maghrib);
  const diffSec = maghribSec - fajrSec;
  if (diffSec <= 0) return null;
  return Math.round((diffSec / 3600) * 10) / 10;
}

/** Default date: first day of current/next Ramadan, or today if in Ramadan. */
function getDefaultCompareDate(): string {
  const today = new Date();
  if (isRamadanDay(today)) return toLocalDateString(today);
  const start = getRamadanStartForYear(today.getFullYear());
  if (today < start) return toLocalDateString(start);
  const nextStart = getRamadanStartForYear(today.getFullYear() + 1);
  return toLocalDateString(nextStart);
}

/** Parse YYYY-MM-DD to readable label. */
function formatDateLabel(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

export default function RamadanCompare() {
  const [preferences] = useUserPreferences();
  const method = preferences.prayerCalculationMethod ?? DEFAULT_PRAYER_METHOD_ID;
  const [regions, setRegions] = useState<CompareRegion[]>(() =>
    PRESET_REGIONS.slice(0, 4).map((r, i) => ({
      id: `preset-${i}-${r.lat}`,
      name: r.name,
      lat: r.lat,
      lng: r.lng,
      country: r.country,
    }))
  );
  const [compareDate, setCompareDate] = useState<string>(getDefaultCompareDate);
  const [rows, setRows] = useState<RowData[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("hours");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [locationSearchValue, setLocationSearchValue] = useState("");

  const fetchAll = useCallback(async () => {
    if (regions.length === 0) {
      setRows([]);
      return;
    }
    setLoading(true);
    try {
      const results = await Promise.all(
        regions.map(async (r) => {
          const pt: PrayerTimes | null = await fetchPrayerTimesForDateAsync(r.lat, r.lng, compareDate, method);
          if (!pt) {
            return { region: r, fajr: "—", maghrib: "—", hours: null, error: true };
          }
          const hrs = fastingHours(pt.fajr, pt.maghrib);
          return {
            region: r,
            fajr: pt.fajr || "—",
            maghrib: pt.maghrib || "—",
            hours: hrs,
            error: false,
          };
        })
      );
      setRows(results);
    } finally {
      setLoading(false);
    }
  }, [regions, compareDate, method]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const addRegion = useCallback((loc: LocationResult) => {
    const name = loc.name || loc.displayName?.split(",")[0]?.trim() || "Unknown";
    const id = `custom-${loc.lat}-${loc.lng}-${Date.now()}`;
    setRegions((prev) => {
      const exists = prev.some((r) => Math.abs(r.lat - loc.lat) < 0.01 && Math.abs(r.lng - loc.lng) < 0.01);
      if (exists) return prev;
      return [...prev, { id, name, lat: loc.lat, lng: loc.lng, country: loc.country }];
    });
    setLocationSearchValue("");
  }, []);

  const removeRegion = useCallback((id: string) => {
    setRegions((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const toggleSort = useCallback((key: SortKey) => {
    setSortKey((prevKey) => {
      if (prevKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return key;
      }
      setSortDir(key === "name" ? "asc" : "desc");
      return key;
    });
  }, []);

  const sortedRows = [...rows].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case "name":
        cmp = (a.region.name || "").localeCompare(b.region.name || "");
        break;
      case "fajr":
        cmp = (a.fajr || "").localeCompare(b.fajr || "");
        break;
      case "maghrib":
        cmp = (a.maghrib || "").localeCompare(b.maghrib || "");
        break;
      case "hours":
        cmp = (a.hours ?? 0) - (b.hours ?? 0);
        break;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const minDate = toLocalDateString(getRamadanStartForYear(new Date().getFullYear() - 1));
  const maxDate = toLocalDateString(getRamadanEndForYear(new Date().getFullYear() + 1));

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Compare Ramadan Fasting Times by City | TryRamadan",
    description: "Compare suhoor end (Fajr), iftar (Maghrib), and total fasting hours across cities worldwide. See how fasting duration varies by region.",
    url: "https://tryramadan.app/compare",
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageSEO
        title="Compare Ramadan Fasting Times by City | TryRamadan"
        description="Compare suhoor end (Fajr), iftar (Maghrib), and total fasting hours across cities worldwide. See how fasting duration varies by region."
        path="/compare"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Compare fasting times by region
        </h1>
        <p className="text-muted-foreground mb-6">
          See suhoor end (Fajr), iftar (Maghrib), and total fasting duration for any date. Add cities below or use the presets.
        </p>

        {/* Date picker */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Calendar className="w-4 h-4" aria-hidden />
            Date
          </label>
          <input
            type="date"
            value={compareDate}
            min={minDate}
            max={maxDate}
            onChange={(e) => setCompareDate(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-secondary focus:ring-1 focus:ring-secondary"
            aria-label="Select date to compare"
          />
          <span className="text-sm text-muted-foreground">{formatDateLabel(compareDate)}</span>
        </div>

        {/* Add location */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">Add a city</label>
          <div className="max-w-md">
            <LocationSearch
              value={locationSearchValue}
              onSelect={addRegion}
              placeholder="Search city to add..."
            />
          </div>
        </div>

        {/* Table */}
        {loading && regions.length > 0 ? (
          <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
            <span>Loading times…</span>
          </div>
        ) : regions.length === 0 ? (
          <p className="text-muted-foreground py-8">Add at least one region above to compare.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="p-3 font-semibold text-foreground">
                    <button
                      type="button"
                      onClick={() => toggleSort("name")}
                      className="inline-flex items-center gap-1 hover:text-secondary focus:outline-none focus:underline"
                    >
                      Region
                      {sortKey === "name" ? sortDir === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" /> : <ArrowUpDown className="w-4 h-4 opacity-50" />}
                    </button>
                  </th>
                  <th className="p-3 font-semibold text-foreground">
                    <button
                      type="button"
                      onClick={() => toggleSort("fajr")}
                      className="inline-flex items-center gap-1 hover:text-secondary focus:outline-none focus:underline"
                    >
                      Fasting start (Fajr)
                      {sortKey === "fajr" ? sortDir === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" /> : <ArrowUpDown className="w-4 h-4 opacity-50" />}
                    </button>
                  </th>
                  <th className="p-3 font-semibold text-foreground">
                    <button
                      type="button"
                      onClick={() => toggleSort("maghrib")}
                      className="inline-flex items-center gap-1 hover:text-secondary focus:outline-none focus:underline"
                    >
                      Fasting end (Maghrib)
                      {sortKey === "maghrib" ? sortDir === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" /> : <ArrowUpDown className="w-4 h-4 opacity-50" />}
                    </button>
                  </th>
                  <th className="p-3 font-semibold text-foreground">
                    <button
                      type="button"
                      onClick={() => toggleSort("hours")}
                      className="inline-flex items-center gap-1 hover:text-secondary focus:outline-none focus:underline"
                    >
                      Total fasting hours
                      {sortKey === "hours" ? sortDir === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" /> : <ArrowUpDown className="w-4 h-4 opacity-50" />}
                    </button>
                  </th>
                  <th className="p-3 w-10" aria-label="Remove" />
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row) => (
                  <tr key={row.region.id} className="border-b border-border last:border-b-0 hover:bg-muted/20">
                    <td className="p-3">
                      <span className="font-medium text-foreground">{row.region.name}</span>
                      {row.region.country && (
                        <span className="block text-xs text-muted-foreground">{row.region.country}</span>
                      )}
                    </td>
                    <td className="p-3 text-foreground">{row.error ? "—" : row.fajr}</td>
                    <td className="p-3 text-foreground">{row.error ? "—" : row.maghrib}</td>
                    <td className="p-3 text-foreground">
                      {row.error ? "—" : row.hours != null ? `${row.hours}h` : "—"}
                    </td>
                    <td className="p-2">
                      <button
                        type="button"
                        onClick={() => removeRegion(row.region.id)}
                        className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive focus:outline-none focus:ring-2 focus:ring-ring"
                        aria-label={`Remove ${row.region.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-6 text-sm text-muted-foreground">
          Times use the <a href="https://aladhan.com" target="_blank" rel="noopener noreferrer" className="text-secondary underline">Aladhan</a> calculation method (Muslim World League). Actual times may vary by local sighting.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            to="/dashboard/schedule"
            className="inline-flex items-center gap-2 rounded-xl bg-secondary text-secondary-foreground px-4 py-2 font-medium hover:opacity-90"
          >
            <MapPin className="w-4 h-4" />
            My schedule
          </Link>
          <Link to="/" className="text-muted-foreground hover:text-foreground underline">
            Back to home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
