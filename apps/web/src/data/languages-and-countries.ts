/**
 * Language and country options for Settings (display + future i18n).
 * Flag is emoji; value is stored in preferences.
 */

export interface LanguageOption {
  value: string;
  label: string;
  flag: string;
}

export interface CountryOption {
  value: string;
  label: string;
  flag: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "ar", label: "العربية", flag: "🇸🇦" },
  { value: "ur", label: "Urdu", flag: "🇵🇰" },
  { value: "fr", label: "Français", flag: "🇫🇷" },
  { value: "tr", label: "Türkçe", flag: "🇹🇷" },
  { value: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
  { value: "ms", label: "Bahasa Melayu", flag: "🇲🇾" },
  { value: "bn", label: "বাংলা", flag: "🇧🇩" },
];

export const COUNTRY_OPTIONS: CountryOption[] = [
  { value: "US", label: "United States", flag: "🇺🇸" },
  { value: "GB", label: "United Kingdom", flag: "🇬🇧" },
  { value: "CA", label: "Canada", flag: "🇨🇦" },
  { value: "AU", label: "Australia", flag: "🇦🇺" },
  { value: "SA", label: "Saudi Arabia", flag: "🇸🇦" },
  { value: "AE", label: "United Arab Emirates", flag: "🇦🇪" },
  { value: "EG", label: "Egypt", flag: "🇪🇬" },
  { value: "PK", label: "Pakistan", flag: "🇵🇰" },
  { value: "IN", label: "India", flag: "🇮🇳" },
  { value: "ID", label: "Indonesia", flag: "🇮🇩" },
  { value: "MY", label: "Malaysia", flag: "🇲🇾" },
  { value: "TR", label: "Turkey", flag: "🇹🇷" },
  { value: "FR", label: "France", flag: "🇫🇷" },
  { value: "DE", label: "Germany", flag: "🇩🇪" },
  { value: "BD", label: "Bangladesh", flag: "🇧🇩" },
  { value: "QA", label: "Qatar", flag: "🇶🇦" },
  { value: "KW", label: "Kuwait", flag: "🇰🇼" },
  { value: "JO", label: "Jordan", flag: "🇯🇴" },
  { value: "OTHER", label: "Other", flag: "🌐" },
];
