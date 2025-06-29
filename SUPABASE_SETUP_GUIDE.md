# NutriAI Supabase Database Setup Guide

## Prerequisites
- You have created a new Supabase project
- You have the project URL and anon key

## Step-by-Step Setup

### 1. Configure Environment Variables

1. Open the `.env` file in the mobile folder
2. Replace the placeholder values with your actual Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
   ```

### 2. Run Database Setup Scripts

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Run the scripts in this exact order:

**Step 1: Database Schema**
- Copy and paste the entire contents of `database_setup.sql`
- Click **Run** to execute
- This creates all tables, indexes, and triggers

**Step 2: Security Policies**
- Copy and paste the entire contents of `database_rls_policies.sql`
- Click **Run** to execute
- This sets up Row Level Security and auto-profile creation

**Step 3: Seed Data (Optional)**
- Copy and paste the entire contents of `database_seed_data.sql`
- Click **Run** to execute
- This adds common food items for testing

#### Option B: Using Supabase CLI (Advanced)

If you want to use version control for your database:

1. Install Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Link project: `supabase link --project-ref your-project-id`
4. Run migrations: `supabase db push`

### 3. Verify Setup

1. Go to **Table Editor** in your Supabase dashboard
2. You should see these tables:
   - `users`
   - `food_items`
   - `daily_logs`
   - `meal_entries`
   - `user_streaks`
   - `analytics_events`
   - `ai_food_analysis`

3. Go to **Authentication** → **Policies**
4. Verify that RLS is enabled on all tables

### 4. Test Authentication

1. Update your `.env` file with the correct credentials
2. Run the React Native app: `npm start`
3. Try creating a new account
4. Check the **Table Editor** → **users** table to see if a profile was created

### 5. Enable Storage (For Image Uploads)

1. Go to **Storage** in your Supabase dashboard
2. Create a new bucket called `meal-images`
3. Set it to **Public** (for now - we'll restrict this later)
4. Go to **Policies** tab in Storage
5. Add these policies:

```sql
-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload meal images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'meal-images' AND 
  auth.role() = 'authenticated'
);

-- Allow users to view meal images
CREATE POLICY "Anyone can view meal images" ON storage.objects
FOR SELECT USING (bucket_id = 'meal-images');

-- Allow users to update their own meal images
CREATE POLICY "Users can update their own meal images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'meal-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## Database Schema Overview

### Core Tables

1. **users** - User profiles (extends auth.users)
2. **food_items** - Food nutrition database
3. **daily_logs** - Daily nutrition summaries
4. **meal_entries** - Individual meal/food logs
5. **user_streaks** - Streak tracking
6. **analytics_events** - App usage analytics
7. **ai_food_analysis** - Cached AI analysis results

### Key Features

- **Auto-profile creation**: When users sign up, a profile is automatically created
- **Auto-totals calculation**: Daily logs automatically update when meal entries change
- **Row Level Security**: Users can only access their own data
- **Optimized queries**: Indexes for performance
- **Automatic timestamps**: All tables track created_at and updated_at

## Troubleshooting

### Common Issues

1. **"relation does not exist" error**
   - Make sure you ran `database_setup.sql` first
   - Check that all scripts completed without errors

2. **RLS policy errors**
   - Verify you ran `database_rls_policies.sql` after the schema
   - Check that auth.uid() is working (user must be authenticated)

3. **Environment variables not working**
   - Make sure you're using `EXPO_PUBLIC_` prefix
   - Restart your Expo development server after changing .env
   - Check the console for any Supabase connection errors

### Testing Your Setup

You can test the database manually in the SQL Editor:

```sql
-- Test user profile creation (run as authenticated user)
SELECT * FROM public.users WHERE id = auth.uid();

-- Test food items
SELECT * FROM public.food_items LIMIT 5;

-- Test creating a daily log
INSERT INTO public.daily_logs (user_id, date) 
VALUES (auth.uid(), CURRENT_DATE);
```

## Next Steps

Once your database is set up:

1. Test the authentication flow in the mobile app
2. Verify that user profiles are created automatically
3. We'll implement the meal logging functionality
4. Add image upload for food photos
5. Integrate with OpenAI for food recognition

Let me know if you run into any issues during setup!