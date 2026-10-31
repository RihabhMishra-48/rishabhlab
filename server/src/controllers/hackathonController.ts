import { Request, Response } from 'express';
import { Hackathon } from '../models/Hackathon';
import { HACKATHON_CATEGORIES, HackathonCategory } from '../config/scraperConfig';
import { hackathonAggregatorService } from '../services/HackathonAggregatorService';
import { logger } from '../config/logger';
import { supabase, isSupabaseConfigured } from '../config/supabase';

export class HackathonController {
  /**
   * GET /api/hackathons
   * Query params: category, search, source, status, grouped, page, limit
   * Loads verified, active hackathons directly from Supabase database.
   */
  public async getHackathons(req: Request, res: Response): Promise<void> {
    try {
      const {
        category,
        search,
        source,
        status = 'open',
        grouped,
        page = '1',
        limit = '60',
      } = req.query;

      const now = new Date();
      let hackathons: any[] = [];
      let total = 0;

      // 1. PRIMARY DATASTORE: Supabase database
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data: sbData, error: sbErr } = await supabase
            .from('hackathons')
            .select('*')
            .is('user_id', null)
            .order('target_event_date', { ascending: true, nullsFirst: false });

          if (!sbErr && sbData && sbData.length > 0) {
            hackathons = sbData.map((h: any) => {
              const meta = h.ai_outputs || {};
              const deadline = h.target_event_date ? new Date(h.target_event_date) : null;
              const isClosed = meta.status === 'closed' || Boolean(deadline && deadline.getTime() < now.getTime());
              const isClosingSoon = Boolean(
                deadline &&
                !isClosed &&
                deadline.getTime() - now.getTime() < 3 * 24 * 3600 * 1000 &&
                deadline.getTime() > now.getTime()
              );

              return {
                _id: h.id,
                id: meta.id || h.id,
                title: h.hackathon_name,
                category: h.selected_track || 'Open Innovation',
                summary: h.problem_statement || '',
                description: meta.description || h.problem_statement || '',
                registrationUrl: meta.registrationUrl || '',
                sourcePlatform: meta.sourcePlatform || 'Devpost',
                sourceId: meta.sourceId || '',
                prizes: meta.prizes || { total: 'TBD', breakdown: [] },
                timeline: Array.isArray(h.phases) ? h.phases : [],
                tags: Array.isArray(h.team_members) ? h.team_members : (meta.tags || []),
                applicationDeadline: deadline ? deadline.toISOString() : null,
                location: meta.location || 'Online / Virtual',
                bannerUrl: meta.bannerUrl || '',
                organization: meta.organization || '',
                eligibility: meta.eligibility || 'Open to all builders and students globally.',
                status: isClosed ? 'closed' : meta.status || 'open',
                isClosed,
                isClosingSoon,
                scrapedAt: meta.scrapedAt || h.created_at,
              };
            });
          }
        } catch (sbEx: any) {
          logger.warn(`[HackathonController] Supabase read notice: ${sbEx.message}`);
        }
      }

      // 2. Fallback to MongoDB only if Supabase returned 0 items
      if (hackathons.length === 0) {
        try {
          const rawHackathons = await Hackathon.find({
            title: { $exists: true, $ne: '' },
            id: { $exists: true },
            status: { $ne: 'closed' },
            $or: [{ applicationDeadline: { $gte: now } }, { applicationDeadline: null }],
          }).lean();

          if (rawHackathons && rawHackathons.length > 0) {
            hackathons = rawHackathons.map((h) => {
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
                _id: h._id ? h._id.toString() : h.id,
                isClosed,
                isClosingSoon,
                status: isClosed ? 'closed' : h.status || 'open',
              };
            });
          }
        } catch (_) {}
      }

      // Filter: Category / Theme
      if (category && typeof category === 'string' && category.toLowerCase() !== 'all') {
        const catLower = category.toLowerCase();
        hackathons = hackathons.filter((h) => (h.category || '').toLowerCase() === catLower);
      }

      // Filter: Source Platform
      if (source && typeof source === 'string' && source.toLowerCase() !== 'all') {
        const srcLower = source.toLowerCase();
        hackathons = hackathons.filter((h) => (h.sourcePlatform || '').toLowerCase() === srcLower);
      }

      // Filter: Search
      if (search && typeof search === 'string' && search.trim().length > 0) {
        const q = search.trim().toLowerCase();
        hackathons = hackathons.filter(
          (h) =>
            (h.title && h.title.toLowerCase().includes(q)) ||
            (h.summary && h.summary.toLowerCase().includes(q)) ||
            (h.organization && h.organization.toLowerCase().includes(q)) ||
            (h.tags && h.tags.some((t: string) => t.toLowerCase().includes(q)))
        );
      }

      // Filter active / non-closed
      hackathons = hackathons.filter((h) => !h.isClosed);

      // Sort by nearest deadline
      hackathons.sort((a, b) => {
        const dateA = a.applicationDeadline ? new Date(a.applicationDeadline).getTime() : Infinity;
        const dateB = b.applicationDeadline ? new Date(b.applicationDeadline).getTime() : Infinity;
        return dateA - dateB;
      });

      total = hackathons.length;

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

      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 60));
      const skip = (pageNum - 1) * limitNum;
      const paginated = hackathons.slice(skip, skip + limitNum);

      res.json({
        success: true,
        page: pageNum,
        limit: limitNum,
        total,
        count: paginated.length,
        categories: HACKATHON_CATEGORIES,
        hackathons: paginated,
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

      if (!id) {
        res.status(400).json({ success: false, message: 'Hackathon ID is required.' });
        return;
      }

      // Check Supabase first
      if (isSupabaseConfigured() && supabase) {
        try {
          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
          let query = supabase.from('hackathons').select('*').is('user_id', null);
          if (isUUID) {
            query = query.eq('id', id);
          }

          const { data: sbRows } = await query;
          const matched = (sbRows || []).find(
            (h: any) => h.id === id || h.ai_outputs?.id === id || h.ai_outputs?.sourceId === id
          );

          if (matched) {
            const meta = matched.ai_outputs || {};
            const deadline = matched.target_event_date ? new Date(matched.target_event_date) : null;
            const now = new Date();
            const isClosed = meta.status === 'closed' || Boolean(deadline && deadline.getTime() < now.getTime());

            res.json({
              success: true,
              hackathon: {
                _id: matched.id,
                id: meta.id || matched.id,
                title: matched.hackathon_name,
                category: matched.selected_track || 'Open Innovation',
                summary: matched.problem_statement || '',
                description: meta.description || matched.problem_statement || '',
                registrationUrl: meta.registrationUrl || '',
                sourcePlatform: meta.sourcePlatform || 'Devpost',
                sourceId: meta.sourceId || '',
                prizes: meta.prizes || { total: 'TBD', breakdown: [] },
                timeline: Array.isArray(matched.phases) ? matched.phases : [],
                tags: Array.isArray(matched.team_members) ? matched.team_members : (meta.tags || []),
                applicationDeadline: deadline ? deadline.toISOString() : null,
                location: meta.location || 'Online / Virtual',
                bannerUrl: meta.bannerUrl || '',
                organization: meta.organization || '',
                eligibility: meta.eligibility || 'Open to all builders and students globally.',
                status: isClosed ? 'closed' : meta.status || 'open',
                isClosed,
                scrapedAt: meta.scrapedAt || matched.created_at,
              },
            });
            return;
          }
        } catch (_) {}
      }

      // Fallback to MongoDB
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
      let countsMap: Record<string, number> = {};

      if (isSupabaseConfigured() && supabase) {
        const { data: sbData } = await supabase
          .from('hackathons')
          .select('selected_track, target_event_date, ai_outputs')
          .is('user_id', null);

        if (sbData && sbData.length > 0) {
          sbData.forEach((h: any) => {
            const deadline = h.target_event_date ? new Date(h.target_event_date) : null;
            const isClosed = h.ai_outputs?.status === 'closed' || Boolean(deadline && deadline.getTime() < now.getTime());
            if (!isClosed) {
              const cat = h.selected_track || 'Open Innovation';
              countsMap[cat] = (countsMap[cat] || 0) + 1;
            }
          });
        }
      } else {
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
        counts.forEach((c) => (countsMap[c._id] = c.count));
      }

      const categoriesWithCount = HACKATHON_CATEGORIES.map((cat) => ({
        name: cat,
        count: countsMap[cat] || 0,
      }));

      const totalActive = Object.values(countsMap).reduce((acc, c) => acc + c, 0);

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
   * Triggers background scraping and Supabase sync.
   */
  public async triggerSync(req: Request, res: Response): Promise<void> {
    try {
      logger.info('[HackathonController] Manual sync requested via API');
      const report = await hackathonAggregatorService.runAggregationPipeline();

      res.json({
        success: true,
        message: `Pipeline completed. Stored ${report.totalUpserted} live hackathons directly in Supabase.`,
        report,
      });
    } catch (err: any) {
      logger.error(`[HackathonController] triggerSync error: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to trigger scraper sync pipeline.' });
    }
  }

  /**
   * GET /api/hackathons/stats
   * Aggregator health, platform counts, and last sync timestamp from Supabase.
   */
  public async getStats(req: Request, res: Response): Promise<void> {
    try {
      const now = new Date();
      let total = 0;
      let activeCount = 0;
      const platformMap: Record<string, number> = { Devpost: 0, Unstop: 0, Luma: 0 };
      let lastScrapedAt: string | null = null;

      if (isSupabaseConfigured() && supabase) {
        const { data: sbData } = await supabase
          .from('hackathons')
          .select('id, target_event_date, ai_outputs, created_at')
          .is('user_id', null);

        if (sbData && sbData.length > 0) {
          total = sbData.length;
          sbData.forEach((h: any) => {
            const meta = h.ai_outputs || {};
            const p = meta.sourcePlatform || 'Devpost';
            platformMap[p] = (platformMap[p] || 0) + 1;
            const deadline = h.target_event_date ? new Date(h.target_event_date) : null;
            if (!deadline || deadline.getTime() >= now.getTime()) {
              activeCount++;
            }
            if (meta.scrapedAt && (!lastScrapedAt || meta.scrapedAt > lastScrapedAt)) {
              lastScrapedAt = meta.scrapedAt;
            }
          });
        }
      }

      if (total === 0) {
        const validMatch = { title: { $exists: true, $ne: '' }, id: { $exists: true } };
        const [platformStats, totalDocs, activeDocs, latestScraped] = await Promise.all([
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
          Hackathon.findOne(validMatch).sort({ scrapedAt: -1 }).select('scrapedAt').lean(),
        ]);
        total = totalDocs;
        activeCount = activeDocs;
        lastScrapedAt = latestScraped?.scrapedAt ? new Date(latestScraped.scrapedAt).toISOString() : null;
        platformStats.forEach((p) => {
          platformMap[p._id] = p.count;
        });
      }

      res.json({
        success: true,
        total,
        activeCount,
        closedCount: total - activeCount,
        lastScrapedAt,
        platforms: Object.entries(platformMap).map(([platform, count]) => ({ platform, count })),
      });
    } catch (err: any) {
      logger.error(`[HackathonController] getStats error: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to fetch aggregator stats.' });
    }
  }
}

export const hackathonController = new HackathonController();
