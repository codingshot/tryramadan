import { useEffect, useRef, useState } from 'react';
import { AppState, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { getEffectiveRamadanRange, getRamadanDayNumberInRange } from '@tryramadan/core/ramadan';
import { fastingGuidance, guidanceNotice } from '@tryramadan/core/guidance';

type Status = 'fasting' | 'completed' | 'not-fasting';
type Day = { status?: Status; journal?: string };
type Records = Record<string, Day>;
const STORAGE_KEY = 'tryramadan-native-days-v1';
const todayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

function validRecords(value: unknown): value is Records {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.entries(value).every(([key, entry]) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key) || !entry || typeof entry !== 'object') return false;
    const day = entry as Day;
    return (day.status === undefined || ['fasting', 'completed', 'not-fasting'].includes(day.status)) &&
      (day.journal === undefined || typeof day.journal === 'string');
  });
}

export default function App() {
  const [tab, setTab] = useState<'Today' | 'Journal' | 'Learn'>('Today');
  const [date, setDate] = useState(todayKey);
  const [records, setRecords] = useState<Records>({});
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [journalDate, setJournalDate] = useState(todayKey);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      const parsed: unknown = raw ? JSON.parse(raw) : {};
      if (!validRecords(parsed)) throw new Error('Invalid saved data');
      if (active) { setRecords(parsed); setReady(true); }
    }).catch(() => {
      if (active) setError('Saved data could not be loaded. Restart to retry. No saved data has been overwritten.');
    });
    const updateDate = () => setDate(todayKey());
    const timer = setInterval(updateDate, 30000);
    const subscription = AppState.addEventListener('change', updateDate);
    return () => { active = false; clearInterval(timer); subscription.remove(); };
  }, []);

  async function saveDay(patch: Day, targetDate = date) {
    if (!ready || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError('');
    setMessage('');
    const next = { ...records, [targetDate]: { ...records[targetDate], ...patch } };
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setRecords(next);
      setMessage('Saved on this device.');
    } catch {
      setError('Could not save. Your changes have not been stored; please try again.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  const range = getEffectiveRamadanRange();
  const dayNumber = getRamadanDayNumberInRange(new Date(`${date}T12:00:00`), range.start, range.end);
  const day = records[date];
  const draft = drafts[journalDate] ?? records[journalDate]?.journal ?? '';
  const completed = Object.values(records).filter((entry) => entry.status === 'completed').length;
  const disabled = !ready || saving;
  const openSource = (url: string) => Linking.openURL(url).catch(() => setError('Could not open this source. Check your connection and try again.'));

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.eyebrow}>TRYRAMADAN · YOUR DAILY COMPANION</Text>
          <Text accessibilityRole="header" style={styles.heading}>{tab === 'Today' ? 'A little intention.\nA meaningful day.' : tab}</Text>
          <Text style={styles.body}>{date} · {dayNumber ? `Ramadan day ${dayNumber} (estimated)` : 'Make space for reflection'}</Text>
          <View accessibilityRole="tablist" style={styles.tabs}>
            {(['Today', 'Journal', 'Learn'] as const).map((name) => (
              <Pressable key={name} accessibilityRole="tab" accessibilityState={{ selected: tab === name }}
                onPress={() => { setTab(name); if (name === 'Journal') setJournalDate(date); setMessage(''); }} style={[styles.tab, tab === name && styles.activeTab]}>
                <Text style={tab === name ? styles.activeText : styles.tabText}>{name}</Text>
              </Pressable>
            ))}
          </View>
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          {message ? <Text accessibilityLiveRegion="polite" style={styles.body}>{message}</Text> : null}
          {!ready && !error ? <Text style={styles.body}>Loading your saved entries…</Text> : null}

          {tab === 'Today' ? <>
            <View style={styles.card}>
              <Text style={styles.eyebrow}>TODAY’S CHECK-IN</Text>
              <Text accessibilityRole="header" style={styles.cardTitle}>{day?.status === 'completed' ? 'Fast recorded' : day?.status === 'fasting' ? 'Fasting today' : day?.status === 'not-fasting' ? 'Taking care of yourself' : 'How is your day going?'}</Text>
              <Text style={styles.body}>This is your personal log, not a ruling on the validity of a fast. Rest and legitimate exemptions are not failures.</Text>
              {(['fasting', 'completed', 'not-fasting'] as const).map((status) => (
                <Pressable key={status} accessibilityRole="button" disabled={disabled}
                  accessibilityState={{ disabled, selected: day?.status === status }}
                  onPress={() => saveDay({ status })} style={[styles.button, disabled && styles.disabled]}>
                  <Text style={styles.activeText}>{status === 'fasting' ? 'I am fasting' : status === 'completed' ? 'Record completed fast' : 'Not fasting today'}</Text>
                </Pressable>
              ))}
              <Text style={styles.caption}>{completed} completed {completed === 1 ? 'day' : 'days'} recorded · You can correct today’s selection.</Text>
            </View>
            <View style={styles.card}>
              <Text accessibilityRole="header" style={styles.cardTitle}>Plan with your community</Text>
              <Text style={styles.body}>Estimated next/current Ramadan: {range.startStr} – {range.endStr}. Dates depend on moon sighting. Confirm your local dates and Fajr/Maghrib times; this screen is not a prayer timetable.</Text>
            </View>
          </> : null}

          {tab === 'Journal' ? <View style={styles.card}>
            <Text accessibilityRole="header" style={styles.cardTitle}>What are you grateful for today?</Text>
            <Text style={styles.caption}>Reflection for {journalDate}{journalDate !== date ? ' · Started before midnight; save here to keep the original date.' : ''}</Text>
            <Text style={styles.body}>A quiet place to reflect. Entries stay on this device; web and native storage do not sync.</Text>
            <TextInput accessibilityLabel="Today’s reflection" multiline editable={!disabled} value={draft}
              onChangeText={(value) => setDrafts((prev) => ({ ...prev, [journalDate]: value }))} placeholder="One thing I noticed today…" placeholderTextColor="#617367"
              maxLength={10000} textAlignVertical="top" style={styles.input} />
            <Pressable accessibilityRole="button" disabled={disabled} accessibilityState={{ disabled }}
              onPress={() => saveDay({ journal: draft }, journalDate)} style={[styles.button, disabled && styles.disabled]}>
              <Text style={styles.activeText}>{saving ? 'Saving…' : 'Save reflection'}</Text>
            </Pressable>
            {Object.entries(records).filter(([key, entry]) => key !== date && entry.journal).sort(([a], [b]) => b.localeCompare(a)).map(([key, entry]) => (
              <View key={key} style={styles.history}><Text style={styles.eyebrow}>{key}</Text><Text style={styles.body}>{entry.journal}</Text></View>
            ))}
          </View> : null}

          {tab === 'Learn' ? <>
            <Text style={styles.body}>{guidanceNotice}</Text>
            {fastingGuidance.map((item) => <View key={item.id} style={styles.card}>
              <Text accessibilityRole="header" style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.body}>{item.summary}</Text>
              <Pressable accessibilityRole="link" onPress={() => openSource(item.url)} style={styles.source}>
                <Text style={styles.link}>Read source: {item.source} ↗</Text>
              </Pressable>
            </View>)}
          </> : null}
          <Text style={styles.caption}>If fasting may harm you, seek medical advice. This app does not assess whether it is safe for you to fast.</Text>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f6f4eb' },
  content: { padding: 24, paddingBottom: 48, gap: 18, width: '100%', maxWidth: 760, alignSelf: 'center' },
  eyebrow: { color: '#43604c', fontSize: 11, fontWeight: '700', letterSpacing: 1.8 },
  heading: { fontSize: 36, lineHeight: 42, color: '#173e2d', fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 25, color: '#354c40' },
  tabs: { flexDirection: 'row', gap: 8, paddingVertical: 6 },
  tab: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 24, borderWidth: 1, borderColor: '#b7c7b8' },
  activeTab: { backgroundColor: '#173e2d', borderColor: '#173e2d' },
  tabText: { color: '#173e2d', fontWeight: '600' },
  activeText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  card: { padding: 24, backgroundColor: '#ffffff', borderRadius: 20, borderWidth: 1, borderColor: '#dce3d8', gap: 14 },
  cardTitle: { fontSize: 23, color: '#173e2d', fontWeight: '600' },
  button: { minHeight: 48, padding: 14, backgroundColor: '#245c42', borderRadius: 12, alignItems: 'center' },
  disabled: { opacity: 0.5 },
  caption: { color: '#526556', fontSize: 13, lineHeight: 20 },
  input: { minHeight: 180, padding: 16, borderWidth: 1, borderColor: '#97ae9c', borderRadius: 12, fontSize: 16, color: '#173e2d' },
  history: { borderTopWidth: 1, borderTopColor: '#dce3d8', paddingTop: 16, gap: 8 },
  source: { minHeight: 44, justifyContent: 'center' },
  link: { color: '#245c42', textDecorationLine: 'underline', fontSize: 14 },
  error: { color: '#982e2e', fontSize: 15, lineHeight: 23 },
});
