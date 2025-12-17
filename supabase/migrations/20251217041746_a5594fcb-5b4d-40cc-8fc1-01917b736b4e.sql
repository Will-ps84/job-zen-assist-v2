-- A) BRAND SETTINGS (configuración de marca editable)
CREATE TABLE public.brand_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name text NOT NULL DEFAULT 'Job Zen Assist',
  slogan text DEFAULT 'Tu mentor digital para encontrar el trabajo ideal',
  logo_url text,
  primary_color text DEFAULT '#8B5CF6',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insertar configuración por defecto
INSERT INTO public.brand_settings (brand_name, slogan) 
VALUES ('Job Zen Assist', 'Tu mentor digital para encontrar el trabajo ideal');

-- RLS: lectura pública, escritura solo admin
ALTER TABLE public.brand_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brand settings are publicly readable"
ON public.brand_settings FOR SELECT
USING (true);

-- B) SISTEMA DE ROLES (seguro, tabla separada)
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Función segura para verificar roles (evita recursión RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Políticas para user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Políticas para brand_settings (solo admin puede modificar)
CREATE POLICY "Admins can update brand settings"
ON public.brand_settings FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert brand settings"
ON public.brand_settings FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger para updated_at en brand_settings
CREATE TRIGGER update_brand_settings_updated_at
BEFORE UPDATE ON public.brand_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();