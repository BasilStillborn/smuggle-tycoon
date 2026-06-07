import {
  airports,
  cities,
  countries,
  defaultProfile,
  languages,
  tripTypes,
  type AirportId,
  type ArrivalProfile,
  type CityId,
  type CountryId,
  type LanguageId,
  type TripType,
} from '../data/arrivals';

const storageKey = 'first-week-britain-profile-v1';

function isCountry(value: unknown): value is CountryId {
  return typeof value === 'string' && countries.some((country) => country.id === value);
}

function isLanguage(value: unknown): value is LanguageId {
  return typeof value === 'string' && languages.some((language) => language.id === value);
}

function isAirport(value: unknown): value is AirportId {
  return typeof value === 'string' && airports.some((airport) => airport.id === value);
}

function isCity(value: unknown): value is CityId {
  return typeof value === 'string' && cities.some((city) => city.id === value);
}

function isTripType(value: unknown): value is TripType {
  return typeof value === 'string' && tripTypes.some((tripType) => tripType.id === value);
}

function normaliseTripLength(value: unknown) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return defaultProfile.tripLengthDays;
  }

  return Math.min(365, Math.max(1, Math.round(parsed)));
}

export function loadSavedProfile(): ArrivalProfile | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<ArrivalProfile>;

    return {
      country: isCountry(parsed.country) ? parsed.country : defaultProfile.country,
      language: isLanguage(parsed.language) ? parsed.language : defaultProfile.language,
      airport: isAirport(parsed.airport) ? parsed.airport : defaultProfile.airport,
      city: isCity(parsed.city) ? parsed.city : defaultProfile.city,
      tripType: isTripType(parsed.tripType) ? parsed.tripType : defaultProfile.tripType,
      tripLengthDays: normaliseTripLength(parsed.tripLengthDays),
    };
  } catch {
    return null;
  }
}

export function saveProfile(profile: ArrivalProfile) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(profile));
}
