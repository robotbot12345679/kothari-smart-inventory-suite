-- 1. Organizations
CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'My Organization',
  owner_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- 2. Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  org_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  email text,
  display_name text,
  must_change_password boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Access roles (permission sets)
CREATE TABLE public.access_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  permissions text[] NOT NULL DEFAULT '{}',
  is_system boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.access_roles TO authenticated;
GRANT ALL ON public.access_roles TO service_role;
ALTER TABLE public.access_roles ENABLE ROW LEVEL SECURITY;

-- 4. User role assignments
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role_id uuid REFERENCES public.access_roles(id) ON DELETE CASCADE,
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 5. Helper functions (security definer to avoid recursive RLS)
CREATE OR REPLACE FUNCTION public.current_org_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT org_id FROM public.profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.is_org_owner(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.organizations WHERE owner_id = _user_id)
$$;

CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_org_owner(_user_id) OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.access_roles ar ON ar.id = ur.role_id
    WHERE ur.user_id = _user_id
      AND (_permission = ANY (ar.permissions) OR 'all' = ANY (ar.permissions))
  )
$$;

CREATE OR REPLACE FUNCTION public.in_same_org(_row_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _row_user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles a
    JOIN public.profiles b ON a.org_id = b.org_id AND a.org_id IS NOT NULL
    WHERE a.id = _row_user_id AND b.id = auth.uid()
  )
$$;

-- 6. Policies for new tables
CREATE POLICY "Members can view their organization" ON public.organizations
  FOR SELECT TO authenticated USING (id = public.current_org_id() OR owner_id = auth.uid());
CREATE POLICY "Users can create an organization" ON public.organizations
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner can update organization" ON public.organizations
  FOR UPDATE TO authenticated USING (owner_id = auth.uid());

CREATE POLICY "Members can view org profiles" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid() OR org_id = public.current_org_id());
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "Owner can manage org profiles" ON public.profiles
  FOR UPDATE TO authenticated USING (public.is_org_owner(auth.uid()) AND org_id = public.current_org_id());
CREATE POLICY "Owner can delete org profiles" ON public.profiles
  FOR DELETE TO authenticated USING (public.is_org_owner(auth.uid()) AND org_id = public.current_org_id() AND id <> auth.uid());

CREATE POLICY "Members can view access roles" ON public.access_roles
  FOR SELECT TO authenticated USING (org_id = public.current_org_id());
CREATE POLICY "Owner can insert access roles" ON public.access_roles
  FOR INSERT TO authenticated WITH CHECK (public.is_org_owner(auth.uid()) AND org_id = public.current_org_id());
CREATE POLICY "Owner can update access roles" ON public.access_roles
  FOR UPDATE TO authenticated USING (public.is_org_owner(auth.uid()) AND org_id = public.current_org_id());
CREATE POLICY "Owner can delete access roles" ON public.access_roles
  FOR DELETE TO authenticated USING (public.is_org_owner(auth.uid()) AND org_id = public.current_org_id() AND is_system = false);

CREATE POLICY "Members can view org user roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR org_id = public.current_org_id());
CREATE POLICY "Owner can assign roles" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (public.is_org_owner(auth.uid()) AND org_id = public.current_org_id());
CREATE POLICY "Owner can update role assignments" ON public.user_roles
  FOR UPDATE TO authenticated USING (public.is_org_owner(auth.uid()) AND org_id = public.current_org_id());
CREATE POLICY "Owner can remove role assignments" ON public.user_roles
  FOR DELETE TO authenticated USING (public.is_org_owner(auth.uid()) AND org_id = public.current_org_id());

-- 7. updated_at triggers
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_access_roles_updated_at BEFORE UPDATE ON public.access_roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Re-scope business data policies to the organization
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['products','categories','customers','orders','suppliers']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Users can view own %1$s" ON public.%1$s', t);
    EXECUTE format('DROP POLICY IF EXISTS "Users can insert own %1$s" ON public.%1$s', t);
    EXECUTE format('DROP POLICY IF EXISTS "Users can update own %1$s" ON public.%1$s', t);
    EXECUTE format('DROP POLICY IF EXISTS "Users can delete own %1$s" ON public.%1$s', t);
    EXECUTE format('CREATE POLICY "Org members can view %1$s" ON public.%1$s FOR SELECT TO authenticated USING (public.in_same_org(user_id))', t);
    EXECUTE format('CREATE POLICY "Org members can insert %1$s" ON public.%1$s FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)', t);
    EXECUTE format('CREATE POLICY "Org members can update %1$s" ON public.%1$s FOR UPDATE TO authenticated USING (public.in_same_org(user_id))', t);
    EXECUTE format('CREATE POLICY "Org members can delete %1$s" ON public.%1$s FOR DELETE TO authenticated USING (public.in_same_org(user_id))', t);
  END LOOP;
END $$;

DROP POLICY IF EXISTS "Users can view own settings" ON public.settings;
CREATE POLICY "Org members can view settings" ON public.settings
  FOR SELECT TO authenticated USING (public.in_same_org(user_id));

-- 9. Bootstrap existing users into one organization with default access levels
DO $$
DECLARE v_owner uuid; v_org uuid;
BEGIN
  SELECT id INTO v_owner FROM auth.users ORDER BY created_at LIMIT 1;
  IF v_owner IS NULL THEN RETURN; END IF;

  INSERT INTO public.organizations (name, owner_id) VALUES ('Kothari''s Dry Fruits & More', v_owner)
  RETURNING id INTO v_org;

  INSERT INTO public.profiles (id, org_id, email, display_name, must_change_password)
  SELECT u.id, v_org, u.email, split_part(coalesce(u.email,'user'), '@', 1), false
  FROM auth.users u
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.access_roles (org_id, name, description, permissions, is_system) VALUES
    (v_org, 'Full Access', 'Complete access to every module and setting', ARRAY['all'], true),
    (v_org, 'Billing & Settings', 'Manage billing template, invoices and orders', ARRAY['dashboard.view','orders.view','orders.manage','bills.view','reports.view','settings.billing'], true),
    (v_org, 'Inventory Manager', 'Manage products, stock, suppliers and inventory', ARRAY['dashboard.view','products.view','products.manage','inventory.manage','suppliers.manage','categories.manage','reports.view'], true),
    (v_org, 'Sales & POS', 'Run point of sale, orders and customers', ARRAY['dashboard.view','pos.use','products.view','orders.view','orders.manage','customers.view','customers.manage','shipping.manage'], true),
    (v_org, 'Read Only', 'View dashboards and reports without editing', ARRAY['dashboard.view','products.view','orders.view','customers.view','reports.view','analytics.view'], true);
END $$;