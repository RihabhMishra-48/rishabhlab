import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { Roadmap } from '../models/Roadmap';
import { StudentProfile } from '../models/StudentProfile';
import { aiService } from '../services/aiService';

const router = Router();

import mongoose from 'mongoose';
import { supabase } from '../config/supabase';

// GET /api/roadmap
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const isMongoReady = mongoose.connection.readyState === 1;

    let profile: any = null;
    if (isMongoReady) {
      try {
        profile = await StudentProfile.findOne({ userId: user._id });
      } catch (e) {
        console.warn('Mongo find profile error:', e);
      }
    }

    const userGoal = (req.query.track as string) || profile?.targetGoal || (user as any).targetGoal || 'Web Development';
    const isExplicitRegenerate = req.query.regenerate === 'true';

    const trackLower = userGoal.toLowerCase();
    let catFilter = 'Web Development';
    if (trackLower.includes('ai') || trackLower.includes('ml') || trackLower.includes('machine')) catFilter = 'AI / Machine Learning';
    else if (trackLower.includes('data') || trackLower.includes('analytics')) catFilter = 'Data / Analytics';
    else if (trackLower.includes('cyber') || trackLower.includes('security')) catFilter = 'Cybersecurity';
    else if (trackLower.includes('app') || trackLower.includes('mobile')) catFilter = 'Mobile App Development';

    let roadmap: any = null;
    if (isMongoReady) {
      try {
        roadmap = await Roadmap.findOne({
          userId: user._id,
          $or: [
            { category: { $regex: new RegExp(catFilter.slice(0, 4), 'i') } },
            { title: { $regex: new RegExp(catFilter.slice(0, 4), 'i') } },
          ],
        });
      } catch (e) {
        console.warn('Mongo find roadmap error:', e);
      }
    }

    if (!roadmap || isExplicitRegenerate) {
      const generated = await aiService.generateRoadmap(
        {
          goal: userGoal,
          currentLevel: profile?.level || 'Beginner',
          availableTime: '2 hr/day',
          desiredOutcome: 'High-impact projects & placement',
          targetDate: '90 days',
        },
        isExplicitRegenerate
      );

      if (isMongoReady) {
        try {
          if (roadmap && isExplicitRegenerate) {
            roadmap.title = generated.title;
            roadmap.slug = generated.slug;
            roadmap.category = generated.category;
            roadmap.nodes = generated.nodes as any;
            roadmap.totalNodes = generated.totalNodes;
            roadmap.completedNodes = 0;
            await roadmap.save();
          } else if (!roadmap) {
            roadmap = await Roadmap.create({
              ...generated,
              userId: user._id,
            });
          }
        } catch (e) {
          roadmap = { ...generated, userId: user._id, _id: 'roadmap-' + Date.now() };
        }
      } else {
        roadmap = { ...generated, userId: user._id, _id: 'roadmap-' + Date.now() };
      }
    }

    const currentActiveNode = roadmap?.nodes?.find((n: any) => n.status === 'in_progress') || roadmap?.nodes?.[0] || null;

    res.json({
      roadmap,
      currentActiveNode,
      summary: {
        title: roadmap.title,
        trackInfo: `${roadmap.category} • ${roadmap.targetLevel} • ${roadmap.estimatedDailyTime} • ${roadmap.totalDurationDays} days`,
        completedCount: roadmap?.nodes?.filter((n: any) => n.status === 'completed')?.length || 0,
        totalCount: roadmap?.nodes?.length || 0,
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/roadmap/generate - explicitly request Gemini to regenerate for a track
router.post('/generate', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { goal, currentLevel, availableTime } = req.body;
    const selectedGoal = goal || (user as any).targetGoal || 'AI / Machine Learning';

    const generated = await aiService.generateRoadmap({
      goal: selectedGoal,
      currentLevel: currentLevel || 'Beginner',
      availableTime: availableTime || '2 hr/day',
      desiredOutcome: 'Mastery and live projects',
      targetDate: '90 days',
    });

    const isMongoReady = mongoose.connection.readyState === 1;
    let roadmap: any = null;
    if (isMongoReady && user._id) {
      try {
        roadmap = await Roadmap.findOne({ userId: user._id });
        if (roadmap) {
          roadmap.title = generated.title;
          roadmap.slug = generated.slug;
          roadmap.category = generated.category;
          roadmap.nodes = generated.nodes as any;
          roadmap.totalNodes = generated.totalNodes;
          roadmap.completedNodes = 0;
          await roadmap.save();
        } else {
          roadmap = await Roadmap.create({
            ...generated,
            userId: user._id,
          });
        }
      } catch (e) {
        roadmap = { ...generated, userId: user._id, _id: `rm-${Date.now()}` };
      }
    } else {
      roadmap = { ...generated, userId: user.id || user._id, _id: `rm-${Date.now()}` };
    }

    res.json({ success: true, roadmap });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Update node status
router.post('/node/:nodeId/status', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { nodeId } = req.params;
    const { status } = req.body; // 'completed' | 'in_progress' | 'locked'
    const isMongoReady = mongoose.connection.readyState === 1;

    let roadmap: any = null;
    if (isMongoReady) {
      try {
        roadmap = await Roadmap.findOne({ userId: req.user?._id });
        if (!roadmap) {
          roadmap = await Roadmap.findOne({});
        }
        if (roadmap) {
          const node = roadmap.nodes.find((n: any) => n.nodeId === nodeId);
          if (node) {
            node.status = status;
            roadmap.completedNodes = roadmap.nodes.filter((n: any) => n.status === 'completed').length;
            await roadmap.save();
          }

          const progressPercent = Math.round((roadmap.completedNodes / roadmap.nodes.length) * 100);
          const updateOps: any = {
            progressPercent,
            skillsCompleted: roadmap.completedNodes,
          };
          if (status === 'completed' && node?.title) {
            updateOps.$addToSet = { verifiedSkills: node.title };
          }
          await StudentProfile.findOneAndUpdate(
            { userId: req.user?._id },
            updateOps
          ).catch(() => null);
        }
      } catch (e) {}
    }

    // Sync points and completed skills directly to Supabase profile
    if (supabase && (req.user?.id || req.user?._id)) {
      try {
        const targetId = req.user.id || req.user._id;
        const { data: prof } = await supabase.from('profiles').select('skills_completed, total_points').eq('id', targetId).maybeSingle();
        if (prof) {
          await supabase.from('profiles').update({
            skills_completed: (prof.skills_completed || 0) + (status === 'completed' ? 1 : 0),
            total_points: (prof.total_points || 0) + (status === 'completed' ? 20 : 5),
          }).eq('id', targetId);
        }
      } catch {}
    }

    res.json({ success: true, roadmap: roadmap || { status: 'updated' } });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
