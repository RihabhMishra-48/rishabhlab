import { BaseScraper } from '../scrapers/BaseScraper';
import { DevpostScraper } from '../scrapers/DevpostScraper';
import { UnstopScraper } from '../scrapers/UnstopScraper';
import { LumaScraper } from '../scrapers/LumaScraper';
import { HackathonValidationService } from './HackathonValidationService';
import { logger } from '../config/logger';
import { supabase, isSupabaseConfigured } from '../config/supabase';

export interface IPipelineReport {
  timestamp: string;
  totalScraped: number;
  totalUpserted: number;
  totalFailedValidation: number;
  durationMs: number;
  platformReports: Array<{
    platform: string;
    success: boolean;
    scraped: number;
    upserted: number;
    error?: string;
  }>;
}

export class HackathonAggregatorService {
  private scrapers: BaseScraper[];

  constructor() {
    this.scrapers = [
      new DevpostScraper(),
      new UnstopScraper(),
      new LumaScraper(),
    ];
  }

  /**
   * Executes the full multi-platform aggregation pipeline.
   * Scrapes live hackathons from Devpost, Unstop, Luma, validates them,
   * purges/swaps stale public hackathons in Supabase, and stores fresh records directly in Supabase.
   */
  public async runAggregationPipeline(): Promise<IPipelineReport> {
    const startTime = Date.now();
    logger.info('🚀 [Aggregator Pipeline] Commencing admin-directed live scrape & sync to Supabase...');

    let totalScraped = 0;
    let totalUpserted = 0;
    let totalFailedValidation = 0;
    const platformReports: IPipelineReport['platformReports'] = [];
    const allValidatedItems: any[] = [];

    // Run all scrapers concurrently with isolated error boundaries
    const scraperTasks = this.scrapers.map(async (scraper) => {
      const platformName = scraper.platform;
      try {
        const rawItems = await scraper.scrape();
        let validForPlatform = 0;
        let validationFailures = 0;

        for (const item of rawItems) {
          const validated = HackathonValidationService.validateAndSanitize(item);
          if (!validated) {
            validationFailures++;
            continue;
          }
          allValidatedItems.push(validated);
          validForPlatform++;
        }

        return {
          platform: platformName,
          success: true,
          scraped: rawItems.length,
          upserted: validForPlatform,
          failedValidation: validationFailures,
        };
      } catch (scraperErr: any) {
        logger.error(`[Aggregator] Scraper failed for ${platformName}: ${scraperErr.message}`, {
          platform: platformName,
          stack: scraperErr.stack,
        });
        return {
          platform: platformName,
          success: false,
          scraped: 0,
          upserted: 0,
          failedValidation: 0,
          error: scraperErr.message,
        };
      }
    });

    const settledResults = await Promise.allSettled(scraperTasks);

    for (const res of settledResults) {
      if (res.status === 'fulfilled') {
        const val = res.value;
        totalScraped += val.scraped;
        totalFailedValidation += val.failedValidation;
        platformReports.push({
          platform: val.platform,
          success: val.success,
          scraped: val.scraped,
          upserted: val.upserted,
          error: val.error,
        });
      } else {
        logger.error(`[Aggregator] Uncaught scraper task rejection: ${res.reason}`);
      }
    }

    // SWAP: Store freshly scraped hackathons directly into Supabase database
    if (isSupabaseConfigured() && supabase && allValidatedItems.length > 0) {
      try {
        const supabaseRows = allValidatedItems.map((item) => ({
          user_id: null, // Public aggregated listing
          hackathon_name: item.title,
          selected_track: item.category,
          problem_statement: item.summary || item.description || '',
          target_event_date: item.applicationDeadline ? new Date(item.applicationDeadline).toISOString() : null,
          phases: Array.isArray(item.timeline) ? item.timeline : [],
          team_members: Array.isArray(item.tags) ? item.tags : [],
          ai_outputs: {
            id: item.id,
            sourcePlatform: item.sourcePlatform,
            sourceId: item.sourceId,
            registrationUrl: item.registrationUrl,
            prizes: item.prizes,
            bannerUrl: item.bannerUrl || '',
            location: item.location || 'Online / Virtual',
            organization: item.organization || '',
            eligibility: item.eligibility || 'Open to all builders and students globally.',
            tags: item.tags || [],
            status: item.status || 'open',
            description: item.description || '',
            scrapedAt: new Date().toISOString(),
          },
        }));

        // 1. Purge stale public hackathons (only where user_id IS NULL, preserving all student personalized plans)
        const { error: delErr } = await supabase.from('hackathons').delete().is('user_id', null);
        if (delErr) {
          logger.warn(`[Aggregator] Stale hackathons purge notice: ${delErr.message}`);
        } else {
          logger.info('[Aggregator] Stale public hackathons purged successfully from Supabase.');
        }

        // 2. Batch insert fresh scraped records in chunks of 50
        const BATCH_SIZE = 50;
        let insertedCount = 0;
        for (let i = 0; i < supabaseRows.length; i += BATCH_SIZE) {
          const chunk = supabaseRows.slice(i, i + BATCH_SIZE);
          const { data: inserted, error: insErr } = await supabase.from('hackathons').insert(chunk).select('id');
          if (!insErr && inserted) {
            insertedCount += inserted.length;
          } else if (insErr) {
            logger.error(`[Aggregator] Supabase batch insert error: ${insErr.message}`);
          }
        }

        totalUpserted = insertedCount;
        logger.info(`✨ [Aggregator] Successfully stored ${insertedCount} live hackathons directly into Supabase database.`);
      } catch (sbErr: any) {
        logger.error(`[Aggregator] Supabase sync exception: ${sbErr.message}`);
      }
    }

    const durationMs = Date.now() - startTime;
    logger.info(
      `🏁 [Aggregator Pipeline] Completed in ${durationMs}ms. Scraped: ${totalScraped}, Stored in Supabase: ${totalUpserted}, Discarded: ${totalFailedValidation}`
    );

    return {
      timestamp: new Date().toISOString(),
      totalScraped,
      totalUpserted,
      totalFailedValidation,
      durationMs,
      platformReports,
    };
  }
}

export const hackathonAggregatorService = new HackathonAggregatorService();

export const aggregatorService = new HackathonAggregatorService();

