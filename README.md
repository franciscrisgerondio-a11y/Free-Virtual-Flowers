# Virtual Flowers Website

A beautiful website for sending virtual flowers via email.

## Setup Instructions

### 1. Deploy Backend to Render

1. Push your code to GitHub:
```bash
git add .
git commit -m "Update for Render deployment"
git push origin main
```

2. Go to [Render.com](https://render.com) and create a new Web Service:
   - Connect your GitHub repository
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Free tier

3. Add Environment Variables in Render Dashboard:
   - `EMAIL_ADDRESS`: `flowersforyou226@gmail.com`
   - `EMAIL_APP_PASSWORD`: `mlbrtqzabnilesbl`

4. Deploy and get your Render URL (e.g., `https://your-app-name.onrender.com`)

### 2. Update Frontend

1. Open `index.html` and find line 358:
```javascript
const API_BASE_URL = 'https://YOUR-RENDER-APP.onrender.com';
```

2. Replace `YOUR-RENDER-APP` with your actual Render app name

3. Commit and push to GitHub:
```bash
git add index.html
git commit -m "Update API URL for production"
git push origin main
```

### 3. Deploy Frontend to GitHub Pages

1. Go to your GitHub repository
2. Go to Settings → Pages
3. Select branch: `main` and folder: `/root` (or use `/docs` if you prefer)
4. Save and get your GitHub Pages URL

### 4. Test

1. Visit your GitHub Pages URL
2. Select a flower
3. Fill in the form
4. Send and verify the email is received!

## Notes

- First request to Render may take 30-50 seconds (free tier sleep mode)
- Make sure your Gmail account has 2FA enabled and App Password generated
- Check Render logs for any errors during testing

## Local Development

To run locally:
```bash
npm install
npm start
```
Then visit http://localhost:3000
