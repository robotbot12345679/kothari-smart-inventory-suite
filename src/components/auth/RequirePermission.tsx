import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { usePermissions } from "@/context/PermissionsContext";

export const AccessDenied = ({ message }: { message?: string }) => {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <Lock className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Access restricted</CardTitle>
          <CardDescription>
            {message ?? "Your access level does not include this section. Ask an administrator if you need it."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => navigate("/settings")}>
            Go to my settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

const RequirePermission = ({
  permission,
  children,
}: {
  permission: string | null;
  children: React.ReactNode;
}) => {
  const { can, loading } = usePermissions();
  if (loading) return null;
  if (permission && !can(permission)) return <AccessDenied />;
  return <>{children}</>;
};

export default RequirePermission;
