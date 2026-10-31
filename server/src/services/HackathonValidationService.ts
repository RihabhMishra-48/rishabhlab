import { IHackathonNormalized } from '../scrapers/types';
import { HACKATHON_CATEGORIES, SOURCE_PLATFORMS, HackathonCategory, SourcePlatform } from '../config/scraperConfig';
import { logger } from '../config/logger';

export class HackathonValidationService {
  /**
   * Validates and sanitizes a scraped hackathon document.
   * Returns sanitized entity or null if validation fails.
   */
  public static validateAndSanitize(raw: Partial<IHackathonNormalized>): IHackathonNormalized | null {
    if (!raw.title || typeof raw.title !== 'string' || raw.title.trim().length === 0) {
      logger.warn('[Validation] Discarded item with empty title');
      return null;
    }

    if (!raw.sourcePlatform || !SOURCE_PLATFORMS.includes(raw.sourcePlatform as SourcePlatform)) {
      logger.warn(`[Validation] Discarded item with invalid sourcePlatform: ${raw.sourcePlatform}`);
      return null;
    }

    if (!raw.sourceId || typeof raw.sourceId !== 'string' || raw.sourceId.trim().length === 0) {
      logger.warn('[Validation] Discarded item with empty sourceId');
      return null;
    }

    if (!raw.registrationUrl || !raw.registrationUrl.startsWith('http')) {
      logger.warn(`[Validation] Discarded item with invalid registrationUrl: ${raw.registrationUrl}`);
      return null;
    }

    // Ensure category is strictly inside our enum
    let category = raw.category as HackathonCategory;
    if (!category || !HACKATHON_CATEGORIES.includes(category)) {
      category = 'Open Innovation';
    }

    // Sanitize summary
    const summary = (raw.summary || raw.title).replace(/\s+/g, ' ').trim().slice(0, 500);

    // Sanitize description
    const description = (raw.description || summary).replace(/\s+/g, ' ').trim();

    const deadline = raw.applicationDeadline ? new Date(raw.applicationDeadline) : null;
    const isPastDeadline = Boolean(deadline && !isNaN(deadline.getTime()) && deadline.getTime() < Date.now());

    // Strict Live Invariant: Never scrape or store closed/outdated hackathons
    if (isPastDeadline || raw.status === 'closed') {
      return null;
    }

    return {
      id: raw.id || `${raw.sourcePlatform.toLowerCase()}-${raw.sourceId}`,
      title: raw.title.trim(),
      sourcePlatform: raw.sourcePlatform as SourcePlatform,
      sourceId: raw.sourceId.trim(),
      category,
      registrationUrl: raw.registrationUrl.trim(),
      summary,
      description,
      prizes: raw.prizes || { total: 'TBD', breakdown: [] },
      timeline: Array.isArray(raw.timeline) ? raw.timeline : [],
      scrapedAt: raw.scrapedAt instanceof Date ? raw.scrapedAt : new Date(),
      applicationDeadline: deadline && !isNaN(deadline.getTime()) ? deadline : null,
      location: typeof raw.location === 'string' ? raw.location.trim() : 'Online / Virtual',
      bannerUrl: typeof raw.bannerUrl === 'string' ? raw.bannerUrl : '',
      eligibility: typeof raw.eligibility === 'string' ? raw.eligibility.trim() : 'Open to all developers and students.',
      organization: typeof raw.organization === 'string' ? raw.organization.trim() : `${raw.sourcePlatform} Host`,
      tags: Array.isArray(raw.tags) ? raw.tags.map((t) => String(t).trim()).filter(Boolean) : [],
      status: 'open',
    };
  }
}

