import React from "react";
import { MoreHorizontal, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface RowAction {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
  separatorBefore?: boolean;
}

export const RowActionsDropdown: React.FC<{ actions: RowAction[] }> = ({ actions }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label="Row actions">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="end"
      className="min-w-[180px] rounded-xl p-1.5 shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 duration-200"
    >
      {actions.map((a, i) => (
        <React.Fragment key={a.label}>
          {a.separatorBefore && i > 0 && <DropdownMenuSeparator />}
          <DropdownMenuItem
            disabled={a.disabled}
            onClick={a.onClick}
            className={cn(
              "gap-2 rounded-lg px-2.5 py-2 cursor-pointer transition-colors",
              a.destructive && "text-destructive focus:text-destructive focus:bg-destructive/10"
            )}
          >
            {a.icon && <a.icon className="h-4 w-4" />}
            {a.label}
          </DropdownMenuItem>
        </React.Fragment>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);
