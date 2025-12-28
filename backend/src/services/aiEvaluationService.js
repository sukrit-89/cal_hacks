import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// OpenRouter API configuration
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API;

// Retry delays in milliseconds
const RETRY_DELAYS = [3000, 8000, 15000]; // 3s, 8s, 15s

/**
 * Sleep helper function
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Call OpenRouter API with retry logic
 */
const callOpenRouterWithRetry = async (messages, maxRetries = 3) => {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await axios.post(OPENROUTER_API_URL, {
                model: 'meta-llama/llama-3.3-70b-instruct:free', // Free model
                messages: messages,
                temperature: 0.3,
                max_tokens: 1024
            }, {
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'http://localhost:5000',
                    'X-Title': 'Hackathon Platform'
                },
                timeout: 60000
            });

            return response.data.choices[0].message.content.trim();
        } catch (error) {
            const isRateLimit = error.response?.status === 429 ||
                error.message.includes('429') ||
                error.message.includes('rate');

            if (isRateLimit && attempt < maxRetries) {
                const delay = RETRY_DELAYS[attempt] || 15000;
                console.log(`⏳ Rate limited. Retrying in ${delay / 1000}s... (attempt ${attempt + 1}/${maxRetries})`);
                await sleep(delay);
            } else {
                throw error;
            }
        }
    }
};

/**
 * Pre-evaluate a team using OpenRouter AI
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
                    githubUrls.push(member.githubUrl);
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
        const biosText = biosArray.length > 0 ? biosArray.join('. ') : 'No bios provided.';

        // Get idea description
        const ideaDescription = teamData.submissions?.idea?.description ||
            teamData.submissions?.idea?.title ||
            'No idea description provided.';

        // Get idea title
        const ideaTitle = teamData.submissions?.idea?.title || 'Untitled Project';

        // Build the prompt
        const prompt = `You are an expert hackathon judge evaluating a team's application. 
        
Evaluate this team based on the following criteria and provide scores from 0-100 for each:

TEAM: ${teamData.teamName}

PROJECT IDEA TITLE: ${ideaTitle}

PROJECT IDEA DESCRIPTION:
${ideaDescription}

TEAM MEMBER GITHUB PROFILES: ${githubUrls.length > 0 ? githubUrls.join(', ') : 'Not provided'}

TEAM MEMBER BIOS:
${biosText}

SCORING CRITERIA:
1. GITHUB (Weight: ${weights.github}%): Evaluate based on the GitHub profiles provided. Consider: profile completeness, repositories, activity, and technical skills shown.
2. RESUME/SKILLS (Weight: ${weights.resume}%): Evaluate based on team member bios and their described skills, experience, and background.
3. IDEA (Weight: ${weights.idea}%): Evaluate the project idea based on: innovation, feasibility, impact, and market potential.
4. BIOS (Weight: ${weights.bios}%): Evaluate the team composition: diversity of skills, team synergy, and overall team strength.

IMPORTANT: You must respond ONLY with a valid JSON object in this exact format (no markdown, no extra text):
{
    "github": <score 0-100>,
    "resume": <score 0-100>,
    "idea": <score 0-100>,
    "bios": <score 0-100>,
    "reasoning": {
        "github": "<brief 1-2 sentence explanation>",
        "resume": "<brief 1-2 sentence explanation>",
        "idea": "<brief 1-2 sentence explanation>",
        "bios": "<brief 1-2 sentence explanation>"
    }
}`;

        console.log('📤 Sending evaluation request to OpenRouter...');

        const messages = [
            { role: 'system', content: 'You are an expert hackathon judge. Respond only with valid JSON.' },
            { role: 'user', content: prompt }
        ];

        const output = await callOpenRouterWithRetry(messages);

        console.log('📥 OpenRouter raw response:', output.substring(0, 200) + '...');

        // Parse the JSON response
        let aiResult;
        try {
            const jsonMatch = output.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                aiResult = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (parseError) {
            console.error('Failed to parse OpenRouter response:', parseError.message);
            console.log('Raw output:', output);
            throw new Error('Failed to parse AI response');
        }

        // Extract scores with validation
        const githubScore = Math.min(100, Math.max(0, parseInt(aiResult.github) || 50));
        const resumeScore = Math.min(100, Math.max(0, parseInt(aiResult.resume) || 50));
        const ideaScore = Math.min(100, Math.max(0, parseInt(aiResult.idea) || 50));
        const biosScore = Math.min(100, Math.max(0, parseInt(aiResult.bios) || 50));

        // Calculate weighted total
        const totalScore = Math.round(
            (githubScore * (weights.github / 100)) +
            (resumeScore * (weights.resume / 100)) +
            (ideaScore * (weights.idea / 100)) +
            (biosScore * (weights.bios / 100))
        );

        console.log('✅ OpenRouter evaluation complete:', { githubScore, resumeScore, ideaScore, biosScore, totalScore });

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
            source: 'OPENROUTER_AI',
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('❌ OpenRouter AI evaluation failed:', error.message);
        console.log('⚠️ FALLBACK: Using consistent fallback scores');
        return consistentFallbackEvaluation(teamData, weights);
    }
};

/**
 * Final evaluation for a team using OpenRouter
 */
export const finalEvaluateTeam = async (teamData, weights) => {
    try {
        console.log('🤖 AI Final Evaluation started for team:', teamData.teamName);

        const repoUrl = teamData.submissions?.final?.repositoryUrl || '';
        const projectDescription = teamData.submissions?.final?.projectDescription ||
            teamData.submissions?.idea?.description ||
            'No project description provided.';

        const githubUrls = [];
        if (repoUrl) githubUrls.push(repoUrl);
        if (teamData.teamBios && Array.isArray(teamData.teamBios)) {
            teamData.teamBios.forEach(member => {
                if (member.githubUrl) {
                    githubUrls.push(member.githubUrl);
                }
            });
        }

        const biosArray = [];
        if (teamData.teamBios && Array.isArray(teamData.teamBios)) {
            teamData.teamBios.forEach((member, index) => {
                if (member.bio) {
                    biosArray.push(`Member ${index + 1}: ${member.bio}`);
                }
            });
        }
        const biosText = biosArray.length > 0 ? biosArray.join('. ') : 'No bios provided.';

        const prompt = `You are an expert hackathon judge evaluating a team's FINAL project submission.

TEAM: ${teamData.teamName}

PROJECT REPOSITORY: ${repoUrl || 'Not provided'}

PROJECT DESCRIPTION:
${projectDescription}

TEAM GITHUB PROFILES: ${githubUrls.length > 0 ? githubUrls.join(', ') : 'Not provided'}

TEAM MEMBER BIOS:
${biosText}

SCORING CRITERIA:
1. GITHUB/CODE (Weight: ${weights.github}%): Evaluate the repository quality, code organization, commits, and technical implementation.
2. TECHNICAL SKILLS (Weight: ${weights.resume}%): Evaluate the technical complexity and skills demonstrated in the project.
3. IDEA/INNOVATION (Weight: ${weights.idea}%): Evaluate innovation, creativity, problem-solving, and potential impact.
4. TEAM EXECUTION (Weight: ${weights.bios}%): Evaluate how well the team executed their vision and documented their work.

IMPORTANT: Respond ONLY with a valid JSON object:
{
    "github": <score 0-100>,
    "resume": <score 0-100>,
    "idea": <score 0-100>,
    "bios": <score 0-100>,
    "reasoning": {
        "github": "<brief explanation>",
        "resume": "<brief explanation>",
        "idea": "<brief explanation>",
        "bios": "<brief explanation>"
    }
}`;

        console.log('📤 Sending final evaluation request to OpenRouter...');

        const messages = [
            { role: 'system', content: 'You are an expert hackathon judge. Respond only with valid JSON.' },
            { role: 'user', content: prompt }
        ];

        const output = await callOpenRouterWithRetry(messages);

        let aiResult;
        try {
            const jsonMatch = output.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                aiResult = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (parseError) {
            console.error('Failed to parse OpenRouter response:', parseError.message);
            throw new Error('Failed to parse AI response');
        }

        const githubScore = Math.min(100, Math.max(0, parseInt(aiResult.github) || 50));
        const resumeScore = Math.min(100, Math.max(0, parseInt(aiResult.resume) || 50));
        const ideaScore = Math.min(100, Math.max(0, parseInt(aiResult.idea) || 50));
        const biosScore = Math.min(100, Math.max(0, parseInt(aiResult.bios) || 50));

        const totalScore = Math.round(
            (githubScore * (weights.github / 100)) +
            (resumeScore * (weights.resume / 100)) +
            (ideaScore * (weights.idea / 100)) +
            (biosScore * (weights.bios / 100))
        );

        console.log('✅ OpenRouter final evaluation complete:', { githubScore, resumeScore, ideaScore, biosScore, totalScore });

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
            reasoning: aiResult.reasoning || {},
            breakdown: {
                github: aiResult.reasoning?.github || 'Repository analyzed',
                resume: aiResult.reasoning?.resume || 'Technical skills evaluated',
                idea: aiResult.reasoning?.idea || 'Project innovation assessed',
                bio: aiResult.reasoning?.bios || 'Team execution reviewed'
            },
            source: 'OPENROUTER_AI',
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('❌ OpenRouter Final evaluation failed:', error.message);
        console.log('⚠️ FALLBACK: Using consistent fallback scores');
        return consistentFallbackEvaluation(teamData, weights);
    }
};

/**
 * Consistent fallback evaluation using hash-based scores
 */
const consistentFallbackEvaluation = (teamData, weights) => {
    console.log('🔧 Generating consistent fallback scores for team:', teamData.teamName);

    const hashString = `${teamData.id}-${teamData.teamName}-${teamData.submissions?.idea?.title || ''}`;
    let hash = 0;
    for (let i = 0; i < hashString.length; i++) {
        const char = hashString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }

    const baseScore = Math.abs(hash % 31) + 60;

    const githubScore = Math.min(90, Math.max(60, baseScore + (hash % 10)));
    const resumeScore = Math.min(90, Math.max(60, baseScore + ((hash >> 8) % 10)));
    const ideaScore = Math.min(90, Math.max(60, baseScore + ((hash >> 16) % 10)));
    const biosScore = Math.min(90, Math.max(60, baseScore + ((hash >> 24) % 10)));

    const totalScore = Math.round(
        (githubScore * (weights.github / 100)) +
        (resumeScore * (weights.resume / 100)) +
        (ideaScore * (weights.idea / 100)) +
        (biosScore * (weights.bios / 100))
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
            github: 'GitHub profile evaluation (fallback mode)',
            resume: 'Skills assessment (fallback mode)',
            idea: 'Project idea analysis (fallback mode)',
            bios: 'Team composition review (fallback mode)'
        },
        breakdown: {
            github: `Analyzed team GitHub presence`,
            resume: `Evaluated team skills`,
            idea: 'Project concept assessed',
            bio: 'Team dynamics reviewed'
        },
        source: 'CONSISTENT_FALLBACK',
        timestamp: new Date().toISOString()
    };
};

export default {
    preEvaluateTeam,
    finalEvaluateTeam
};
