# AetherNet Deployment Guide (Docker on Render)

## Prerequisites

- GitHub repository with all code pushed
- MongoDB Atlas account (free tier available)
- Clerk authentication account
- Pinata IPFS account
- Render.com account (free tier available)
- Vercel account (free tier available)

## Step-by-Step Deployment

### 1. Backend Deployment to Render (Docker)

#### 1.1 Prepare MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier M0)
3. Create a database user with strong password
4. Add IP whitelist: `0.0.0.0/0` (allows all IPs)
5. Get connection string (will look like: `mongodb+srv://user:pass@cluster.mongodb.net/aethernet?retryWrites=true&w=majority`)

#### 1.2 Prepare Environment Variables

Copy `.env.production.example` to `.env.production` and fill in:
- `MONGODB_URI`: From MongoDB Atlas
- `CLERK_SECRET_KEY`: From Clerk dashboard
- `PINATA_JWT`: From Pinata
- `CORS_ORIGINS`: Will update after frontend deployment

#### 1.3 Create Backend Dockerfile

Create [backend/Dockerfile](backend/Dockerfile) with this content:

```dockerfile
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system packages needed by scientific Python dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
   build-essential \
   gfortran \
   libopenblas-dev \
   liblapack-dev \
   && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY backend /app/backend

WORKDIR /app/backend
EXPOSE 10000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "10000"]
```

Important:
- This Docker setup uses your existing [backend/requirements.txt](backend/requirements.txt) as requested.
- You do not need [backend/requirements-prod.txt](backend/requirements-prod.txt) for Render Docker deploy.

#### 1.4 Deploy to Render

1. Commit and push all changes to GitHub
```bash
git add .
git commit -m "Add deployment configuration"
git push origin main
```

2. Go to [Render.com](https://render.com)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `aethernet-backend`
   - **Environment**: Docker
   - **Dockerfile Path**: `backend/Dockerfile`
   - **Region**: Choose closest region

6. Add Environment Variables in Render dashboard:
   - `MONGODB_URI`: Your MongoDB connection string
   - `CLERK_SECRET_KEY`: Your Clerk secret
   - `PINATA_JWT`: Your Pinata JWT
   - `PINATA_API_KEY`: Your Pinata API key
   - `PINATA_API_SECRET`: Your Pinata API secret
   - `APP_ENV`: `production`
   - `PINATA_GATEWAY`: `https://gateway.pinata.cloud/ipfs/`
   - `FL_SERVER_HOST`: `0.0.0.0`
   - `FL_SERVER_PORT`: `8080`

7. Click "Create Web Service"
8. Wait for deployment (5-10 minutes first time)
9. Note your backend URL (e.g., `https://aethernet-backend.onrender.com`)

#### 1.5 Test Backend

```bash
curl https://aethernet-backend.onrender.com/api/v1/health
```

### 2. Frontend Deployment to Vercel

#### 2.1 Update CORS in Backend

In Render dashboard, update:
- `CORS_ORIGINS`: `https://your-vercel-domain.vercel.app`

#### 2.2 Deploy to Vercel

1. Go to [Vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Project Name**: `aethernet-frontend`
   - **Framework**: `Vite`
   - **Root Directory**: `./frontend`

5. In "Build and Output Settings":
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

6. Add Environment Variables:
   - `VITE_API_BASE_URL`: Your backend URL (e.g., `https://aethernet-backend.onrender.com`)
   - `VITE_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key

7. Click "Deploy"
8. Wait for deployment (1-3 minutes)
9. Note your frontend URL (e.g., `https://aethernet-frontend.vercel.app`)

### 3. Post-Deployment Configuration

#### 3.1 Update Clerk Settings

In Clerk Dashboard:
- Add frontend URL to "Allowed Origins"
- Add backend URL to allowed origins (for API calls)

#### 3.2 Final CORS Update

In Render dashboard, update:
- `CORS_ORIGINS`: Include both Vercel URL and any custom domains
- `FRONTEND_URL`: Your Vercel URL

#### 3.3 Test End-to-End

1. Open your Vercel frontend URL
2. Test authentication flow
3. Test API calls
4. Check browser console for errors
5. Check Render logs for backend errors

### 4. Monitoring & Logs

**Render Backend Logs:**
- Dashboard → Select service → Logs

**Vercel Frontend Logs:**
- Dashboard → Select project → Deployments → Logs

### 5. Custom Domain (Optional)

#### Render Custom Domain:
1. In service settings → Custom Domain
2. Add your domain
3. Follow DNS instructions

#### Vercel Custom Domain:
1. In project settings → Domains
2. Add your domain
3. Follow DNS instructions

### 6. Database Backups

Enable automatic backups in MongoDB Atlas:
- Dashboard → Backup & Restore
- Select cluster
- Enable daily backups

---

## Troubleshooting

| Issue | Solution |
|---|---|
| Backend returns 500 | Check Render logs; verify MongoDB connection; restart service |
| Build fails on Python packages | Use Docker environment and verify [backend/Dockerfile](backend/Dockerfile) installs system build tools |
| Frontend blank page | Check Vercel build logs; verify VITE_API_BASE_URL is set |
| CORS errors | Verify CORS_ORIGINS includes frontend URL; check backend logs |
| Authentication fails | Verify Clerk keys match; check token expiration |
| Database connection fails | Verify MongoDB URI; check IP whitelist allows Render IP |
| SSE connection fails | Ensure backend URL is correct; check Firefox/Safari SSE support |

---

## Environment Variables Reference

### Backend (.env.production)
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/aethernet
CLERK_SECRET_KEY=sk_live_...
PINATA_JWT=eyJ...
PINATA_API_KEY=...
PINATA_API_SECRET=...
APP_ENV=production
CORS_ORIGINS=https://aethernet.vercel.app
FRONTEND_URL=https://aethernet.vercel.app
```

Backend dependency source used by Docker build:
```
backend/requirements.txt
```

### Frontend (Vercel Dashboard)
```
VITE_API_BASE_URL=https://aethernet-backend.onrender.com
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
```

---

## Performance Tips

1. **Backend**: Use Render's paid tier for better performance
2. **Database**: Upgrade from M0 cluster for production traffic
3. **Frontend**: Enable Vercel Analytics for monitoring
4. **Models**: Consider model quantization for faster inference
5. **Caching**: Implement Redis for session caching

---

## Security Checklist

- [ ] Never commit `.env.production`
- [ ] Use strong MongoDB passwords
- [ ] Enable MongoDB network restrictions
- [ ] Rotate Clerk keys regularly
- [ ] Enable HTTPS (automatic on both platforms)
- [ ] Monitor suspicious API calls
- [ ] Keep dependencies updated
- [ ] Enable Render's auto-deploy from main branch only

---

## Rollback Procedures

### Render Rollback
1. Dashboard → Deployments
2. Select previous successful deployment
3. Click "Deploy"

### Vercel Rollback
1. Dashboard → Deployments
2. Click "..." on previous successful deployment
3. Select "Promote to Production"

---

## Next Steps

- [ ] Set up error monitoring (Sentry, LogRocket)
- [ ] Configure CDN for faster static delivery
- [ ] Implement rate limiting
- [ ] Set up automated backups
- [ ] Create staging environment for testing
- [ ] Document API endpoints
- [ ] Set up CI/CD pipelines
