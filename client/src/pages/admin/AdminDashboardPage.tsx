import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PricingPlan } from '../../types';
import {
  ShieldAlert,
  Users,
  CreditCard,
  BookOpen,
  Code2,
  Check,
  Edit2,
  Save,
  Sparkles
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [adminData, setAdminData] = useState<any>(null);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [editingPlanKey, setEditingPlanKey] = useState<string | null>(null);
  const [editPriceMonthly, setEditPriceMonthly] = useState<number>(0);
  const [editPriceAnnual, setEditPriceAnnual] = useState<number>(0);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const data = await api.getAdminOverview();
        setAdminData(data);
        const plans = await api.getPricingPlans();
        setPricingPlans(plans);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdmin();
  }, []);

  const handleEditPlan = (plan: PricingPlan) => {
    setEditingPlanKey(plan.key);
    setEditPriceMonthly(plan.priceMonthly);
    setEditPriceAnnual(plan.priceAnnual);
  };

  const handleSavePlan = async (key: string) => {
    try {
      const res = await api.updatePricingPlan(key, {
        priceMonthly: editPriceMonthly,
        priceAnnual: editPriceAnnual,
      });
      setPricingPlans((prev) => prev.map((p) => (p.key === key ? res.plan : p)));
      setEditingPlanKey(null);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-2">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Platform Super Admin</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          Admin Control Center
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          Manage system users, curriculum content, and subscription pricing dynamically.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Total Users</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-mono">
            {adminData?.metrics?.totalUsers || 2480}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Verified Mentors</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-purple-500 font-mono">
            {adminData?.metrics?.mentors || 24}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Partner Campuses</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-500 font-mono">
            {adminData?.metrics?.partnerColleges || 6}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Daily Execution Rate</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-500 font-mono">
            {adminData?.metrics?.avgCompletionRate || '68%'}
          </p>
        </div>
      </div>

      {/* Dynamic Pricing Management (Section 27 & 44) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Subscription Architecture
            </span>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white mt-0.5">
              Live Pricing Tier Rates
            </h2>
          </div>
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Rate updated live!
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingPlans.map((plan) => {
            const isEditing = editingPlanKey === plan.key;

            return (
              <div
                key={plan.key}
                className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white">{plan.name}</h3>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800">
                    {plan.key}
                  </span>
                </div>

                {isEditing ? (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="text-[10px] font-semibold text-neutral-500">Monthly Price (₹)</label>
                      <input
                        type="number"
                        value={editPriceMonthly}
                        onChange={(e) => setEditPriceMonthly(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-neutral-500">Annual Price (₹)</label>
                      <input
                        type="number"
                        value={editPriceAnnual}
                        onChange={(e) => setEditPriceAnnual(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleSavePlan(plan.key)}
                        className="flex-1 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1"
                      >
                        <Save className="w-3.5 h-3.5" /> Save
                      </button>
                      <button
                        onClick={() => setEditingPlanKey(null)}
                        className="flex-1 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <p className="text-2xl font-extrabold text-neutral-900 dark:text-white font-mono">
                        ₹{plan.priceMonthly} <span className="text-xs text-neutral-400 font-sans font-normal">/ mo</span>
                      </p>
                      <p className="text-xs text-neutral-500 font-mono">
                        ₹{plan.priceAnnual} / year
                      </p>
                    </div>
                    <button
                      onClick={() => handleEditPlan(plan)}
                      className="w-full py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-800 flex items-center justify-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Rate</span>
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
