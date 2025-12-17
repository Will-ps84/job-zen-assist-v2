-- P0.3: Add salary_period to profiles for salary expectation tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS salary_period text DEFAULT 'monthly' CHECK (salary_period IN ('monthly', 'annual'));

-- Update trigger to capture country from registration metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, country)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'country'
  );
  RETURN NEW;
END;
$$;