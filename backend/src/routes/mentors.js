import express from 'express';
import authenticate from '../middleware/auth.js';
import { isOrganizer, isMentor } from '../middleware/roleCheck.js';
import {
    createMentor,
    getMentor,
    getAllMentors,
    updateMentor,
    deleteMentor,
    deleteAssignmentsByMentor,
    getMentorsByDomain,
    createMentorAssignment,
    getAssignmentsByMentor,
    getAssignmentsByHackathon,
    getAssignmentsByTeam,
    getTeamsByHackathon,
    getTeam,
    updateTeam,
    updateAssignmentStatus,
    getHackathon
} from '../services/firestore.js';
import { extractDomains } from '../utils/aiDomainExtractor.js';
import { sendMentorAssignmentEmail } from '../services/emailServiceResend.js';

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

// Delete mentor (organizer only)
router.delete('/:id', authenticate, isOrganizer, async (req, res) => {
    try {
        const mentorId = req.params.id;

        if (!mentorId) {
            return res.status(400).json({ error: 'Mentor ID is required' });
        }

        const mentor = await getMentor(mentorId);

        if (!mentor) {
            return res.status(404).json({ error: 'Mentor not found' });
        }

        // Delete all assignments associated with this mentor
        let deletedAssignments = 0;
        try {
            deletedAssignments = await deleteAssignmentsByMentor(mentorId);
        } catch (assignmentError) {
            console.error('Error deleting assignments:', assignmentError);
            // Continue with mentor deletion even if assignment deletion fails
        }

        // Delete the mentor
        await deleteMentor(mentorId);

        res.json({
            message: 'Mentor deleted successfully',
            deletedAssignments
        });
    } catch (error) {
        console.error('Delete mentor error:', error);
        res.status(500).json({ error: 'Failed to delete mentor', details: error.message });
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

        // Fetch all mentors upfront and build a load tracker
        const allMentors = await getAllMentors();
        const mentorLoadTracker = {};

        // Initialize load tracker with current assigned counts
        for (const mentor of allMentors) {
            mentorLoadTracker[mentor.id] = mentor.assignedCount || 0;
        }

        const assignmentSummary = {
            totalTeams: 0,
            totalAssignments: 0,
            skippedTeams: [],
            mentorLoads: {},
            errors: []
        };

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

            // Check if team already has assignments for this hackathon
            const existingAssignments = await getAssignmentsByTeam(team.id);
            const existingHackathonAssignments = existingAssignments.filter(
                a => a.hackathonId === hackathonId
            );

            if (existingHackathonAssignments.length > 0) {
                assignmentSummary.skippedTeams.push({
                    teamId: team.id,
                    teamName: team.teamName,
                    reason: 'Team already has mentor assignments'
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
                    // Get mentors for this domain from allMentors
                    const eligibleMentors = allMentors.filter(
                        m => m.domains && m.domains.includes(domain)
                    );

                    if (eligibleMentors.length === 0) {
                        assignmentSummary.errors.push({
                            teamId: team.id,
                            domain,
                            error: `No mentors available for domain: ${domain}`
                        });
                        continue;
                    }

                    // Sort by current load (using tracker) to find mentor with lowest load
                    // This ensures automatic load balancing - always picks least loaded mentor
                    const sortedMentors = [...eligibleMentors].sort((a, b) => {
                        const loadA = mentorLoadTracker[a.id] || 0;
                        const loadB = mentorLoadTracker[b.id] || 0;
                        // Primary sort: by current load (ascending)
                        if (loadA !== loadB) {
                            return loadA - loadB;
                        }
                        // Secondary sort: by remaining capacity (descending) - prefer mentors with more room
                        const remainingA = a.maxLoad - loadA;
                        const remainingB = b.maxLoad - loadB;
                        return remainingB - remainingA;
                    });

                    // Find first mentor with available capacity (already sorted by lowest load)
                    let selectedMentor = null;
                    for (const mentor of sortedMentors) {
                        const currentLoad = mentorLoadTracker[mentor.id] || 0;
                        if (currentLoad < mentor.maxLoad) {
                            selectedMentor = mentor;
                            break;
                        }
                    }

                    // Fallback: If no domain-specific mentor available, assign to ANY mentor with lowest load
                    if (!selectedMentor && eligibleMentors.length === 0) {
                        // Sort ALL mentors by load and find one with capacity
                        const allMentorsSorted = [...allMentors].sort((a, b) => {
                            const loadA = mentorLoadTracker[a.id] || 0;
                            const loadB = mentorLoadTracker[b.id] || 0;
                            if (loadA !== loadB) return loadA - loadB;
                            return (b.maxLoad - loadB) - (a.maxLoad - loadA);
                        });

                        for (const mentor of allMentorsSorted) {
                            const currentLoad = mentorLoadTracker[mentor.id] || 0;
                            if (currentLoad < mentor.maxLoad && !assignedMentors.includes(mentor.id)) {
                                selectedMentor = mentor;
                                console.log(`⚠️ Fallback: Assigning team ${team.teamName} to ${mentor.name} (least loaded mentor)`);
                                break;
                            }
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

                    // Check if this mentor is already assigned to this team (avoid duplicate domain assignments)
                    if (assignedMentors.includes(selectedMentor.id)) {
                        // Mentor already assigned to this team, skip creating duplicate
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

                    // Update load tracker immediately
                    mentorLoadTracker[selectedMentor.id] = (mentorLoadTracker[selectedMentor.id] || 0) + 1;

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

        // Send emails to mentors with their assignments (non-blocking)
        const emailResults = { sent: 0, failed: 0, skipped: 0, errors: [] };

        // Check if Resend is configured
        const emailEnabled = process.env.ENABLE_EMAIL !== 'false';
        const resendConfigured = !!process.env.RESEND_API_KEY;

        if (!emailEnabled || !resendConfigured) {
            const reason = !emailEnabled
                ? 'Email disabled via ENABLE_EMAIL=false'
                : 'Resend API key not configured';
            console.log(`📧 Skipping email notifications - ${reason}`);
            emailResults.skipped = Object.keys(mentorLoadTracker).length;
            res.json({
                message: 'PPT distribution completed',
                summary: assignmentSummary,
                emailResults
            });
            return; // Skip email sending entirely
        } else {
            // Get hackathon details for email
            const hackathon = await getHackathon(hackathonId);
            const hackathonName = hackathon?.title || 'Hackathon';

            // Get all assignments for this hackathon grouped by mentor
            const allAssignments = await getAssignmentsByHackathon(hackathonId);
            const assignmentsByMentor = {};

            for (const assignment of allAssignments) {
                if (!assignmentsByMentor[assignment.mentorId]) {
                    assignmentsByMentor[assignment.mentorId] = [];
                }

                // Get team details for the email
                const team = await getTeam(assignment.teamId);
                assignmentsByMentor[assignment.mentorId].push({
                    teamId: assignment.teamId,
                    teamName: team?.teamName || 'Unknown Team',
                    ideaTitle: team?.submissions?.idea?.title || 'Untitled',
                    domain: assignment.domain,
                    pptUrl: team?.submissions?.idea?.pptUrl || null
                });
            }

            // Send email to each mentor with assignments (with timeout)
            const emailPromises = Object.entries(assignmentsByMentor).map(async ([mentorId, mentorAssignments]) => {
                const emailStart = Date.now(); // Track email latency
                try {
                    const mentor = await getMentor(mentorId);
                    if (mentor && mentor.email) {
                        // Add timeout of 10 seconds per email
                        const timeoutPromise = new Promise((_, reject) =>
                            setTimeout(() => reject(new Error('Email timeout')), 10000)
                        );

                        const emailResult = await Promise.race([
                            sendMentorAssignmentEmail(mentor, mentorAssignments, hackathonName),
                            timeoutPromise
                        ]);

                        const emailLatency = Date.now() - emailStart;
                        emailResults.sent++;
                        emailResults.latencies = emailResults.latencies || [];
                        emailResults.latencies.push(emailLatency);
                        console.log(`Email sent to mentor: ${mentor.email} (${emailLatency}ms)`);
                    }
                } catch (emailError) {
                    const emailLatency = Date.now() - emailStart;
                    console.error(`Failed to send email to mentor ${mentorId}: ${emailError.message} (after ${emailLatency}ms)`);
                    emailResults.failed++;
                    emailResults.errors.push({ mentorId, error: emailError.message });
                }
            });

            // Wait for all emails but don't let it block forever
            await Promise.allSettled(emailPromises);

            // Calculate latency statistics
            if (emailResults.latencies && emailResults.latencies.length > 0) {
                emailResults.avgLatencyMs = Math.round(
                    emailResults.latencies.reduce((a, b) => a + b, 0) / emailResults.latencies.length
                );
                emailResults.minLatencyMs = Math.min(...emailResults.latencies);
                emailResults.maxLatencyMs = Math.max(...emailResults.latencies);
                delete emailResults.latencies; // Don't send raw array to frontend
            }
        }

        res.json({
            message: 'PPT distribution completed',
            summary: assignmentSummary,
            emailResults
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

// Get distribution statistics/accuracy (organizer only)
router.get('/distribution-stats/:hackathonId', authenticate, isOrganizer, async (req, res) => {
    try {
        const { hackathonId } = req.params;

        // Get hackathon to verify organizer
        const hackathon = await getHackathon(hackathonId);
        if (!hackathon) {
            return res.status(404).json({ error: 'Hackathon not found' });
        }

        if (hackathon.organizerId !== req.user.uid) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Get all assignments for this hackathon
        const assignments = await getAssignmentsByHackathon(hackathonId);

        // Get all mentors
        const mentors = await getAllMentors();

        // Get all teams with idea submissions
        const teams = await getTeamsByHackathon(hackathonId);
        const teamsWithIdeas = teams.filter(t => t.submissions?.idea?.description);

        // Calculate per-mentor statistics
        const mentorStats = {};
        for (const mentor of mentors) {
            const mentorAssignments = assignments.filter(a => a.mentorId === mentor.id);
            mentorStats[mentor.id] = {
                name: mentor.name,
                email: mentor.email,
                domains: mentor.domains,
                maxLoad: mentor.maxLoad,
                assignedCount: mentorAssignments.length,
                utilization: mentor.maxLoad > 0 ? ((mentorAssignments.length / mentor.maxLoad) * 100).toFixed(1) : 0,
                assignments: mentorAssignments.map(a => ({
                    teamId: a.teamId,
                    teamName: a.teamName,
                    matchedDomain: a.matchedDomain,
                    status: a.status
                }))
            };
        }

        // Calculate overall statistics
        const assignmentCounts = Object.values(mentorStats).map(m => m.assignedCount);
        const totalAssignments = assignmentCounts.reduce((sum, c) => sum + c, 0);
        const mentorsWithAssignments = assignmentCounts.filter(c => c > 0).length;

        // Calculate uniformity metrics
        const avgAssignments = mentorsWithAssignments > 0 ? totalAssignments / mentorsWithAssignments : 0;
        const maxAssignments = Math.max(...assignmentCounts, 0);
        const minAssignments = Math.min(...assignmentCounts.filter(c => c > 0), 0);

        // Standard deviation for uniformity
        const variance = mentorsWithAssignments > 0
            ? assignmentCounts.filter(c => c > 0).reduce((sum, c) => sum + Math.pow(c - avgAssignments, 2), 0) / mentorsWithAssignments
            : 0;
        const stdDev = Math.sqrt(variance);

        // Uniformity score (100 = perfectly uniform, 0 = very uneven)
        // Using coefficient of variation inverted
        const coefficientOfVariation = avgAssignments > 0 ? (stdDev / avgAssignments) : 0;
        const uniformityScore = Math.max(0, Math.min(100, (1 - coefficientOfVariation) * 100)).toFixed(1);

        // Check for unassigned teams
        const assignedTeamIds = new Set(assignments.map(a => a.teamId));
        const unassignedTeams = teamsWithIdeas.filter(t => !assignedTeamIds.has(t.id));

        // Calculate domain coverage
        const domainAssignments = {};
        for (const assignment of assignments) {
            const domain = assignment.matchedDomain || 'unknown';
            domainAssignments[domain] = (domainAssignments[domain] || 0) + 1;
        }

        const stats = {
            overview: {
                totalTeams: teams.length,
                teamsWithIdeas: teamsWithIdeas.length,
                totalAssignments,
                totalMentors: mentors.length,
                mentorsWithAssignments,
                unassignedTeamsCount: unassignedTeams.length
            },
            uniformity: {
                score: parseFloat(uniformityScore),
                rating: parseFloat(uniformityScore) >= 80 ? 'Excellent' :
                    parseFloat(uniformityScore) >= 60 ? 'Good' :
                        parseFloat(uniformityScore) >= 40 ? 'Fair' : 'Poor',
                avgAssignmentsPerMentor: avgAssignments.toFixed(2),
                maxAssignments,
                minAssignments: minAssignments === Infinity ? 0 : minAssignments,
                standardDeviation: stdDev.toFixed(2),
                description: `Distribution is ${parseFloat(uniformityScore) >= 80 ? 'highly uniform' :
                    parseFloat(uniformityScore) >= 60 ? 'reasonably uniform' :
                        parseFloat(uniformityScore) >= 40 ? 'somewhat uneven' : 'very uneven'}`
            },
            domainDistribution: domainAssignments,
            mentorBreakdown: Object.values(mentorStats).map(m => ({
                name: m.name,
                email: m.email,
                domains: m.domains,
                assigned: m.assignedCount,
                maxLoad: m.maxLoad,
                utilization: `${m.utilization}%`,
                status: m.assignedCount >= m.maxLoad ? 'At Capacity' :
                    m.assignedCount > 0 ? 'Active' : 'No Assignments'
            })),
            unassignedTeams: unassignedTeams.map(t => ({
                id: t.id,
                name: t.teamName,
                code: t.teamCode
            }))
        };

        res.json(stats);
    } catch (error) {
        console.error('Distribution stats error:', error);
        res.status(500).json({ error: 'Failed to fetch distribution statistics' });
    }
});

export default router;
