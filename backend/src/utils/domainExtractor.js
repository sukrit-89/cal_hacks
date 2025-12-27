/**
 * Domain Extractor - Rule-based domain classification from text
 * 
 * This module extracts technology domains from text content using keyword matching.
 * It's used to match team project PPTs with mentor expertise areas.
 * 
 * NO ML, NO EMBEDDINGS - Pure deterministic keyword matching
 */

// Fixed domain list
export const DOMAINS = {
    AI: 'AI',
    WEB: 'Web',
    BLOCKCHAIN: 'Blockchain',
    CLOUD: 'Cloud',
    IOT: 'IoT',
    DATA: 'Data',
    GENERAL: 'General'
};

// Domain keyword mapping
const DOMAIN_KEYWORDS = {
    [DOMAINS.AI]: [
        'ai', 'ml', 'machine learning', 'deep learning', 'neural', 'nlp',
        'natural language', 'gpt', 'llm', 'large language model',
        'model', 'tensorflow', 'pytorch', 'keras', 'computer vision',
        'image recognition', 'chatbot', 'artificial intelligence',
        'transformer', 'bert', 'reinforcement learning'
    ],

    [DOMAINS.WEB]: [
        'react', 'vue', 'angular', 'frontend', 'backend', 'fullstack',
        'html', 'css', 'javascript', 'typescript', 'node', 'nodejs',
        'express', 'django', 'flask', 'fastapi', 'spring', 'next.js',
        'svelte', 'web app', 'webapp', 'website', 'rest api', 'graphql',
        'http', 'server', 'client'
    ],

    [DOMAINS.BLOCKCHAIN]: [
        'blockchain', 'web3', 'solidity', 'ethereum', 'smart contract',
        'crypto', 'cryptocurrency', 'nft', 'defi', 'decentralized',
        'distributed ledger', 'bitcoin', 'polygon', 'metamask',
        'wallet', 'dapp', 'dao'
    ],

    [DOMAINS.CLOUD]: [
        'aws', 'azure', 'gcp', 'google cloud', 'cloud', 'docker',
        'kubernetes', 'k8s', 'serverless', 'lambda', 'ec2', 's3',
        'container', 'microservices', 'devops', 'ci/cd', 'jenkins',
        'terraform', 'cloud computing', 'saas', 'paas', 'iaas'
    ],

    [DOMAINS.IOT]: [
        'iot', 'internet of things', 'sensor', 'arduino', 'raspberry pi',
        'mqtt', 'embedded', 'hardware', 'microcontroller', 'esp32',
        'esp8266', 'smart home', 'automation', 'edge computing',
        'zigbee', 'bluetooth', 'wifi module'
    ],

    [DOMAINS.DATA]: [
        'database', 'sql', 'nosql', 'mongodb', 'postgresql', 'mysql',
        'analytics', 'data science', 'data analysis', 'bigquery',
        'data warehouse', 'etl', 'data pipeline', 'pandas', 'numpy',
        'visualization', 'tableau', 'power bi', 'jupyter',
        'data engineering', 'spark', 'hadoop'
    ]
};

/**
 * Extract domains from text content
 * 
 * @param {string} text - The text to analyze (e.g., extracted from PPT)
 * @returns {string[]} - Array of matched domains, or ["General"] if no matches
 * 
 * @example
 * extractDomains("We built an AI chatbot using GPT and React")
 * // Returns: ["AI", "Web"]
 */
export const extractDomains = (text) => {
    if (!text || typeof text !== 'string') {
        return [DOMAINS.GENERAL];
    }

    // Normalize text: lowercase and remove extra whitespace
    const normalizedText = text.toLowerCase().trim();

    if (!normalizedText) {
        return [DOMAINS.GENERAL];
    }

    const matchedDomains = new Set();

    // Check each domain's keywords
    for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
        for (const keyword of keywords) {
            // Use word boundary matching to avoid false positives
            // e.g., "react" should match "React app" but not "create"
            const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');

            if (regex.test(normalizedText)) {
                matchedDomains.add(domain);
                break; // Move to next domain once we have a match
            }
        }
    }

    // Return matched domains or General if none found
    if (matchedDomains.size === 0) {
        return [DOMAINS.GENERAL];
    }

    return Array.from(matchedDomains).sort(); // Sort for determinism
};

/**
 * Get all available domains
 * @returns {string[]} - List of all domain categories
 */
export const getAllDomains = () => {
    return Object.values(DOMAINS).filter(d => d !== DOMAINS.GENERAL);
};

export default {
    extractDomains,
    getAllDomains,
    DOMAINS
};
