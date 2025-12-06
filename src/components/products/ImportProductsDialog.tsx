
import React, { useState } from "react";
import * as XLSX from 'xlsx';
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
import { useCloudData } from "@/context/CloudDataContext";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download } from "lucide-react";
import type { Product } from "@/types/pos";

interface ImportProductsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ImportProductsDialog = ({ open, onOpenChange }: ImportProductsDialogProps) => {
  const { addProduct, categories, user, loading } = useCloudData();
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

  const parseExcelOrCSV = async (file: File): Promise<Record<string, any>[]> => {
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.csv')) {
      const content = await file.text();
      return parseCSV(content);
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      return XLSX.utils.sheet_to_json(worksheet);
    }
    
    throw new Error('Unsupported file format');
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV or Excel file to import.",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please wait for the system to initialize and try again.",
        variant: "destructive"
      });
      return;
    }

    try {
      setImporting(true);
      
      const data = await parseExcelOrCSV(file);
      
      console.log("Parsed data:", data);
      console.log("First row keys:", data.length > 0 ? Object.keys(data[0]) : "No data");
      
      if (data.length === 0) {
        toast({
          title: "Empty file",
          description: "The file doesn't contain any data.",
          variant: "destructive"
        });
        setImporting(false);
        return;
      }

      // Case-insensitive header check
      const headers = Object.keys(data[0]).map(h => h.toLowerCase());
      const hasName = headers.some(h => h === 'name' || h === 'product' || h === 'product name');
      const hasPrice = headers.some(h => h === 'price' || h === 'cost' || h === 'amount');

      if (!hasName) {
        toast({
          title: "Missing required field",
          description: "Your file is missing the 'name' column.",
          variant: "destructive"
        });
        setImporting(false);
        return;
      }

      let importedCount = 0;
      const validCategories = ["All", "Dry Fruits", "Nuts", "Seeds", "Spices", "Dried Fruits"];

      for (const row of data) {
        try {
          // Get value helper function - checks all case variations
          const getValue = (keys: string[]): any => {
            for (const key of keys) {
              if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
                return row[key];
              }
            }
            return undefined;
          };

          const name = getValue(['name', 'Name', 'NAME', 'product', 'Product', 'PRODUCT', 'product name', 'Product Name']);
          if (!name) {
            console.log("Skipping row without name:", row);
            continue;
          }

          const skuVal = getValue(['sku', 'SKU', 'Sku', 'code', 'Code', 'CODE']);
          const sku = skuVal ? skuVal.toString().trim() : `SKU-${Date.now()}-${importedCount}`;
          
          const priceVal = getValue(['price', 'Price', 'PRICE', 'cost', 'Cost', 'COST']);
          const price = priceVal ? parseFloat(priceVal.toString().replace(/[^0-9.]/g, '')) || 0 : 0;
          
          const categoryVal = getValue(['category', 'Category', 'CATEGORY', 'type', 'Type']);
          let category = categoryVal || 'All';
          if (category === 'Dried Fruits') category = 'Dry Fruits';
          if (!validCategories.includes(category)) category = 'All';
          
          const descVal = getValue(['description', 'Description', 'DESCRIPTION', 'desc', 'Desc']);
          const description = descVal || '';
          
          const stockVal = getValue(['stock', 'Stock', 'STOCK', 'quantity', 'Quantity', 'qty', 'Qty']);
          const stock = stockVal ? parseInt(stockVal.toString().replace(/[^0-9]/g, ''), 10) || 0 : 0;
          
          const weightVal = getValue(['weight', 'Weight', 'WEIGHT']);
          const weight = weightVal ? parseFloat(weightVal.toString().replace(/[^0-9.]/g, '')) || 1 : 1;
          
          const unitVal = getValue(['unit', 'Unit', 'UNIT']);
          const unitStr = unitVal ? unitVal.toString().toLowerCase() : 'g';
          const unit = ['g', 'kg', 'box', 'pcs'].includes(unitStr) ? unitStr : 'g';
          
          const barcodeVal = getValue(['barcode', 'Barcode', 'BARCODE', 'bar code', 'Bar Code']);
          const barcode = barcodeVal ? barcodeVal.toString().trim() : null;

          const newProduct: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'user_id'> = {
            name: name.toString().trim(),
            sku,
            price,
            category,
            description,
            stock,
            weight,
            unit: unit as 'g' | 'kg' | 'box' | 'pcs',
            image: "",
            is_active: true,
            price_includes_gst: true,
            barcode,
            image_url: null,
            expiry_date: null,
            min_stock: 0
          };

          console.log("Importing product:", newProduct);
          await addProduct(newProduct);
          importedCount++;
        } catch (err) {
          console.error("Error importing product row:", row, err);
        }
      }

      toast({
        title: "Products Imported",
        description: `Successfully imported ${importedCount} products.`
      });
      
      setFile(null);
      onOpenChange(false);
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import Failed",
        description: "Failed to import products. Please check your file format.",
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
          <DialogTitle>Import Products from CSV/Excel</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file to import product data in bulk.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center">
            <Label htmlFor="csv-file">CSV or Excel File</Label>
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
            accept=".csv,.xlsx,.xls" 
            onChange={handleFileChange} 
          />
          
          <div className="text-xs text-muted-foreground">
            Required columns: name (price is optional)
          </div>
          
          {!user && (
            <Alert variant="destructive">
              <AlertDescription>
                System is initializing. Please wait before importing.
              </AlertDescription>
            </Alert>
          )}
          
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
          <Button onClick={handleImport} disabled={!file || importing || !user || loading}>
            {importing ? "Importing..." : loading ? "Initializing..." : "Import Products"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportProductsDialog;
