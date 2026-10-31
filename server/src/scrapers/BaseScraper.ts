import { chromium, Browser, BrowserContext, Page } from 'playwright';
import crypto from 'crypto';
import { IScraper, IHackathonNormalized } from './types';
import {
  HackathonCategory,
  SourcePlatform,
  REALISTIC_USER_AGENTS,
  SCRAPER_CONFIG,
} from '../config/scraperConfig';
import { logger } from '../config/logger';

export abstract class BaseScraper implements IScraper {
  abstract readonly platform: SourcePlatform;
  protected browser: Browser | null = null;

  /**
   * Initializes a single headless Playwright browser instance with anti-detection args.
   */
  protected async launchBrowser(): Promise<Browser> {
    if (this.browser) {
      return this.browser;
    }

    try {
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--disable-blink-features=AutomationControlled',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      });
      return this.browser;
    } catch (err: any) {
      logger.error(`[${this.platform}] Failed to launch Playwright browser: ${err.message}`, {
        platform: this.platform,
        stack: err.stack,
      });
      throw err;
    }
  }

  /**
   * Creates a stealth Playwright BrowserContext with rotated User-Agent and masked properties.
   */
  protected async createStealthContext(): Promise<BrowserContext> {
    const browser = await this.launchBrowser();
    const userAgent = this.getRandomUserAgent();

    const viewports = [
      { width: 1920, height: 1080 },
      { width: 1440, height: 900 },
      { width: 1366, height: 768 },
    ];
    const viewport = viewports[Math.floor(Math.random() * viewports.length)];

    const context = await browser.newContext({
      userAgent,
      viewport,
      locale: 'en-US',
      timezoneId: 'America/New_York',
      extraHTTPHeaders: SCRAPER_CONFIG.defaultHeaders,
    });

    // Stealth script to mask navigator.webdriver and emulation fingerprints
    await context.addInitScript(() => {
      // Overwrite navigator.webdriver
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });

      // Emulate realistic chrome runtime
      (window as any).chrome = {
        runtime: {},
        loadTimes: () => {},
        csi: () => {},
        app: {},
      };

      // Emulate realistic plugin array
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });

      // Emulate realistic languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });
    });

    return context;
  }

  /**
   * Safely shuts down the browser and clears references.
   */
  protected async closeBrowser(): Promise<void> {
    if (this.browser) {
      try {
        await this.browser.close();
      } catch (err: any) {
        logger.warn(`[${this.platform}] Warning closing browser: ${err.message}`);
      } finally {
        this.browser = null;
      }
    }
  }

  /**
   * Introduces random jitter delays (1-3 seconds) to emulate organic browsing patterns.
   */
  protected async jitterDelay(
    minMs: number = SCRAPER_CONFIG.minJitterDelayMs,
    maxMs: number = SCRAPER_CONFIG.maxJitterDelayMs
  ): Promise<void> {
    const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  /**
   * Safe page navigation with configurable timeouts and networkidle fallback.
   */
  protected async safeGoto(
    page: Page,
    url: string,
    waitUntil: 'load' | 'domcontentloaded' | 'networkidle' = 'domcontentloaded'
  ): Promise<boolean> {
    try {
      await page.goto(url, {
        waitUntil,
        timeout: SCRAPER_CONFIG.navigationTimeoutMs,
      });
      return true;
    } catch (err: any) {
      logger.warn(`[${this.platform}] Navigation timeout/warning for ${url}: ${err.message}`);
      // Fallback: check if page still has DOM content
      try {
        const title = await page.title();
        return Boolean(title);
      } catch {
        return false;
      }
    }
  }

  /**
   * Selects a random modern User-Agent from the pool.
   */
  protected getRandomUserAgent(): string {
    const index = Math.floor(Math.random() * REALISTIC_USER_AGENTS.length);
    return REALISTIC_USER_AGENTS[index];
  }

  /**
   * Generates a deterministic system hash from sourcePlatform + sourceId.
   */
  public generateId(platform: SourcePlatform, sourceId: string): string {
    return crypto
      .createHash('sha256')
      .update(`${platform.toLowerCase()}:${sourceId.trim()}`)
      .digest('hex')
      .slice(0, 24);
  }

  /**
   * Uniform classification engine categorizing unstructured text into our strict standard enum.
   */
  public classifyCategory(
    text: string,
    title: string = '',
    tags: string[] = []
  ): HackathonCategory {
    const corpus = `${title} ${text} ${tags.join(' ')}`.toLowerCase();

    // 1. Web3 / Blockchain
    if (
      corpus.includes('web3') ||
      corpus.includes('blockchain') ||
      corpus.includes('crypto') ||
      corpus.includes('solana') ||
      corpus.includes('ethereum') ||
      corpus.includes('smart contract') ||
      corpus.includes('defi') ||
      corpus.includes('dao') ||
      corpus.includes('nft') ||
      corpus.includes('sui') ||
      corpus.includes('ton') ||
      corpus.includes('aptos')
    ) {
      return 'Web3/Blockchain';
    }

    // 2. AI / ML
    if (
      corpus.includes('ai') ||
      corpus.includes('artificial intelligence') ||
      corpus.includes('machine learning') ||
      corpus.includes('deep learning') ||
      corpus.includes('llm') ||
      corpus.includes('genai') ||
      corpus.includes('generative ai') ||
      corpus.includes('neural') ||
      corpus.includes('openai') ||
      corpus.includes('agent') ||
      corpus.includes('computer vision') ||
      corpus.includes('nlp') ||
      corpus.includes('diffusion') ||
      corpus.includes('rag')
    ) {
      return 'AI/ML';
    }

    // 3. FinTech
    if (
      corpus.includes('fintech') ||
      corpus.includes('finance') ||
      corpus.includes('banking') ||
      corpus.includes('payment') ||
      corpus.includes('trading') ||
      corpus.includes('algorithmic trading') ||
      corpus.includes('fraud detection')
    ) {
      return 'FinTech';
    }

    // 4. Cybersecurity
    if (
      corpus.includes('cyber') ||
      corpus.includes('security') ||
      corpus.includes('infosec') ||
      corpus.includes('ctf') ||
      corpus.includes('vulnerability') ||
      corpus.includes('bug bounty') ||
      corpus.includes('penetration testing') ||
      corpus.includes('zero-trust')
    ) {
      return 'Cybersecurity';
    }

    // 5. Cloud & DevOps
    if (
      corpus.includes('devops') ||
      corpus.includes('cloud') ||
      corpus.includes('kubernetes') ||
      corpus.includes('docker') ||
      corpus.includes('terraform') ||
      corpus.includes('aws') ||
      corpus.includes('gcp') ||
      corpus.includes('azure') ||
      corpus.includes('ci/cd')
    ) {
      return 'Cloud & DevOps';
    }

    // 6. Mobile / Web Dev
    if (
      corpus.includes('web dev') ||
      corpus.includes('mobile dev') ||
      corpus.includes('react') ||
      corpus.includes('next.js') ||
      corpus.includes('flutter') ||
      corpus.includes('android') ||
      corpus.includes('ios') ||
      corpus.includes('swift') ||
      corpus.includes('frontend') ||
      corpus.includes('backend') ||
      corpus.includes('full-stack') ||
      corpus.includes('fullstack')
    ) {
      return 'Mobile/Web Dev';
    }

    // Default fallback category
    return 'Open Innovation';
  }

  /**
   * Main entry point to be implemented by platform sub-classes.
   */
  abstract scrape(): Promise<IHackathonNormalized[]>;
}

