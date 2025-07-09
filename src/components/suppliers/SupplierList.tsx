
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Phone, Mail } from "lucide-react";
import { Supplier } from "@/types/supplier";

interface SupplierListProps {
  suppliers: Supplier[];
  selectedSupplier: number | null;
  onSelectSupplier: (id: number) => void;
}

const SupplierList: React.FC<SupplierListProps> = ({
  suppliers,
  selectedSupplier,
  onSelectSupplier
}) => {
  const activeSuppliers = suppliers.filter(s => s.isActive);

  return (
    <div className="space-y-4">
      {/* Horizontal scrollable supplier bar */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {activeSuppliers.map((supplier) => (
          <Button
            key={supplier.id}
            variant={selectedSupplier === supplier.id ? "default" : "outline"}
            className="whitespace-nowrap min-w-fit"
            onClick={() => onSelectSupplier(supplier.id)}
          >
            <Building2 className="h-4 w-4 mr-2" />
            {supplier.name}
          </Button>
        ))}
      </div>

      {/* Supplier cards grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {activeSuppliers.map((supplier) => (
          <Card 
            key={supplier.id}
            className={`card-hover cursor-pointer transition-all ${
              selectedSupplier === supplier.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onSelectSupplier(supplier.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">{supplier.name}</h3>
                </div>
                <Badge variant="secondary">Active</Badge>
              </div>
              
              {supplier.contactPerson && (
                <p className="text-sm text-muted-foreground mb-2">
                  Contact: {supplier.contactPerson}
                </p>
              )}
              
              <div className="space-y-1">
                {supplier.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {supplier.phone}
                  </div>
                )}
                
                {supplier.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {supplier.email}
                  </div>
                )}
              </div>

              {supplier.gstNumber && (
                <p className="text-xs text-muted-foreground mt-2">
                  GST: {supplier.gstNumber}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SupplierList;
