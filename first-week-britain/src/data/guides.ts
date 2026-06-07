import type { AirportId, ArrivalProfile, TripType } from './arrivals';

export type GuideAction = {
  label: string;
  href?: string;
  kind: 'official' | 'partner' | 'tool';
};

export type GuideCard = {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  steps: string[];
  actions: GuideAction[];
  goodFor: string;
};

export type OfficialLink = {
  label: string;
  description: string;
  href: string;
  tag: string;
};

export type PhraseCard = {
  situation: string;
  sayThis: string;
  means: string;
};

const coreGuideCards: GuideCard[] = [
  {
    id: 'mobile-data',
    eyebrow: 'Step 1',
    title: 'Get mobile data before you need it',
    summary: 'Maps, train disruption, ticket emails, and hotel messages all depend on data. Treat it as arrival infrastructure.',
    steps: [
      'Check roaming before departure or buy an eSIM that activates on arrival.',
      'Keep airport Wi-Fi as a backup, not your main plan.',
      'Download offline maps around your airport, hotel, and first station.',
    ],
    actions: [
      { label: 'Partner eSIM slot', kind: 'partner' },
      { label: 'Compare later', kind: 'tool' },
    ],
    goodFor: 'Everyone, especially first-time visitors and students.',
  },
  {
    id: 'payments',
    eyebrow: 'Step 2',
    title: 'Use UK payments without panic',
    summary: 'The UK is heavily contactless. Cash is useful as backup, but cards and mobile wallets are the default in cities.',
    steps: [
      'Test your card with a small purchase before relying on it for transport gates.',
      'Use one card or phone per person on London transport. Do not swap between card and phone for the same journey.',
      'Tell your bank you are travelling if it commonly blocks foreign transactions.',
    ],
    actions: [
      { label: 'TfL contactless guidance', href: 'https://tfl.gov.uk/fares/contactless-and-oyster-account', kind: 'official' },
      { label: 'Currency tool slot', kind: 'tool' },
    ],
    goodFor: 'Visitors from card-first and QR-first markets.',
  },
  {
    id: 'airport-transfer',
    eyebrow: 'Step 3',
    title: 'Pick the right airport transfer',
    summary: 'Fastest is not always best. Your correct route depends on luggage, arrival time, hotel area, and rail disruption.',
    steps: [
      'Use official airport transport pages for current rail, Tube, coach, and road information.',
      'Late-night arrival with heavy luggage may justify a licensed taxi or pre-booked transfer.',
      'Avoid unofficial drivers approaching you inside the terminal.',
    ],
    actions: [
      { label: 'Transfer partner slot', kind: 'partner' },
      { label: 'National Rail', href: 'https://www.nationalrail.co.uk/', kind: 'official' },
    ],
    goodFor: 'Families, late arrivals, business travellers, and visitors with large luggage.',
  },
  {
    id: 'transport',
    eyebrow: 'Step 4',
    title: 'Understand London transport basics',
    summary: 'The Tube, Elizabeth line, buses, and national rail are separate-feeling systems that overlap. Learn the rules once.',
    steps: [
      'On escalators, stand on the right and walk on the left.',
      'For buses, usually tap only when boarding. For Tube and rail, tap in and tap out where gates or readers exist.',
      'Check last trains and engineering works before late evening plans.',
    ],
    actions: [
      { label: 'TfL journey planner', href: 'https://tfl.gov.uk/plan-a-journey/', kind: 'official' },
      { label: 'Citymapper', href: 'https://citymapper.com/london', kind: 'tool' },
    ],
    goodFor: 'Anyone staying in London more than one day.',
  },
  {
    id: 'health',
    eyebrow: 'Safety',
    title: 'Know who to call before you are stressed',
    summary: 'The UK has different routes for emergencies, urgent advice, pharmacy help, and travel insurance claims.',
    steps: [
      'Call 999 for immediate danger, serious injury, fire, or crime in progress.',
      'Use NHS 111 for urgent medical advice when it is not an emergency.',
      'Pharmacists can advise on minor illness and common medicines.',
    ],
    actions: [
      { label: 'NHS 111 online', href: 'https://111.nhs.uk/', kind: 'official' },
      { label: 'Insurance partner slot', kind: 'partner' },
    ],
    goodFor: 'Every traveller, especially families and students.',
  },
  {
    id: 'etiquette',
    eyebrow: 'Local rules',
    title: 'Avoid small mistakes that feel big',
    summary: 'Most UK friction comes from hidden norms: queueing, payment manners, road direction, and public transport etiquette.',
    steps: [
      'Queue visibly and wait your turn, even when there is no barrier.',
      'Look right first when crossing roads, then left, then right again.',
      'Tipping is not required everywhere. Restaurants may add a service charge to the bill.',
    ],
    actions: [
      { label: 'Common scams guide slot', kind: 'tool' },
    ],
    goodFor: 'First-time visitors and anyone nervous about local manners.',
  },
];

const tripGuideCards: Record<TripType, GuideCard[]> = {
  tourist: [
    {
      id: 'attractions',
      eyebrow: 'Tourist mode',
      title: 'Book the things that actually sell out',
      summary: 'London has many free museums, but some viewpoints, tours, theatre, and temporary exhibitions need planning.',
      steps: [
        'Check official attraction sites before buying through resellers.',
        'Keep one rainy-day plan and one low-energy plan each day.',
        'For day trips, check last train times before booking dinner or theatre afterwards.',
      ],
      actions: [
        { label: 'Attraction partner slot', kind: 'partner' },
      ],
      goodFor: 'Short stays and family trips.',
    },
  ],
  student: [
    {
      id: 'student-arrival',
      eyebrow: 'Student mode',
      title: 'Separate university tasks from travel tasks',
      summary: 'Your first week is not just sightseeing. It is check-in, housing, banking, campus support, and health setup.',
      steps: [
        'Follow your university arrival checklist before taking advice from random forums.',
        'Save accommodation check-in windows and emergency accommodation contact details.',
        'Ask your university about GP registration, banking letters, and student travel discounts.',
      ],
      actions: [
        { label: 'Student banking slot', kind: 'partner' },
      ],
      goodFor: 'International students and parents.',
    },
  ],
  business: [
    {
      id: 'business-arrival',
      eyebrow: 'Business mode',
      title: 'Protect time and receipts',
      summary: 'The business version of the app should prevent late arrivals, missing receipts, and confusing expense records.',
      steps: [
        'Add buffer time for airport immigration, rail transfers, and peak-hour Tube journeys.',
        'Keep receipts for train tickets, taxis, meals, and mobile data.',
        'Use pre-booked transfers when arrival reliability matters more than price.',
      ],
      actions: [
        { label: 'Business transfer slot', kind: 'partner' },
      ],
      goodFor: 'Meetings, conferences, and short corporate trips.',
    },
  ],
};

export const phraseCards: PhraseCard[] = [
  {
    situation: 'At a station gate',
    sayThis: 'My card did not work. Can you help me, please?',
    means: 'Use this when a contactless card or ticket gate fails.',
  },
  {
    situation: 'At a pharmacy',
    sayThis: 'I need advice for a minor illness. Do I need to see a doctor?',
    means: 'Pharmacists can guide common medicine and next steps.',
  },
  {
    situation: 'In a taxi or ride-hail',
    sayThis: 'Please take me to this address. Can I pay by card?',
    means: 'Show the address on your phone and confirm payment before leaving.',
  },
  {
    situation: 'At a restaurant',
    sayThis: 'Is service charge included?',
    means: 'Checks whether tipping has already been added to the bill.',
  },
];

const airportOfficialLinks: Record<AirportId, OfficialLink> = {
  heathrow: {
    label: 'Heathrow transport',
    description: 'Official live information for Heathrow trains, Tube, coaches, parking, and taxis.',
    href: 'https://www.heathrow.com/transport-and-directions',
    tag: 'Airport',
  },
  gatwick: {
    label: 'Gatwick transport',
    description: 'Official routes to and from Gatwick, including trains, coaches, taxis, and terminal transfer.',
    href: 'https://www.gatwickairport.com/to-and-from/',
    tag: 'Airport',
  },
};

export function getGuideCards(profile: ArrivalProfile): GuideCard[] {
  return [...coreGuideCards, ...tripGuideCards[profile.tripType]];
}

export function getOfficialLinks(airportId: AirportId): OfficialLink[] {
  return [
    {
      label: 'Check if you need a UK visa',
      description: 'GOV.UK tool for official visa and entry guidance by nationality and reason for travel.',
      href: 'https://www.gov.uk/check-uk-visa',
      tag: 'GOV.UK',
    },
    airportOfficialLinks[airportId],
    {
      label: 'Transport for London',
      description: 'Official London Tube, bus, tram, Elizabeth line, fares, and journey planning information.',
      href: 'https://tfl.gov.uk/',
      tag: 'Transport',
    },
    {
      label: 'National Rail',
      description: 'Official UK rail journey planning, disruption information, and live departure boards.',
      href: 'https://www.nationalrail.co.uk/',
      tag: 'Rail',
    },
    {
      label: 'NHS 111 online',
      description: 'Urgent medical advice for non-emergencies. Use 999 for life-threatening emergencies.',
      href: 'https://111.nhs.uk/',
      tag: 'Health',
    },
    {
      label: 'Met Office forecast',
      description: 'Official UK weather forecasts and warnings. Useful before day trips and outdoor plans.',
      href: 'https://www.metoffice.gov.uk/',
      tag: 'Weather',
    },
    {
      label: 'Foreign embassies in the UK',
      description: 'GOV.UK list of foreign embassies and high commissions for lost passport or consular help.',
      href: 'https://www.gov.uk/government/publications/foreign-embassies-in-the-uk',
      tag: 'Consular',
    },
  ];
}
