-- Asigna rol admin automáticamente al correo operativo de la plataforma.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE
      WHEN lower(NEW.email) = lower('opsuale@gmail.com') THEN 'admin'::user_role
      ELSE 'volunteer'::user_role
    END
  );
  RETURN NEW;
END;
$$;
