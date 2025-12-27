// Quick script to update hackathon status from draft to live
// Run this in PowerShell after getting your auth token

const token = 'YOUR_AUTH_TOKEN_HERE';
const hackathonId = 'YOUR_HACKATHON_ID_HERE'; // Get from URL when viewing hackathon

fetch(`http://localhost:5000/api/hackathons/${hackathonId}`, {
    method: 'PUT',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        status: 'live'
    })
})
    .then(r => r.json())
    .then(data => console.log('✅ Hackathon status updated to live:', data))
    .catch(err => console.error('❌ Error:', err));
