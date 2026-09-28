import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const PAGE_SIZES = [10, 50, 100];

export function usePagination<T>(items: T[], initialSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialSize);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const pageItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize]
  );
  return {
    pageItems,
    page,
    pageSize,
    total: items.length,
    totalPages,
    setPage,
    setPageSize: (n: number) => {
      setPageSize(n);
      setPage(1);
    },
  };
}

function pageList(page: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) out.push("…");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < total - 1) out.push("…");
  out.push(total);
  return out;
}

interface Props {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  setPage: (p: number) => void;
  setPageSize: (n: number) => void;
  className?: string;
}

export const DataTablePagination: React.FC<Props> = ({
  page,
  pageSize,
  total,
  totalPages,
  setPage,
  setPageSize,
  className,
}) => (
  <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-3", className)}>
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <span>Rows per page</span>
      <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
        <SelectTrigger className="h-8 w-[72px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PAGE_SIZES.map((s) => (
            <SelectItem key={s} value={String(s)}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span>{total} records found</span>
    </div>
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
      </Button>
      {pageList(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-2 text-muted-foreground">…</span>
        ) : (
          <Button
            key={p}
            variant={p === page ? "outline" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setPage(p)}
          >
            {p}
          </Button>
        )
      )}
      <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
        Next <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  </div>
);
