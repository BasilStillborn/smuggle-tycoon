export type CountryId = 'china' | 'india' | 'usa' | 'eu' | 'gulf' | 'other';
export type AirportId = 'heathrow' | 'gatwick';
export type CityId = 'london';
export type TripType = 'tourist' | 'student' | 'business';
export type LanguageId = 'english' | 'chinese';

export type ArrivalProfile = {
  country: CountryId;
  language: LanguageId;
  airport: AirportId;
  city: CityId;
  tripType: TripType;
  tripLengthDays: number;
};

export type SelectOption<T extends string> = {
  id: T;
  label: string;
  note: string;
};

export type Airport = SelectOption<AirportId> & {
  terminalTip: string;
  primaryRoutes: string[];
  officialUrl: string;
};

export type ChecklistSection = {
  title: string;
  timeframe: string;
  intent: string;
  items: string[];
};

export const defaultProfile: ArrivalProfile = {
  country: 'china',
  language: 'english',
  airport: 'heathrow',
  city: 'london',
  tripType: 'tourist',
  tripLengthDays: 7,
};

export const countries: Array<SelectOption<CountryId> & { priority: string }> = [
  {
    id: 'china',
    label: 'China',
    note: 'Plan mobile data and payments before landing. UK transport is card-first, not QR-first.',
    priority: 'Check that your bank card or mobile wallet works for UK contactless payments before entering the Tube.',
  },
  {
    id: 'india',
    label: 'India',
    note: 'Forex cards and international debit cards are common, but UPI is not generally accepted in the UK.',
    priority: 'Test your forex or international card at the airport before relying on it for transport gates.',
  },
  {
    id: 'usa',
    label: 'United States',
    note: 'Contactless is widely used. Remember that traffic comes from the opposite side when crossing roads.',
    priority: 'Use one contactless card or phone per traveller on London transport, and tap the same one in and out.',
  },
  {
    id: 'eu',
    label: 'EU / EEA',
    note: 'Mobile roaming rules can vary after Brexit. Check your plan before assuming UK roaming is included.',
    priority: 'Confirm roaming costs or buy an eSIM before using mobile maps and transport apps heavily.',
  },
  {
    id: 'gulf',
    label: 'Gulf region',
    note: 'Weather changes quickly. Card payments are normal, but carry a backup card for transport and hotels.',
    priority: 'Pack a light waterproof layer and keep one backup card separate from your phone.',
  },
  {
    id: 'other',
    label: 'Other country',
    note: 'Start with mobile data, payments, airport transport, and emergency numbers.',
    priority: 'Save your hotel address, emergency numbers, and embassy contact details before leaving the airport.',
  },
];

export const languages: Array<SelectOption<LanguageId>> = [
  { id: 'english', label: 'English', note: 'MVP language' },
  { id: 'chinese', label: '中文 visitor guide', note: 'Chinese-specific sections and phrase cards' },
];

export const airports: Airport[] = [
  {
    id: 'heathrow',
    label: 'London Heathrow',
    note: 'Best for West London and direct Tube or Elizabeth line access.',
    terminalTip: 'Follow purple Elizabeth line signs, blue Piccadilly line signs, or Heathrow Express signs depending on your budget and speed needs.',
    primaryRoutes: ['Elizabeth line to central London', 'Piccadilly line for a cheaper Tube route', 'Heathrow Express to Paddington', 'licensed black cab or pre-booked car'],
    officialUrl: 'https://www.heathrow.com/transport-and-directions',
  },
  {
    id: 'gatwick',
    label: 'London Gatwick',
    note: 'Best for South London, Victoria, London Bridge, and Brighton routes.',
    terminalTip: 'Use the free terminal shuttle if needed, then follow signs to trains for Gatwick Express, Southern, or Thameslink.',
    primaryRoutes: ['Gatwick Express to Victoria', 'Thameslink to London Bridge or St Pancras', 'Southern trains to Victoria', 'coach or pre-booked car'],
    officialUrl: 'https://www.gatwickairport.com/to-and-from/',
  },
];

export const cities: Array<SelectOption<CityId> & { officialTransportUrl: string }> = [
  {
    id: 'london',
    label: 'London',
    note: 'The MVP city. Covers Tube, buses, Elizabeth line, contactless, airport transfers, and visitor basics.',
    officialTransportUrl: 'https://tfl.gov.uk/',
  },
];

export const tripTypes: Array<SelectOption<TripType> & { extra: string }> = [
  {
    id: 'tourist',
    label: 'Tourist',
    note: 'Short-stay sightseeing, family visits, museums, attractions, and day trips.',
    extra: 'Book high-demand attractions early and keep flexible plans for bad weather.',
  },
  {
    id: 'student',
    label: 'Student',
    note: 'University arrival, housing, banking, mobile data, NHS basics, and campus check-in.',
    extra: 'Keep your university arrival instructions, accommodation address, and immigration documents accessible offline.',
  },
  {
    id: 'business',
    label: 'Business',
    note: 'Meetings, airport transfers, receipts, expense records, and reliable transport choices.',
    extra: 'Save receipts for rail, taxis, meals, and airport transfers as you go.',
  },
];

export function getCountry(profile: ArrivalProfile) {
  return countries.find((country) => country.id === profile.country) ?? countries[0];
}

export function getAirport(profile: ArrivalProfile) {
  return airports.find((airport) => airport.id === profile.airport) ?? airports[0];
}

export function getCity(profile: ArrivalProfile) {
  return cities.find((city) => city.id === profile.city) ?? cities[0];
}

export function getTripType(profile: ArrivalProfile) {
  return tripTypes.find((tripType) => tripType.id === profile.tripType) ?? tripTypes[0];
}

export function getChecklist(profile: ArrivalProfile): ChecklistSection[] {
  const airport = getAirport(profile);
  const city = getCity(profile);
  const country = getCountry(profile);
  const tripType = getTripType(profile);

  const tripSpecificItems: Record<TripType, string[]> = {
    tourist: [
      'Check opening hours before travelling to attractions, especially on Mondays and bank holidays.',
      'Do not assume UK VAT-free shopping is available in Great Britain. Check current GOV.UK rules before buying expensive items.',
    ],
    student: [
      'Follow your university check-in instructions before opening bank, GP, or accommodation tasks.',
      'Save your student support contact, accommodation office number, and campus address offline.',
    ],
    business: [
      'Save meeting addresses in maps and allow extra travel time for peak-hour Tube and rail journeys.',
      'Use licensed taxis, black cabs, or reputable ride-hailing for late arrivals and client-facing transfers.',
    ],
  };

  const isChina = profile.country === 'china';
  const chinaArrivalItems = isChina ? [
    'Chinese visitor priority: prepare a Visa/Mastercard or other UK-compatible contactless payment method before leaving the airport.',
    'Do not rely on WeChat Pay or Alipay for London transport, taxis, restaurants, or daily purchases.',
    'Download an English offline translation pack in Baidu Translate before leaving airport Wi-Fi.',
  ] : [];
  const chinaTransferItems = isChina ? [
    'Screenshot your hotel name, English address, and postcode before you leave the terminal.',
    'If using TfL contactless, do not mix a physical card and mobile wallet for the same journey.',
  ] : [];
  const chinaOperatingItems = isChina ? [
    'Save bilingual emergency phrases and the numbers 999 and 111 where you can find them offline.',
    'Use photo translation for signs, menus, ticket machines, and medicine labels instead of guessing.',
    'Keep one physical backup card separate from your phone in case your phone battery dies.',
  ] : [];

  return [
    {
      title: 'Clear arrivals without friction',
      timeframe: 'First 60 minutes',
      intent: 'Get connected, paid, routed, and safe before leaving the airport.',
      items: [
        country.priority,
        ...chinaArrivalItems,
        'Connect to airport Wi-Fi only long enough to activate mobile data or confirm your roaming plan.',
        `Choose your route from ${airport.label}: ${airport.primaryRoutes.slice(0, 3).join(', ')}.`,
        'Save your hotel or accommodation address offline in maps and screenshots.',
        'Save emergency number 999 and NHS non-emergency number 111 in your phone.',
      ],
    },
    {
      title: `Reach ${city.label} with a backup plan`,
      timeframe: 'Airport to city',
      intent: 'Avoid the two classic mistakes: unlicensed taxis and payment-card problems at gates.',
      items: [
        airport.terminalTip,
        ...chinaTransferItems,
        'Use official airport signs for trains, Tube, coaches, black cabs, or pre-booked cars.',
        'If using London transport contactless, tap with the same card or phone every time.',
        'Check for strikes or engineering works before committing to a rail route.',
        'Avoid anyone inside the terminal offering unofficial taxi rides.',
      ],
    },
    {
      title: 'Stabilise your first evening',
      timeframe: 'Day 0',
      intent: 'Turn the UK from confusing to manageable before you sleep.',
      items: [
        'Buy a small bottle of water and a simple snack before late check-in if you arrive after 9pm.',
        'Find the nearest pharmacy, supermarket, and Tube or rail station to your accommodation.',
        'Check the Met Office forecast and plan clothing for rain, wind, and temperature changes.',
        'Keep passport, payment card, and hotel key in separate places when you go out.',
        tripType.extra,
      ],
    },
    {
      title: 'Build your UK operating system',
      timeframe: 'First 3 days',
      intent: 'Set up the tools and habits that stop small problems becoming travel stress.',
      items: [
        'Install or open transport tools such as TfL, Citymapper, National Rail, and your airline app.',
        ...chinaOperatingItems,
        'Learn the difference between emergency care, NHS 111, pharmacy advice, and private travel insurance.',
        'Practise British basics: queueing, standing on the right on escalators, and saying the card machine is not working if payment fails.',
        ...tripSpecificItems[profile.tripType],
      ],
    },
  ];
}
