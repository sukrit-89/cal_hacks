import express from 'express';
import authenticate from '../middleware/auth.js';
import { isOrganizer } from '../middleware/roleCheck.js';
import {
    getHackathon,
    getTeamsByHackathon,
    getTeam,
    saveEvaluation,
    getEvaluationsByTeam,
    updateTeam
} from '../services/firestore.js';
import { preEvaluateTeam, finalEvaluateTeam } from '../services/aiEvaluationService.js';

const router = express.Router();

// Trigger pre-evaluation for all teams in hackathon (organizer only)
router.post('/pre-evaluate/:hackathonId', authenticate, isOrganizer, async (req, res) => {
    try {
        console.log('🚀 Pre-evaluation triggered for hackathon:', req.params.hackathonId);

        const hackathon = await getHackathon(req.params.hackathonId);

        if (!hackathon) {
            return res.status(404).json({ error: 'Hackathon not found' });
        }

        if (hackathon.organizerId !== req.user.uid) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Get all teams for this hackathon (evaluate all, not just pending)
        const allTeams = await getTeamsByHackathon(req.params.hackathonId);
        console.log(`📋 Found ${allTeams.length} total teams`);

        if (allTeams.length === 0) {
            return res.status(400).json({ error: 'No teams to evaluate' });
        }

        // Map weights to new format (github, resume, idea, bios)
        const hackathonWeights = hackathon.aiWeights || {};
        const weights = {
            github: hackathonWeights.github || hackathonWeights.complexity || 30,
            resume: hackathonWeights.resume || hackathonWeights.design || 20,
            idea: hackathonWeights.idea || hackathonWeights.innovation || 40,
            bios: hackathonWeights.bios || hackathonWeights.pitch || 10
        };
        console.log('⚖️ Using weights:', weights);

        // Evaluate each team
        const evaluationResults = [];

        for (const team of allTeams) {
            try {
                console.log(`\n🔄 Evaluating team: ${team.teamName} (${team.id})`);
                const aiResult = await preEvaluateTeam(team, weights);
                console.log(`✅ Got scores for ${team.teamName}:`, aiResult.scores);

                // Save evaluation with reasoning
                await saveEvaluation({
                    teamId: team.id,
                    hackathonId: req.params.hackathonId,
                    type: 'pre',
                    aiScores: aiResult.scores,
                    totalScore: aiResult.scores.total,
                    breakdown: aiResult.breakdown,
                    reasoning: aiResult.reasoning
                });

                // Update team with scores
                await updateTeam(team.id, {
                    scores: aiResult.scores,
                    reasoning: aiResult.reasoning,
                    evaluatedAt: new Date().toISOString()
                });
                console.log(`💾 Saved scores for team: ${team.teamName}`);

                evaluationResults.push({
                    teamId: team.id,
                    teamName: team.teamName,
                    score: aiResult.scores.total,
                    scores: aiResult.scores,
                    reasoning: aiResult.reasoning
                });
            } catch (error) {
                console.error(`❌ Error evaluating team ${team.id}:`, error.message);
                evaluationResults.push({
                    teamId: team.id,
                    teamName: team.teamName,
                    error: 'Evaluation failed: ' + error.message
                });
            }
        }

        // Sort by score
        evaluationResults.sort((a, b) => (b.score || 0) - (a.score || 0));

        console.log(`\n🎉 Evaluation complete! Evaluated ${evaluationResults.length} teams`);

        res.json({
            message: 'Pre-evaluation completed',
            evaluated: evaluationResults.length,
            results: evaluationResults
        });
    } catch (error) {
        console.error('Pre-evaluation error:', error);
        res.status(500).json({ error: 'Pre-evaluation failed' });
    }
});

// Trigger final evaluation for all accepted teams (organizer only)
router.post('/final-evaluate/:hackathonId', authenticate, isOrganizer, async (req, res) => {
    try {
        const hackathon = await getHackathon(req.params.hackathonId);

        if (!hackathon) {
            return res.status(404).json({ error: 'Hackathon not found' });
        }

        if (hackathon.organizerId !== req.user.uid) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Get all accepted teams with final submissions
        const allTeams = await getTeamsByHackathon(req.params.hackathonId);
        const acceptedTeams = allTeams.filter(
            team => team.status === 'accepted' && team.submissions?.final
        );

        if (acceptedTeams.length === 0) {
            return res.status(400).json({ error: 'No teams with final submissions to evaluate' });
        }

        // Map weights to new format
        const hackathonWeights = hackathon.aiWeights || {};
        const weights = {
            github: hackathonWeights.github || hackathonWeights.complexity || 30,
            resume: hackathonWeights.resume || hackathonWeights.design || 20,
            idea: hackathonWeights.idea || hackathonWeights.innovation || 40,
            bios: hackathonWeights.bios || hackathonWeights.pitch || 10
        };

        // Evaluate each team
        const evaluationResults = [];

        for (const team of acceptedTeams) {
            try {
                const aiResult = await finalEvaluateTeam(team, weights);

                // Save evaluation with reasoning
                await saveEvaluation({
                    teamId: team.id,
                    hackathonId: req.params.hackathonId,
                    type: 'final',
                    aiScores: aiResult.scores,
                    totalScore: aiResult.scores.total,
                    breakdown: aiResult.breakdown,
                    reasoning: aiResult.reasoning
                });

                // Update team with final scores
                await updateTeam(team.id, {
                    finalScores: aiResult.scores,
                    finalReasoning: aiResult.reasoning,
                    finalEvaluatedAt: new Date().toISOString()
                });

                evaluationResults.push({
                    teamId: team.id,
                    teamName: team.teamName,
                    score: aiResult.scores.total,
                    scores: aiResult.scores,
                    reasoning: aiResult.reasoning
                });
            } catch (error) {
                console.error(`Error evaluating team ${team.id}:`, error);
                evaluationResults.push({
                    teamId: team.id,
                    teamName: team.teamName,
                    error: 'Evaluation failed'
                });
            }
        }

        // Sort by score
        evaluationResults.sort((a, b) => (b.score || 0) - (a.score || 0));

        res.json({
            message: 'Final evaluation completed',
            evaluated: evaluationResults.length,
            results: evaluationResults
        });
    } catch (error) {
        console.error('Final evaluation error:', error);
        res.status(500).json({ error: 'Final evaluation failed' });
    }
});

// Get scores for a specific team
router.get('/scores/:teamId', authenticate, async (req, res) => {
    try {
        const team = await getTeam(req.params.teamId);

        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        const evaluations = await getEvaluationsByTeam(req.params.teamId);

        res.json({ evaluations });
    } catch (error) {
        console.error('Get scores error:', error);
        res.status(500).json({ error: 'Failed to fetch scores' });
    }
});

export default router;
