import { HackathonCategory, SourcePlatform } from '../config/scraperConfig';
import { IHackathonTimelineItem, IHackathonPrizes } from '../models/Hackathon';

export interface IHackathonNormalized {
  id: string; // Deterministic sha256 hash of sourcePlatform + sourceId
  title: string;
  sourcePlatform: SourcePlatform;
  sourceId: string;
  category: HackathonCategory;
  registrationUrl: string;
  summary: string;
  description: string;
  prizes: IHackathonPrizes | string;
  timeline: IHackathonTimelineItem[];
  scrapedAt: Date;
  applicationDeadline?: Date | null;
  location?: string;
  bannerUrl?: string;
  eligibility?: string;
  organization?: string;
  tags: string[];
  status: 'open' | 'upcoming' | 'closed';
}

export interface IScraperResult {
  platform: SourcePlatform;
  success: boolean;
  count: number;
  items: IHackathonNormalized[];
  durationMs: number;
  error?: string;
}

export interface IScraper {
  readonly platform: SourcePlatform;
  scrape(): Promise<IHackathonNormalized[]>;
}

