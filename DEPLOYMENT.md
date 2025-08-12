# 🚀 SeedChain Deployment Guide

## Prerequisites

- GitHub account with the repository: `https://github.com/HiNala/image-seed-chain`
- Vercel account (free tier works)
- OpenAI API key with credits for DALL-E usage

## 🔐 Environment Variables Setup

You'll need these environment variables:

### 1. OpenAI API Key
- Go to [OpenAI Platform](https://platform.openai.com/api-keys)
- Create a new API key with DALL-E access
- Copy the key (starts with `sk-proj-...`)

### 2. Vercel Blob Storage
- Will be created automatically during Vercel deployment
- Token will be generated in Vercel dashboard

## 📦 Deploy to Vercel

### Option 1: Automatic Deployment (Recommended)

1. **Import from GitHub:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import `HiNala/image-seed-chain` from GitHub
   - Select "apps/web" as the root directory

2. **Configure Build Settings:**
   - Framework Preset: Next.js
   - Root Directory: `apps/web`
   - Build Command: `npm run build`
   - Output Directory: Leave default (.next)

3. **Environment Variables:**
   ```bash
   OPENAI_API_KEY=sk-proj-your-actual-api-key-here
   NEXT_PUBLIC_BASE_URL=https://your-app-name.vercel.app
   ```
   *(Note: BLOB_READ_WRITE_TOKEN will be auto-generated)*

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete

### Option 2: Manual CLI Deployment

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy from project root:**
   ```bash
   cd apps/web
   vercel --prod
   ```

## 🗄️ Set up Blob Storage

1. **Create Blob Store:**
   - Go to Vercel Dashboard → Your Project
   - Navigate to "Storage" tab
   - Click "Create Database" → "Blob"
   - Name it "seedchain-images"

2. **Generate Token:**
   - In the Blob store, go to "Settings"
   - Create a new token with "Read and Write" permissions
   - Copy the token

3. **Add Environment Variable:**
   - Go to Project Settings → Environment Variables
   - Add: `BLOB_READ_WRITE_TOKEN=your-blob-token-here`
   - Redeploy the application

## 🌐 Domain Configuration

1. **Custom Domain (Optional):**
   - In Vercel Project Settings → Domains
   - Add your custom domain
   - Update `NEXT_PUBLIC_BASE_URL` to your custom domain

2. **Update Environment Variables:**
   ```bash
   NEXT_PUBLIC_BASE_URL=https://your-custom-domain.com
   ```

## ✅ Post-Deployment Checklist

- [ ] App loads without errors
- [ ] Image generation works (test with a simple prompt)
- [ ] Images are saved to Blob storage
- [ ] History shows generated images
- [ ] No console errors in browser

## 🔧 Troubleshooting

### Common Issues:

1. **403 OpenAI Error:**
   - Verify API key is correct
   - Ensure your OpenAI account has credits
   - Check model names are `dall-e-2` and `dall-e-3`

2. **Blob Storage Errors:**
   - Verify `BLOB_READ_WRITE_TOKEN` is set
   - Ensure Blob store is created in same Vercel team

3. **Build Failures:**
   - Check all dependencies are in package.json
   - Verify TypeScript types are correct
   - Review build logs in Vercel dashboard

### Environment Variables Reference:
```bash
# Required
OPENAI_API_KEY=sk-proj-...
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app

# Optional
NODE_ENV=production
```

## 🔄 Continuous Deployment

Once set up, any push to the `main` branch will automatically trigger a new deployment to Vercel.

## 📊 Monitoring

- **Vercel Analytics:** Enabled by default
- **Function Logs:** Available in Vercel dashboard
- **Performance:** Monitor image generation times
- **Blob Usage:** Check storage usage in Vercel Blob dashboard

## 💡 Tips

- Start with a low rate limit in production
- Monitor OpenAI API usage to control costs
- Set up alerts for high Blob storage usage
- Consider implementing image compression for storage optimization
