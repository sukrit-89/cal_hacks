import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' }); // Use latest stable model

/**
 * AI-powered domain classification using Google Gemini
 * Analyzes project descriptions and classifies into relevant technology domains
 * 
 * @param {string} text - Project description text
 * @returns {Promise<string[]>} Array of domain names
 */
export const extractDomains = async (text) => {
    try {
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            console.warn('Invalid input text for AI domain extraction');
            return ['General'];
        }

        // Construct the prompt for Gemini
        const prompt = `You are an expert technology classifier for a hackathon platform. 
        
Analyze the following project description and classify it into ONE OR MORE of these domains:
- AI (Artificial Intelligence, Machine Learning, Deep Learning, NLP, Computer Vision, Neural Networks)
- Web (Web Development, React, Angular, Vue, Node.js, Frontend, Backend, Full Stack)
- Blockchain (Cryptocurrency, Smart Contracts, DeFi, Web3, NFT, Ethereum, Solidity)
- Cloud (AWS, Azure, GCP, Cloud Computing, Serverless, Microservices, DevOps)
- IoT (Internet of Things, Embedded Systems, Sensors, Arduino, Raspberry Pi, Hardware)
- Data (Data Science, Analytics, Big Data, Data Visualization, Business Intelligence, Databases)

RULES:
1. Return ONLY the domain names that are CLEARLY relevant
2. A project can have multiple domains (e.g., "AI, Web" if it uses both)
3. Be selective - only include domains that are central to the project
4. If none of the domains fit well, return "General"
5. Return as a comma-separated list WITHOUT any explanation

PROJECT DESCRIPTION:
${text}

DOMAINS:`;

        // Call Gemini API
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const output = response.text().trim();

        // Parse the response
        const domains = output
            .split(',')
            .map(d => d.trim())
            .filter(d => ['AI', 'Web', 'Blockchain', 'Cloud', 'IoT', 'Data', 'General'].includes(d));

        // Return domains or fallback to General
        if (domains.length === 0) {
            console.warn('AI classification returned no valid domains, using General');
            return ['General'];
        }

        console.log(`AI Classification: "${text.substring(0, 100)}..." → [${domains.join(', ')}]`);
        return domains;

    } catch (error) {
        console.error('AI domain extraction error:', error);

        // Fallback to simple keyword matching if AI fails
        console.warn('Falling back to keyword-based classification');
        return fallbackKeywordExtraction(text);
    }
};

/**
 * Fallback keyword-based extraction if AI fails
 * This ensures the system still works even if Gemini API is down
 */
const fallbackKeywordExtraction = (text) => {
    const lowerText = text.toLowerCase();
    const domains = [];

    const domainKeywords = {
        AI: ['ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning', 'neural network', 'nlp', 'computer vision', 'tensorflow', 'pytorch'],
        Web: ['web', 'website', 'react', 'angular', 'vue', 'node.js', 'nodejs', 'express', 'frontend', 'backend', 'full stack', 'html', 'css', 'javascript'],
        Blockchain: ['blockchain', 'crypto', 'smart contract', 'ethereum', 'defi', 'web3', 'nft', 'solidity', 'bitcoin'],
        Cloud: ['cloud', 'aws', 'azure', 'gcp', 'google cloud', 'serverless', 'lambda', 'docker', 'kubernetes', 'microservices'],
        IoT: ['iot', 'internet of things', 'sensor', 'arduino', 'raspberry pi', 'embedded', 'hardware', 'esp32'],
        Data: ['data', 'analytics', 'big data', 'data science', 'visualization', 'dashboard', 'tableau', 'power bi', 'sql', 'database', 'mongodb', 'postgresql']
    };

    for (const [domain, keywords] of Object.entries(domainKeywords)) {
        if (keywords.some(keyword => lowerText.includes(keyword))) {
            domains.push(domain);
        }
    }

    return domains.length > 0 ? domains : ['General'];
};

export default {
    extractDomains
};
