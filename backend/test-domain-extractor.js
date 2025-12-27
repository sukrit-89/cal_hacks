/**
 * Test script for Domain Extractor
 * 
 * Run with: node backend/test-domain-extractor.js
 */

import { extractDomains, DOMAINS } from './src/utils/domainExtractor.js';

console.log('🧪 Testing Domain Extractor\n');

const testCases = [
    {
        text: "Our AI-powered chatbot uses GPT and machine learning to provide intelligent responses",
        expected: ["AI"]
    },
    {
        text: "Built a full-stack web application with React frontend and Node.js backend",
        expected: ["Web"]
    },
    {
        text: "Smart contract platform on Ethereum blockchain for decentralized finance",
        expected: ["Blockchain"]
    },
    {
        text: "Cloud-native application deployed on AWS with Kubernetes orchestration",
        expected: ["Cloud"]
    },
    {
        text: "IoT sensor network using Arduino and MQTT protocol for smart home automation",
        expected: ["IoT"]
    },
    {
        text: "Data analytics platform with MongoDB database and visualization dashboards",
        expected: ["Data"]
    },
    {
        text: "AI-powered web app using React and TensorFlow for image recognition",
        expected: ["AI", "Web"]
    },
    {
        text: "Blockchain DApp with web3 integration and React frontend",
        expected: ["Blockchain", "Web"]
    },
    {
        text: "Generic hackathon project about team collaboration",
        expected: ["General"]
    },
    {
        text: "",
        expected: ["General"]
    }
];

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
    const result = extractDomains(testCase.text);
    const success = JSON.stringify(result) === JSON.stringify(testCase.expected);

    console.log(`Test ${index + 1}: ${success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Input: "${testCase.text.substring(0, 60)}${testCase.text.length > 60 ? '...' : ''}"`);
    console.log(`  Expected: [${testCase.expected.join(', ')}]`);
    console.log(`  Got:      [${result.join(', ')}]`);
    console.log('');

    if (success) passed++;
    else failed++;
});

console.log('━'.repeat(60));
console.log(`Results: ${passed}/${testCases.length} passed, ${failed}/${testCases.length} failed`);
console.log('━'.repeat(60));

if (failed === 0) {
    console.log('\n🎉 All tests passed!\n');
    process.exit(0);
} else {
    console.log(`\n⚠️  ${failed} test(s) failed\n`);
    process.exit(1);
}
