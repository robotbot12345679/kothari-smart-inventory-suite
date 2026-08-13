REVOKE EXECUTE ON FUNCTION public.current_org_id() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_org_owner(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_permission(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.in_same_org(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon;