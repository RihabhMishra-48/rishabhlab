import cron from 'node-cron';
import { aggregatorService, IPipelineReport } from './HackathonAggregatorService';
import { SCRAPER_CONFIG } from '../config/scraperConfig';
import { logger } from '../config/logger';

export class SchedulerService {
  private isJobRunning = false;
  private cronJob: ReturnType<typeof cron.schedule> | null = null;
  private lastReport: IPipelineReport | null = null;

  /**
   * Initializes the 24-hour Node-Cron scheduler.
   */
  public initScheduler(): void {
    const schedule = SCRAPER_CONFIG.cronSchedule;
    logger.info(`⏰ [Scheduler] Registering 24-hour hackathon aggregation cron with pattern: "${schedule}"`);

    this.cronJob = cron.schedule(schedule, async () => {
      logger.info('⏰ [Scheduler] 24-Hour cron triggered. Initiating pipeline execution...');
      await this.executeJob();
    });
  }

  /**
   * Safe execution wrapper with concurrency locks.
   */
  public async executeJob(): Promise<IPipelineReport | null> {
    if (this.isJobRunning) {
      logger.warn('⚠️ [Scheduler] Aggregation job is already running. Skipping overlapping execution.');
      return null;
    }

    this.isJobRunning = true;
    try {
      this.lastReport = await aggregatorService.runAggregationPipeline();
      return this.lastReport;
    } catch (err: any) {
      logger.error(`❌ [Scheduler] Pipeline failed: ${err.message}`, { stack: err.stack });
      return null;
    } finally {
      this.isJobRunning = false;
    }
  }

  /**
   * Allows manual on-demand trigger via API endpoint.
   */
  public async triggerManualSync(): Promise<{ isRunning: boolean; report?: IPipelineReport | null; message: string }> {
    if (this.isJobRunning) {
      return {
        isRunning: true,
        message: 'A scraping pipeline is currently active. Please monitor logs or retry in a few moments.',
      };
    }

    // Execute asynchronously or await
    const report = await this.executeJob();
    return {
      isRunning: false,
      report,
      message: 'Scraping and aggregation pipeline completed successfully.',
    };
  }

  public getStatus() {
    return {
      isJobRunning: this.isJobRunning,
      cronSchedule: SCRAPER_CONFIG.cronSchedule,
      lastReport: this.lastReport,
    };
  }

  public stopScheduler(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      logger.info('🛑 [Scheduler] Cron scheduler stopped.');
    }
  }
}

export const schedulerService = new SchedulerService();
