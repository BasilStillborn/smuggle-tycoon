import type { AirportId } from './arrivals';

export type ChineseGuideBlock = {
  title: string;
  subtitle: string;
  points: string[];
};

export type RecommendedApp = {
  id: string;
  name: string;
  chineseName?: string;
  category: string;
  description: string;
  href?: string;
  caution?: string;
};

export type ToolApp = {
  id: string;
  name: string;
  chineseName?: string;
  category: string;
  description: string;
  href: string;
  caution?: string;
};

export type ToolAppGroup = {
  id: string;
  title: string;
  subtitle: string;
  apps: ToolApp[];
};

export type BilingualPhrase = {
  id: string;
  situation: string;
  chineseSituation: string;
  english: string;
  chineseMeaning: string;
  tip: string;
};

export const baiduTranslateGuide: ChineseGuideBlock = {
  title: '出发前设置百度翻译',
  subtitle: '翻译别等到现场再折腾。离线包、拍照翻译、语音翻译先准备好。',
  points: [
    '出发前安装百度翻译，不要等到机场网络不稳定时再下载。',
    '提前下载英文离线翻译包，避免刚落地时没有网络。',
    '允许相机权限，用拍照翻译识别路牌、菜单、药品标签和售票机。',
    '允许麦克风权限，用语音/对话翻译处理酒店、出租车、药店和问路场景。',
    '把下面的常用英文句子提前复制保存，紧急时可以直接出示。',
  ],
};

export const chinaPaymentGuide: ChineseGuideBlock = {
  title: '英国支付别只靠微信/支付宝',
  subtitle: '英国是银行卡和 contactless 为主。微信支付、支付宝、银联都不能当作唯一方案。',
  points: [
    '英国城市里信用卡、借记卡、Apple Pay 和 Google Pay 很常见。现金只是备用。',
    '微信支付和支付宝在英国不是通用支付方式，不能依赖它们乘地铁或日常消费。',
    '银联卡接受度不如 Visa/Mastercard。最好准备一张可境外使用的 Visa 或 Mastercard。',
    '伦敦地铁、Elizabeth line 和部分火车闸机需要 Oyster、contactless card、手机钱包或有效车票。',
    '坐伦敦交通时，同一段旅程必须用同一张卡或同一个手机进出站。不要混用。',
    '准备一张实体备用卡，并和手机分开放，避免手机没电或丢失时无法付款。',
  ],
};

export const chineseAirportNotes: Record<AirportId, ChineseGuideBlock> = {
  heathrow: {
    title: '希思罗机场到伦敦',
    subtitle: 'Heathrow has several routes. Choose by budget, luggage, and hotel area.',
    points: [
      'Elizabeth line：紫色线路，适合去伦敦市中心和东部，价格和速度比较平衡。',
      'Piccadilly line：蓝色地铁线，通常更便宜，但时间更长，人多时带大行李不方便。',
      'Heathrow Express：去 Paddington 很快，但通常更贵。',
      'Black cab 或提前预约车辆适合深夜、家庭、商务和大件行李。',
      '不要接受航站楼内陌生人主动招揽的非官方出租车。',
    ],
  },
  gatwick: {
    title: '盖特威克机场到伦敦',
    subtitle: 'Gatwick is rail-first. Pick the train by your final London area.',
    points: [
      'Gatwick Express：常去 Victoria，比较直接。',
      'Thameslink：适合去 London Bridge、Blackfriars、St Pancras 等区域。',
      'Southern：也可到 Victoria，注意不同班次停靠站不同。',
      '如果很晚抵达或带很多行李，可以考虑官方出租车、正规网约车或提前预约接送。',
      '离开机场前先截图酒店英文地址和邮编。',
    ],
  },
};

export const recommendedApps: RecommendedApp[] = [
  {
    id: 'baidu-translate',
    name: 'Baidu Translate',
    chineseName: '百度翻译',
    category: 'Translation',
    description: '拍照翻译、语音/对话翻译和离线英文翻译包，适合路牌、菜单、药品标签和问路。',
    href: 'https://fanyi.baidu.com/',
    caution: 'Recommended tool only. This app is not partnered with Baidu.',
  },
  {
    id: 'citymapper',
    name: 'Citymapper',
    category: 'London routes',
    description: '适合在伦敦规划地铁、公交、步行和换乘路线。',
    href: 'https://citymapper.com/london',
  },
  {
    id: 'tfl-go',
    name: 'TfL Go',
    category: 'Official London transport',
    description: '伦敦官方交通应用，查看线路、车站和服务状态。',
    href: 'https://tfl.gov.uk/maps_/tfl-go',
  },
  {
    id: 'national-rail',
    name: 'National Rail',
    category: 'UK trains',
    description: '查看英国火车时刻、延误、罢工和换乘信息。',
    href: 'https://www.nationalrail.co.uk/',
  },
  {
    id: 'maps',
    name: 'Google Maps / Apple Maps',
    category: 'Maps',
    description: '提前保存酒店、机场、药店、超市和第一个车站位置。',
  },
  {
    id: 'uber-bolt',
    name: 'Uber / Bolt',
    category: 'Ride-hailing',
    description: '适合深夜、大件行李或公共交通不方便时使用。上车前核对车牌。',
    caution: '机场接送优先使用官方出租车点、正规网约车或提前预约服务。',
  },
  {
    id: 'esim-slot',
    name: 'UK eSIM provider slot',
    category: 'Mobile data',
    description: '未来可接入 eSIM 合作链接。当前版本只提醒你提前准备网络。',
  },
];

export const firstTenMinuteChecklist = [
  '连上机场 Wi-Fi 后，先确认手机流量或 eSIM 能用。',
  '把酒店英文地址和 postcode 截图保存，别只留中文名。',
  '准备一张 Visa/Mastercard 或能境外 contactless 的卡，别只靠微信/支付宝。',
  '打开地图确认去酒店路线，再决定坐地铁、火车、打车还是预约车。',
  '保存 999 和 NHS 111。真出事时别搜索，直接用。',
];

export const translationApps: ToolApp[] = [
  {
    id: 'baidu-translate',
    name: 'Baidu Translate',
    chineseName: '百度翻译',
    category: '翻译首选',
    description: '中文用户更顺手。提前下载英文离线包，打开拍照、语音和对话翻译权限。',
    href: 'https://fanyi.baidu.com/',
    caution: '推荐工具，不代表本应用与百度有合作关系。',
  },
  {
    id: 'google-translate',
    name: 'Google Translate',
    chineseName: 'Google 翻译',
    category: '备用翻译',
    description: '有些场景下识别英文菜单、标识和长句也很方便，可以作为备用。',
    href: 'https://translate.google.com/',
  },
];

export const transportApps: ToolApp[] = [
  {
    id: 'tfl-go',
    name: 'TfL Go',
    category: '官方伦敦交通',
    description: '看地铁、Elizabeth line、公交和线路状态。遇到延误先看这里。',
    href: 'https://tfl.gov.uk/maps_/tfl-go',
  },
  {
    id: 'citymapper',
    name: 'Citymapper',
    category: '路线规划',
    description: '在伦敦非常好用，适合比较地铁、公交、步行和打车方案。',
    href: 'https://citymapper.com/london',
  },
  {
    id: 'national-rail',
    name: 'National Rail',
    category: '英国火车',
    description: '查英国火车时刻、延误、罢工和站台变化。伦敦外行程建议装。',
    href: 'https://www.nationalrail.co.uk/',
  },
];

export const foodDeliveryApps: ToolApp[] = [
  {
    id: 'deliveroo',
    name: 'Deliveroo',
    category: '外卖',
    description: '英国常见外卖平台。适合餐厅选择多的城市区域。',
    href: 'https://deliveroo.co.uk/',
  },
  {
    id: 'uber-eats',
    name: 'Uber Eats',
    category: '外卖',
    description: '很多城市可用，和 Uber 账号体系接近，上手比较快。',
    href: 'https://www.ubereats.com/gb',
  },
  {
    id: 'just-eat',
    name: 'Just Eat',
    category: '外卖',
    description: '覆盖面广，部分小店会在这里出现。',
    href: 'https://www.just-eat.co.uk/',
  },
];

export const rideApps: ToolApp[] = [
  {
    id: 'uber',
    name: 'Uber',
    category: '网约车',
    description: '伦敦和英国很多城市可用。上车前核对车牌、车型和司机姓名。',
    href: 'https://www.uber.com/gb/en/ride/',
  },
  {
    id: 'bolt',
    name: 'Bolt',
    category: '网约车',
    description: '伦敦常见的 Uber 备用选择。价格和等待时间可以对比。',
    href: 'https://bolt.eu/en-gb/',
  },
  {
    id: 'black-cabs',
    name: 'Black cabs',
    chineseName: '伦敦黑色出租车',
    category: '正规出租车',
    description: '机场和市区出租车点可用，通常更贵，但适合深夜、行李多或不想折腾时。',
    href: 'https://tfl.gov.uk/modes/taxis-and-minicabs/',
  },
];

export const appLauncherGroups: ToolAppGroup[] = [
  {
    id: 'translation',
    title: '翻译',
    subtitle: '拍照、语音、离线英文包，先准备好。',
    apps: translationApps,
  },
  {
    id: 'transport',
    title: '交通',
    subtitle: '伦敦地铁公交、全国火车和实时路线。',
    apps: transportApps,
  },
  {
    id: 'food',
    title: '外卖',
    subtitle: '刚到酒店累了，可以先用这些找吃的。',
    apps: foodDeliveryApps,
  },
  {
    id: 'rides',
    title: '打车',
    subtitle: '深夜、大件行李、带老人小孩时更省心。',
    apps: rideApps,
  },
  {
    id: 'maps-weather',
    title: '地图和天气',
    subtitle: '英国天气变脸快，地址也离不开 postcode。',
    apps: [
      {
        id: 'google-maps',
        name: 'Google Maps',
        category: '地图',
        description: '提前保存酒店、机场、药店、超市和第一个车站。',
        href: 'https://www.google.com/maps',
      },
      {
        id: 'apple-maps',
        name: 'Apple Maps',
        category: '地图',
        description: 'iPhone 用户可直接用。建议把酒店地址加入收藏。',
        href: 'https://maps.apple.com/',
      },
      {
        id: 'met-office',
        name: 'Met Office',
        chineseName: '英国气象局',
        category: '天气',
        description: '查英国官方天气预报。出门前看雨、风和体感温度。',
        href: 'https://www.metoffice.gov.uk/weather/forecast/gcpvj0v07',
      },
    ],
  },
];

export const foodDeliveryNotes = [
  '英国外卖主要靠 postcode 找地址。酒店名不够，最好填完整英文地址和邮编。',
  '下单前确认酒店是否允许外卖送到前台。有些酒店只让你自己下楼取。',
  '多数平台需要银行卡、Apple Pay 或 Google Pay。别默认能用微信/支付宝。',
  '深夜可选项会明显变少，刚到英国别拖到太晚才找吃的。',
  '小费不是强制，但服务费、配送费和小额订单费可能会叠加。',
];

export const rideHailingNotes = [
  '机场内有人主动拉客，直接拒绝。用官方出租车点、正规网约车或提前预约车。',
  '上车前核对车牌、车型、司机姓名和目的地。不要只看对方说“Uber”。',
  '深夜、行李多、带老人小孩时，打车比转车更省心，但费用会高很多。',
  'Black cab 通常更贵，但在伦敦比较正规，很多车可以刷卡。',
];

export const transportQuickRules = [
  '坐地铁、Elizabeth line 和多数火车时，同一段旅程进出站必须用同一张卡或同一个手机。',
  '公交通常只上车刷一次，不需要下车再刷。',
  '自动扶梯靠右站，左边留给赶路的人。',
  '遇到罢工、维修或延误，先看 TfL Go、Citymapper 或 National Rail。',
];

export const bilingualPhrases: BilingualPhrase[] = [
  {
    id: 'pharmacy-minor-illness',
    situation: 'Pharmacy',
    chineseSituation: '药店咨询',
    english: 'I need advice for a minor illness. Do I need to see a doctor?',
    chineseMeaning: '我有轻微不适，想咨询一下。我需要看医生吗？',
    tip: '英国药剂师可以处理很多轻微病症建议。紧急情况请拨打 999。',
  },
  {
    id: 'transport-card-failed',
    situation: 'Tube or rail gate',
    chineseSituation: '地铁或火车闸机',
    english: 'My card did not work. Can you help me, please?',
    chineseMeaning: '我的卡没有刷成功。请问可以帮我一下吗？',
    tip: '找车站工作人员，不要反复用不同卡乱刷。',
  },
  {
    id: 'hotel-booking',
    situation: 'Hotel check-in',
    chineseSituation: '酒店入住',
    english: 'I have a booking under this name.',
    chineseMeaning: '我用这个名字预订了房间。',
    tip: '同时出示护照、预订截图和英文姓名。',
  },
  {
    id: 'taxi-address-card',
    situation: 'Taxi or ride-hailing',
    chineseSituation: '出租车或网约车',
    english: 'Please take me to this address. Can I pay by card?',
    chineseMeaning: '请带我去这个地址。可以刷卡支付吗？',
    tip: '上车前出示英文地址和邮编，并确认车牌。',
  },
  {
    id: 'emergency-help',
    situation: 'Emergency',
    chineseSituation: '紧急求助',
    english: 'I need help. Please call 999.',
    chineseMeaning: '我需要帮助。请拨打 999。',
    tip: '999 是英国警察、消防和救护车紧急电话。',
  },
  {
    id: 'restaurant-allergy',
    situation: 'Restaurant allergy',
    chineseSituation: '餐厅过敏询问',
    english: 'Does this contain peanuts, shellfish, or dairy?',
    chineseMeaning: '这道菜含有花生、贝类或乳制品吗？',
    tip: '如果有严重过敏，请提前写清楚并直接出示给服务员。',
  },
];

export const chineseSeoTopics = [
  '第一次去英国旅游，需要先解决网络、支付、交通和紧急联系方式。',
  '中国游客在英国不能默认使用微信支付或支付宝，最好准备 Visa/Mastercard 和备用实体卡。',
  '从希思罗机场到伦敦可选 Elizabeth line、Piccadilly line、Heathrow Express 或正规出租车。',
  '从盖特威克机场到伦敦可选 Gatwick Express、Thameslink、Southern 或正规接送。',
  '英国紧急电话是 999，非紧急医疗建议可使用 NHS 111。',
  '提前准备翻译软件、英文酒店地址、离线地图和常用英文句子，可以降低落地第一天压力。',
];

export function isChineseVisitor(countryId: string) {
  return countryId === 'china';
}
