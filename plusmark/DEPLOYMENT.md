# Plusmark Website Deployment Guide

## Architecture Overview

This deployment uses a **single Vercel project** serving both the public website and admin panel. The admin panel is accessed via a subdomain (`admin.plusmarkboards.com`) pointing to the same deployment.

### Why Single Deployment?

- ✅ **Secure by default**: Admin routes already protected with server-side authentication
- ✅ **Shared sessions**: httpOnly cookies work seamlessly
- ✅ **No CORS complexity**: Same-origin requests throughout
- ✅ **Simpler environment management**: One set of credentials
- ✅ **Cost-effective**: Single Vercel project

## Prerequisites

1. GitHub account with this repository pushed
2. Vercel account (free tier works)
3. Domain DNS access (for custom domain setup)
4. Firebase Realtime Database credentials
5. Cloudinary account credentials

---

## Step 1: Push to GitHub

```bash
# If not already initialized
cd plusmark
git init
git add .
git commit -m "Initial commit"

# Create GitHub repository and push
git remote add origin https://github.com/YOUR_USERNAME/plusmark.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy to Vercel

### A. Connect Repository

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. **Import Git Repository**: Select your `plusmark` repository
4. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `plusmark`
   - **Build Command**: (leave default - `npm run build`)
   - **Output Directory**: (leave default - `.next`)

### B. Environment Variables

Click **"Environment Variables"** and add ALL of the following:

#### Required for All Deployments

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://www.plusmarkboards.com

# Cloudinary (required for images/videos)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=drt0rpkn2
CLOUDINARY_API_KEY=828927481674484
CLOUDINARY_API_SECRET=7RdeLQEkjEBB2llyZGg-UPFRG9g

# Admin Authentication (CRITICAL - use your actual values from .env.local)
ADMIN_PASSWORD=Plusmark@Admin2026/Arvind
ADMIN_SESSION_SECRET=48c7c81fa7e69d01d2327eb2faa10267466f4c9481260dfcd43b4f209d883bb7

# Firebase Admin SDK (paste entire JSON on one line)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"plusmark-retailers",...}
FIREBASE_DATABASE_URL=https://plusmark-retailers-default-rtdb.firebaseio.com

# Firebase Web Config (public)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyB0cKQl4LSD2fP9uhWv4CajFCbbMQapkJ4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=plusmark-retailers.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://plusmark-retailers-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=plusmark-retailers
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=plusmark-retailers.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=864370688864
NEXT_PUBLIC_FIREBASE_APP_ID=1:864370688864:web:4cb1b698cf2f42238d5405
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-M31RZRF9BW
```

#### Optional Notification Services

```bash
# Email Notifications (Resend)
RESEND_API_KEY=
ENQUIRY_TO_EMAIL=
ENQUIRY_FROM_EMAIL=

# Webhook (Zapier/Make/Slack)
ENQUIRY_WEBHOOK_URL=

# Contact Overrides
NEXT_PUBLIC_WHATSAPP_NUMBER=+919913967888
NEXT_PUBLIC_CONTACT_EMAIL=
NEXT_PUBLIC_CONTACT_PHONE=+919913967888
```

**⚠️ Security Notes:**
- Never commit `.env.local` to Git
- `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` are server-only
- `FIREBASE_SERVICE_ACCOUNT` contains private keys - keep secret
- `CLOUDINARY_API_SECRET` is server-only

### C. Deploy

1. Click **"Deploy"**
2. Wait for build to complete (~2-3 minutes)
3. You'll receive a deployment URL: `https://plusmark-xxx.vercel.app`

---

## Step 3: Configure Custom Domains

### A. Add Main Domain

1. In Vercel project dashboard, go to **Settings** → **Domains**
2. Add domain: `www.plusmarkboards.com`
3. Vercel will provide DNS records to add:

#### Option 1: Using CNAME (Recommended)
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

#### Option 2: Using A Record
```
Type: A
Name: www
Value: 76.76.21.21
```

4. Also add apex domain redirect:
```
Type: A
Name: @
Value: 76.76.21.164
```
This automatically redirects `plusmarkboards.com` → `www.plusmarkboards.com`

### B. Add Admin Subdomain

1. In Vercel project dashboard, go to **Settings** → **Domains**
2. Add domain: `admin.plusmarkboards.com`
3. Add DNS record to your domain provider:

```
Type: CNAME
Name: admin
Value: cname.vercel-dns.com
```

**Important**: Both domains point to the same Vercel deployment. The admin subdomain is just a convenient URL - the actual security is enforced by server-side authentication.

### C. Wait for DNS Propagation

- DNS changes take 5 minutes to 48 hours
- Check status: `nslookup admin.plusmarkboards.com`
- Vercel will automatically provision SSL certificates

---

## Step 4: Verify Deployment

### Public Website Tests

1. **Homepage**: Visit `https://www.plusmarkboards.com`
   - ✅ Logo, navigation, hero section load
   - ✅ Images load from Cloudinary
   - ✅ No console errors

2. **Product Pages**: Visit `https://www.plusmarkboards.com/products/metallic-premium-white-board`
   - ✅ Product images, 3D model, A+ description load
   - ✅ Enquiry button works

3. **3D Showroom**: Visit `https://www.plusmarkboards.com/showroom`
   - ✅ 3D models load
   - ✅ Animations work

4. **Enquiry Submission**: Fill form at `/contact`
   - ✅ Submission succeeds
   - ✅ Data appears in Firebase
   - ✅ Email/webhook notification sent (if configured)

### Admin Panel Tests

1. **Direct Access Prevention**: Visit `https://www.plusmarkboards.com/admin`
   - ✅ Redirects to `/admin/login`

2. **Login**: Visit `https://admin.plusmarkboards.com/login`
   - ✅ Enter password from `ADMIN_PASSWORD`
   - ✅ Redirects to admin dashboard

3. **Dashboard**: Check `https://admin.plusmarkboards.com`
   - ✅ Enquiry statistics load
   - ✅ Recent enquiries displayed
   - ✅ Firebase data loads correctly

4. **Enquiry Management**:
   - ✅ Click enquiry to view details
   - ✅ Update status (New → Contacted → Closed)
   - ✅ Changes reflect in Firebase
   - ✅ Delete enquiry works

5. **CSV Export**: Click "Export CSV"
   - ✅ Downloads `plusmark-enquiries-YYYY-MM-DD.csv`
   - ✅ Contains all enquiry data

6. **Client Management**: Visit `/admin/clients`
   - ✅ Client list loads from Firebase
   - ✅ Add/edit/delete operations work

7. **Logout**: Click "Log out"
   - ✅ Redirects to `/admin/login`
   - ✅ Session cookie cleared
   - ✅ Cannot access `/admin` without re-login

### Security Tests

1. **Unauthenticated API Access**:
   ```bash
   curl https://www.plusmarkboards.com/admin/export
   # Should return: 401 Unauthorized
   ```

2. **Cookie Security**: Inspect browser DevTools → Application → Cookies
   - ✅ `pm_admin` cookie has flags: `HttpOnly`, `Secure`, `SameSite=Strict`

3. **Robots.txt**: Visit `https://admin.plusmarkboards.com/robots.txt`
   - ✅ Contains `Disallow: /admin/`

---

## Step 5: Update Site URL

After domain is verified, update environment variable:

1. Go to Vercel project → **Settings** → **Environment Variables**
2. Edit `NEXT_PUBLIC_SITE_URL` to: `https://www.plusmarkboards.com`
3. **Redeploy**: Vercel → **Deployments** → click "..." → **Redeploy**

---

## Environment Variables Reference

### Server-Only (Never expose to client)

| Variable | Purpose | Example |
|----------|---------|---------|
| `ADMIN_PASSWORD` | Admin panel password | `SecurePass123!` |
| `ADMIN_SESSION_SECRET` | Session signing key (32+ chars) | `48c7c81fa7e69d...` |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase Admin SDK JSON | `{"type":"service_account",...}` |
| `CLOUDINARY_API_SECRET` | Cloudinary upload signing | `7RdeLQEkj...` |
| `RESEND_API_KEY` | Email service key | `re_xxx` |

### Public (Safe to expose via NEXT_PUBLIC_)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for SEO |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary delivery |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase web SDK config |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Contact WhatsApp |

---

## Troubleshooting

### Build Fails

**Error**: `Module not found: Can't resolve 'server-only'`
- **Fix**: Ensure `package.json` dependencies are up to date
- Run: `npm install`

**Error**: `Firebase Admin initialization failed`
- **Fix**: Check `FIREBASE_SERVICE_ACCOUNT` is properly formatted JSON on one line
- **Fix**: Ensure no trailing commas or line breaks

### Admin Login Fails

**Error**: `Incorrect password` (but password is correct)
- **Fix**: Check `ADMIN_PASSWORD` in Vercel matches `.env.local`
- **Fix**: Ensure `ADMIN_SESSION_SECRET` is at least 32 characters

**Error**: Session expires immediately
- **Fix**: Check system time is correct
- **Fix**: Verify cookie `Secure` flag matches deployment (production = true)

### Images Not Loading

**Error**: Cloudinary 404
- **Fix**: Verify `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is correct
- **Fix**: Check image URLs in browser network tab
- **Fix**: Ensure Cloudinary images are uploaded to correct folder

### Firebase Connection Fails

**Error**: `Permission denied` when accessing database
- **Fix**: Check Firebase Realtime Database rules allow server SDK access
- **Fix**: Verify `FIREBASE_DATABASE_URL` matches your project
- **Fix**: Ensure service account has Editor or Owner role

### CORS Errors

- **Should NOT occur** with single deployment
- If you see CORS errors, verify both domains point to same Vercel deployment
- Check browser console for actual error origin

---

## Deployment Checklist

### Pre-Deployment
- [ ] Repository pushed to GitHub
- [ ] All environment variables documented
- [ ] Firebase Realtime Database rules configured
- [ ] Cloudinary images uploaded
- [ ] Admin password is strong (12+ characters)

### During Deployment
- [ ] Vercel project created
- [ ] All environment variables added
- [ ] Build completes successfully
- [ ] Deployment URL accessible

### Post-Deployment
- [ ] Custom domain DNS configured
- [ ] Admin subdomain DNS configured
- [ ] SSL certificates provisioned (automatic)
- [ ] `NEXT_PUBLIC_SITE_URL` updated to production domain
- [ ] All public pages tested
- [ ] Admin login tested
- [ ] Enquiry submission tested
- [ ] Firebase data loads correctly
- [ ] Cloudinary images load correctly
- [ ] 3D models load correctly

---

## Maintenance

### Updating Content

**Product Data**: Edit files in `/data/products.ts`, `/data/gallery.ts`, etc.
- Commit and push to GitHub
- Vercel auto-deploys from `main` branch

**Images**: Upload to Cloudinary
- Update URLs in data files
- Commit and push

### Monitoring

- **Vercel Analytics**: Built-in traffic analytics
- **Firebase Console**: Monitor database usage
- **Cloudinary Dashboard**: Track bandwidth usage

### Backup

**Firebase Data**:
```bash
# Export enquiries via admin panel
https://admin.plusmarkboards.com/admin/export
```

**Code**:
- Always maintain GitHub repository
- Tag releases: `git tag v1.0.0 && git push --tags`

---

## Security Best Practices

1. **Rotate Admin Password** every 90 days
2. **Monitor Firebase logs** for suspicious activity
3. **Keep dependencies updated**: `npm update` monthly
4. **Review Vercel deployment logs** for errors
5. **Never commit secrets** - use `.env.local` (already in `.gitignore`)
6. **Use strong passwords**: Minimum 12 characters, mix of symbols/numbers/letters

---

## Support

**Vercel Issues**: [vercel.com/support](https://vercel.com/support)
**Firebase Issues**: [firebase.google.com/support](https://firebase.google.com/support)
**Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

**Project-Specific Issues**:
- Check Vercel deployment logs
- Check browser console for client-side errors
- Check Firebase Realtime Database logs
- Review this guide's Troubleshooting section
