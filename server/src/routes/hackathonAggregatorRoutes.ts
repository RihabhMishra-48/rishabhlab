import { Router } from 'express';
import { hackathonController } from '../controllers/hackathonController';

const router = Router();

// Category breakdown and counts
router.get('/categories', (req, res) => hackathonController.getCategories(req, res));

// Aggregator health and telemetry stats
router.get('/stats', (req, res) => hackathonController.getStats(req, res));

// Trigger manual live scraping and DB synchronization
router.post('/sync', (req, res) => hackathonController.triggerSync(req, res));
router.post('/scrape/trigger', (req, res) => hackathonController.triggerSync(req, res));

// List hackathons with optional category filtering & grouping, sorted by deadline
router.get('/', (req, res) => hackathonController.getHackathons(req, res));

// Deep scraped hackathon details for localized modal / view
router.get('/:id', (req, res) => hackathonController.getHackathonById(req, res));

export default router;

