-- A) STORAGE BUCKET para CVs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes', 
  'resumes', 
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
);

-- Storage policies for resumes bucket
CREATE POLICY "Users can upload their own resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resumes' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own resumes"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'resumes' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own resumes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'resumes' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Add file metadata columns to resumes table
ALTER TABLE public.resumes 
ADD COLUMN IF NOT EXISTS file_url text,
ADD COLUMN IF NOT EXISTS file_name text,
ADD COLUMN IF NOT EXISTS file_type text,
ADD COLUMN IF NOT EXISTS file_size integer;

-- B) CMS RECURSOS
CREATE TABLE public.resource_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  icon text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category_id uuid REFERENCES public.resource_categories(id),
  slug text NOT NULL UNIQUE,
  content text,
  cover_image_url text,
  country_scope text[] DEFAULT ARRAY['ALL'],
  is_published boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS for resources
ALTER TABLE public.resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Categories: public read, admin write
CREATE POLICY "Categories are publicly readable"
ON public.resource_categories FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories"
ON public.resource_categories FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Resources: published read, admin write
CREATE POLICY "Published resources are publicly readable"
ON public.resources FOR SELECT
USING (is_published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage resources"
ON public.resources FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update resources"
ON public.resources FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete resources"
ON public.resources FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- C) PORTALES POR PAÍS
CREATE TABLE public.job_portals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  name text NOT NULL,
  url text NOT NULL,
  type text DEFAULT 'general',
  description text,
  logo_url text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.job_portals ENABLE ROW LEVEL SECURITY;

-- Portals: active read for all, admin write
CREATE POLICY "Active portals are publicly readable"
ON public.job_portals FOR SELECT
USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage portals"
ON public.job_portals FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update portals"
ON public.job_portals FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete portals"
ON public.job_portals FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- D) ROLES - Policies for admin to manage user_roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert default resource categories
INSERT INTO public.resource_categories (name, slug, icon) VALUES
('ATS y Optimización', 'ats', 'FileSearch'),
('Metodología STAR', 'star', 'Star'),
('Entrevistas', 'entrevistas', 'MessageSquare'),
('LinkedIn', 'linkedin', 'Linkedin'),
('Portafolio', 'portafolio', 'Briefcase'),
('Empleo por País', 'empleo-pais', 'Globe');

-- Insert sample job portals
INSERT INTO public.job_portals (country, name, url, type, description) VALUES
('MX', 'OCC Mundial', 'https://www.occ.com.mx', 'general', 'Principal bolsa de empleo en México'),
('MX', 'Computrabajo MX', 'https://www.computrabajo.com.mx', 'general', 'Amplia oferta de empleos'),
('MX', 'LinkedIn Jobs MX', 'https://www.linkedin.com/jobs', 'professional', 'Red profesional global'),
('AR', 'Bumeran', 'https://www.bumeran.com.ar', 'general', 'Principal portal de empleo en Argentina'),
('AR', 'ZonaJobs', 'https://www.zonajobs.com.ar', 'general', 'Bolsa de trabajo argentina'),
('CO', 'elempleo.com', 'https://www.elempleo.com', 'general', 'Principal portal de empleo en Colombia'),
('CO', 'Computrabajo CO', 'https://www.computrabajo.com.co', 'general', 'Amplia oferta de empleos'),
('PE', 'Bumeran PE', 'https://www.bumeran.com.pe', 'general', 'Portal de empleo en Perú'),
('PE', 'Computrabajo PE', 'https://www.computrabajo.com.pe', 'general', 'Bolsa de trabajo peruana'),
('CL', 'Laborum', 'https://www.laborum.cl', 'general', 'Principal portal de empleo en Chile'),
('CL', 'Trabajando.com', 'https://www.trabajando.cl', 'general', 'Bolsa de trabajo chilena');

-- Trigger for resources updated_at
CREATE TRIGGER update_resources_updated_at
BEFORE UPDATE ON public.resources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for job_portals updated_at
CREATE TRIGGER update_job_portals_updated_at
BEFORE UPDATE ON public.job_portals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();