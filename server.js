const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

const BUSINESS_EMAIL = process.env.EMAIL_ADDRESS || 'flowersforyou226@gmail.com';
const APP_PASSWORD = process.env.EMAIL_APP_PASSWORD || 'mlbrtqzabnilesbl';
const TOKEN_FILE = './tokenStore.json';

// Load token store from file on startup
let tokenStore = {};
if (fs.existsSync(TOKEN_FILE)) {
    try { tokenStore = JSON.parse(fs.readFileSync(TOKEN_FILE)); } catch {}
}

function saveTokenStore() {
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokenStore));
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: BUSINESS_EMAIL,
        pass: APP_PASSWORD
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.log('Email configuration error:', error);
    } else {
        console.log('Email server is ready to send messages!');
    }
});

app.post('/api/send-flower', async (req, res) => {
    try {
        const {
            senderName,
            recipientEmail,
            recipientName,
            message,
            replyToEmail,
            hideEmail,
            flower
        } = req.body;

        if (!senderName || !recipientEmail || !recipientName || !flower) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        let token = null;
        if (replyToEmail) {
            token = crypto.randomBytes(8).toString('hex');
            tokenStore[token] = {
                senderEmail: replyToEmail,
                senderName,
                recipientName,
                expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000)
            };
            saveTokenStore();
        }

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
        .header { text-align: center; color: #667eea; margin-bottom: 30px; }
        .flower-display { text-align: center; margin: 20px 0; }
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
        .reply-note {
            background: #e7f3ff;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
            font-size: 0.9em;
            color: #2c5282;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>You've Received a Virtual Flower!</h1>
        </div>

        <p style="font-size: 1.2em; color: #333;">Dear ${recipientName},</p>

        <div class="flower-display">
            <img src="${flower.url}" alt="${flower.name}" style="width: 200px; height: 200px; object-fit: contain;" />
        </div>

        <h2 style="text-align: center; color: #667eea; margin: 20px 0;">
            ${flower.name}
        </h2>

        ${message ? `
        <div class="message-box">
            <p style="margin: 0; line-height: 1.6;">${message}</p>
        </div>
        ` : ''}

        ${replyToEmail && !hideEmail ? `
        <div class="reply-note">
            <p style="margin: 0;"><strong>Reply Information:</strong> You can reach the sender at: <a href="mailto:${replyToEmail}" style="color: #667eea;">${replyToEmail}</a></p>
        </div>
        ` : ''}

        ${token ? `
        <div class="reply-note">
            <p style="margin: 0;">You can reply directly to this email and your message will be forwarded to the sender.</p>
        </div>
        ` : ''}

        <div class="sender-info">
            <p>With love from<br><strong>${senderName}</strong></p>
        </div>
        <div style="display:none;font-size:0;color:transparent;max-height:0;overflow:hidden;">ref:${token}</div>
    </div>
</body>
</html>
        `;

        const mailOptions = {
            from: `"${senderName}" <${BUSINESS_EMAIL}>`,
            to: recipientEmail,
            subject: `${senderName} sent you a virtual ${flower.name}!`,
            html: emailHtml,
            text: `Dear ${recipientName},\n\nYou've received a virtual ${flower.name} from ${senderName}!\n\n${message ? `Message: ${message}\n\n` : ''}${replyToEmail && !hideEmail ? `You can reach the sender at: ${replyToEmail}\n\n` : ''}${token ? `You can reply directly to this email and your message will be forwarded to the sender.\n\n` : ''}With love from,\n${senderName}`,
            replyTo: replyToEmail ? BUSINESS_EMAIL : undefined
        };

        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: 'Flower sent successfully!' });

    } catch (error) {
        console.error('Error sending email:', error);

        let errorMessage = 'Failed to send flower. Please try again.';
        if (error.code === 'EAUTH' || error.message.includes('authentication')) {
            errorMessage = 'Email authentication failed. Please check the email credentials.';
        } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            errorMessage = 'Network connection error. Please check your internet connection.';
        } else if (error.code === 'ETIMEDOUT') {
            errorMessage = 'Connection timed out. Please try again later.';
        } else if (error.message) {
            errorMessage = 'Error: ' + error.message;
        }

        res.status(500).json({
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

app.get('/api/lookup-token/:token', (req, res) => {
    const entry = tokenStore[req.params.token];
    if (!entry) return res.status(404).json({ error: 'Token not found' });
    if (Date.now() > entry.expiresAt) {
        delete tokenStore[req.params.token];
        saveTokenStore();
        return res.status(410).json({ error: 'Token expired' });
    }
    res.json(entry);
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Virtual Flowers API is running' });
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.listen(PORT, () => {
    console.log(`🌸 Virtual Flowers server running on http://localhost:${PORT}`);
    console.log(`Sending flowers from: ${BUSINESS_EMAIL}`);
});
