const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Temporary email service (using Guerrilla Mail API concept)
class TemporaryEmailService {
    constructor() {
        this.emails = new Map();
    }

    async createTemporaryEmail() {
        const randomId = Math.random().toString(36).substring(2, 15);
        const tempEmail = `temp_${randomId}@virtualflowers.temp`;
        
        this.emails.set(tempEmail, {
            created: Date.now(),
            expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        });

        return tempEmail;
    }

    isValidEmail(email) {
        const tempData = this.emails.get(email);
        if (tempData && tempData.expires > Date.now()) {
            return true;
        }
        return false;
    }
}

const tempEmailService = new TemporaryEmailService();

// Email sending endpoint
app.post('/api/send-flower', async (req, res) => {
    try {
        const {
            senderName,
            senderEmail,
            recipientEmail,
            recipientName,
            message,
            flower,
            emailType,
            gmailPassword
        } = req.body;

        // Validate required fields
        if (!senderName || !recipientEmail || !recipientName || !flower) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate sender email based on type
        if (emailType === 'personal' && !gmailPassword) {
            return res.status(400).json({ error: 'Gmail App Password is required for personal email' });
        }

        // Create transporter
        let transporter;

        if (emailType === 'personal') {
            // Use Gmail SMTP with App Password
            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: senderEmail,
                    pass: gmailPassword
                }
            });
        } else {
            // For temporary email, we'll use a demo mode or fallback to a default SMTP
            // In production, you'd integrate with a real temporary email service
            transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || 'smtp.example.com',
                port: parseInt(process.env.SMTP_PORT) || 587,
                secure: false,
                auth: {
                    user: process.env.SMTP_USER || 'noreply@virtualflowers.com',
                    pass: process.env.SMTP_PASS || 'demo_password'
                }
            });
        }

        // Create beautiful HTML email
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        .header {
            text-align: center;
            color: #667eea;
            margin-bottom: 30px;
        }
        .flower-display {
            text-align: center;
            font-size: 8em;
            margin: 20px 0;
            animation: bloom 2s ease-in-out;
        }
        @keyframes bloom {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); opacity: 1; }
        }
        .message-box {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        .sender-info {
            text-align: center;
            color: #666;
            margin-top: 30px;
            font-style: italic;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            color: #999;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌸 You've Received a Virtual Flower! 🌹</h1>
        </div>
        
        <p style="font-size: 1.2em; color: #333;">Dear ${recipientName},</p>
        
        <div class="flower-display">${flower.emoji}</div>
        
        <h2 style="text-align: center; color: #667eea; margin: 20px 0;">
            ${flower.name.charAt(0).toUpperCase() + flower.name.slice(1)}
        </h2>
        
        ${message ? `
        <div class="message-box">
            <p style="margin: 0; line-height: 1.6;">${message}</p>
        </div>
        ` : ''}
        
        <div class="sender-info">
            <p>With love from<br><strong>${senderName}</strong></p>
        </div>
        
        <div class="footer">
            <p>Sent via Virtual Flowers 🌺</p>
            <p>Spread the joy of virtual flowers!</p>
        </div>
    </div>
</body>
</html>
        `;

        // Email options
        const mailOptions = {
            from: `"${senderName} via Virtual Flowers" <${emailType === 'personal' ? senderEmail : 'noreply@virtualflowers.com'}>`,
            to: recipientEmail,
            subject: `🌸 ${senderName} sent you a virtual ${flower.name}!`,
            html: emailHtml
        };

        // Send email
        await transporter.sendMail(mailOptions);

        res.json({ 
            success: true, 
            message: 'Flower sent successfully!' 
        });

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ 
            error: 'Failed to send flower. Please check your email credentials and try again.' 
        });
    }
});

// Temporary email creation endpoint
app.post('/api/create-temp-email', async (req, res) => {
    try {
        const tempEmail = await tempEmailService.createTemporaryEmail();
        res.json({ 
            success: true, 
            email: tempEmail,
            expiresIn: '24 hours'
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create temporary email' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Virtual Flowers API is running' });
});

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.listen(PORT, () => {
    console.log(`🌸 Virtual Flowers server running on http://localhost:${PORT}`);
    console.log(`Send beautiful flowers to your loved ones!`);
});
