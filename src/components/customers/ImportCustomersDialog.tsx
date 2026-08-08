import React, { useState } from "react";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download } from "lucide-react";
import { useCloudData } from "@/context/CloudDataContext";
import { useToast } from "@/components/ui/use-toast";

interface ImportCustomersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TEMPLATE_HEADERS = [
  "Name",
  "Phone",
  "Email",
  "Address",
  "City",
  "State",
  "Birthday",
  "Total Orders",
  "Total Spent",
  "Last Order Date",
  "Status",
];

const parseCSV = (csv: string): Record<string, string>[] => {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length === 0) return [];

  const splitLine = (line: string) => {
    const out: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        out.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    out.push(current.trim());
    return out;
  };

  const headers = splitLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = splitLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = index < values.length ? values[index] : "";
    });
    return row;
  });
};

const ImportCustomersDialog = ({ open, onOpenChange }: ImportCustomersDialogProps) => {
  const { addCustomer } = useCloudData();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const parseFile = async (input: File): Promise<Record<string, any>[]> => {
    const fileName = input.name.toLowerCase();
    if (fileName.endsWith(".csv")) {
      return parseCSV(await input.text());
    }
    if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      const workbook = XLSX.read(await input.arrayBuffer(), { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      return XLSX.utils.sheet_to_json(sheet);
    }
    throw new Error("Unsupported file format");
  };

  const handleImport = async () => {
    if (!file) return;

    try {
      setImporting(true);
      const rows = await parseFile(file);

      if (rows.length === 0) {
        toast({
          title: "Empty file",
          description: "The file doesn't contain any data rows.",
          variant: "destructive",
        });
        return;
      }

      const getValue = (row: Record<string, any>, keys: string[]) => {
        for (const key of Object.keys(row)) {
          if (keys.includes(key.trim().toLowerCase())) {
            const value = row[key];
            if (value !== undefined && value !== null && `${value}`.trim() !== "") {
              return `${value}`.trim();
            }
          }
        }
        return "";
      };

      const toNumber = (value: string) => {
        const parsed = parseFloat(value.replace(/[^0-9.-]/g, ""));
        return Number.isFinite(parsed) ? parsed : 0;
      };

      let imported = 0;
      let skipped = 0;

      for (const row of rows) {
        const name = getValue(row, ["name", "customer", "customer name", "full name"]);
        const phone = getValue(row, ["phone", "phone number", "mobile", "contact"]);

        if (!name && !phone) {
          skipped++;
          continue;
        }

        try {
          await addCustomer({
            name: name || phone,
            phone,
            email: getValue(row, ["email", "email address"]),
            address: getValue(row, ["address", "customer address"]),
            city: getValue(row, ["city"]),
            state: getValue(row, ["state"]),
            pincode: getValue(row, ["pincode", "pin code", "zip", "postal code"]),
            notes: getValue(row, ["notes", "note"]),
            birthday: getValue(row, ["birthday", "dob", "date of birth"]),
            total_orders: toNumber(getValue(row, ["total orders", "orders"])),
            total_spent: toNumber(getValue(row, ["total spent", "spent", "lifetime value"])),
            last_order_date: getValue(row, ["last order date", "last order"]) || null,
            status: (getValue(row, ["status"]) || "Active") as string,
            order_history: [],
          } as any);
          imported++;
        } catch (rowError) {
          console.error("Failed to import customer row", row, rowError);
          skipped++;
        }
      }

      toast({
        title: "Customers Imported",
        description: `Imported ${imported} customer(s)${skipped ? `, skipped ${skipped} row(s)` : ""}.`,
      });

      setFile(null);
      onOpenChange(false);
    } catch (error) {
      console.error("Customer import failed", error);
      toast({
        title: "Import Failed",
        description: "Could not read that file. Please use the template format.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const sample = [
      'Ramesh Kumar,+919876543210,ramesh@example.com,"12 MG Road, Andheri",Mumbai,Maharashtra,1990-04-12,0,0,,Active',
    ];
    const csvContent = `${TEMPLATE_HEADERS.join(",")}\n${sample.join("\n")}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "customers-template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Import Customers</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file to add customers in bulk.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="customer-import-file">CSV or Excel file</Label>
            <Button variant="outline" size="sm" className="text-xs" onClick={downloadTemplate}>
              <Download className="h-3 w-3 mr-1" />
              Template
            </Button>
          </div>

          <Input
            id="customer-import-file"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />

          <div className="text-xs text-muted-foreground">
            Columns: {TEMPLATE_HEADERS.join(", ")}. Only Name or Phone is required per row.
          </div>

          <Alert>
            <AlertDescription>
              Empty rows are skipped. Missing fields are saved with sensible defaults.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!file || importing}>
            {importing ? "Importing..." : "Import Customers"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportCustomersDialog;
