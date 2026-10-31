import React, { useState, useEffect, useMemo } from 'react';
import { AggregatedHackathon } from '../../types';
import { api } from '../../services/api';
import { supabase, isSupabaseConfigured } from '../../services/supabase';
import { HackathonDetailModal } from './HackathonDetailModal';
import { ConnectMentorModal } from './ConnectMentorModal';
import {
  ExternalLink,
  Eye,
  Search,
  Filter,
  Award,
  Clock,
  Sparkles,
  Building2,
  AlertCircle,
  Layers,
  CheckCircle2,
  Users,
} from 'lucide-react';

export const HackathonAggregatorView: React.FC = () => {
  const [hackathons, setHackathons] = useState<AggregatedHackathon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Filters (Strictly Active Hackathons & Themes/Platforms)
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [groupByCategory, setGroupByCategory] = useState<boolean>(false);

  // Modals State
  const [detailModalHackathon, setDetailModalHackathon] = useState<AggregatedHackathon | null>(null);
  const [mentorModalHackathon, setMentorModalHackathon] = useState<AggregatedHackathon | null>(null);

  const categories = [
    'All',
    'AI/ML',
    'Web3/Blockchain',
    'Open Innovation',
    'FinTech',
    'Mobile/Web Dev',
    'Cybersecurity',
    'Cloud & DevOps',
  ];

  const platforms = ['All', 'Devpost', 'Unstop', 'Luma'];

  // Fetch hackathons directly from persistent MongoDB cache
  const loadHackathons = async () => {
    try {
      setLoading(true);
      const res = await api.getAggregatedHackathons(
        selectedCategory !== 'All' ? selectedCategory : undefined,
        searchQuery || undefined,
        selectedPlatform !== 'All' ? selectedPlatform : undefined
      );

      if (res && res.hackathons) {
        setHackathons(res.hackathons);
        setTotalCount(res.total || res.hackathons.length);
      }
    } catch (err: any) {
      console.warn('[Hackathons] Fetch warning:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHackathons();
  }, [selectedCategory, selectedPlatform]);

  // Real-time Supabase listener: auto-update student view when admin syncs/scrapes fresh hackathons
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const channel = supabase
        .channel('student-hackathons-live')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'hackathons' }, () => {
          api.invalidateCache(/hackathon/);
          loadHackathons();
        })
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    } catch (_) {}
  }, []);

  // Client-side search filtering
  const filteredHackathons = useMemo(() => {
    let list = hackathons;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (h) =>
          (h.title && h.title.toLowerCase().includes(q)) ||
          (h.summary && h.summary.toLowerCase().includes(q)) ||
          (h.organization && h.organization.toLowerCase().includes(q)) ||
          (h.tags && h.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }
    return list;
  }, [hackathons, searchQuery]);

  // Grouped by Category / Theme Map
  const categorizedGroups = useMemo(() => {
    const groups: Record<string, AggregatedHackathon[]> = {};
    for (const cat of categories.filter((c) => c !== 'All')) {
      groups[cat] = [];
    }
    filteredHackathons.forEach((h) => {
      const cat = h.category || 'Open Innovation';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(h);
    });
    return groups;
  }, [filteredHackathons]);

  const getPlatformBadge = (platform: string) => {
    switch (platform) {
      case 'Devpost':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'Unstop':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
      case 'Luma':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      default:
        return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#1a1a1a] border border-neutral-200/90 dark:border-neutral-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold font-mono uppercase tracking-wider text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 px-2.5 py-0.5 rounded-full border border-cyan-200 dark:border-cyan-800/40">
                <Sparkles className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                Live Multi-Platform Aggregator
              </span>
              <span className="flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Auto-synced ({totalCount || filteredHackathons.length} Active Hackathons)
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Curated Global Hackathons
            </h2>

            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-2xl leading-relaxed">
              Explore verified live hackathons from Unstop, Devpost, and Luma with deep-scraped prizes, timelines, and instant 1:1 mentor connection.
            </p>
          </div>

          {/* Group by theme toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setGroupByCategory(!groupByCategory)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${groupByCategory
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-transparent shadow-xs'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{groupByCategory ? 'Grouped by Theme' : 'Group by Theme'}</span>
            </button>
          </div>
        </div>

        {/* Search & Platform Filter Row */}
        <div className="mt-5 pt-4 border-t border-neutral-200/80 dark:border-neutral-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by tech stack, company, or keyword..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-neutral-50 dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 font-sans"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider font-mono mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Source:
            </span>
            {platforms.map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPlatform(p)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border whitespace-nowrap transition-colors cursor-pointer ${selectedPlatform === p
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-transparent'
                    : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:text-neutral-900 dark:hover:text-white'
                  }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Theme / Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3.5 pb-1 scrollbar-none">
          <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider font-mono mr-1">
            Themes:
          </span>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3.5 py-1 text-xs font-medium rounded-full border whitespace-nowrap transition-colors cursor-pointer ${selectedCategory === c
                  ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700 font-bold'
                  : 'bg-neutral-100/70 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:text-neutral-900 dark:hover:text-white'
                }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Main Hackathon Cards Display */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-neutral-400 space-y-3">
          <div className="w-8 h-8 border-2 border-neutral-900 dark:border-white border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredHackathons.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#1a1a1a] border border-neutral-200/90 dark:border-neutral-800 space-y-3">
          <AlertCircle className="w-8 h-8 text-neutral-400 mx-auto" />
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">
            No active hackathons match your selected criteria
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
            Try adjusting your search query or selecting another theme filter.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedPlatform('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 text-xs font-bold text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl border border-neutral-200 dark:border-neutral-700 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : groupByCategory && selectedCategory === 'All' ? (
        // CATEGORIZED GROUPS VIEW
        <div className="space-y-8">
          {Object.entries(categorizedGroups).map(([groupTitle, items]) => {
            if (items.length === 0) return null;
            return (
              <div key={groupTitle} className="space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-200/80 dark:border-neutral-800/80 pb-2">
                  <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500" />
                    <span>{groupTitle}</span>
                    <span className="text-[11px] font-mono text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full font-normal">
                      {items.length}
                    </span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((hackathon) => (
                    <HackathonCard
                      key={hackathon.id || hackathon._id}
                      hackathon={hackathon}
                      onViewDetails={() => setDetailModalHackathon(hackathon)}
                      onConnectMentor={() => setMentorModalHackathon(hackathon)}
                      getPlatformBadge={getPlatformBadge}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // STANDARD UNIFORM GRID VIEW
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHackathons.map((hackathon) => (
            <HackathonCard
              key={hackathon.id || hackathon._id}
              hackathon={hackathon}
              onViewDetails={() => setDetailModalHackathon(hackathon)}
              onConnectMentor={() => setMentorModalHackathon(hackathon)}
              getPlatformBadge={getPlatformBadge}
            />
          ))}
        </div>
      )}

      {/* Deep Scraped Details Modal */}
      <HackathonDetailModal
        hackathon={detailModalHackathon}
        isOpen={Boolean(detailModalHackathon)}
        onClose={() => setDetailModalHackathon(null)}
        onConnectMentor={() => {
          const target = detailModalHackathon;
          setDetailModalHackathon(null);
          setMentorModalHackathon(target);
        }}
      />

      {/* Connect to Mentor Modal (Harsh, Arpit & Rishabh) */}
      <ConnectMentorModal
        hackathon={mentorModalHackathon}
        isOpen={Boolean(mentorModalHackathon)}
        onClose={() => setMentorModalHackathon(null)}
      />
    </div>
  );
};

interface HackathonCardProps {
  hackathon: AggregatedHackathon;
  onViewDetails: () => void;
  onConnectMentor: () => void;
  getPlatformBadge: (p: string) => string;
}

const HackathonCard: React.FC<HackathonCardProps> = ({
  hackathon,
  onViewDetails,
  onConnectMentor,
  getPlatformBadge,
}) => {
  const deadline = hackathon.applicationDeadline ? new Date(hackathon.applicationDeadline) : null;
  const prizeDisplay =
    typeof hackathon.prizes === 'string'
      ? hackathon.prizes
      : hackathon.prizes?.total || 'Grand Prizes';

  return (
    <div className="flex flex-col justify-between bg-white dark:bg-[#1a1a1a] rounded-3xl p-5 border border-neutral-200/90 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors shadow-2xs">
      <div>
        {/* Banner Thumbnail */}
        {hackathon.bannerUrl && (
          <div className="h-36 w-full rounded-2xl overflow-hidden mb-3.5 bg-neutral-100 dark:bg-neutral-900">
            <img
              src={hackathon.bannerUrl}
              alt={hackathon.title}
              className="w-full h-full object-cover opacity-90"
              loading="lazy"
            />
          </div>
        )}

        {/* Platform Badge & Live Tag */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span
            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${getPlatformBadge(
              hackathon.sourcePlatform
            )}`}
          >
            {hackathon.sourcePlatform}
          </span>

          <span className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Open & Active</span>
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white line-clamp-2 leading-snug mb-1.5">
          {hackathon.title}
        </h3>

        {/* Organizer */}
        {hackathon.organization && (
          <p className="flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400 mb-2 truncate">
            <Building2 className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
            <span className="truncate">{hackathon.organization}</span>
          </p>
        )}

        {/* Summary */}
        <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed mb-3">
          {hackathon.summary}
        </p>

        {/* Metadata Badges: Theme, Prize & Deadline */}
        <div className="flex flex-wrap items-center gap-2 text-xs py-2.5 border-t border-neutral-100 dark:border-neutral-800/80 mb-3.5">
          <span className="text-[11px] text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-700 font-medium">
            {hackathon.category}
          </span>

          <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/40">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span className="truncate max-w-[130px]">{prizeDisplay}</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700">
            <Clock className="w-3 h-3 text-neutral-500" />
            <span>
              {deadline
                ? deadline.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                : 'Rolling'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Row: [View Details] [Register Now] & [Connect to Mentor] */}
      <div className="space-y-2 pt-2.5 border-t border-neutral-100 dark:border-neutral-800/80">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onViewDetails}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl border border-neutral-200 dark:border-neutral-700 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
            <span>View Details</span>
          </button>

          <a
            href={hackathon.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-950 rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <span>Register Now</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <button
          onClick={onConnectMentor}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-950/70 rounded-xl border border-indigo-200 dark:border-indigo-800/40 transition-colors cursor-pointer"
        >
          <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Connect to Mentor</span>
        </button>
      </div>
    </div>
  );
};
