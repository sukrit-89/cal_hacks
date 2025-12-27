import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter using SMTP with TLS (port 587)
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD // Use App Password for Gmail
    },
    tls: {
        rejectUnauthorized: false // Allow self-signed certificates
    }
});

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content (optional)
 * @returns {Promise<Object>} Send result
 */
export const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const mailOptions = {
            from: `"HackSpire Platform" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for plain text
        };

        const result = await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}: ${result.messageId}`);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Email send error:', error);
        throw error;
    }
};

/**
 * Send mentor assignment email with PPT links
 * @param {Object} mentor - Mentor data
 * @param {Array} assignments - Array of assigned teams with PPT info
 * @param {string} hackathonName - Name of the hackathon
 */
export const sendMentorAssignmentEmail = async (mentor, assignments, hackathonName) => {
    const teamRows = assignments.map((assignment, index) => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${index + 1}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${assignment.teamName}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${assignment.ideaTitle}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">
                <span style="background: #e3f2fd; color: #1565c0; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                    ${assignment.domain}
                </span>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">
                ${assignment.pptUrl
            ? `<a href="${assignment.pptUrl}" style="color: #6366f1; text-decoration: none;">View PPT</a>`
            : '<span style="color: #999;">No PPT</span>'
        }
            </td>
        </tr>
    `).join('');

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
            <div style="max-width: 700px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">🎯 New PPT Assignments</h1>
                    <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">${hackathonName}</p>
                </div>
                
                <!-- Content -->
                <div style="padding: 30px;">
                    <p style="color: #333; font-size: 16px;">Hello <strong>${mentor.name}</strong>,</p>
                    
                    <p style="color: #666; line-height: 1.6;">
                        You have been assigned <strong>${assignments.length} team(s)</strong> to review for the 
                        <strong>${hackathonName}</strong> hackathon. Please review the submissions and provide your valuable feedback.
                    </p>
                    
                    <!-- Assignments Table -->
                    <div style="margin: 25px 0; overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                            <thead>
                                <tr style="background: #f8f9fa;">
                                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #6366f1;">#</th>
                                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #6366f1;">Team Name</th>
                                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #6366f1;">Idea Title</th>
                                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #6366f1;">Domain</th>
                                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #6366f1;">PPT Link</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${teamRows}
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Summary -->
                    <div style="background: #f0f9ff; border-left: 4px solid #6366f1; padding: 15px; margin: 20px 0; border-radius: 0 4px 4px 0;">
                        <p style="margin: 0; color: #333;">
                            <strong>Your Domains:</strong> ${mentor.domains.join(', ')}<br>
                            <strong>Current Load:</strong> ${assignments.length} / ${mentor.maxLoad} teams
                        </p>
                    </div>
                    
                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/mentor/dashboard" 
                           style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); 
                                  color: white; 
                                  padding: 14px 30px; 
                                  text-decoration: none; 
                                  border-radius: 6px; 
                                  font-weight: bold;
                                  display: inline-block;">
                            Go to Mentor Dashboard
                        </a>
                    </div>
                    
                    <p style="color: #666; font-size: 14px; line-height: 1.6;">
                        Please login to your mentor dashboard to mark submissions as reviewed after evaluation.
                    </p>
                </div>
                
                <!-- Footer -->
                <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
                    <p style="color: #999; font-size: 12px; margin: 0;">
                        This is an automated email from the Hackathon Management Platform.<br>
                        Please do not reply to this email.
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail({
        to: mentor.email,
        subject: `🎯 New PPT Assignments - ${hackathonName} (${assignments.length} teams)`,
        html
    });
};

/**
 * Verify email configuration
 */
export const verifyEmailConfig = async () => {
    try {
        await transporter.verify();
        console.log('✅ Email service is configured correctly');
        return true;
    } catch (error) {
        console.error('❌ Email configuration error:', error.message);
        return false;
    }
};

export default {
    sendEmail,
    sendMentorAssignmentEmail,
    verifyEmailConfig
};
