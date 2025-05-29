
import React, { useState } from "react";
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
import { useData } from "@/context/DataContext";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download } from "lucide-react";
import type { Product } from "@/types/pos";

interface ImportProductsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ImportProductsDialog = ({ open, onOpenChange }: ImportProductsDialogProps) => {
  const { addProduct, categories } = useData();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const parseCSV = (csv: string): Record<string, string>[] => {
    const lines = csv.split(/\r?\n/).filter(line => line.trim() !== '');
    
    if (lines.length === 0) {
      return [];
    }
    
    const headerRow = lines[0].split(',').map(header => header.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(value => value.trim());
      const obj: Record<string, string> = {};
      
      headerRow.forEach((header, index) => {
        obj[header] = index < values.length ? values[index] : '';
      });
      
      return obj;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to import.",
        variant: "destructive"
      });
      return;
    }

    try {
      setImporting(true);
      
      const content = await file.text();
      const csvData = parseCSV(content);
      
      if (csvData.length === 0) {
        toast({
          title: "Empty CSV file",
          description: "The CSV file doesn't contain any data.",
          variant: "destructive"
        });
        setImporting(false);
        return;
      }

      const requiredFields = ['name', 'price'];
      const headers = Object.keys(csvData[0]);
      const missingFields = requiredFields.filter(field => !headers.includes(field));

      if (missingFields.length > 0) {
        toast({
          title: "Missing required fields",
          description: `Your CSV is missing the following required fields: ${missingFields.join(', ')}`,
          variant: "destructive"
        });
        setImporting(false);
        return;
      }

      let importedCount = 0;
      const defaultCategory = categories[0]?.name || "All";

      for (const row of csvData) {
        try {
          const newProduct: Product = {
            id: Date.now() + importedCount,
            name: row.name || "Unknown Product",
            sku: row.sku || `SKU-${Date.now() + importedCount}`,
            price: parseFloat(row.price) || 0,
            category: row.category || defaultCategory,
            description: row.description || "",
            stock: parseInt(row.stock || "0", 10),
            weight: parseFloat(row.weight || "1"),
            unit: (row.unit as 'g' | 'kg' | 'box' | 'pcs') || 'g',
            image: "",
            isActive: true,
            priceIncludesGST: true
          };

          addProduct(newProduct);
          importedCount++;
        } catch (err) {
          console.error("Error importing product row:", row, err);
        }
      }

      toast({
        title: "Products Imported",
        description: `Successfully imported ${importedCount} products.`
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import Failed",
        description: "Failed to import products. Please check your CSV file format.",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  const downloadSampleCSV = () => {
    const headers = "name,sku,category,price,stock,weight,unit,description";
    const sampleData = [
      "Cashew Nuts,CF-001,Nuts,850,25,500,g,Premium quality cashew nuts",
      "Almonds,AM-002,Nuts,950,15,500,g,California almonds",
      "Raisins,RS-003,Dry Fruits,350,30,250,g,Sweet golden raisins"
    ].join("\n");
    
    const csvContent = `${headers}\n${sampleData}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_products.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Products from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import product data in bulk.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center">
            <Label htmlFor="csv-file">CSV File</Label>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadSampleCSV}
              className="text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              Sample CSV
            </Button>
          </div>
          
          <Input 
            id="csv-file" 
            type="file" 
            accept=".csv" 
            onChange={handleFileChange} 
          />
          
          <div className="text-xs text-muted-foreground">
            Required columns: name, price
          </div>
          
          <Alert>
            <AlertDescription>
              Products will be imported with default values for any missing fields.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!file || importing}>
            {importing ? "Importing..." : "Import Products"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportProductsDialog;
