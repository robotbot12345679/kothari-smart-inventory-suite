
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Tag } from "lucide-react";

interface TopProductItem {
  name: string;
  quantity: number;
}

interface TopSellingProductsProps {
  products: TopProductItem[];
}

const TopSellingProducts: React.FC<TopSellingProductsProps> = ({ products }) => {
  const navigate = useNavigate();

  return (
    <Card className="card-hover h-full">
      <CardHeader className="pb-2">
        <CardTitle>Top Selling Products</CardTitle>
        <CardDescription>Best performers</CardDescription>
      </CardHeader>
      <CardContent>
        {products && products.length > 0 ? (
          <div className="space-y-3">
            {products.map((product, index) => (
              <div key={product.name} className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary font-medium mr-2">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.quantity} units sold
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <Tag className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="mb-4 text-muted-foreground">No sales data yet</p>
            <Button variant="outline" onClick={() => navigate('/pos')}>
              Create Sale
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopSellingProducts;
