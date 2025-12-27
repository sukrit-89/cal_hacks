import express from 'express';
import { nanoid } from 'nanoid';
import QRCode from 'qrcode';
import authenticate from '../middleware/auth.js';
import { isParticipant } from '../middleware/roleCheck.js';
import {
    createTeam,
    getTeam,
    getTeamByCode,
    getTeamsByHackathon,
    getTeamsByUser,
    updateTeam,
    getHackathon,
    createTeamInvite,
    getTeamInvites,
    updateInviteStatus,
    getUser
} from '../services/firestore.js';
import { createTeamInviteNotification } from '../services/notificationService.js';

const router = express.Router();

// Create team (participant only)
router.post('/', authenticate, isParticipant, async (req, res) => {
    try {
        const { hackathonId, teamName } = req.body;

        // Verify hackathon exists
        const hackathon = await getHackathon(hackathonId);
        if (!hackathon) {
            return res.status(404).json({ error: 'Hackathon not found' });
        }

        // Generate unique team code
        const teamCode = nanoid(6).toUpperCase();

        const teamData = {
            hackathonId,
            teamName,
            teamCode,
            leaderId: req.user.uid,
            members: [req.user.uid],
            status: 'pending',
            submissions: {},
            scores: {},
            rsvpStatus: false,
            qrCode: null
        };

        const teamId = await createTeam(teamData);

        res.status(201).json({
            message: 'Team created successfully',
            teamId,
            team: { id: teamId, ...teamData }
        });
    } catch (error) {
        console.error('Create team error:', error);
        res.status(500).json({ error: 'Failed to create team' });
    }
});

// Join team with code (participant only)
router.post('/join', authenticate, isParticipant, async (req, res) => {
    try {
        const { teamCode, bio, githubUrl, linkedinUrl } = req.body;

        const team = await getTeamByCode(teamCode);

        if (!team) {
            return res.status(404).json({ error: 'Team not found with this code' });
        }

        // Check if user is already a member
        if (team.members.includes(req.user.uid)) {
            return res.status(400).json({ error: 'You are already a member of this team' });
        }

        // Add user to team members
        const updatedMembers = [...team.members, req.user.uid];

        // Initialize teamBios array if it doesn't exist
        const teamBios = team.teamBios || [];

        // Add member's profile (bio, GitHub, LinkedIn)
        teamBios.push({
            userId: req.user.uid,
            bio: bio || '',
            githubUrl: githubUrl || '',
            linkedinUrl: linkedinUrl || ''
        });

        await updateTeam(team.id, {
            members: updatedMembers,
            teamBios: teamBios
        });

        res.json({
            message: 'Successfully joined team',
            team: { ...team, members: updatedMembers, teamBios }
        });
    } catch (error) {
        console.error('Join team error:', error);
        res.status(500).json({ error: 'Failed to join team' });
    }
});

// Get team by ID
router.get('/:id', authenticate, async (req, res) => {
    try {
        const team = await getTeam(req.params.id);

        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        res.json({ team });
    } catch (error) {
        console.error('Get team error:', error);
        res.status(500).json({ error: 'Failed to fetch team' });
    }
});

// Get teams by hackathon
router.get('/hackathon/:hackathonId', authenticate, async (req, res) => {
    try {
        const teams = await getTeamsByHackathon(req.params.hackathonId);
        res.json({ teams });
    } catch (error) {
        console.error('Get teams error:', error);
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
});

// Get user's teams
router.get('/user/me', authenticate, async (req, res) => {
    try {
        const teams = await getTeamsByUser(req.user.uid);
        res.json({ teams });
    } catch (error) {
        console.error('Get user teams error:', error);
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
});

// Update team
router.put('/:id', authenticate, async (req, res) => {
    try {
        const team = await getTeam(req.params.id);

        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        // Check if user is team leader OR organizer of the hackathon
        const hackathon = await getHackathon(team.hackathonId);
        const isTeamLeader = team.leaderId === req.user.uid;
        const isOrganizer = hackathon && hackathon.organizerId === req.user.uid;

        if (!isTeamLeader && !isOrganizer) {
            return res.status(403).json({ error: 'Not authorized to update team' });
        }

        // If organizer is updating status, allow only status changes
        if (isOrganizer && !isTeamLeader) {
            const allowedFields = ['status'];
            const updates = {};
            for (const field of allowedFields) {
                if (req.body[field] !== undefined) {
                    updates[field] = req.body[field];
                }
            }
            await updateTeam(req.params.id, updates);
        } else {
            // Team leader can update all fields
            await updateTeam(req.params.id, req.body);
        }

        res.json({ message: 'Team updated successfully' });
    } catch (error) {
        console.error('Update team error:', error);
        res.status(500).json({ error: 'Failed to update team' });
    }
});

// Submit team registration
router.post('/:id/submit', authenticate, isParticipant, async (req, res) => {
    try {
        const team = await getTeam(req.params.id);

        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        if (team.leaderId !== req.user.uid) {
            return res.status(403).json({ error: 'Only team leader can submit registration' });
        }

        const { teamBios } = req.body;

        // Simple submission - just team member bios
        // Project details will be added during final submission
        const submissions = {
            initial: {
                teamBios: teamBios || team.teamBios || [], // Use provided or existing
                submittedAt: new Date().toISOString()
            }
        };

        await updateTeam(req.params.id, { submissions, status: 'pending' });

        res.json({ message: 'Registration submitted successfully' });
    } catch (error) {
        console.error('Submit registration error:', error);
        res.status(500).json({ error: 'Failed to submit registration' });
    }
});

// Submit idea (PPT + description)
router.post('/:id/idea-submit', authenticate, isParticipant, async (req, res) => {
    try {
        const team = await getTeam(req.params.id);

        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        if (team.leaderId !== req.user.uid) {
            return res.status(403).json({ error: 'Only team leader can submit idea' });
        }

        const { title, description, pptUrl } = req.body;

        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required' });
        }

        // Update team with idea submission (pptUrl is optional)
        const ideaSubmission = {
            title,
            description,
            pptUrl,
            submittedAt: new Date().toISOString()
        };

        // Merge with existing submissions
        const existingSubmissions = team.submissions || {};
        await updateTeam(req.params.id, {
            submissions: {
                ...existingSubmissions,
                idea: ideaSubmission
            }
        });

        res.json({ message: 'Idea submitted successfully' });
    } catch (error) {
        console.error('Submit idea error:', error);
        res.status(500).json({ error: 'Failed to submit idea' });
    }
});

// RSVP for hackathon
router.post('/:id/rsvp', authenticate, isParticipant, async (req, res) => {
    try {
        const team = await getTeam(req.params.id);

        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        if (team.status !== 'accepted') {
            return res.status(400).json({ error: 'Only accepted teams can RSVP' });
        }

        // Generate QR code
        const qrData = JSON.stringify({
            teamId: req.params.id,
            teamName: team.teamName,
            hackathonId: team.hackathonId,
            timestamp: new Date().toISOString()
        });

        const qrCodeDataURL = await QRCode.toDataURL(qrData);

        await updateTeam(req.params.id, {
            rsvpStatus: true,
            qrCode: qrCodeDataURL
        });

        res.json({
            message: 'RSVP successful',
            qrCode: qrCodeDataURL
        });
    } catch (error) {
        console.error('RSVP error:', error);
        res.status(500).json({ error: 'Failed to RSVP' });
    }
});

// Verify QR code and check-in team (organizer only)
router.post('/verify-checkin', authenticate, async (req, res) => {
    try {
        const { qrData } = req.body;

        if (!qrData) {
            return res.status(400).json({ error: 'QR data is required' });
        }

        // Parse QR code data
        let parsedData;
        try {
            parsedData = JSON.parse(qrData);
        } catch (e) {
            return res.status(400).json({ error: 'Invalid QR code format' });
        }

        const { teamId, hackathonId } = parsedData;

        if (!teamId || !hackathonId) {
            return res.status(400).json({ error: 'Invalid QR code data' });
        }

        // Get team details
        const team = await getTeam(teamId);
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        // Verify hackathon belongs to organizer
        const hackathon = await getHackathon(hackathonId);
        if (!hackathon) {
            return res.status(404).json({ error: 'Hackathon not found' });
        }

        if (hackathon.organizerId !== req.user.uid) {
            return res.status(403).json({ error: 'Not authorized to check-in teams for this hackathon' });
        }

        // Verify team has RSVP'd
        if (!team.rsvpStatus) {
            return res.status(400).json({ error: 'Team has not RSVP\'d' });
        }

        // Fetch member details
        const memberDetails = await Promise.all(
            (team.members || []).map(async (memberId) => {
                try {
                    const user = await getUser(memberId);
                    if (user) {
                        // Find member's bio if available
                        const memberBio = (team.teamBios || []).find(bio => bio.userId === memberId);
                        return {
                            id: memberId,
                            displayName: user.displayName || 'Unknown',
                            email: user.email || '',
                            isLeader: memberId === team.leaderId,
                            bio: memberBio?.bio || '',
                            githubUrl: memberBio?.githubUrl || '',
                            linkedinUrl: memberBio?.linkedinUrl || ''
                        };
                    }
                    return { id: memberId, displayName: 'Unknown User', email: '', isLeader: false };
                } catch (err) {
                    return { id: memberId, displayName: 'Unknown User', email: '', isLeader: false };
                }
            })
        );

        // Check if already checked in
        if (team.checkedIn) {
            return res.json({
                message: 'Team already checked in',
                alreadyCheckedIn: true,
                team: {
                    id: teamId,
                    teamName: team.teamName,
                    teamCode: team.teamCode,
                    memberCount: team.members?.length || 0,
                    memberDetails: memberDetails,
                    checkedInAt: team.checkedInAt
                },
                hackathon: {
                    name: hackathon.name
                }
            });
        }

        // Mark team as checked in
        const checkedInAt = new Date().toISOString();
        await updateTeam(teamId, {
            checkedIn: true,
            checkedInAt: checkedInAt
        });

        res.json({
            message: 'Check-in successful',
            alreadyCheckedIn: false,
            team: {
                id: teamId,
                teamName: team.teamName,
                teamCode: team.teamCode,
                memberCount: team.members?.length || 0,
                memberDetails: memberDetails,
                checkedInAt: checkedInAt
            },
            hackathon: {
                name: hackathon.name
            }
        });
    } catch (error) {
        console.error('Check-in error:', error);
        res.status(500).json({ error: 'Failed to check-in team' });
    }
});

// Final submission
router.post('/:id/final-submit', authenticate, isParticipant, async (req, res) => {
    try {
        const team = await getTeam(req.params.id);

        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        if (team.leaderId !== req.user.uid) {
            return res.status(403).json({ error: 'Only team leader can submit final project' });
        }

        if (team.status !== 'accepted' || !team.rsvpStatus) {
            return res.status(400).json({ error: 'Must be accepted and RSVP\'d to submit final project' });
        }

        const { repositoryUrl, projectDescription, files } = req.body;

        const finalSubmission = {
            repositoryUrl,
            projectDescription,
            files: files || [],
            submittedAt: new Date().toISOString()
        };

        await updateTeam(req.params.id, {
            'submissions.final': finalSubmission
        });

        res.json({ message: 'Final submission successful' });
    } catch (error) {
        console.error('Final submission error:', error);
        res.status(500).json({ error: 'Failed to submit final project' });
    }
});

// Send team invite (team leader only)
router.post('/:id/invite', authenticate, isParticipant, async (req, res) => {
    try {
        const team = await getTeam(req.params.id);

        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        if (team.leaderId !== req.user.uid) {
            return res.status(403).json({ error: 'Only team leader can send invites' });
        }

        const { invitedUserId } = req.body;

        // Get invited user info
        const invitedUser = await getUser(invitedUserId);
        if (!invitedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Create invite
        const inviteId = await createTeamInvite({
            teamId: req.params.id,
            teamName: team.teamName,
            hackathonId: team.hackathonId,
            invitedBy: req.user.uid,
            invitedUser: invitedUserId
        });

        // Create notification
        const currentUser = await getUser(req.user.uid);
        await createTeamInviteNotification(
            invitedUserId,
            team.teamName,
            req.params.id,
            currentUser.displayName || 'Someone'
        );

        res.json({ message: 'Invite sent successfully', inviteId });
    } catch (error) {
        console.error('Send invite error:', error);
        res.status(500).json({ error: 'Failed to send invite' });
    }
});

// Get user's team invites
router.get('/invites/me', authenticate, async (req, res) => {
    try {
        const invites = await getTeamInvites(req.user.uid);
        res.json({ invites });
    } catch (error) {
        console.error('Get invites error:', error);
        res.status(500).json({ error: 'Failed to fetch invites' });
    }
});

// Accept team invite
router.post('/invites/:id/accept', authenticate, isParticipant, async (req, res) => {
    try {
        const invites = await getTeamInvites(req.user.uid);
        const invite = invites.find(inv => inv.id === req.params.id);

        if (!invite) {
            return res.status(404).json({ error: 'Invite not found' });
        }

        // Add user to team
        const team = await getTeam(invite.teamId);
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        const updatedMembers = [...team.members, req.user.uid];
        await updateTeam(invite.teamId, { members: updatedMembers });

        // Update invite status
        await updateInviteStatus(req.params.id, 'accepted');

        res.json({ message: 'Invite accepted successfully', team });
    } catch (error) {
        console.error('Accept invite error:', error);
        res.status(500).json({ error: 'Failed to accept invite' });
    }
});

// Reject team invite
router.post('/invites/:id/reject', authenticate, isParticipant, async (req, res) => {
    try {
        await updateInviteStatus(req.params.id, 'rejected');
        res.json({ message: 'Invite rejected' });
    } catch (error) {
        console.error('Reject invite error:', error);
        res.status(500).json({ error: 'Failed to reject invite' });
    }
});

export default router;
