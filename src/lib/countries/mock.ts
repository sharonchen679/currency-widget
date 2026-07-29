import type { Country } from "@/types/country";

/**
 * Small fixture set for local UI / API testing without burning API quota.
 * Canada values mirror the design screenshots.
 */
export const MOCK_COUNTRIES: Country[] = [
  {
    code: "CA",
    name: "Canada",
    nativeName: "Canada",
    flagPng: "https://flagcdn.com/w320/ca.png",
    flagSvg: "https://flagcdn.com/ca.svg",
    flagEmoji: "🇨🇦",
    capital: "Ottawa",
    region: "Americas",
    subregion: "North America",
    currencies: [
      { code: "CAD", name: "Canadian dollar", symbol: "$" },
    ],
    population: 38005238,
    timezones: [
      "UTC-08:00",
      "UTC-07:00",
      "UTC-06:00",
      "UTC-05:00",
      "UTC-04:00",
      "UTC-03:30",
    ],
  },
  {
    code: "AU",
    name: "Australia",
    nativeName: "Australia",
    flagPng: "https://flagcdn.com/w320/au.png",
    flagSvg: "https://flagcdn.com/au.svg",
    flagEmoji: "🇦🇺",
    capital: "Canberra",
    region: "Oceania",
    subregion: "Australia and New Zealand",
    currencies: [
      { code: "AUD", name: "Australian dollar", symbol: "$" },
    ],
    population: 25687041,
    timezones: [
      "UTC+08:00",
      "UTC+09:30",
      "UTC+10:00",
      "UTC+10:30",
      "UTC+11:00",
    ],
  },
  {
    code: "BR",
    name: "Brazil",
    nativeName: "Brasil",
    flagPng: "https://flagcdn.com/w320/br.png",
    flagSvg: "https://flagcdn.com/br.svg",
    flagEmoji: "🇧🇷",
    capital: "Brasília",
    region: "Americas",
    subregion: "South America",
    currencies: [
      { code: "BRL", name: "Brazilian real", symbol: "R$" },
    ],
    population: 212559417,
    timezones: ["UTC-05:00", "UTC-04:00", "UTC-03:00", "UTC-02:00"],
  },
  {
    code: "CN",
    name: "China",
    nativeName: "中国",
    flagPng: "https://flagcdn.com/w320/cn.png",
    flagSvg: "https://flagcdn.com/cn.svg",
    flagEmoji: "🇨🇳",
    capital: "Beijing",
    region: "Asia",
    subregion: "Eastern Asia",
    currencies: [
      { code: "CNY", name: "Chinese yuan", symbol: "¥" },
    ],
    population: 1402112000,
    timezones: ["UTC+08:00"],
  },
];
