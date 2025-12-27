import axios from 'axios';
import config from '../config/config.js';

// Mock Axicov AI integration
// TODO: Replace with actual Axicov API calls when credentials are provided

export const preEvaluateTeam = async (teamData, weights) => {
    try {
        // TODO: Uncomment when Axicov credentials are available
        /*
        const response = await axios.post(
          config.axicov.preEvalUrl,
          {
            team: teamData,
            weights: weights
          },
          {
            headers: {
              'Authorization': `Bearer ${config.axicov.apiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        return response.data;
        */

        // MOCK IMPLEMENTATION
        console.log('🤖 Mock AI Pre-Evaluation called with weights:', weights);

        // Simulate AI scoring based on weights
        const innovationScore = Math.floor(Math.random() * 30 + 70);
        const complexityScore = Math.floor(Math.random() * 30 + 65);
        const designScore = Math.floor(Math.random() * 30 + 60);
        const pitchScore = Math.floor(Math.random() * 30 + 70);

        const totalScore = Math.round(
            (innovationScore * (weights.innovation / 100)) +
            (complexityScore * (weights.complexity / 100)) +
            (designScore * (weights.design / 100)) +
            (pitchScore * (weights.pitch / 100))
        );

        return {
            teamId: teamData.teamId,
            scores: {
                innovation: innovationScore,
                complexity: complexityScore,
                design: designScore,
                pitch: pitchScore,
                total: totalScore
            },
            breakdown: {
                github: `Analyzed ${teamData.members?.length || 0} GitHub profiles`,
                resume: `Evaluated ${teamData.members?.length || 0} resumes`,
                idea: 'Idea presentation analyzed',
                bio: 'Team composition assessed'
            },
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Axicov pre-evaluation error:', error);
        throw new Error('AI evaluation failed');
    }
};

export const finalEvaluateTeam = async (teamData, weights) => {
    try {
        // TODO: Uncomment when Axicov credentials are available
        /*
        const response = await axios.post(
          config.axicov.finalEvalUrl,
          {
            team: teamData,
            weights: weights
          },
          {
            headers: {
              'Authorization': `Bearer ${config.axicov.apiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        return response.data;
        */

        // MOCK IMPLEMENTATION
        console.log('🤖 Mock AI Final Evaluation called');

        const codeQuality = Math.floor(Math.random() * 30 + 70);
        const innovation = Math.floor(Math.random() * 30 + 75);
        const completeness = Math.floor(Math.random() * 30 + 65);
        const documentation = Math.floor(Math.random() * 30 + 60);

        const totalScore = Math.round(
            (codeQuality + innovation + completeness + documentation) / 4
        );

        return {
            teamId: teamData.teamId,
            scores: {
                codeQuality,
                innovation,
                completeness,
                documentation,
                total: totalScore
            },
            breakdown: {
                repository: 'GitHub repository analyzed',
                commits: 'Commit history evaluated',
                documentation: 'README and docs reviewed',
                functionality: 'Project functionality tested'
            },
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Axicov final evaluation error:', error);
        throw new Error('AI evaluation failed');
    }
};

export default {
    preEvaluateTeam,
    finalEvaluateTeam
};
