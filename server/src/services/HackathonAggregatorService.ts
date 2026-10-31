import { BaseScraper } from '../scrapers/BaseScraper';
import { DevpostScraper } from '../scrapers/DevpostScraper';
import { UnstopScraper } from '../scrapers/UnstopScraper';
import { LumaScraper } from '../scrapers/LumaScraper';
import { HackathonValidationService } from './HackathonValidationService';
import { Hackathon } from '../models/Hackathon';
import { logger } from '../config/logger';

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
   * Executes the full multi-platform aggregation pipeline with defensive error isolation and upserts into MongoDB.
   */
  public async runAggregationPipeline(): Promise<IPipelineReport> {
    const startTime = Date.now();
    logger.info('🚀 [Aggregator Pipeline] Commencing multi-platform scrape & sync...');

    let totalScraped = 0;
    let totalUpserted = 0;
    let totalFailedValidation = 0;
    const platformReports: IPipelineReport['platformReports'] = [];

    // Run all scrapers concurrently with isolated error boundaries
    const scraperTasks = this.scrapers.map(async (scraper) => {
      const platformName = scraper.platform;
      try {
        const rawItems = await scraper.scrape();
        let upsertedCount = 0;
        let validationFailures = 0;

        for (const item of rawItems) {
          const validated = HackathonValidationService.validateAndSanitize(item);
          if (!validated) {
            validationFailures++;
            continue;
          }

          try {
            await Hackathon.findOneAndUpdate(
              {
                sourcePlatform: validated.sourcePlatform,
                sourceId: validated.sourceId,
              },
              {
                $set: {
                  ...validated,
                  scrapedAt: new Date(),
                },
              },
              {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
              }
            );
            upsertedCount++;
          } catch (dbErr: any) {
            logger.error(
              `[Aggregator] DB upsert failed for ${validated.sourcePlatform}#${validated.sourceId}: ${dbErr.message}`
            );
          }
        }

        return {
          platform: platformName,
          success: true,
          scraped: rawItems.length,
          upserted: upsertedCount,
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
        totalUpserted += val.upserted;
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

    const durationMs = Date.now() - startTime;
    logger.info(
      `🏁 [Aggregator Pipeline] Completed in ${durationMs}ms. Scraped: ${totalScraped}, Upserted: ${totalUpserted}, Discarded: ${totalFailedValidation}`
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

export const aggregatorService = new HackathonAggregatorService();

