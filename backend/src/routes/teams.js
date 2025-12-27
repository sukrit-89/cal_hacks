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
        const { teamCode, bio, linkedinUrl } = req.body;

        const team = await getTeam(teamCode);

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

        // Add member's bio and LinkedIn
        teamBios.push({
            userId: req.user.uid,
            bio: bio || '',
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

        // Only team leader can update
        if (team.leaderId !== req.user.uid) {
            return res.status(403).json({ error: 'Only team leader can update team details' });
        }

        await updateTeam(req.params.id, req.body);

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

        const { projectDetails, documents, teamBios } = req.body;

        const submissions = {
            initial: {
                projectDetails,
                documents,
                teamBios,
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
