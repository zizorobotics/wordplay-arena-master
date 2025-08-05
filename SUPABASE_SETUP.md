# 🚀 Supabase Setup Guide for Wordle Ultimate

This guide will help you set up Supabase for the Wordle Ultimate multiplayer game with authentication, anonymous users, and gems system.

## 📋 Prerequisites

- A Supabase account (free tier works)
- Google OAuth credentials (for sign-in)
- Node.js and npm installed

## 🔧 Step 1: Create Supabase Project

1. **Go to [supabase.com](https://supabase.com)** and sign in
2. **Create a new project**
3. **Choose a name** (e.g., "wordle-ultimate")
4. **Set a database password** (save this!)
5. **Choose a region** close to your users
6. **Wait for setup** (usually 1-2 minutes)

## 🗄️ Step 2: Set Up Database Schema

1. **Go to SQL Editor** in your Supabase dashboard
2. **Run the initial schema** (from `supabase/migrations/0001_initial_schema.sql`)
3. **Run the user management schema** (from `supabase/migrations/0002_user_management.sql`)

### Quick Setup Commands:

```sql
-- Run this in Supabase SQL Editor
-- First, run the initial schema
-- Then run the user management schema
```

## 🔐 Step 3: Configure Authentication

### Google OAuth Setup:

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create a new project** or select existing
3. **Enable Google+ API**
4. **Go to Credentials → Create Credentials → OAuth 2.0 Client ID**
5. **Set Application Type** to "Web application"
6. **Add Authorized Redirect URIs**:
   - `https://your-project-ref.supabase.co/auth/v1/callback`
   - `http://localhost:8080/auth/callback` (for development)

### Configure Supabase Auth:

1. **Go to Authentication → Settings** in Supabase
2. **Add your Google OAuth credentials**:
   - Client ID: `your-google-client-id`
   - Client Secret: `your-google-client-secret`
3. **Enable Google provider**
4. **Set Site URL** to your domain (or `http://localhost:8080` for dev)

## 🔑 Step 4: Get API Keys

1. **Go to Settings → API** in Supabase
2. **Copy these values**:
   - Project URL
   - Anon public key
   - Service role key (keep this secret!)

## ⚙️ Step 5: Environment Configuration

1. **Create `.env` file** in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Server Configuration
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Google OAuth (for Supabase Auth)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

2. **Create `.env` file** in the `server` directory:

```env
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

## 🎮 Step 6: Test the Setup

1. **Install dependencies**:
   ```bash
   npm install
   cd client && npm install
   cd ../server && dart pub get
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open http://localhost:8080**

4. **Test features**:
   - ✅ Anonymous user creation (IP-based)
   - ✅ Gems display (10 default)
   - ✅ Sign-in with Google
   - ✅ User profile creation
   - ✅ Stats tracking

## 🔍 Features Implemented

### ✅ User Management
- **Anonymous users** with IP-based tracking
- **Google OAuth** for registered users
- **Seamless conversion** from anonymous to registered
- **Profile persistence** across sessions

### ✅ Gems System
- **Default 10 gems** for new users
- **Persistent storage** in database
- **Visual display** in UI
- **Stats tracking** (win streak, total games, etc.)

### ✅ Database Schema
- **Enhanced profiles table** with gems, streaks, stats
- **Anonymous users table** for IP-based tracking
- **Games table** supporting both user types
- **Row Level Security** policies

### ✅ Authentication Flow
- **Automatic anonymous user creation**
- **Google sign-in integration**
- **Profile migration** from anonymous to registered
- **Session management**

## 🐛 Troubleshooting

### Common Issues:

1. **"Cannot find module '@supabase/supabase-js'"**
   ```bash
   cd client && npm install @supabase/supabase-js
   ```

2. **"Invalid API key"**
   - Check your environment variables
   - Ensure you're using the correct project URL and keys

3. **"Google OAuth not working"**
   - Verify redirect URIs in Google Cloud Console
   - Check Supabase Auth settings
   - Ensure HTTPS for production

4. **"Database functions not found"**
   - Run the migration files in Supabase SQL Editor
   - Check that RLS policies are enabled

### Debug Mode:

Add this to your `.env`:
```env
DEBUG=true
```

## 🚀 Production Deployment

1. **Update environment variables** with production URLs
2. **Set up proper domain** in Supabase Auth settings
3. **Configure CORS** if needed
4. **Set up monitoring** and logging

## 📊 Database Functions

The setup includes these PostgreSQL functions:

- `get_or_create_anonymous_user(user_ip)` - Creates/finds anonymous users
- `update_anonymous_user_stats(...)` - Updates anonymous user stats
- `convert_anonymous_to_registered(...)` - Converts anonymous to registered

## 🎯 Next Steps

After setup, you can:

1. **Add word data** to the `words` table
2. **Implement real-time features** with Supabase Realtime
3. **Add leaderboards** and achievements
4. **Create admin dashboard** for user management
5. **Add more game modes** and features

## 📞 Support

If you encounter issues:

1. Check the Supabase logs in the dashboard
2. Verify all environment variables are set
3. Ensure database migrations ran successfully
4. Check browser console for client-side errors

---

**Happy coding! 🎮✨** 