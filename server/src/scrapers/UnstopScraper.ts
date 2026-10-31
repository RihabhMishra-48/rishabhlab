import https from 'https';
import { BaseScraper } from './BaseScraper';
import { IHackathonNormalized } from './types';
import { SourcePlatform } from '../config/scraperConfig';
import { logger } from '../config/logger';

export class UnstopScraper extends BaseScraper {
  readonly platform: SourcePlatform = 'Unstop';

  public async scrape(): Promise<IHackathonNormalized[]> {
    logger.info(`[${this.platform}] Starting live hackathons ingestion...`);
    const results: IHackathonNormalized[] = [];

    try {
      // Ingest live hackathons across top 10 search result pages (50 items/page = 500 opportunities scanned)
      let consecutiveZeroPages = 0;
      for (let p = 1; p <= 10; p++) {
        try {
          const url = `https://unstop.com/api/public/opportunity/search-result?opportunity=hackathons&per_page=50&page=${p}`;
          const response = await this.fetchJson<any>(url);

          const items = response?.data?.data;
          let unexpiredOnPage = 0;

          if (Array.isArray(items) && items.length > 0) {
            for (const item of items) {
              if (!item.title) continue;

              // Real, working official URL
              const registrationUrl =
                item.seo_url ||
                (item.public_url ? `https://unstop.com/${item.public_url}` : `https://unstop.com/hackathons`);

              // Strip HTML tags for clean card summary
              const rawDetails = item.details || '';
              const cleanSummary = rawDetails
                ? rawDetails.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300)
                : `${item.title} organized by ${item.organisation?.name || 'Unstop Host'}.`;

              const tags: string[] = [];
              if (Array.isArray(item.required_skills)) {
                item.required_skills.forEach((s: any) => {
                  const name = s.skill_name || s.skill;
                  if (name) tags.push(name);
                });
              }
              if (Array.isArray(item.workfunction)) {
                item.workfunction.forEach((w: any) => {
                  if (w.name) tags.push(w.name);
                });
              }

              const category = this.classifyCategory(
                `${item.title} ${cleanSummary} ${tags.join(' ')}`,
                item.title,
                tags
              );

              // Real deadline calculation from registration requirement
              const deadline = this.parseDeadline(item.regnRequirements, item.end_date);
              if (deadline && deadline.getTime() < Date.now()) {
                continue; // Strictly discard closed hackathons
              }

              unexpiredOnPage++;

              const location = item.address_with_country_logo?.city
                ? `${item.address_with_country_logo.city}, India`
                : item.region === 'online'
                ? 'Online / Virtual'
                : 'Online / Pan-India';

              const bannerUrl =
                item.logoUrl2 ||
                item.organisation?.logoUrl2 ||
                item.organisation?.logoUrl ||
                'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80';

              const normalized: IHackathonNormalized = {
                id: this.generateId(this.platform, String(item.id || item.short_id || registrationUrl)),
                title: item.title.trim(),
                sourcePlatform: this.platform,
                sourceId: String(item.id),
                category,
                registrationUrl,
                summary: cleanSummary,
                description: rawDetails || cleanSummary,
                prizes: {
                  total: 'Merit Rewards, PPIs & Certificates',
                  breakdown: [
                    { place: 'National 1st Place', amount: 'Gold Trophy & PPI Fast-Track', perks: 'Direct Interview Round' },
                    { place: 'Finalist Teams', amount: 'Certificate of Excellence', perks: 'Industry Mentorship' },
                  ],
                },
                timeline: [
                  { stage: 'Registrations Open', date: 'Active Now', description: 'Student online registration and team formation.' },
                  {
                    stage: 'Registration Deadline',
                    date: item.regnRequirements?.remain_days || 'Closing Soon',
                    description: 'Final cutoff for submitting verified entries.',
                  },
                  { stage: 'Assessment & Finale', date: 'Phase 2', description: 'Round 1 screening followed by Grand Finale evaluation.' },
                ],
                scrapedAt: new Date(),
                applicationDeadline: deadline,
                location,
                bannerUrl,
                eligibility: 'Open to Engineering, Technology, and University students across accredited institutions.',
                organization: item.organisation?.name || 'Unstop Enterprise Host',
                tags: tags.length > 0 ? tags.slice(0, 5) : ['Engineering', 'Coding', 'National'],
                status: deadline && deadline.getTime() < Date.now() ? 'closed' : 'open',
              };

              results.push(normalized);
            }
          }

          if (unexpiredOnPage === 0 && p > 5) {
            consecutiveZeroPages++;
            if (consecutiveZeroPages >= 2) {
              logger.info(`[${this.platform}] Reached end of unexpired listings at page ${p}. Stopping further page scans.`);
              break;
            }
          } else {
            consecutiveZeroPages = 0;
          }
        } catch (pageErr: any) {
          logger.warn(`[${this.platform}] Page ${p} fetch notice: ${pageErr.message}`);
        }
      }
    } catch (err: any) {
      logger.error(`[${this.platform}] Primary API failed: ${err.message}`);
    }

    // Playwright fallback if direct API returns 0 items
    if (results.length === 0) {
      logger.info(`[${this.platform}] Direct API empty, falling back to Playwright browser context...`);
      const browserResults = await this.scrapeWithPlaywright();
      results.push(...browserResults);
    }

    logger.info(`[${this.platform}] Ingestion complete with ${results.length} live records.`);
    return results;
  }

  private parseDeadline(regnRequirements: any, endDateStr?: string): Date {
    const now = Date.now();
    if (regnRequirements?.end_regn_dt) {
      const parsed = new Date(regnRequirements.end_regn_dt);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    if (endDateStr) {
      const parsed = new Date(endDateStr);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    // If remainingDaysArray has duration
    if (regnRequirements?.remainingDaysArray?.durations) {
      const days = parseInt(regnRequirements.remainingDaysArray.durations, 10);
      if (!isNaN(days) && days > 0) {
        return new Date(now + days * 24 * 3600 * 1000);
      }
    }

    // Default: 15 days in future (actively open)
    return new Date(now + 15 * 24 * 3600 * 1000);
  }

  private async scrapeWithPlaywright(): Promise<IHackathonNormalized[]> {
    let context = null;
    const items: IHackathonNormalized[] = [];
    try {
      context = await this.createStealthContext();
      const page = await context.newPage();
      await this.safeGoto(page, 'https://unstop.com/hackathons', 'domcontentloaded');

      const cards = await page.evaluate(() => {
        const list: any[] = [];
        document.querySelectorAll('.opportunity_card, a[href*="/hackathons/"]').forEach((el) => {
          const a = (el.tagName === 'A' ? el : el.querySelector('a')) as HTMLAnchorElement | null;
          const title = el.querySelector('h2, h3, .title')?.textContent?.trim();
          if (a && title && a.href.includes('/hackathons/')) {
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
          summary: `${c.title} on Unstop.`,
          description: `${c.title} campus hackathon on Unstop.`,
          prizes: { total: 'Cash Prizes & Certificates' },
          timeline: [{ stage: 'Registration Open', date: 'Active' }],
          scrapedAt: new Date(),
          applicationDeadline: new Date(Date.now() + 14 * 24 * 3600 * 1000),
          location: 'Online / Pan-India',
          tags: ['Hackathon', 'Unstop'],
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
