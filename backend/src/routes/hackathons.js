import express from 'express';
import authenticate from '../middleware/auth.js';
import { isOrganizer } from '../middleware/roleCheck.js';
import {
    createHackathon,
    getHackathon,
    getAllHackathons,
    updateHackathon,
    deleteHackathon
} from '../services/firestore.js';

const router = express.Router();

// Get all hackathons (public)
router.get('/', async (req, res) => {
    try {
        const { status, organizerId } = req.query;
        const filters = {};

        if (status) filters.status = status;
        if (organizerId) filters.organizerId = organizerId;

        const hackathons = await getAllHackathons(filters);
        res.json({ hackathons });
    } catch (error) {
        console.error('Get hackathons error:', error);
        res.status(500).json({ error: 'Failed to fetch hackathons' });
    }
});

// Get hackathon by ID (public)
router.get('/:id', async (req, res) => {
    try {
        const hackathon = await getHackathon(req.params.id);

        if (!hackathon) {
            return res.status(404).json({ error: 'Hackathon not found' });
        }

        res.json({ hackathon });
    } catch (error) {
        console.error('Get hackathon error:', error);
        res.status(500).json({ error: 'Failed to fetch hackathon' });
    }
});

// Create hackathon (organizer only)
router.post('/', authenticate, isOrganizer, async (req, res) => {
    try {
        const {
            title,
            description,
            banner,
            timeline,
            rules,
            maxTeams,
            aiWeights,
            tags,
            mode,
            location
        } = req.body;

        const hackathonData = {
            title,
            description,
            banner,
            organizerId: req.user.uid,
            timeline,
            rules,
            maxTeams: maxTeams || 100,
            aiWeights: aiWeights || {
                innovation: 40,
                complexity: 30,
                design: 20,
                pitch: 10
            },
            tags: tags || [],
            mode: mode || 'hybrid',
            location: location || 'Online',
            status: 'draft',
            registeredTeams: 0
        };

        const hackathonId = await createHackathon(hackathonData);

        res.status(201).json({
            message: 'Hackathon created successfully',
            hackathonId,
            hackathon: { id: hackathonId, ...hackathonData }
        });
    } catch (error) {
        console.error('Create hackathon error:', error);
        res.status(500).json({ error: 'Failed to create hackathon' });
    }
});

// Update hackathon (organizer only)
router.put('/:id', authenticate, isOrganizer, async (req, res) => {
    try {
        const hackathon = await getHackathon(req.params.id);

        if (!hackathon) {
            return res.status(404).json({ error: 'Hackathon not found' });
        }

        if (hackathon.organizerId !== req.user.uid) {
            return res.status(403).json({ error: 'Not authorized to update this hackathon' });
        }

        await updateHackathon(req.params.id, req.body);

        res.json({ message: 'Hackathon updated successfully' });
    } catch (error) {
        console.error('Update hackathon error:', error);
        res.status(500).json({ error: 'Failed to update hackathon' });
    }
});

// Delete hackathon (organizer only)
router.delete('/:id', authenticate, isOrganizer, async (req, res) => {
    try {
        const hackathon = await getHackathon(req.params.id);

        if (!hackathon) {
            return res.status(404).json({ error: 'Hackathon not found' });
        }

        if (hackathon.organizerId !== req.user.uid) {
            return res.status(403).json({ error: 'Not authorized to delete this hackathon' });
        }

        await deleteHackathon(req.params.id);

        res.json({ message: 'Hackathon deleted successfully' });
    } catch (error) {
        console.error('Delete hackathon error:', error);
        res.status(500).json({ error: 'Failed to delete hackathon' });
    }
});

export default router;
