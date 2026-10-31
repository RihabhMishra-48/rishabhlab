import { Request, Response } from 'express';
import { Hackathon } from '../models/Hackathon';
import { HACKATHON_CATEGORIES, HackathonCategory } from '../config/scraperConfig';
import { schedulerService } from '../services/SchedulerService';
import { logger } from '../config/logger';

export class HackathonController {
  /**
   * GET /api/hackathons
   * Query params: category, search, source, status, grouped, page, limit
   * Defaults to returning ONLY ACTIVE & OPEN hackathons so closed events never clutter the view.
   */
  public async getHackathons(req: Request, res: Response): Promise<void> {
    try {
      const {
        category,
        search,
        source,
        status = 'open', // Default: open active hackathons only
        grouped,
        page = '1',
        limit = '60',
      } = req.query;

      const now = new Date();

      // Ensure we only query valid, active, non-closed hackathons
      const filter: Record<string, any> = {
        title: { $exists: true, $ne: '' },
        id: { $exists: true },
        status: { $ne: 'closed' },
        $or: [{ applicationDeadline: { $gte: now } }, { applicationDeadline: null }],
      };

      // 1. Category / Theme Filter
      if (category && typeof category === 'string' && category.toLowerCase() !== 'all') {
        const matchingCategory = HACKATHON_CATEGORIES.find(
          (c) => c.toLowerCase() === category.toLowerCase()
        );
        if (matchingCategory) {
          filter.category = matchingCategory;
        }
      }

      // 3. Platform / Source Filter
      if (source && typeof source === 'string' && source.toLowerCase() !== 'all') {
        filter.sourcePlatform = new RegExp(`^${source}$`, 'i');
      }

      // 4. Search query filter
      if (search && typeof search === 'string' && search.trim().length > 0) {
        const searchRegex = new RegExp(search.trim(), 'i');
        filter.$or = [
          { title: searchRegex },
          { summary: searchRegex },
          { organization: searchRegex },
          { tags: searchRegex },
        ];
      }

      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 60));
      const skip = (pageNum - 1) * limitNum;

      const [rawHackathons, total] = await Promise.all([
        Hackathon.find(filter)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Hackathon.countDocuments(filter),
      ]);

      // Enrich documents with active/closed/closing-soon status
      const hackathons = rawHackathons.map((h) => {
        const deadline = h.applicationDeadline ? new Date(h.applicationDeadline) : null;
        const isClosed = h.status === 'closed' || Boolean(deadline && deadline.getTime() < now.getTime());
        const isClosingSoon = Boolean(
          deadline &&
          !isClosed &&
          deadline.getTime() - now.getTime() < 3 * 24 * 3600 * 1000 &&
          deadline.getTime() > now.getTime()
        );

        return {
          ...h,
          isClosed,
          isClosingSoon,
          status: isClosed ? 'closed' : h.status || 'open',
        };
      });

      // Priority sort: nearest deadline first
      hackathons.sort((a, b) => {
        if (a.isClosed && !b.isClosed) return 1;
        if (!a.isClosed && b.isClosed) return -1;

        if (!a.isClosed && !b.isClosed) {
          const dateA = a.applicationDeadline ? new Date(a.applicationDeadline).getTime() : Infinity;
          const dateB = b.applicationDeadline ? new Date(b.applicationDeadline).getTime() : Infinity;
          return dateA - dateB;
        }

        const dateA = a.applicationDeadline ? new Date(a.applicationDeadline).getTime() : 0;
        const dateB = b.applicationDeadline ? new Date(b.applicationDeadline).getTime() : 0;
        return dateB - dateA;
      });

      // Grouped layout view
      if (grouped === 'true' || grouped === '1') {
        const groupedByCategory: Record<string, any[]> = {};
        for (const cat of HACKATHON_CATEGORIES) {
          groupedByCategory[cat] = [];
        }

        hackathons.forEach((h) => {
          if (!groupedByCategory[h.category]) {
            groupedByCategory[h.category] = [];
          }
          groupedByCategory[h.category].push(h);
        });

        res.json({
          success: true,
          total,
          count: hackathons.length,
          categories: HACKATHON_CATEGORIES,
          groups: groupedByCategory,
        });
        return;
      }

      res.json({
        success: true,
        page: pageNum,
        limit: limitNum,
        total,
        count: hackathons.length,
        categories: HACKATHON_CATEGORIES,
        hackathons,
      });
    } catch (err: any) {
      logger.error(`[HackathonController] getHackathons error: ${err.message}`, { stack: err.stack });
      res.status(500).json({ success: false, message: 'Failed to retrieve aggregated hackathons.' });
    }
  }

  /**
   * GET /api/hackathons/:id
   * Deep details for localized page/modal presentation.
   */
  public async getHackathonById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const hackathon = await Hackathon.findOne({
        $and: [
          { title: { $exists: true, $ne: '' } },
          { $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
        ],
      }).lean();

      if (!hackathon) {
        res.status(404).json({ success: false, message: `Hackathon "${id}" not found.` });
        return;
      }

      const now = new Date();
      const deadline = hackathon.applicationDeadline ? new Date(hackathon.applicationDeadline) : null;
      const isClosed = hackathon.status === 'closed' || Boolean(deadline && deadline.getTime() < now.getTime());
      const isClosingSoon = Boolean(
        deadline &&
        !isClosed &&
        deadline.getTime() - now.getTime() < 3 * 24 * 3600 * 1000 &&
        deadline.getTime() > now.getTime()
      );

      res.json({
        success: true,
        hackathon: {
          ...hackathon,
          isClosed,
          isClosingSoon,
          status: isClosed ? 'closed' : hackathon.status || 'open',
        },
      });
    } catch (err: any) {
      logger.error(`[HackathonController] getHackathonById error: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to retrieve hackathon details.' });
    }
  }

  /**
   * GET /api/hackathons/categories
   * Returns list of uniform categories along with count of active hackathons in each.
   */
  public async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const now = new Date();
      const counts = await Hackathon.aggregate([
        {
          $match: {
            title: { $exists: true, $ne: '' },
            id: { $exists: true },
            $or: [{ applicationDeadline: { $gte: now } }, { applicationDeadline: null }],
            status: { $ne: 'closed' },
          },
        },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]);

      const countMap = new Map<string, number>();
      counts.forEach((c) => countMap.set(c._id, c.count));

      const categoriesWithCount = HACKATHON_CATEGORIES.map((cat) => ({
        name: cat,
        count: countMap.get(cat) || 0,
      }));

      const totalActive = counts.reduce((acc, c) => acc + c.count, 0);

      res.json({
        success: true,
        totalActive,
        categories: categoriesWithCount,
      });
    } catch (err: any) {
      logger.error(`[HackathonController] getCategories error: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to retrieve categories.' });
    }
  }

  /**
   * POST /api/hackathons/sync
   * Triggers background scraping non-blockingly.
   */
  public async triggerSync(req: Request, res: Response): Promise<void> {
    try {
      logger.info('[HackathonController] Manual sync requested via API');
      schedulerService.executeJob().catch((err) => {
        logger.error(`[HackathonController] Background sync error: ${err.message}`);
      });

      res.json({
        success: true,
        message: 'Scraping and aggregation pipeline launched in background. Fresh records will be available within moments.',
      });
    } catch (err: any) {
      logger.error(`[HackathonController] triggerSync error: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to trigger scraper sync pipeline.' });
    }
  }

  /**
   * GET /api/hackathons/stats
   * Aggregator health, platform counts, and last sync timestamp.
   */
  public async getStats(req: Request, res: Response): Promise<void> {
    try {
      const now = new Date();
      const validMatch = { title: { $exists: true, $ne: '' }, id: { $exists: true } };

      const [platformStats, total, activeCount, closedCount, latestScraped] = await Promise.all([
        Hackathon.aggregate([
          { $match: validMatch },
          { $group: { _id: '$sourcePlatform', count: { $sum: 1 } } },
        ]),
        Hackathon.countDocuments(validMatch),
        Hackathon.countDocuments({
          ...validMatch,
          $or: [{ applicationDeadline: { $gte: now } }, { applicationDeadline: null }],
          status: { $ne: 'closed' },
        }),
        Hackathon.countDocuments({
          ...validMatch,
          $or: [{ applicationDeadline: { $lt: now, $ne: null } }, { status: 'closed' }],
        }),
        Hackathon.findOne(validMatch).sort({ scrapedAt: -1 }).select('scrapedAt').lean(),
      ]);

      const schedulerStatus = schedulerService.getStatus();

      res.json({
        success: true,
        total,
        activeCount,
        closedCount,
        lastScrapedAt: latestScraped?.scrapedAt || null,
        platforms: platformStats.map((p) => ({ platform: p._id, count: p.count })),
        scheduler: schedulerStatus,
      });
    } catch (err: any) {
      logger.error(`[HackathonController] getStats error: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to fetch aggregator stats.' });
    }
  }
}

export const hackathonController = new HackathonController();
