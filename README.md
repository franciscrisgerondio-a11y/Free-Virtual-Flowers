# 🌸 Virtual Flowers

A beautiful web application that allows users to send virtual flowers via email using either their personal Gmail account or a temporary email address.

## Features

- **8 Beautiful Flowers**: Choose from roses, tulips, sunflowers, lilies, orchids, bouquets, cherry blossoms, and hibiscus
- **Two Email Options**:
  - **Personal Email**: Send directly from your Gmail account (requires Gmail App Password)
  - **Temporary Email**: Use a generated temporary email address
- **Beautiful HTML Emails**: Recipients receive stunning, animated flower emails
- **Custom Messages**: Add personal messages to your flower gifts
- **Responsive Design**: Works perfectly on desktop and mobile devices

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- For Gmail sending: A Gmail account with 2FA enabled and an App Password

## Getting a Gmail App Password

1. Go to your Google Account settings
2. Enable 2-Factor Authentication (if not already enabled)
3. Visit [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
4. Generate a new app password for "Mail"
5. Use this password in the application

## Installation

1. Clone or navigate to the project directory:
```bash
cd /workspace
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and visit:
```
http://localhost:3000
```

## Usage

1. **Select a Flower**: Click on any flower from the grid to choose it
2. **Choose Email Type**: Select between Personal Email or Temporary Email
3. **Fill in Details**:
   - Your name
   - Your email address (Gmail for personal email)
   - Gmail App Password (if using personal email)
   - Recipient's email and name
   - Optional personal message
4. **Send**: Click the "Send Flower" button

## Configuration

You can configure the following environment variables:

- `PORT`: Server port (default: 3000)
- `SMTP_HOST`: SMTP host for temporary email (default: smtp.example.com)
- `SMTP_PORT`: SMTP port (default: 587)
- `SMTP_USER`: SMTP username for temporary email
- `SMTP_PASS`: SMTP password for temporary email

## Project Structure

```
/workspace
├── index.html          # Frontend HTML/CSS/JavaScript
├── server.js           # Backend Node.js server
├── package.json        # Dependencies and scripts
└── README.md          # This file
```

## Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Email**: Nodemailer
- **Features**: CORS, Body Parser

## Security Notes

- Never commit your Gmail App Password to version control
- The application uses HTTPS in production environments
- Temporary emails expire after 24 hours
- All email credentials are used only for sending and are not stored

## License

MIT License - Feel free to use and modify!

## Support

For issues or questions, please check:
- Gmail App Password setup: [Google Support](https://support.google.com/accounts/answer/185833)
- Nodemailer documentation: [nodemailer.com](https://nodemailer.com/)

---

Made with 💜 for spreading joy through virtual flowers!
