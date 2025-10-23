
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useCloudData } from "@/context/CloudDataContext";
import { Calendar } from "lucide-react";
import { Order } from "@/types/pos";
import { v4 as uuidv4 } from 'uuid';

const AddSalesDialog = () => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<string>("");
  const [totalSales, setTotalSales] = useState<string>("");
  const { addOrder } = useCloudData();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !totalSales || isNaN(parseFloat(totalSales))) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid date and sales amount.",
        variant: "destructive",
      });
      return;
    }

    // Create a new manual order entry
    const manualOrder: Order = {
      id: uuidv4(),
      orderDate: new Date(date).toISOString(),
      orderStatus: "Delivered",
      paymentStatus: "Paid",
      paymentMethod: "Cash",
      items: [],
      total: parseFloat(totalSales),
      subtotal: parseFloat(totalSales),
      gst: 0,
      customerName: "Manual Entry",
      customerEmail: "",
      customerPhone: "",
      shippingAddress: "",
    };

    addOrder(manualOrder);

    toast({
      title: "Sales Record Added",
      description: `Sales data for ${new Date(date).toLocaleDateString()} has been added.`,
    });

    setOpen(false);
    setDate("");
    setTotalSales("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Calendar className="h-4 w-4" />
          Add Missing Sales
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Missing Sales Data</DialogTitle>
          <DialogDescription>
            Record sales data for a day that wasn't previously recorded.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalSales">Total Sales Amount (₹)</Label>
            <Input
              id="totalSales"
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={totalSales}
              onChange={(e) => setTotalSales(e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Sales Record</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSalesDialog;
