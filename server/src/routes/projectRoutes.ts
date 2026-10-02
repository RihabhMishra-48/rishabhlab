import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { Project } from '../models/Project';
import { StudentProfile } from '../models/StudentProfile';

const router = Router();

// GET /api/projects
router.get('/', async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter: any = {};
    if (status && status !== 'All') filter.status = status;
    if (category) filter.category = category;

    const projects = await Project.find(filter).sort({ createdAt: -1 });
    res.json(projects);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/projects/:slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const project = await Project.findOne({ slug });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/projects/:id/task-toggle - toggle task inside milestone
router.post('/:id/task-toggle', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { milestoneId, taskId } = req.body;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    let totalTasks = 0;
    let completedTasks = 0;

    project.milestones.forEach((m) => {
      m.tasks.forEach((t) => {
        totalTasks++;
        if (m.id === milestoneId && t.id === taskId) {
          t.isCompleted = !t.isCompleted;
        }
        if (t.isCompleted) completedTasks++;
      });
      // Check milestone status
      m.isCompleted = m.tasks.every((t) => t.isCompleted);
    });

    project.progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    if (project.progressPercent === 100) {
      project.status = 'Completed';
    } else if (project.progressPercent > 0) {
      project.status = 'In Progress';
    }

    await project.save();
    res.json({ success: true, project });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/projects/:id/submit-proof - submit Proof of Work
router.post('/:id/submit-proof', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { githubRepoUrl, liveDeployUrl, demoVideoUrl, screenshots } = req.body;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    project.githubRepoUrl = githubRepoUrl || project.githubRepoUrl;
    project.liveDeployUrl = liveDeployUrl || project.liveDeployUrl;
    project.demoVideoUrl = demoVideoUrl || project.demoVideoUrl;
    if (screenshots && Array.isArray(screenshots)) {
      project.screenshots = screenshots;
    }
    project.proofOfWorkSubmitted = true;
    project.status = 'Completed';
    project.progressPercent = 100;
    await project.save();

    // Reward student profile
    await StudentProfile.findOneAndUpdate(
      { userId: req.user?._id },
      {
        $inc: { projectsCompleted: 1, totalPoints: 150 },
      }
    );

    res.json({
      success: true,
      message: 'Proof of work submitted! Project now visible on your public portfolio.',
      project,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
