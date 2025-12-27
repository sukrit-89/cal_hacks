/**
 * Test Script: Create 20 test teams with idea submissions for mentor distribution testing
 * 
 * Usage: node test-distribution.js <hackathonId>
 * 
 * This script creates 20 teams with different domain ideas to test the mentor distribution system.
 * Each team will have an idea description that matches one or more domains (AI, Web, Blockchain, Cloud, IoT, Data)
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load service account
const serviceAccountPath = join(__dirname, 'src/config/ServiceAccount.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

// Sample idea descriptions for different domains
const testIdeas = [
    // AI Domain (4 teams)
    {
        title: "AI-Powered Health Diagnosis",
        description: "An artificial intelligence system that uses machine learning and neural networks to analyze medical images and patient symptoms to provide preliminary diagnosis recommendations. Uses deep learning for image classification.",
        domains: ["AI"]
    },
    {
        title: "Smart Chatbot Assistant",
        description: "A conversational AI chatbot using natural language processing (NLP) and machine learning to provide customer support. Implements transformer models for better understanding.",
        domains: ["AI"]
    },
    {
        title: "AI Resume Screener",
        description: "Machine learning powered resume screening tool that uses artificial intelligence to match candidates with job requirements. Uses NLP for text analysis.",
        domains: ["AI"]
    },
    {
        title: "Predictive Analytics Dashboard",
        description: "AI-based predictive analytics platform using machine learning algorithms to forecast business trends and patterns from historical data.",
        domains: ["AI", "Data"]
    },

    // Web Domain (4 teams)
    {
        title: "E-Commerce Platform",
        description: "A full-stack web application for online shopping built with React frontend and Node.js backend. Features include user authentication, shopping cart, and payment integration.",
        domains: ["Web"]
    },
    {
        title: "Social Media Dashboard",
        description: "Web-based social media management platform using modern web technologies like React, TypeScript and REST APIs. Includes real-time updates with WebSocket.",
        domains: ["Web"]
    },
    {
        title: "Online Learning Portal",
        description: "Educational web platform built with Next.js and Express. Features video streaming, quiz modules, and progress tracking for students.",
        domains: ["Web"]
    },
    {
        title: "Portfolio Builder",
        description: "Web application that allows users to create professional portfolios using drag-and-drop interface. Built with React and Firebase.",
        domains: ["Web"]
    },

    // Blockchain Domain (3 teams)
    {
        title: "Decentralized Voting System",
        description: "A blockchain-based voting platform using Ethereum smart contracts and Solidity. Ensures transparent and tamper-proof elections with decentralized verification.",
        domains: ["Blockchain"]
    },
    {
        title: "NFT Marketplace",
        description: "Blockchain marketplace for trading NFTs (Non-Fungible Tokens). Built on Ethereum using smart contracts and Web3.js for wallet integration.",
        domains: ["Blockchain", "Web"]
    },
    {
        title: "Supply Chain Tracker",
        description: "Blockchain solution for tracking products in supply chain using distributed ledger technology. Smart contracts ensure data immutability.",
        domains: ["Blockchain"]
    },

    // Cloud Domain (3 teams)
    {
        title: "Serverless API Platform",
        description: "Cloud-native serverless application using AWS Lambda, API Gateway and DynamoDB. Implements microservices architecture with auto-scaling.",
        domains: ["Cloud"]
    },
    {
        title: "Multi-Cloud Deployment Tool",
        description: "Cloud orchestration tool for deploying applications across AWS, Azure and GCP. Uses Kubernetes and Docker for containerization.",
        domains: ["Cloud"]
    },
    {
        title: "Cloud Storage Solution",
        description: "Distributed cloud storage service with encryption and redundancy. Uses S3-compatible APIs and cloud functions for processing.",
        domains: ["Cloud", "Web"]
    },

    // IoT Domain (3 teams)
    {
        title: "Smart Home Controller",
        description: "IoT system for home automation using Arduino, Raspberry Pi and MQTT protocol. Controls lights, temperature, and security sensors.",
        domains: ["IoT"]
    },
    {
        title: "Industrial Monitoring System",
        description: "IoT platform for monitoring industrial equipment using sensors and embedded systems. Real-time data collection and alerting.",
        domains: ["IoT", "Cloud"]
    },
    {
        title: "Smart Agriculture System",
        description: "IoT-based precision farming solution with soil sensors, weather monitoring, and automated irrigation using microcontrollers.",
        domains: ["IoT"]
    },

    // Data Domain (3 teams)
    {
        title: "Real-Time Analytics Engine",
        description: "Big data analytics platform for processing streaming data. Uses Apache Kafka, Spark and data visualization dashboards.",
        domains: ["Data"]
    },
    {
        title: "Data Lake Solution",
        description: "Enterprise data lake architecture for storing and analyzing structured and unstructured data. Implements ETL pipelines and data warehousing.",
        domains: ["Data", "Cloud"]
    },
    {
        title: "Business Intelligence Tool",
        description: "Data visualization and business intelligence platform. Connects to multiple data sources and creates interactive dashboards and reports.",
        domains: ["Data", "Web"]
    }
];

// Generate a random team code
function generateTeamCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function createTestTeams(hackathonId) {
    if (!hackathonId) {
        console.error('❌ Please provide a hackathon ID as argument');
        console.log('Usage: node test-distribution.js <hackathonId>');
        process.exit(1);
    }

    console.log(`\n🚀 Creating 20 test teams for hackathon: ${hackathonId}\n`);

    // First, check if hackathon exists
    const hackathonDoc = await db.collection('hackathons').doc(hackathonId).get();
    if (!hackathonDoc.exists) {
        console.error(`❌ Hackathon with ID "${hackathonId}" not found`);
        process.exit(1);
    }

    console.log(`✅ Found hackathon: ${hackathonDoc.data().name}\n`);

    const createdTeams = [];

    for (let i = 0; i < testIdeas.length; i++) {
        const idea = testIdeas[i];
        const teamNumber = i + 1;
        const teamCode = generateTeamCode();

        const teamData = {
            teamName: `Test Team ${teamNumber}`,
            teamCode: teamCode,
            hackathonId: hackathonId,
            leaderId: `test-user-${teamNumber}`,
            members: [`test-user-${teamNumber}`],
            memberDetails: [{
                id: `test-user-${teamNumber}`,
                name: `Test User ${teamNumber}`,
                email: `testuser${teamNumber}@test.com`
            }],
            submissions: {
                idea: {
                    title: idea.title,
                    description: idea.description,
                    pptUrl: `https://res.cloudinary.com/demo/raw/upload/test-ppt-${teamNumber}.pdf`,
                    submittedAt: new Date().toISOString()
                }
            },
            createdAt: new Date().toISOString()
        };

        try {
            const docRef = await db.collection('teams').add(teamData);
            createdTeams.push({
                id: docRef.id,
                teamName: teamData.teamName,
                ideaTitle: idea.title,
                expectedDomains: idea.domains
            });
            console.log(`✅ Created Team ${teamNumber}: "${idea.title}" (Expected domains: ${idea.domains.join(', ')})`);
        } catch (error) {
            console.error(`❌ Failed to create Team ${teamNumber}:`, error.message);
        }
    }

    console.log(`\n✨ Successfully created ${createdTeams.length} test teams!\n`);
    console.log('📊 Domain distribution:');

    const domainCount = {};
    createdTeams.forEach(team => {
        team.expectedDomains.forEach(domain => {
            domainCount[domain] = (domainCount[domain] || 0) + 1;
        });
    });

    Object.entries(domainCount).forEach(([domain, count]) => {
        console.log(`   ${domain}: ${count} teams`);
    });

    console.log('\n🎯 Next steps:');
    console.log('1. Go to the Organizer Dashboard');
    console.log('2. Select the hackathon');
    console.log('3. Click "Distribute PPTs to Mentors"');
    console.log('\nThe system will extract domains from descriptions and assign to mentors!\n');

    process.exit(0);
}

// Get hackathon ID from command line
const hackathonId = process.argv[2];
createTestTeams(hackathonId);
