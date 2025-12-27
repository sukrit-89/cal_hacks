import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

console.log('=================================');
console.log('Email Configuration Test - Port 465 (SSL)');
console.log('=================================');
console.log('EMAIL_USER:', process.env.EMAIL_USER || '❌ NOT SET');
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ SET (hidden)' : '❌ NOT SET');
console.log('');

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('❌ Email credentials not found in .env file');
    process.exit(1);
}

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

console.log('Testing SMTP connection to smtp.gmail.com:465 (SSL)...');
console.log('');

transporter.verify()
    .then(() => {
        console.log('✅ SUCCESS! Email configuration is working with port 465!');
        console.log('✅ You can send emails from:', process.env.EMAIL_USER);
        console.log('');
        console.log('Your backend email service has been updated to use port 465.');
    })
    .catch(err => {
        console.log('❌ FAILED! Cannot connect to Gmail SMTP on port 465 either');
        console.log('');
        console.log('Error:', err.message);
        console.log('');
        console.log('This suggests a firewall/network issue.');
        console.log('Try connecting from a different network (mobile hotspot).');
    });
