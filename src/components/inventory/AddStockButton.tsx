
import React from "react";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import UpdateStockDialog from "./UpdateStockDialog";

const AddStockButton = () => {
  return (
    <UpdateStockDialog>
      <Button variant="outline" className="gap-2">
        <Package className="h-4 w-4" />
        Add Stock
      </Button>
    </UpdateStockDialog>
  );
};

export default AddStockButton;
