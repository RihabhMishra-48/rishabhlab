export const HACKATHON_CATEGORIES = [
  'AI/ML',
  'Web3/Blockchain',
  'Open Innovation',
  'FinTech',
  'Mobile/Web Dev',
  'Cybersecurity',
  'Cloud & DevOps',
] as const;

export type HackathonCategory = typeof HACKATHON_CATEGORIES[number];

export const SOURCE_PLATFORMS = ['Unstop', 'Devpost', 'Luma'] as const;
export type SourcePlatform = typeof SOURCE_PLATFORMS[number];

export const REALISTIC_USER_AGENTS: string[] = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
];

export const SCRAPER_CONFIG = {
  cronSchedule: process.env.HACKATHON_CRON_SCHEDULE || '0 0 * * *', // Every 24 hours at midnight
  navigationTimeoutMs: Number(process.env.SCRAPER_NAV_TIMEOUT_MS) || 30000,
  networkIdleTimeoutMs: Number(process.env.SCRAPER_IDLE_TIMEOUT_MS) || 15000,
  minJitterDelayMs: 1000,
  maxJitterDelayMs: 3000,
  maxItemsPerPlatform: Number(process.env.SCRAPER_MAX_ITEMS) || 25,
  defaultHeaders: {
    'Accept-Language': 'en-US,en;q=0.9',
    'sec-ch-ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'none',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1',
  },
};

