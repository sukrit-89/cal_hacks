import axios from 'axios';

// AI Evaluation API endpoint
const AI_EVAL_API_URL = 'https://express-app-morphvm-is5bih0g.http.cloud.morph.so/start';

/**
 * Pre-evaluate a team using the AI evaluation API
 * @param {Object} teamData - Team data including members, idea, bios
 * @param {Object} weights - Scoring weights { github, resume, idea, bios }
 * @returns {Promise<Object>} Evaluation results
 */
export const preEvaluateTeam = async (teamData, weights) => {
    try {
        console.log('🤖 AI Pre-Evaluation started for team:', teamData.teamName);

        // Extract GitHub URLs from team members
        const githubUrls = [];
        if (teamData.teamBios && Array.isArray(teamData.teamBios)) {
            teamData.teamBios.forEach(member => {
                if (member.githubUrl) {
                    // Ensure proper GitHub URL format
                    let githubUrl = member.githubUrl;
                    if (!githubUrl.startsWith('http')) {
                        githubUrl = `https://github.com/${githubUrl}`;
                    }
                    if (!githubUrl.endsWith('/')) {
                        githubUrl += '/';
                    }
                    githubUrls.push(githubUrl);
                }
            });
        }

        // Extract bios from team members
        const biosArray = [];
        if (teamData.teamBios && Array.isArray(teamData.teamBios)) {
            teamData.teamBios.forEach((member, index) => {
                if (member.bio) {
                    biosArray.push(`Member ${index + 1}: ${member.bio}`);
                }
            });
        }
        const biosText = biosArray.join('. ') || 'No bios provided.';

        // Get idea description
        const ideaDescription = teamData.submissions?.idea?.description ||
            teamData.submissions?.idea?.title ||
            'No idea description provided.';

        // Get resume info (using bios as resume proxy if no dedicated resume)
        const resumeText = teamData.resumeSummary ||
            biosArray.join('. ') ||
            'No resume information available.';

        // Convert weights from 0-100 format to match API expectations
        // The API expects weights like: { github: 30, resume: 20, idea: 40, bios: 10 }
        const apiWeights = {
            github: weights.github || weights.complexity || 30,
            resume: weights.resume || weights.design || 20,
            idea: weights.idea || weights.innovation || 40,
            bios: weights.bios || weights.pitch || 10
        };

        // Prepare request body
        const requestBody = {
            githubs: JSON.stringify(githubUrls.length > 0 ? githubUrls : ["https://github.com/example/"]),
            resume: resumeText,
            idea: ideaDescription,
            bios: biosText,
            weights: JSON.stringify(apiWeights),
            temperature: 0.3,
            maxTokens: 1024
        };

        console.log('📤 Sending to AI API:', {
            githubs: githubUrls,
            ideaPreview: ideaDescription.substring(0, 100) + '...',
            biosPreview: biosText.substring(0, 100) + '...',
            weights: apiWeights
        });

        // Call the AI evaluation API
        const response = await axios.post(AI_EVAL_API_URL, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 60000 // 60 second timeout
        });

        const aiResult = response.data;
        console.log('📥 AI API Response:', JSON.stringify(aiResult, null, 2));

        // Extract scores - handle various possible response formats
        const githubScore = aiResult.githubScore ?? aiResult.github ?? aiResult.scores?.github ?? 0;
        const resumeScore = aiResult.resumeScore ?? aiResult.resume ?? aiResult.scores?.resume ?? 0;
        const ideaScore = aiResult.ideaScore ?? aiResult.idea ?? aiResult.scores?.idea ?? 0;
        const biosScore = aiResult.biosScore ?? aiResult.bios ?? aiResult.scores?.bios ?? 0;

        // Calculate total using weights
        const totalScore = aiResult.totalScore ?? aiResult.total ?? Math.round(
            (githubScore * (apiWeights.github / 100)) +
            (resumeScore * (apiWeights.resume / 100)) +
            (ideaScore * (apiWeights.idea / 100)) +
            (biosScore * (apiWeights.bios / 100))
        );

        console.log('📊 Parsed Scores:', { githubScore, resumeScore, ideaScore, biosScore, totalScore });

        // Map API response to our format
        return {
            teamId: teamData.id,
            scores: {
                github: githubScore,
                resume: resumeScore,
                idea: ideaScore,
                bios: biosScore,
                total: totalScore,
                // Also map to legacy field names for compatibility
                innovation: ideaScore,
                complexity: githubScore,
                design: resumeScore,
                pitch: biosScore
            },
            reasoning: aiResult.reasoning || {
                github: 'GitHub profile analysis complete',
                resume: 'Resume evaluation complete',
                idea: 'Idea assessment complete',
                bios: 'Team bios review complete'
            },
            breakdown: {
                github: aiResult.reasoning?.github || 'GitHub profiles analyzed',
                resume: aiResult.reasoning?.resume || 'Resumes evaluated',
                idea: aiResult.reasoning?.idea || 'Idea analyzed',
                bio: aiResult.reasoning?.bios || 'Team bios assessed'
            },
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('AI Pre-evaluation error:', error.message);

        // If API fails, use fallback mock evaluation
        console.log('⚠️ Using fallback mock evaluation');
        return mockPreEvaluateTeam(teamData, weights);
    }
};

/**
 * Final evaluation for a team (same API, different context)
 */
export const finalEvaluateTeam = async (teamData, weights) => {
    try {
        console.log('🤖 AI Final Evaluation started for team:', teamData.teamName);

        // For final evaluation, we focus more on the final submission
        const githubUrls = [];

        // If team has a GitHub repo submission, use that
        if (teamData.submissions?.final?.repoUrl) {
            githubUrls.push(teamData.submissions.final.repoUrl);
        }

        // Also include member GitHubs
        if (teamData.teamBios && Array.isArray(teamData.teamBios)) {
            teamData.teamBios.forEach(member => {
                if (member.githubUrl) {
                    let githubUrl = member.githubUrl;
                    if (!githubUrl.startsWith('http')) {
                        githubUrl = `https://github.com/${githubUrl}`;
                    }
                    if (!githubUrl.endsWith('/')) {
                        githubUrl += '/';
                    }
                    githubUrls.push(githubUrl);
                }
            });
        }

        // Extract bios
        const biosArray = [];
        if (teamData.teamBios && Array.isArray(teamData.teamBios)) {
            teamData.teamBios.forEach((member, index) => {
                if (member.bio) {
                    biosArray.push(`Member ${index + 1}: ${member.bio}`);
                }
            });
        }
        const biosText = biosArray.join('. ') || 'No bios provided.';

        // Get final submission description or idea
        const ideaDescription = teamData.submissions?.final?.description ||
            teamData.submissions?.idea?.description ||
            'No project description provided.';

        const resumeText = teamData.resumeSummary || biosArray.join('. ') || 'No resume information.';

        const apiWeights = {
            github: weights.github || weights.complexity || 30,
            resume: weights.resume || weights.design || 20,
            idea: weights.idea || weights.innovation || 40,
            bios: weights.bios || weights.pitch || 10
        };

        const requestBody = {
            githubs: JSON.stringify(githubUrls.length > 0 ? githubUrls : ["https://github.com/example/"]),
            resume: resumeText,
            idea: ideaDescription,
            bios: biosText,
            weights: JSON.stringify(apiWeights),
            temperature: 0.3,
            maxTokens: 1024
        };

        const response = await axios.post(AI_EVAL_API_URL, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 60000
        });

        const aiResult = response.data;
        console.log('📥 AI Final Evaluation Response:', JSON.stringify(aiResult, null, 2));

        // Extract scores - handle various possible response formats
        const githubScore = aiResult.githubScore ?? aiResult.github ?? aiResult.scores?.github ?? 0;
        const resumeScore = aiResult.resumeScore ?? aiResult.resume ?? aiResult.scores?.resume ?? 0;
        const ideaScore = aiResult.ideaScore ?? aiResult.idea ?? aiResult.scores?.idea ?? 0;
        const biosScore = aiResult.biosScore ?? aiResult.bios ?? aiResult.scores?.bios ?? 0;

        // Calculate total using weights
        const totalScore = aiResult.totalScore ?? aiResult.total ?? Math.round(
            (githubScore * (apiWeights.github / 100)) +
            (resumeScore * (apiWeights.resume / 100)) +
            (ideaScore * (apiWeights.idea / 100)) +
            (biosScore * (apiWeights.bios / 100))
        );

        console.log('📊 Final Parsed Scores:', { githubScore, resumeScore, ideaScore, biosScore, totalScore });

        return {
            teamId: teamData.id,
            scores: {
                github: githubScore,
                resume: resumeScore,
                idea: ideaScore,
                bios: biosScore,
                total: totalScore,
                // Legacy mappings
                codeQuality: aiResult.githubScore || 0,
                innovation: aiResult.ideaScore || 0,
                completeness: aiResult.resumeScore || 0,
                documentation: aiResult.biosScore || 0
            },
            reasoning: aiResult.reasoning || {},
            breakdown: {
                github: aiResult.reasoning?.github || 'Repository analyzed',
                resume: aiResult.reasoning?.resume || 'Technical skills evaluated',
                idea: aiResult.reasoning?.idea || 'Project innovation assessed',
                bio: aiResult.reasoning?.bios || 'Team composition reviewed'
            },
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('AI Final evaluation error:', error.message);
        console.log('⚠️ Using fallback mock evaluation');
        return mockFinalEvaluateTeam(teamData, weights);
    }
};

/**
 * Fallback mock evaluation when API fails
 */
const mockPreEvaluateTeam = (teamData, weights) => {
    console.log('🎭 Mock Pre-Evaluation for team:', teamData.teamName);

    const githubScore = Math.floor(Math.random() * 30 + 60);
    const resumeScore = Math.floor(Math.random() * 30 + 55);
    const ideaScore = Math.floor(Math.random() * 30 + 65);
    const biosScore = Math.floor(Math.random() * 30 + 50);

    const apiWeights = {
        github: weights.github || weights.complexity || 30,
        resume: weights.resume || weights.design || 20,
        idea: weights.idea || weights.innovation || 40,
        bios: weights.bios || weights.pitch || 10
    };

    const totalScore = Math.round(
        (githubScore * (apiWeights.github / 100)) +
        (resumeScore * (apiWeights.resume / 100)) +
        (ideaScore * (apiWeights.idea / 100)) +
        (biosScore * (apiWeights.bios / 100))
    );

    return {
        teamId: teamData.id,
        scores: {
            github: githubScore,
            resume: resumeScore,
            idea: ideaScore,
            bios: biosScore,
            total: totalScore,
            innovation: ideaScore,
            complexity: githubScore,
            design: resumeScore,
            pitch: biosScore
        },
        reasoning: {
            github: 'GitHub profiles analyzed (mock evaluation)',
            resume: 'Resume skills evaluated (mock evaluation)',
            idea: 'Project idea assessed (mock evaluation)',
            bios: 'Team bios reviewed (mock evaluation)'
        },
        breakdown: {
            github: `Analyzed ${teamData.members?.length || 0} GitHub profiles`,
            resume: `Evaluated team skills`,
            idea: 'Idea presentation analyzed',
            bio: 'Team composition assessed'
        },
        timestamp: new Date().toISOString()
    };
};

const mockFinalEvaluateTeam = (teamData, weights) => {
    console.log('🎭 Mock Final Evaluation for team:', teamData.teamName);

    const githubScore = Math.floor(Math.random() * 30 + 70);
    const resumeScore = Math.floor(Math.random() * 30 + 65);
    const ideaScore = Math.floor(Math.random() * 30 + 75);
    const biosScore = Math.floor(Math.random() * 30 + 60);

    const totalScore = Math.round((githubScore + resumeScore + ideaScore + biosScore) / 4);

    return {
        teamId: teamData.id,
        scores: {
            github: githubScore,
            resume: resumeScore,
            idea: ideaScore,
            bios: biosScore,
            total: totalScore,
            codeQuality: githubScore,
            innovation: ideaScore,
            completeness: resumeScore,
            documentation: biosScore
        },
        reasoning: {
            github: 'Repository code quality analyzed (mock evaluation)',
            resume: 'Technical implementation reviewed (mock evaluation)',
            idea: 'Innovation assessed (mock evaluation)',
            bios: 'Documentation evaluated (mock evaluation)'
        },
        breakdown: {
            github: 'GitHub repository analyzed',
            resume: 'Technical skills evaluated',
            idea: 'Project innovation assessed',
            bio: 'Team execution reviewed'
        },
        timestamp: new Date().toISOString()
    };
};

export default {
    preEvaluateTeam,
    finalEvaluateTeam
};
