-- Create secure RPC function for role management
CREATE OR REPLACE FUNCTION public.set_user_role(
  target_user_id UUID,
  new_role TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_admin_count INTEGER;
  target_current_role app_role;
  calling_user_id UUID;
BEGIN
  -- Get the calling user
  calling_user_id := auth.uid();
  
  -- Check if caller is admin
  IF NOT public.has_role(calling_user_id, 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'No tienes permisos de administrador');
  END IF;
  
  -- Validate new_role
  IF new_role NOT IN ('admin', 'user', 'moderator', 'remove') THEN
    RETURN json_build_object('success', false, 'error', 'Rol inválido');
  END IF;
  
  -- Get target's current role
  SELECT role INTO target_current_role
  FROM public.user_roles
  WHERE user_id = target_user_id;
  
  -- Count current admins
  SELECT COUNT(*) INTO current_admin_count
  FROM public.user_roles
  WHERE role = 'admin';
  
  -- Prevent removing the last admin
  IF target_current_role = 'admin' AND new_role != 'admin' AND current_admin_count <= 1 THEN
    RETURN json_build_object('success', false, 'error', 'No puedes eliminar al último administrador');
  END IF;
  
  -- Handle role removal
  IF new_role = 'remove' THEN
    DELETE FROM public.user_roles WHERE user_id = target_user_id;
    RETURN json_build_object('success', true, 'message', 'Rol eliminado');
  END IF;
  
  -- Upsert the role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, new_role::app_role)
  ON CONFLICT (user_id, role) 
  DO UPDATE SET role = new_role::app_role;
  
  -- Handle unique constraint - delete old role if different
  DELETE FROM public.user_roles 
  WHERE user_id = target_user_id AND role != new_role::app_role;
  
  RETURN json_build_object('success', true, 'message', 'Rol actualizado');
END;
$$;

-- Grant execute to authenticated users (RPC enforces admin check internally)
GRANT EXECUTE ON FUNCTION public.set_user_role(UUID, TEXT) TO authenticated;