import express from 'express';
import authenticate from '../middleware/auth.js';
import { isOrganizer, isMentor } from '../middleware/roleCheck.js';
import {
    createMentor,
    getMentor,
    getAllMentors,
    updateMentor,
    getMentorsByDomain,
    createMentorAssignment,
    getAssignmentsByMentor,
    getAssignmentsByHackathon,
    getTeamsByHackathon,
    getTeam,
    updateTeam,
    updateAssignmentStatus
} from '../services/firestore.js';
import { extractDomains } from '../utils/aiDomainExtractor.js';

const router = express.Router();

// Create mentor (organizer only)
router.post('/', authenticate, isOrganizer, async (req, res) => {
    try {
        const { name, email, domains, maxLoad } = req.body;

        if (!name || !email || !domains || !maxLoad) {
            return res.status(400).json({ error: 'Missing required fields: name, email, domains, maxLoad' });
        }

        if (!Array.isArray(domains) || domains.length === 0) {
            return res.status(400).json({ error: 'domains must be a non-empty array' });
        }

        if (maxLoad < 1) {
            return res.status(400).json({ error: 'maxLoad must be at least 1' });
        }

        const mentorData = {
            name,
            email,
            domains,
            maxLoad: parseInt(maxLoad)
        };

        const mentorId = await createMentor(mentorData);

        res.status(201).json({
            message: 'Mentor created successfully',
            mentorId,
            mentor: { id: mentorId, ...mentorData, assignedCount: 0 }
        });
    } catch (error) {
        console.error('Create mentor error:', error);
        res.status(500).json({ error: 'Failed to create mentor' });
    }
});

// Get all mentors (organizer only)
router.get('/', authenticate, isOrganizer, async (req, res) => {
    try {
        const mentors = await getAllMentors();
        res.json({ mentors });
    } catch (error) {
        console.error('Get mentors error:', error);
        res.status(500).json({ error: 'Failed to fetch mentors' });
    }
});

// Get mentor by ID
router.get('/:id', authenticate, async (req, res) => {
    try {
        const mentor = await getMentor(req.params.id);

        if (!mentor) {
            return res.status(404).json({ error: 'Mentor not found' });
        }

        res.json({ mentor });
    } catch (error) {
        console.error('Get mentor error:', error);
        res.status(500).json({ error: 'Failed to fetch mentor' });
    }
});

// Update mentor (organizer only)
router.put('/:id', authenticate, isOrganizer, async (req, res) => {
    try {
        const mentor = await getMentor(req.params.id);

        if (!mentor) {
            return res.status(404).json({ error: 'Mentor not found' });
        }

        const { name, email, domains, maxLoad } = req.body;
        const updates = {};

        if (name) updates.name = name;
        if (email) updates.email = email;
        if (domains) {
            if (!Array.isArray(domains) || domains.length === 0) {
                return res.status(400).json({ error: 'domains must be a non-empty array' });
            }
            updates.domains = domains;
        }
        if (maxLoad) {
            if (maxLoad < 1) {
                return res.status(400).json({ error: 'maxLoad must be at least 1' });
            }
            updates.maxLoad = parseInt(maxLoad);
        }

        await updateMentor(req.params.id, updates);

        res.json({ message: 'Mentor updated successfully' });
    } catch (error) {
        console.error('Update mentor error:', error);
        res.status(500).json({ error: 'Failed to update mentor' });
    }
});

// Distribute PPTs to mentors (organizer only)
router.post('/assign/:hackathonId', authenticate, isOrganizer, async (req, res) => {
    try {
        const { hackathonId } = req.params;
        const { teamTexts } = req.body; // Optional: { teamId: extractedText }

        // Fetch all teams in this hackathon
        const teams = await getTeamsByHackathon(hackathonId);

        if (teams.length === 0) {
            return res.status(400).json({ error: 'No teams found for this hackathon' });
        }

        const assignmentSummary = {
            totalTeams: 0,
            totalAssignments: 0,
            skippedTeams: [],
            mentorLoads: {},
            errors: []
        };

        // Track mentor loads in memory for deterministic distribution
        const mentorLoadTracker = {};

        for (const team of teams) {
            // Check if team has idea submission (description is required, PPT is optional)
            const hasIdea = team.submissions?.idea?.description;

            if (!hasIdea) {
                assignmentSummary.skippedTeams.push({
                    teamId: team.id,
                    teamName: team.teamName,
                    reason: 'No idea description submitted'
                });
                continue;
            }

            assignmentSummary.totalTeams++;

            try {
                // Use the idea description for domain extraction
                const textContent = team.submissions?.idea?.description || '';

                if (!textContent) {
                    assignmentSummary.errors.push({
                        teamId: team.id,
                        error: 'No text content available for domain extraction'
                    });
                    continue;
                }

                const extractedDomains = await extractDomains(textContent);

                const assignedMentors = [];
                const assignmentRecords = [];

                // For each domain, find and assign a mentor
                for (const domain of extractedDomains) {
                    // Get mentors for this domain, sorted by assignedCount
                    const eligibleMentors = await getMentorsByDomain(domain);

                    if (eligibleMentors.length === 0) {
                        assignmentSummary.errors.push({
                            teamId: team.id,
                            domain,
                            error: `No mentors available for domain: ${domain}`
                        });
                        continue;
                    }

                    // Find first mentor with available capacity
                    let selectedMentor = null;
                    for (const mentor of eligibleMentors) {
                        const currentLoad = mentorLoadTracker[mentor.id] ?? mentor.assignedCount;
                        if (currentLoad < mentor.maxLoad) {
                            selectedMentor = mentor;
                            break;
                        }
                    }

                    if (!selectedMentor) {
                        assignmentSummary.errors.push({
                            teamId: team.id,
                            domain,
                            error: `All mentors for domain ${domain} are at capacity`
                        });
                        continue;
                    }

                    // Create assignment
                    const assignmentId = await createMentorAssignment({
                        mentorId: selectedMentor.id,
                        teamId: team.id,
                        hackathonId,
                        domain
                    });

                    assignmentRecords.push(assignmentId);
                    assignedMentors.push(selectedMentor.id);

                    // Update load tracker
                    mentorLoadTracker[selectedMentor.id] = (mentorLoadTracker[selectedMentor.id] ?? selectedMentor.assignedCount) + 1;

                    assignmentSummary.totalAssignments++;
                }

                // Update team with extracted domains and assigned mentors
                await updateTeam(team.id, {
                    'submissions.idea.extractedDomains': extractedDomains,
                    'submissions.idea.assignedMentors': [...new Set(assignedMentors)] // Remove duplicates
                });

            } catch (teamError) {
                console.error(`Error processing team ${team.id}:`, teamError);
                assignmentSummary.errors.push({
                    teamId: team.id,
                    error: teamError.message
                });
            }
        }

        // Persist updated assignedCounts to mentors
        for (const [mentorId, newCount] of Object.entries(mentorLoadTracker)) {
            await updateMentor(mentorId, { assignedCount: newCount });
            assignmentSummary.mentorLoads[mentorId] = newCount;
        }

        res.json({
            message: 'PPT distribution completed',
            summary: assignmentSummary
        });

    } catch (error) {
        console.error('Distribution error:', error);
        res.status(500).json({ error: 'Failed to distribute PPTs to mentors' });
    }
});

// Get mentor's assignments (mentor only)
router.get('/assignments', authenticate, isMentor, async (req, res) => {
    try {
        const { status } = req.query;
        const mentorId = req.user.uid;

        const assignments = await getAssignmentsByMentor(mentorId, status || null);

        // Enrich with team data
        const enrichedAssignments = await Promise.all(
            assignments.map(async (assignment) => {
                const team = await getTeam(assignment.teamId);
                return {
                    ...assignment,
                    teamName: team?.teamName || 'Unknown',
                    pptUrl: team?.submissions?.idea?.pptUrl || null,
                    hackathonId: team?.hackathonId
                };
            })
        );

        res.json({ assignments: enrichedAssignments });
    } catch (error) {
        console.error('Get assignments error:', error);
        res.status(500).json({ error: 'Failed to fetch assignments' });
    }
});

// Mark assignment as reviewed (mentor only)
router.post('/assignments/:assignmentId/reviewed', authenticate, isMentor, async (req, res) => {
    try {
        const { assignmentId } = req.params;

        // Verify assignment belongs to this mentor
        const assignments = await getAssignmentsByMentor(req.user.uid);
        const assignment = assignments.find(a => a.id === assignmentId);

        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found or does not belong to you' });
        }

        if (assignment.status === 'reviewed') {
            return res.status(400).json({ error: 'Assignment already marked as reviewed' });
        }

        await updateAssignmentStatus(assignmentId, 'reviewed');

        res.json({ message: 'Assignment marked as reviewed' });
    } catch (error) {
        console.error('Mark reviewed error:', error);
        res.status(500).json({ error: 'Failed to update assignment status' });
    }
});

export default router;
