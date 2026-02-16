
-- User roles enum
CREATE TYPE public.app_role AS ENUM ('official', 'resident');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  last_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  middle_name TEXT,
  age INTEGER,
  address TEXT,
  contact TEXT,
  status TEXT NOT NULL DEFAULT 'Pending Approval',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Certificate requests table
CREATE TYPE public.request_status AS ENUM ('Pending', 'Approved', 'Denied');
CREATE TYPE public.certificate_type AS ENUM (
  'Barangay Clearance',
  'Certificate of Indigency',
  'Certificate of Residency',
  'Certificate of Low Income',
  'Oath of Undertaking',
  'Business Permit'
);

CREATE TABLE public.certificate_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  resident_name TEXT NOT NULL,
  certificate_type certificate_type NOT NULL,
  purpose TEXT NOT NULL,
  notes TEXT,
  status request_status NOT NULL DEFAULT 'Pending',
  valid_id_url TEXT,
  date_requested TIMESTAMPTZ NOT NULL DEFAULT now(),
  date_processed TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.certificate_requests ENABLE ROW LEVEL SECURITY;

-- Request status history for timeline tracking
CREATE TABLE public.request_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.certificate_requests(id) ON DELETE CASCADE NOT NULL,
  status request_status NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.request_status_history ENABLE ROW LEVEL SECURITY;

-- Enable realtime for certificate_requests
ALTER PUBLICATION supabase_realtime ADD TABLE public.certificate_requests;

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Officials can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'official'));

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Officials can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'official'));

CREATE POLICY "Officials can update any profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'official'));

CREATE POLICY "Anyone can insert profile on signup"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Officials can delete profiles"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'official'));

-- RLS Policies for certificate_requests
CREATE POLICY "Residents can view own requests"
  ON public.certificate_requests FOR SELECT
  TO authenticated
  USING (resident_id = auth.uid());

CREATE POLICY "Officials can view all requests"
  ON public.certificate_requests FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'official'));

CREATE POLICY "Residents can create requests"
  ON public.certificate_requests FOR INSERT
  TO authenticated
  WITH CHECK (resident_id = auth.uid());

CREATE POLICY "Officials can update requests"
  ON public.certificate_requests FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'official'));

-- RLS Policies for request_status_history
CREATE POLICY "Residents can view own request history"
  ON public.request_status_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.certificate_requests cr
      WHERE cr.id = request_id AND cr.resident_id = auth.uid()
    )
  );

CREATE POLICY "Officials can view all history"
  ON public.request_status_history FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'official'));

CREATE POLICY "Officials can insert history"
  ON public.request_status_history FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'official'));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  
  -- Default role is resident
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'resident');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-log status changes
CREATE OR REPLACE FUNCTION public.log_request_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.request_status_history (request_id, status, changed_by)
    VALUES (NEW.id, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_request_status_change
  AFTER UPDATE ON public.certificate_requests
  FOR EACH ROW EXECUTE FUNCTION public.log_request_status_change();

-- Updated_at trigger for profiles
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
