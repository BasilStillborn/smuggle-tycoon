import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { ArrivalProfile } from '../data/arrivals';
import { getAirport, getChecklist, getCity, getCountry, getTripType } from '../data/arrivals';
import {
  appLauncherGroups,
  baiduTranslateGuide,
  bilingualPhrases,
  chinaPaymentGuide,
  chineseAirportNotes,
  firstTenMinuteChecklist,
  foodDeliveryApps,
  foodDeliveryNotes,
  isChineseVisitor,
  recommendedApps,
  rideApps,
  rideHailingNotes,
  translationApps,
  transportApps,
  transportQuickRules,
  type ToolApp,
} from '../data/chineseVisitor';
import { getGuideCards, getOfficialLinks, phraseCards, type GuideCard } from '../data/guides';
import { trackEvent } from '../lib/analytics';
import CategoryTile from './CategoryTile';
import CurrencyConverter from './CurrencyConverter';
import InfoWindow from './InfoWindow';
import Waitlist from './Waitlist';

export type WindowId = 'arrival' | 'airport' | 'transport' | 'payments' | 'translation' | 'currency' | 'delivery' | 'rides' | 'emergency' | 'phrases' | 'apps' | 'official' | 'waitlist';

type AppLocale = 'en' | 'zh';

type Tile = {
  id: WindowId;
  title: string;
  summary: string;
  subtitle: string;
  icon: string;
  accent: string;
  segment: 'all' | 'chinese';
};

type AppDashboardProps = {
  profile: ArrivalProfile;
  hasGenerated: boolean;
  activeWindow: WindowId | null;
  onOpenWindow: (windowId: WindowId) => void;
  onCloseWindow: () => void;
  locale?: AppLocale;
};

const tiles: Tile[] = [
  {
    id: 'arrival',
    title: 'Arrival',
    summary: 'First hour, first evening, first 3 days.',
    subtitle: 'Your generated first-week action board.',
    icon: '01',
    accent: 'bg-britain-ink text-white',
    segment: 'all',
  },
  {
    id: 'airport',
    title: 'Airport Transfer',
    summary: 'Heathrow/Gatwick routes and taxi warnings.',
    subtitle: 'Pick a route by budget, luggage, time, and final area.',
    icon: 'AIR',
    accent: 'bg-britain-mist text-britain-navy',
    segment: 'all',
  },
  {
    id: 'transport',
    title: 'Transport',
    summary: 'Tube, rail, buses, tapping rules, disruption.',
    subtitle: 'The London transport rules worth learning once.',
    icon: 'TFL',
    accent: 'bg-britain-blue text-white',
    segment: 'all',
  },
  {
    id: 'payments',
    title: 'Payments',
    summary: 'Contactless, cards, backup cash, TfL rules.',
    subtitle: 'Avoid card problems at gates and checkouts.',
    icon: '£',
    accent: 'bg-britain-green text-white',
    segment: 'all',
  },
  {
    id: 'translation',
    title: 'Translation',
    summary: 'Baidu Translate setup and offline English pack.',
    subtitle: 'Chinese visitor translation setup before leaving Wi-Fi.',
    icon: '文',
    accent: 'bg-britain-red text-white',
    segment: 'chinese',
  },
  {
    id: 'emergency',
    title: 'Emergency',
    summary: '999, NHS 111, pharmacies, insurance, embassy.',
    subtitle: 'Know the right help route before you are stressed.',
    icon: '999',
    accent: 'bg-britain-red text-white',
    segment: 'all',
  },
  {
    id: 'phrases',
    title: 'Phrases',
    summary: 'Copyable sentences for taxi, hotel, pharmacy.',
    subtitle: 'Short sentences you can show or copy quickly.',
    icon: 'Aa',
    accent: 'bg-britain-gold text-britain-ink',
    segment: 'all',
  },
  {
    id: 'apps',
    title: 'Recommended Apps',
    summary: 'Maps, transport, translation, rail, ride-hailing.',
    subtitle: 'Install and test these before the first stressful moment.',
    icon: 'APP',
    accent: 'bg-britain-ink text-white',
    segment: 'all',
  },
  {
    id: 'official',
    title: 'Official Links',
    summary: 'GOV.UK, TfL, NHS, National Rail, Met Office.',
    subtitle: 'Trusted sources, explained in practical terms.',
    icon: 'UK',
    accent: 'bg-britain-mist text-britain-navy',
    segment: 'all',
  },
  {
    id: 'waitlist',
    title: 'Join Waitlist',
    summary: 'Tell us which arrival version to build next.',
    subtitle: 'Join the validation list and tag your arrival context.',
    icon: '@',
    accent: 'bg-britain-red text-white',
    segment: 'all',
  },
];

const chineseToolboxTiles: Tile[] = [
  {
    id: 'arrival',
    title: '刚到英国先看',
    summary: '落地 10 分钟内先把关键事搞定。',
    subtitle: '别刚落地就开始抓瞎，先按这个顺序来。',
    icon: '先',
    accent: 'bg-britain-red text-white',
    segment: 'all',
  },
  {
    id: 'translation',
    title: '翻译工具',
    summary: '百度翻译、拍照、语音、离线英文包。',
    subtitle: '把翻译工具先装好，现场沟通会轻松很多。',
    icon: '译',
    accent: 'bg-britain-ink text-white',
    segment: 'all',
  },
  {
    id: 'currency',
    title: '英镑人民币',
    summary: '实时 GBP/CNY 汇率和快速估算。',
    subtitle: '买东西、打车、点外卖前先心里有个数。',
    icon: '¥',
    accent: 'bg-britain-gold text-britain-ink',
    segment: 'all',
  },
  {
    id: 'payments',
    title: '英国支付',
    summary: '银行卡、contactless、微信/支付宝限制。',
    subtitle: '英国支付逻辑和国内不一样，别只靠二维码。',
    icon: '卡',
    accent: 'bg-britain-green text-white',
    segment: 'all',
  },
  {
    id: 'airport',
    title: '机场进城',
    summary: '希思罗/盖特威克到伦敦怎么选。',
    subtitle: '按预算、行李、时间和酒店区域选路线。',
    icon: '机',
    accent: 'bg-britain-mist text-britain-navy',
    segment: 'all',
  },
  {
    id: 'transport',
    title: '伦敦交通',
    summary: 'TfL Go、Citymapper、National Rail。',
    subtitle: '地铁、公交、Elizabeth line、火车，一次理清。',
    icon: '轨',
    accent: 'bg-britain-blue text-white',
    segment: 'all',
  },
  {
    id: 'delivery',
    title: '外卖应用',
    summary: 'Deliveroo、Uber Eats、Just Eat。',
    subtitle: '刚到酒店太累了，先知道英国外卖怎么点。',
    icon: '餐',
    accent: 'bg-britain-red text-white',
    segment: 'all',
  },
  {
    id: 'rides',
    title: '打车应用',
    summary: 'Uber、Bolt、Black cabs 和机场避坑。',
    subtitle: '深夜、行李多、带老人小孩时更省心。',
    icon: '车',
    accent: 'bg-britain-ink text-white',
    segment: 'all',
  },
  {
    id: 'emergency',
    title: '紧急求助',
    summary: '999、NHS 111、药店、保险。',
    subtitle: '真遇到事，别临时搜索，先知道该找谁。',
    icon: '999',
    accent: 'bg-britain-red text-white',
    segment: 'all',
  },
  {
    id: 'phrases',
    title: '常用英文',
    summary: '给酒店、车站、药店、司机看的句子。',
    subtitle: '复制英文句子，直接给工作人员看。',
    icon: 'Aa',
    accent: 'bg-britain-gold text-britain-ink',
    segment: 'all',
  },
  {
    id: 'apps',
    title: '必备应用',
    summary: '翻译、交通、外卖、打车、地图、天气。',
    subtitle: '你真正需要装的 UK apps，集中放在这里。',
    icon: 'APP',
    accent: 'bg-britain-ink text-white',
    segment: 'all',
  },
  {
    id: 'waitlist',
    title: '加入名单',
    summary: '告诉我们中国游客最需要什么功能。',
    subtitle: '加入验证名单，帮我们决定下一版优先做什么。',
    icon: '@',
    accent: 'bg-britain-red text-white',
    segment: 'all',
  },
];

const tileTranslations: Record<AppLocale, Partial<Record<WindowId, Pick<Tile, 'title' | 'summary' | 'subtitle'>>>> = {
  en: {},
  zh: {
    arrival: {
      title: '到达清单',
      summary: '第一小时、第一晚、前三天。',
      subtitle: '你的英国第一周行动窗口。',
    },
    airport: {
      title: '机场进城',
      summary: '希思罗/盖特威克路线和出租车提醒。',
      subtitle: '按预算、行李、时间和酒店区域选择路线。',
    },
    transport: {
      title: '伦敦交通',
      summary: '地铁、火车、公交、刷卡和延误。',
      subtitle: '一次学会最重要的伦敦交通规则。',
    },
    payments: {
      title: '支付',
      summary: 'Contactless、银行卡、备用现金和 TfL 规则。',
      subtitle: '避免闸机和收银台付款失败。',
    },
    translation: {
      title: '翻译',
      summary: '百度翻译设置和英文离线包。',
      subtitle: '离开机场 Wi-Fi 前完成翻译准备。',
    },
    emergency: {
      title: '紧急求助',
      summary: '999、NHS 111、药店、保险和使领馆。',
      subtitle: '紧张之前先知道该找谁。',
    },
    phrases: {
      title: '常用短句',
      summary: '出租车、酒店、药店可复制英文句子。',
      subtitle: '可以快速出示或复制的短句。',
    },
    apps: {
      title: '推荐应用',
      summary: '地图、交通、翻译、火车和打车。',
      subtitle: '在第一次紧张场景前安装并测试。',
    },
    official: {
      title: '官方链接',
      summary: 'GOV.UK、TfL、NHS、National Rail、Met Office。',
      subtitle: '可信来源，用实用语言解释。',
    },
    waitlist: {
      title: '加入名单',
      summary: '告诉我们下一版该做什么到达助手。',
      subtitle: '加入验证名单，并标记你的到达情况。',
    },
  },
};

const dashboardCopy = {
  en: {
    appWindow: 'App window',
    closeWindow: 'Close window',
    dashboardEyebrow: 'Compact app dashboard',
    dashboardTitle: 'Choose a window.',
    ready: 'Your checklist is ready.',
    sample: 'Sample dashboard shown before generation.',
    instruction: 'Tap a window below. Start with Arrival.',
    days: 'days',
    open: 'Open',
    startHere: 'Start here',
    next: 'Next:',
    routeOptions: 'Route options',
    fastRules: 'Fast rules',
    londonBasics: 'London basics',
    copyTip: 'Copy this sentence or show it to staff.',
    copied: 'Copied',
    copyPhrase: 'Copy phrase',
    openSource: 'Open source',
    openLink: 'Open',
    tflJourneyPlanner: 'TfL journey planner',
    citymapperLondon: 'Citymapper London',
    tflContactless: 'TfL contactless guidance',
    openBaiduTranslate: 'Open Baidu Translate',
    nhs111: 'NHS 111 online',
  },
  zh: {
    appWindow: '应用窗口',
    closeWindow: '关闭窗口',
    dashboardEyebrow: '中国游客英国到达工具箱',
    dashboardTitle: '别刚落地就开始抓瞎',
    ready: '先把这几个东西搞定。',
    sample: '先把这几个东西搞定。',
    instruction: '翻译、汇率、支付、交通、外卖、打车都在这里。',
    days: '天',
    open: '打开',
    startHere: '先看',
    next: '下一步：',
    routeOptions: '路线选择',
    fastRules: '快速规则',
    londonBasics: '伦敦基础',
    copyTip: '复制这句话，或直接出示给工作人员。',
    copied: '已复制',
    copyPhrase: '复制短句',
    openSource: '打开来源',
    openLink: '打开',
    tflJourneyPlanner: 'TfL 路线规划',
    citymapperLondon: 'Citymapper 伦敦',
    tflContactless: 'TfL contactless 说明',
    openBaiduTranslate: '打开百度翻译',
    nhs111: '打开 NHS 111',
  },
} satisfies Record<AppLocale, Record<string, string>>;

function localizeTile(tile: Tile, locale: AppLocale): Tile {
  return {
    ...tile,
    ...tileTranslations[locale][tile.id],
  };
}

const zhProfileLabels: Record<string, Record<string, string>> = {
  country: {
    china: '中国出发',
    india: '印度出发',
    usa: '美国出发',
    eu: '欧盟/欧洲出发',
    gulf: '海湾地区出发',
    other: '其他国家出发',
  },
  airport: {
    heathrow: '希思罗 Heathrow',
    gatwick: '盖特威克 Gatwick',
  },
  city: {
    london: '伦敦',
  },
  tripType: {
    tourist: '旅游',
    student: '留学',
    business: '商务',
  },
};

function profileLabel(locale: AppLocale, group: keyof typeof zhProfileLabels, id: string, fallback: string) {
  return locale === 'zh' ? zhProfileLabels[group][id] ?? fallback : fallback;
}

const nextWindowMap: Partial<Record<WindowId, WindowId>> = {
  arrival: 'payments',
  payments: 'transport',
  transport: 'emergency',
  airport: 'transport',
  translation: 'phrases',
  emergency: 'phrases',
  phrases: 'apps',
  apps: 'official',
  official: 'waitlist',
};

const chineseNextWindowMap: Partial<Record<WindowId, WindowId>> = {
  arrival: 'translation',
  translation: 'currency',
  currency: 'payments',
  payments: 'airport',
  airport: 'transport',
  transport: 'delivery',
  delivery: 'rides',
  rides: 'emergency',
  emergency: 'phrases',
  phrases: 'apps',
  apps: 'waitlist',
};

function copyWithFallback(text: string) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
  return Promise.resolve();
}

function MiniCard({ title, eyebrow, children }: { title: string; eyebrow?: string; children: ReactNode }) {
  return (
    <article className="rounded-3xl border border-britain-ink/10 bg-white p-4 shadow-sm">
      {eyebrow && <p className="text-xs font-black uppercase tracking-[0.16em] text-britain-red">{eyebrow}</p>}
      <h3 className="mt-1 text-lg font-black leading-tight text-britain-ink">{title}</h3>
      <div className="mt-3 text-sm font-bold leading-6 text-britain-ink/70">{children}</div>
    </article>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item} className="flex gap-3 rounded-2xl bg-britain-cream p-3">
          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-britain-green" />
          <p>{item}</p>
        </div>
      ))}
    </div>
  );
}

function ActionLink({ href, label, eventName, params }: { href: string; label: string; eventName: string; params: Record<string, string | boolean> }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={() => trackEvent(eventName, params)}
      className="focus-ring inline-flex w-full justify-center rounded-full bg-britain-ink px-4 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-britain-navy sm:w-auto"
    >
      {label}
    </a>
  );
}

function AppLinkGrid({ apps, windowId, openLabel }: { apps: ToolApp[]; windowId: WindowId; openLabel: string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {apps.map((app) => (
        <MiniCard key={app.id} title={app.chineseName ? `${app.chineseName} / ${app.name}` : app.name} eyebrow={app.category}>
          <p>{app.description}</p>
          {app.caution && <p className="mt-3 rounded-2xl bg-britain-cream p-3 text-xs leading-5 text-britain-ink/58">{app.caution}</p>}
          <div className="mt-4">
            <ActionLink href={app.href} label={openLabel} eventName="tool_app_clicked" params={{ app_id: app.id, window_id: windowId }} />
          </div>
        </MiniCard>
      ))}
    </div>
  );
}

function GuideSummary({ guide }: { guide?: GuideCard }) {
  if (!guide) {
    return null;
  }

  return (
    <MiniCard title={guide.title} eyebrow={guide.eyebrow}>
      <p className="mb-3">{guide.summary}</p>
      <BulletList items={guide.steps} />
    </MiniCard>
  );
}

function AppDashboard({ profile, hasGenerated, activeWindow, onOpenWindow, onCloseWindow, locale = 'en' }: AppDashboardProps) {
  const [copiedPhrase, setCopiedPhrase] = useState<string | null>(null);
  const t = dashboardCopy[locale];
  const country = getCountry(profile);
  const airport = getAirport(profile);
  const city = getCity(profile);
  const tripType = getTripType(profile);
  const checklist = getChecklist(profile);
  const guideCards = getGuideCards(profile);
  const officialLinks = getOfficialLinks(profile.airport);
  const chineseMode = locale === 'zh' || isChineseVisitor(profile.country);
  const localizedTiles = tiles.map((tile) => localizeTile(tile, locale));
  const visibleTiles = locale === 'zh' ? chineseToolboxTiles : localizedTiles.filter((tile) => tile.segment === 'all' || chineseMode);
  const activeTile = activeWindow ? visibleTiles.find((tile) => tile.id === activeWindow) : null;
  const airportChineseGuide = chineseAirportNotes[profile.airport];
  const paymentGuide = guideCards.find((guide) => guide.id === 'payments');
  const transferGuide = guideCards.find((guide) => guide.id === 'airport-transfer');
  const transportGuide = guideCards.find((guide) => guide.id === 'transport');
  const emergencyGuide = guideCards.find((guide) => guide.id === 'health');
  const mobileDataGuide = guideCards.find((guide) => guide.id === 'mobile-data');

  useEffect(() => {
    trackEvent('dashboard_viewed', {
      country: profile.country,
      airport: profile.airport,
      trip_type: profile.tripType,
      visitor_segment: chineseMode ? 'chinese' : 'general',
      generated: hasGenerated,
    });
  }, [chineseMode, hasGenerated, profile.airport, profile.country, profile.tripType]);

  function openWindow(id: WindowId) {
    onOpenWindow(id);
    trackEvent('category_tile_opened', {
      window_id: id,
      country: profile.country,
      visitor_segment: chineseMode ? 'chinese' : 'general',
    });
  }

  function closeWindow() {
    if (activeWindow) {
      trackEvent('category_tile_closed', { window_id: activeWindow });
    }
    onCloseWindow();
  }

  function openNextWindow(id: WindowId) {
    trackEvent('next_window_clicked', { from_window_id: activeWindow ?? 'unknown', to_window_id: id });
    openWindow(id);
  }

  async function copyPhrase(id: string, text: string) {
    await copyWithFallback(text);
    setCopiedPhrase(id);
    trackEvent('phrase_copied', { phrase_id: id, visitor_segment: chineseMode ? 'chinese' : 'general' });
    window.setTimeout(() => setCopiedPhrase((current) => (current === id ? null : current)), 1800);
  }

  function renderWindowContent() {
    switch (activeWindow) {
      case 'arrival':
        if (locale === 'zh') {
          return (
            <div className="space-y-4">
              <MiniCard title="落地后 10 分钟" eyebrow="先别乱点应用">
                <p className="mb-3 text-britain-ink/60">先把网络、地址、支付和路线稳住，后面就不容易慌。</p>
                <BulletList items={firstTenMinuteChecklist} />
              </MiniCard>
              <div className="grid gap-4 sm:grid-cols-2">
                <MiniCard title="去酒店前" eyebrow="机场出口前检查">
                  <BulletList items={[
                    '确认酒店英文地址、postcode 和入住截图都能离线打开。',
                    '决定交通方式前，先看行李多不多、到达时间晚不晚、酒店离车站远不远。',
                    '如果要坐伦敦交通，同一段旅程别混用实体卡和手机钱包。',
                  ]} />
                </MiniCard>
                <MiniCard title="今晚先稳住" eyebrow="别把小事拖成大麻烦">
                  <BulletList items={[
                    '太晚到酒店时，先买水和简单食物，外卖深夜选择会少很多。',
                    '找出附近药店、超市和最近的地铁/火车站。',
                    '把 999、NHS 111 和保险联系方式保存到手机。',
                  ]} />
                </MiniCard>
              </div>
            </div>
          );
        }

        return (
          <div className="grid gap-4 sm:grid-cols-2">
            {checklist.map((section, index) => (
              <MiniCard key={section.title} title={section.title} eyebrow={`${index + 1}. ${section.timeframe}`}>
                <p className="mb-3 text-britain-ink/60">{section.intent}</p>
                <BulletList items={section.items} />
              </MiniCard>
            ))}
          </div>
        );
      case 'airport':
        return (
          <div className="space-y-4">
            <MiniCard title={`${airport.label} to ${city.label}`} eyebrow={t.routeOptions}>
              <p className="mb-3">{airport.terminalTip}</p>
              <BulletList items={airport.primaryRoutes} />
            </MiniCard>
            {chineseMode && (
              <MiniCard title={airportChineseGuide.title} eyebrow="中文提示">
                <p className="mb-3 text-britain-ink/60">{airportChineseGuide.subtitle}</p>
                <BulletList items={airportChineseGuide.points} />
              </MiniCard>
            )}
            <GuideSummary guide={transferGuide} />
          </div>
        );
      case 'transport':
        if (locale === 'zh') {
          return (
            <div className="space-y-4">
              <AppLinkGrid apps={transportApps} windowId="transport" openLabel={t.openLink} />
              <MiniCard title="伦敦交通快速规则" eyebrow="少踩坑">
                <BulletList items={transportQuickRules} />
              </MiniCard>
            </div>
          );
        }

        return (
          <div className="space-y-4">
            <GuideSummary guide={transportGuide} />
            <MiniCard title={t.fastRules} eyebrow={t.londonBasics}>
              <BulletList items={[
                'Use the same card or phone when tapping in and out on Tube and rail journeys.',
                'For buses, usually tap only when boarding.',
                'Stand on the right on escalators and keep bags close on busy platforms.',
                'Check disruption before late-night journeys or airport transfers.',
              ]} />
            </MiniCard>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ActionLink href="https://tfl.gov.uk/plan-a-journey/" label={t.tflJourneyPlanner} eventName="window_action_clicked" params={{ window_id: 'transport', action: 'tfl' }} />
              <ActionLink href="https://citymapper.com/london" label={t.citymapperLondon} eventName="window_action_clicked" params={{ window_id: 'transport', action: 'citymapper' }} />
            </div>
          </div>
        );
      case 'payments':
        return (
          <div className="space-y-4">
            <GuideSummary guide={paymentGuide} />
            {chineseMode && (
              <MiniCard title={chinaPaymentGuide.title} eyebrow="中国游客重点">
                <p className="mb-3 text-britain-ink/60">{chinaPaymentGuide.subtitle}</p>
                <BulletList items={chinaPaymentGuide.points} />
              </MiniCard>
            )}
            {locale === 'zh' && (
              <MiniCard title="支付失败时怎么办" eyebrow="别在闸机口慌">
                <BulletList items={[
                  '先找工作人员，不要连续换好几张卡乱刷。',
                  '确认是不是用了不同设备：实体卡、Apple Pay、Google Pay 会被当成不同支付方式。',
                  '保留一张实体备用卡，手机没电时能救命。',
                  '小额现金可以备用，但不要指望所有地方都愿意收现金。',
                ]} />
              </MiniCard>
            )}
            <ActionLink href="https://tfl.gov.uk/fares/contactless-and-oyster-account" label={t.tflContactless} eventName="window_action_clicked" params={{ window_id: 'payments', action: 'tfl_contactless' }} />
          </div>
        );
      case 'translation':
        return (
          <div className="space-y-4">
            <MiniCard title={baiduTranslateGuide.title} eyebrow="百度翻译设置">
              <p className="mb-3 text-britain-ink/60">{baiduTranslateGuide.subtitle}</p>
              <BulletList items={baiduTranslateGuide.points} />
            </MiniCard>
            {locale === 'zh' ? (
              <AppLinkGrid apps={translationApps} windowId="translation" openLabel={t.openLink} />
            ) : (
              <ActionLink href="https://fanyi.baidu.com/" label={t.openBaiduTranslate} eventName="baidu_translate_clicked" params={{ visitor_segment: 'chinese', location: 'dashboard_window' }} />
            )}
          </div>
        );
      case 'currency':
        return <CurrencyConverter />;
      case 'delivery':
        return (
          <div className="space-y-4">
            <AppLinkGrid apps={foodDeliveryApps} windowId="delivery" openLabel={t.openLink} />
            <MiniCard title="英国点外卖先注意这些" eyebrow="别等饿疯了再研究">
              <BulletList items={foodDeliveryNotes} />
            </MiniCard>
          </div>
        );
      case 'rides':
        return (
          <div className="space-y-4">
            <AppLinkGrid apps={rideApps} windowId="rides" openLabel={t.openLink} />
            <MiniCard title="打车和机场接送避坑" eyebrow="安全第一">
              <BulletList items={rideHailingNotes} />
            </MiniCard>
          </div>
        );
      case 'emergency':
        if (locale === 'zh') {
          return (
            <div className="space-y-4">
              <MiniCard title="英国紧急电话怎么用" eyebrow="先存下来">
                <BulletList items={[
                  '999：警察、消防、救护车、正在发生的危险或严重伤情。',
                  'NHS 111：不危及生命，但需要尽快获得医疗建议。',
                  '药店 pharmacy：轻微不适、常见药、感冒发烧、皮肤问题等可以先问药剂师。',
                  '旅行保险：私立医疗、理赔、紧急协助和中文支持要看你的保险条款。',
                ]} />
              </MiniCard>
              <ActionLink href="https://111.nhs.uk/" label={t.nhs111} eventName="window_action_clicked" params={{ window_id: 'emergency', action: 'nhs_111' }} />
            </div>
          );
        }

        return (
          <div className="space-y-4">
            <GuideSummary guide={emergencyGuide} />
            <MiniCard title="Numbers to save" eyebrow="Safety">
              <BulletList items={[
                'Call 999 for police, fire, ambulance, danger, serious injury, or crime in progress.',
                'Use NHS 111 for urgent medical advice when it is not life-threatening.',
                'Ask a pharmacy for minor illness, medicine advice, and common symptoms.',
                'Use your travel insurance for private care, claims, or medical support lines.',
              ]} />
            </MiniCard>
            <ActionLink href="https://111.nhs.uk/" label={t.nhs111} eventName="window_action_clicked" params={{ window_id: 'emergency', action: 'nhs_111' }} />
          </div>
        );
      case 'phrases':
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            {(chineseMode ? bilingualPhrases : phraseCards.map((phrase) => ({
              id: phrase.situation,
              situation: phrase.situation,
              chineseSituation: phrase.situation,
              english: phrase.sayThis,
              chineseMeaning: phrase.means,
              tip: t.copyTip,
            }))).map((phrase) => (
              <MiniCard key={phrase.id} title={phrase.chineseSituation} eyebrow={phrase.situation}>
                <p className="text-base font-black leading-7 text-britain-ink">"{phrase.english}"</p>
                <p className="mt-3">{phrase.chineseMeaning}</p>
                <p className="mt-3 rounded-2xl bg-britain-cream p-3 text-xs leading-5 text-britain-ink/58">{phrase.tip}</p>
                <button
                  type="button"
                  onClick={() => copyPhrase(phrase.id, phrase.english)}
                  className="focus-ring mt-4 w-full rounded-full bg-britain-ink px-4 py-3 text-sm font-black text-white transition hover:bg-britain-navy"
                >
                  {copiedPhrase === phrase.id ? t.copied : t.copyPhrase}
                </button>
              </MiniCard>
            ))}
          </div>
        );
      case 'apps':
        if (locale === 'zh') {
          return (
            <div className="space-y-4">
              {appLauncherGroups.map((group) => (
                <MiniCard key={group.id} title={group.title} eyebrow="直接打开">
                  <p className="mb-4 text-britain-ink/60">{group.subtitle}</p>
                  <AppLinkGrid apps={group.apps} windowId="apps" openLabel={t.openLink} />
                </MiniCard>
              ))}
            </div>
          );
        }

        return (
          <div className="space-y-4">
            <GuideSummary guide={mobileDataGuide} />
            <div className="grid gap-4 sm:grid-cols-2">
              {recommendedApps.map((app) => (
                <MiniCard key={app.id} title={app.chineseName ? `${app.chineseName} / ${app.name}` : app.name} eyebrow={app.category}>
                  <p>{app.description}</p>
                  {app.caution && <p className="mt-3 rounded-2xl bg-britain-cream p-3 text-xs leading-5 text-britain-ink/58">{app.caution}</p>}
                  {app.href && (
                    <div className="mt-4">
                      <ActionLink href={app.href} label={t.openLink} eventName="recommended_app_clicked" params={{ app_id: app.id, visitor_segment: chineseMode ? 'chinese' : 'general' }} />
                    </div>
                  )}
                </MiniCard>
              ))}
            </div>
          </div>
        );
      case 'official':
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            {officialLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('official_link_clicked', { label: link.label, tag: link.tag, airport: profile.airport })}
                className="focus-ring rounded-3xl border border-britain-ink/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft"
              >
                <p className="text-xs font-black uppercase tracking-[0.16em] text-britain-red">{link.tag}</p>
                <h3 className="mt-2 text-lg font-black text-britain-ink">{link.label}</h3>
                <p className="mt-3 text-sm font-bold leading-6 text-britain-ink/62">{link.description}</p>
                <p className="mt-4 text-sm font-black text-britain-red">{t.openSource}</p>
              </a>
            ))}
          </div>
        );
      case 'waitlist':
        return <Waitlist profile={profile} variant="panel" locale={locale} />;
      default:
        return null;
    }
  }

  const nextWindow = activeWindow ? (locale === 'zh' ? chineseNextWindowMap[activeWindow] : nextWindowMap[activeWindow]) : null;
  const nextTile = nextWindow ? visibleTiles.find((tile) => tile.id === nextWindow) : null;

  return (
    <section id="dashboard" className="bg-britain-cream px-4 py-12 sm:px-8 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-[2rem] bg-britain-ink p-5 text-white shadow-card sm:p-7">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-britain-gold">{t.dashboardEyebrow}</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="font-serif text-3xl font-black tracking-tight sm:text-5xl">{t.dashboardTitle}</h2>
              <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-white/68 sm:text-base sm:leading-7">
                {hasGenerated ? t.ready : t.sample} {t.instruction}
              </p>
            </div>
            <div className="rounded-3xl bg-white/10 p-4 text-sm font-bold leading-6 text-white/75">
              {profileLabel(locale, 'country', profile.country, country.label)} · {profileLabel(locale, 'airport', profile.airport, airport.label)} · {profileLabel(locale, 'city', profile.city, city.label)} · {profileLabel(locale, 'tripType', profile.tripType, tripType.label)} · {profile.tripLengthDays} {t.days}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          {visibleTiles.map((tile) => (
            <CategoryTile
              key={tile.id}
              title={tile.title}
              summary={tile.summary}
              icon={tile.icon}
              accent={tile.accent}
              badge={tile.id === 'arrival' ? t.startHere : undefined}
              openLabel={t.open}
              onClick={() => openWindow(tile.id)}
            />
          ))}
        </div>
      </div>

      {activeTile && (
        <InfoWindow title={activeTile.title} subtitle={activeTile.subtitle} onClose={closeWindow} eyebrow={t.appWindow} closeLabel={t.closeWindow}>
          <div className="space-y-5">
            {renderWindowContent()}
            {nextTile && (
              <button
                type="button"
                onClick={() => openNextWindow(nextTile.id)}
                className="focus-ring w-full rounded-2xl bg-britain-red px-5 py-4 text-sm font-black text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-red-700"
              >
                {t.next} {nextTile.title}
              </button>
            )}
          </div>
        </InfoWindow>
      )}
    </section>
  );
}

export default AppDashboard;
