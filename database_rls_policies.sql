-- Row Level Security (RLS) Policies
-- Run this AFTER running database_setup.sql

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_food_analysis ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Food items policies (readable by all authenticated users)
CREATE POLICY "Food items are viewable by authenticated users" ON public.food_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Verified food items can be inserted by authenticated users" ON public.food_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Daily logs policies
CREATE POLICY "Users can view their own daily logs" ON public.daily_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily logs" ON public.daily_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily logs" ON public.daily_logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily logs" ON public.daily_logs
    FOR DELETE USING (auth.uid() = user_id);

-- Meal entries policies
CREATE POLICY "Users can view their own meal entries" ON public.meal_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meal entries" ON public.meal_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal entries" ON public.meal_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal entries" ON public.meal_entries
    FOR DELETE USING (auth.uid() = user_id);

-- User streaks policies
CREATE POLICY "Users can view their own streaks" ON public.user_streaks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks" ON public.user_streaks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks" ON public.user_streaks
    FOR UPDATE USING (auth.uid() = user_id);

-- Analytics events policies
CREATE POLICY "Users can insert their own analytics events" ON public.analytics_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can view all analytics events" ON public.analytics_events
    FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role');

-- AI food analysis policies (shared cache)
CREATE POLICY "Authenticated users can view AI analysis cache" ON public.ai_food_analysis
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert AI analysis cache" ON public.ai_food_analysis
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  
  -- Initialize streak tracking
  INSERT INTO public.user_streaks (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update daily log totals when meal entries change
CREATE OR REPLACE FUNCTION public.update_daily_log_totals()
RETURNS TRIGGER AS $$
DECLARE
  log_totals RECORD;
BEGIN
  -- Get the daily_log_id from either NEW or OLD record
  DECLARE daily_log_uuid UUID;
  BEGIN
    IF TG_OP = 'DELETE' THEN
      daily_log_uuid := OLD.daily_log_id;
    ELSE
      daily_log_uuid := NEW.daily_log_id;
    END IF;
    
    -- Calculate new totals
    SELECT 
      COALESCE(SUM(calories), 0) as total_calories,
      COALESCE(SUM(protein), 0) as total_protein,
      COALESCE(SUM(carbs), 0) as total_carbs,
      COALESCE(SUM(fat), 0) as total_fat
    INTO log_totals
    FROM public.meal_entries 
    WHERE daily_log_id = daily_log_uuid;
    
    -- Update the daily log
    UPDATE public.daily_logs 
    SET 
      total_calories = log_totals.total_calories,
      total_protein = log_totals.total_protein,
      total_carbs = log_totals.total_carbs,
      total_fat = log_totals.total_fat,
      updated_at = NOW()
    WHERE id = daily_log_uuid;
  END;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers to update daily log totals
CREATE TRIGGER update_daily_totals_on_insert
  AFTER INSERT ON public.meal_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_daily_log_totals();

CREATE TRIGGER update_daily_totals_on_update
  AFTER UPDATE ON public.meal_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_daily_log_totals();

CREATE TRIGGER update_daily_totals_on_delete
  AFTER DELETE ON public.meal_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_daily_log_totals();