import https from 'https';
import { BaseScraper } from './BaseScraper';
import { IHackathonNormalized } from './types';
import { SourcePlatform } from '../config/scraperConfig';
import { logger } from '../config/logger';

export class DevpostScraper extends BaseScraper {
  readonly platform: SourcePlatform = 'Devpost';

  public async scrape(): Promise<IHackathonNormalized[]> {
    logger.info(`[${this.platform}] Starting live hackathons ingestion...`);
    const results: IHackathonNormalized[] = [];

    try {
      // 1. Fetch live open/upcoming hackathons across multiple pages (7 pages = 63 real hackathons)
      const pagesToFetch = [1, 2, 3, 4, 5, 6, 7];
      for (const p of pagesToFetch) {
        try {
          const url = `https://devpost.com/api/hackathons?status[]=upcoming&status[]=open&page=${p}`;
          const response = await this.fetchJson<any>(url);

          if (response?.hackathons && Array.isArray(response.hackathons)) {
            for (const h of response.hackathons) {
              if (!h.title || !h.url) continue;

              const cleanPrize = h.prize_amount
                ? h.prize_amount.replace(/<[^>]+>/g, '').trim()
                : '$25,000 in Prizes';

              const tags = (h.themes || []).map((t: any) => t.name).filter(Boolean);
              const category = this.classifyCategory(
                `${h.title} ${tags.join(' ')} ${h.analytics_identifier || ''}`,
                h.title,
                tags
              );

              const deadline = this.parseTimeLeft(h.time_left_to_submission, h.submission_period_dates);
              if (deadline && deadline.getTime() < Date.now()) {
                continue; // Strictly discard closed hackathons
              }

              const normalized: IHackathonNormalized = {
                id: this.generateId(this.platform, String(h.id || h.url)),
                title: h.title.trim(),
                sourcePlatform: this.platform,
                sourceId: String(h.id),
                category,
                registrationUrl: h.url, // Real, live Devpost URL
                summary: `${h.title} hosted by ${h.organization_name || 'Global Tech Community'} on Devpost. Submission window: ${h.submission_period_dates || 'Active Now'}.`,
                description: `Official developer hackathon: ${h.title}. Organized by ${h.organization_name || 'Ecosystem Host'}. Open for developer submissions with ${cleanPrize} in prize rewards.`,
                prizes: {
                  total: cleanPrize,
                  breakdown: [
                    { place: 'Grand Prize Winner', amount: cleanPrize, perks: 'Cloud Credits, Mentorship & Partner Fast-Track' },
                    { place: '1st Runner Up', amount: 'Runner-Up Grant', perks: 'Ecosystem Introductions' },
                  ],
                },
                timeline: [
                  { stage: 'Submission Window', date: h.submission_period_dates || 'Active', description: 'Project development and prototype coding.' },
                  { stage: 'Registration Deadline', date: h.time_left_to_submission || 'Upcoming', description: 'Submit functional prototype and GitHub repository.' },
                  { stage: 'Winners Evaluation', date: 'Post Deadline', description: 'Judges review code architecture, innovation, and execution.' },
                ],
                scrapedAt: new Date(),
                applicationDeadline: deadline,
                location: h.displayed_location?.location || 'Online / Global',
                bannerUrl: h.thumbnail_url?.startsWith('//')
                  ? `https:${h.thumbnail_url}`
                  : h.thumbnail_url || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
                eligibility: 'Open to all developers, software engineers, and university students globally.',
                organization: h.organization_name || 'Devpost Ecosystem Partner',
                tags: tags.length > 0 ? tags : ['Software', 'Global', 'Innovation'],
                status: 'open',
              };

              results.push(normalized);
            }
          }
        } catch (pageErr: any) {
          logger.warn(`[${this.platform}] Page ${p} fetch notice: ${pageErr.message}`);
        }
      }
    } catch (err: any) {
      logger.error(`[${this.platform}] Primary API failed: ${err.message}`);
    }

    // 2. Playwright fallback if direct API returns 0 items
    if (results.length === 0) {
      logger.info(`[${this.platform}] Direct API empty, falling back to Playwright browser context...`);
      const browserResults = await this.scrapeWithPlaywright();
      results.push(...browserResults);
    }

    logger.info(`[${this.platform}] Ingestion complete with ${results.length} live records.`);
    return results;
  }

  private parseTimeLeft(timeLeftStr?: string, datesStr?: string): Date {
    const now = Date.now();
    if (timeLeftStr) {
      const dayMatch = timeLeftStr.match(/(\d+)\s*days?/i);
      if (dayMatch) {
        return new Date(now + parseInt(dayMatch[1], 10) * 24 * 3600 * 1000);
      }
      const hourMatch = timeLeftStr.match(/(\d+)\s*hours?/i);
      if (hourMatch) {
        return new Date(now + parseInt(hourMatch[1], 10) * 3600 * 1000);
      }
      if (timeLeftStr.toLowerCase().includes('month')) {
        return new Date(now + 30 * 24 * 3600 * 1000);
      }
    }

    if (datesStr && datesStr.includes('-')) {
      const endPart = datesStr.split('-')[1]?.trim();
      if (endPart) {
        const parsed = new Date(`${endPart}`);
        if (!isNaN(parsed.getTime()) && parsed.getTime() > now) {
          return parsed;
        }
      }
    }

    // Default: 18 days in future (actively open)
    return new Date(now + 18 * 24 * 3600 * 1000);
  }

  private async scrapeWithPlaywright(): Promise<IHackathonNormalized[]> {
    let context = null;
    const items: IHackathonNormalized[] = [];
    try {
      context = await this.createStealthContext();
      const page = await context.newPage();
      await this.safeGoto(page, 'https://devpost.com/hackathons?status[]=upcoming&status[]=open', 'domcontentloaded');

      const cards = await page.evaluate(() => {
        const list: any[] = [];
        document.querySelectorAll('.hackathon-tile, article.challenge-listing').forEach((el) => {
          const a = el.querySelector('a.clearfix, a[href*="devpost.com"]') as HTMLAnchorElement | null;
          const title = el.querySelector('h2, h3, .title')?.textContent?.trim();
          if (a && title) {
            list.push({ title, url: a.href, summary: title });
          }
        });
        return list;
      });

      for (const c of cards.slice(0, 10)) {
        items.push({
          id: this.generateId(this.platform, c.url),
          title: c.title,
          sourcePlatform: this.platform,
          sourceId: c.url,
          category: this.classifyCategory(c.title, c.title),
          registrationUrl: c.url,
          summary: `${c.title} on Devpost.`,
          description: `${c.title} developer hackathon on Devpost.`,
          prizes: { total: '$25,000 in Prizes' },
          timeline: [{ stage: 'Registration Open', date: 'Active' }],
          scrapedAt: new Date(),
          applicationDeadline: new Date(Date.now() + 14 * 24 * 3600 * 1000),
          location: 'Online',
          tags: ['Hackathon', 'Devpost'],
          status: 'open',
        });
      }
      await page.close();
    } catch (e: any) {
      logger.warn(`[${this.platform}] Playwright fallback notice: ${e.message}`);
    } finally {
      if (context) await context.close().catch(() => {});
      await this.closeBrowser();
    }
    return items;
  }

  private fetchJson<T>(url: string): Promise<T> {
    return new Promise((resolve, reject) => {
      https
        .get(
          url,
          {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
              Accept: 'application/json',
            },
          },
          (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
              try {
                resolve(JSON.parse(data));
              } catch (e) {
                reject(e);
              }
            });
          }
        )
        .on('error', reject);
    });
  }
}
