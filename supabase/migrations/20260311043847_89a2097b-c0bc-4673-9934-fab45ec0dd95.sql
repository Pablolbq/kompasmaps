
-- Add archived column for soft-delete / archive functionality
ALTER TABLE public.properties ADD COLUMN archived BOOLEAN NOT NULL DEFAULT false;

-- Update the public SELECT policy to only show non-archived properties
DROP POLICY "Properties are viewable by everyone" ON public.properties;
CREATE POLICY "Properties are viewable by everyone"
  ON public.properties FOR SELECT
  USING (archived = false);

-- Admins can see all properties (including archived) via a separate policy
CREATE POLICY "Admins can view all properties"
  ON public.properties FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));
