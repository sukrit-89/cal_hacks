import dotenv from 'dotenv';
import { Resend } from 'resend';

dotenv.config();

console.log('=================================');
console.log('Resend Email Test');
console.log('=================================');
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ SET (hidden)' : '❌ NOT SET');
console.log('');

if (!process.env.RESEND_API_KEY) {
    console.log('❌ RESEND_API_KEY not found in .env file');
    console.log('Please add: RESEND_API_KEY=re_your_api_key');
    process.exit(1);
}

const resend = new Resend(process.env.RESEND_API_KEY);

console.log('Sending test email...');
console.log('');

resend.emails.send({
    from: 'Hackathon Platform <onboarding@resend.dev>',
    to: process.env.EMAIL_USER || 'test@example.com', // Send to your Gmail
    subject: '🎉 Resend Email Test - Success!',
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #6366f1;">✅ Email Configuration Working!</h1>
            <p style="font-size: 16px;">
                Congratulations! Your Resend email service is now configured and working properly.
            </p>
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>✅ No more SMTP issues!</strong></p>
                <p style="margin: 10px 0 0 0;">Resend uses HTTP API, so no firewall blocking.</p>
            </div>
            <p style="color: #666;">
                Your mentor notification emails will now be sent successfully.
            </p>
        </div>
    `
})
    .then(result => {
        console.log('✅ SUCCESS! Email sent via Resend!');
        console.log('');
        console.log('Result:', result);
        console.log('Email ID:', result.id || result.data?.id || 'sent');
        console.log('Check your inbox:', process.env.EMAIL_USER);
        console.log('');
        console.log('🎉 Resend is now configured and ready to use!');
    })
    .catch(error => {
        console.log('❌ FAILED! Error sending email');
        console.log('');
        console.log('Error:', error.message);
        console.log('');
        console.log('Possible issues:');
        console.log('1. Invalid API key');
        console.log('2. API key needs to be activated (check your email)');
        console.log('3. Rate limit exceeded (unlikely on first test)');
    });
