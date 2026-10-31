import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../services/supabase';
import { CustomDropdown } from '../../components/common/CustomDropdown';
import {
  Building2,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Layers,
  Search,
  ExternalLink,
  Plus
} from 'lucide-react';

export const CollegeDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedIdentifier = searchParams.get('id') || searchParams.get('name') || '';

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchCollege = async () => {
    try {
      setLoading(true);
      const res = await api.getCollegeOverview(requestedIdentifier || user?.college || '');
      setData(res);
    } catch (err) {
      console.error('Failed to fetch college overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollege();
  }, [requestedIdentifier]);

  // Real-time listener for college and profiles changes
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    let channel: any = null;
    const timer = setTimeout(() => {
      try {
        channel = supabase
          .channel('college-dashboard-live')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'colleges' }, () => {
            fetchCollege();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
            fetchCollege();
          })
          .subscribe();
      } catch (e) {
        console.warn('Realtime subscription notice:', e);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [requestedIdentifier]);

  const college = data?.college;
  const collegesList: any[] = data?.collegesList || [];
  const enrolledStudents: any[] = data?.enrolledStudents || [];

  const handleSelectCollege = (identifier: string) => {
    setSearchParams({ id: identifier });
  };

  if (loading && !data) {
    return (
      <div className="p-8 max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-9 h-9 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Syncing institutional campus data...</p>
      </div>
    );
  }

  // Strict Real Data Invariant: Clean modern empty state if no colleges onboarded
  if (!college && collegesList.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="p-10 sm:p-14 rounded-3xl bg-white dark:bg-[#1f1f1f] border border-neutral-200/80 dark:border-neutral-800 text-center space-y-4 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
            <Building2 className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            No Institutional Campuses Onboarded Yet
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
            Institutional dashboards are synchronized directly from live verified database records. Add partner universities in the Platform Admin center to start tracking campus cohorts.
          </p>
          <div className="pt-2">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-bold hover:opacity-90 transition-opacity"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Onboard College in Platform Admin</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* College Header with Live Campus Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#1f1f1f] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-xs font-bold text-lg shrink-0">
            {college?.code || 'COL'}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Verified Campus Partner
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Live Database Synced
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              {college?.name || 'Partner Institution'}
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {college?.location || 'India'}
            </p>
          </div>
        </div>

        {/* Campus Switcher Dropdown (Allows toggling between all onboarded colleges in database) */}
        {collegesList.length > 1 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 shrink-0">
              Campus:
            </label>
            <CustomDropdown
              value={college?.id || college?.name || ''}
              onChange={(val) => handleSelectCollege(val)}
              options={collegesList.map((c) => ({
                value: c.id || c.name,
                label: `${c.name} (${c.code})`,
              }))}
              size="sm"
            />
          </div>
        )}
      </div>

      {/* Real Institutional Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#1f1f1f] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Total Enrolled Students
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-mono">
            {college?.totalStudents || 0}
          </p>
          <span className="text-[11px] text-neutral-500">
            Registered on Platform
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#1f1f1f] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Affiliated Campus Code
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            {college?.code || 'CAMPUS'}
          </p>
          <span className="text-[11px] text-neutral-500">
            Institutional Identifier
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#1f1f1f] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Total Partner Campuses
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-500 font-mono">
            {collegesList.length}
          </p>
          <span className="text-[11px] text-neutral-500">
            Active in Network
          </span>
        </div>
      </div>

      {/* Cohort Skill Distribution (Calculated from Real Profiles) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#1f1f1f] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Cohort Competencies
          </span>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white mt-0.5">
            Student Track Distribution ({college?.name})
          </h2>
        </div>

        {college?.totalStudents === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-400">
            No enrolled students recorded yet for this campus. As students select {college?.name} in their profile, skill distribution will calculate automatically.
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-neutral-800 dark:text-neutral-200">Web Development (Full-Stack)</span>
                <span className="text-neutral-500 font-mono">{college?.skillDistribution?.webDev ?? 0}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${college?.skillDistribution?.webDev ?? 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-neutral-800 dark:text-neutral-200">AI / Machine Learning</span>
                <span className="text-neutral-500 font-mono">{college?.skillDistribution?.aiMl ?? 0}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${college?.skillDistribution?.aiMl ?? 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-neutral-800 dark:text-neutral-200">Data Science & Analytics</span>
                <span className="text-neutral-500 font-mono">{college?.skillDistribution?.dataAnalytics ?? 0}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${college?.skillDistribution?.dataAnalytics ?? 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-neutral-800 dark:text-neutral-200">Cybersecurity & Systems</span>
                <span className="text-neutral-500 font-mono">{college?.skillDistribution?.cybersecurity ?? 0}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${college?.skillDistribution?.cybersecurity ?? 0}%` }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Verified Enrolled Student Roster (Real Profiles from Database) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#1f1f1f] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Campus Cohort Roster
            </span>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white mt-0.5">
              Verified Enrolled Students ({enrolledStudents.length})
            </h2>
          </div>
          <span className="text-xs text-neutral-400">
            Live Database Sync
          </span>
        </div>

        {enrolledStudents.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
            <GraduationCap className="w-9 h-9 text-neutral-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              No students enrolled yet under {college?.name}
            </p>
            <p className="text-[11px] text-neutral-500 mt-1 max-w-sm mx-auto">
              Students who set their college as "{college?.name}" in their profile will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80 border border-neutral-100 dark:border-neutral-800/80 rounded-2xl overflow-hidden">
            {enrolledStudents.map((st) => (
              <div key={st.id || st.email} className="p-3.5 sm:p-4 flex items-center justify-between gap-3 text-xs bg-neutral-50/50 dark:bg-neutral-900/30">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0">
                    {st.name?.charAt(0).toUpperCase() || 'S'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-neutral-900 dark:text-white truncate">
                      {st.name}
                    </p>
                    <p className="text-[11px] text-neutral-500 truncate">
                      {st.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-200/60 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                    {st.degree} · {st.year}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    {st.track}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollegeDashboardPage;
