import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCloudData } from "@/context/CloudDataContext";

export interface Profile {
  id: string;
  org_id: string | null;
  email: string | null;
  display_name: string | null;
  must_change_password: boolean;
  is_active: boolean;
  created_at: string;
}

export interface AccessRole {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  permissions: string[];
  is_system: boolean;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  owner_id: string;
}

interface PermissionsContextType {
  profile: Profile | null;
  organization: Organization | null;
  roles: AccessRole[];
  myRole: AccessRole | null;
  permissions: string[];
  isOwner: boolean;
  loading: boolean;
  can: (permission: string) => boolean;
  refresh: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useCloudData();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [roles, setRoles] = useState<AccessRole[]>([]);
  const [myRole, setMyRole] = useState<AccessRole | null>(null);
  const [loading, setLoading] = useState(true);
  const loadedOnce = useRef(false);

  const load = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setOrganization(null);
      setRoles([]);
      setMyRole(null);
      setLoading(false);
      return;
    }

    if (!loadedOnce.current) setLoading(true);

    try {
      let { data: profileRow } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!profileRow) {
        const { data: inserted } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email,
            display_name: user.email?.split("@")[0] ?? "User",
            must_change_password: false,
          })
          .select()
          .maybeSingle();
        profileRow = inserted ?? null;
      }

      setProfile((profileRow as Profile) ?? null);

      const [{ data: orgRows }, { data: roleRows }, { data: assignments }] = await Promise.all([
        supabase.from("organizations").select("id, name, owner_id"),
        supabase.from("access_roles").select("*").order("name"),
        supabase.from("user_roles").select("role_id").eq("user_id", user.id),
      ]);

      const org = (orgRows ?? [])[0] as Organization | undefined;
      setOrganization(org ?? null);

      const allRoles = ((roleRows ?? []) as AccessRole[]);
      setRoles(allRoles);

      const myRoleId = (assignments ?? [])[0]?.role_id;
      setMyRole(allRoles.find((r) => r.id === myRoleId) ?? null);
    } finally {
      loadedOnce.current = true;
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const isOwner = !!(organization && user && organization.owner_id === user.id);
  const permissions = isOwner ? ["all"] : myRole?.permissions ?? [];

  const can = useCallback(
    (permission: string) => permissions.includes("all") || permissions.includes(permission),
    [permissions]
  );

  return (
    <PermissionsContext.Provider
      value={{ profile, organization, roles, myRole, permissions, isOwner, loading, can, refresh: load }}
    >
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const ctx = useContext(PermissionsContext);
  if (!ctx) throw new Error("usePermissions must be used within a PermissionsProvider");
  return ctx;
};
