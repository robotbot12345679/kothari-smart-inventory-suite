
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, Download, Home } from "lucide-react";
import { useCloudSupplierData } from "@/hooks/useCloudSupplierData";
import { useNavigate } from "react-router-dom";

const ProductComparison = () => {
  const { getProductComparison } = useCloudSupplierData();
  const navigate = useNavigate();
  const productComparison = useMemo(() => getProductComparison(), []);

  const exportToExcel = () => {
    // Simple CSV export
    const headers = ['Product Name', 'Supplier', 'Current Price', 'Previous Price', 'Change', 'Change %'];
    const rows = [];
    
    productComparison.forEach(product => {
      Object.entries(product.suppliers).forEach(([supplierKey, data]) => {
        const supplierName = supplierKey.split('-')[1];
        rows.push([
          product.productName,
          supplierName,
          `₹${data.price}`,
          data.change ? `₹${data.price - data.change}` : 'N/A',
          data.change ? `₹${data.change > 0 ? '+' : ''}${data.change}` : 'N/A',
          data.changePercent ? `${data.changePercent > 0 ? '+' : ''}${data.changePercent.toFixed(1)}%` : 'N/A'
        ]);
      });
    });

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `product-comparison-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-red-600';
    if (change < 0) return 'text-green-600';
    return 'text-muted-foreground';
  };

  const getChangeBadge = (change: number, changePercent: number) => {
    if (change === 0) return null;
    
    const isIncrease = change > 0;
    const bgColor = isIncrease ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
    const Icon = isIncrease ? ArrowUp : ArrowDown;
    
    return (
      <Badge className={`${bgColor} gap-1`}>
        <Icon className="h-3 w-3" />
        ₹{Math.abs(change)} ({Math.abs(changePercent).toFixed(1)}%)
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/suppliers')}
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Back to Suppliers
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Product Price Comparison</h1>
              <p className="text-muted-foreground">
                Compare product prices across all suppliers with price change tracking
              </p>
            </div>
          </div>
          <Button onClick={exportToExcel} className="gap-2">
            <Download className="h-4 w-4" />
            Export to Excel
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{productComparison.length}</div>
              <p className="text-xs text-muted-foreground">Being tracked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Price Increases</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {productComparison.reduce((count, product) => {
                  return count + Object.values(product.suppliers).filter(s => s.change && s.change > 0).length;
                }, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Products with price hikes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Price Decreases</CardTitle>
              <TrendingDown className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {productComparison.reduce((count, product) => {
                  return count + Object.values(product.suppliers).filter(s => s.change && s.change < 0).length;
                }, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Products with price drops</p>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle>Product Price Comparison Table</CardTitle>
          </CardHeader>
          <CardContent>
            {productComparison.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No product price data available yet.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload some purchase bills to start tracking price changes.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Current Price</TableHead>
                    <TableHead>Price Change</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productComparison.map((product) => (
                    Object.entries(product.suppliers).map(([supplierKey, supplierData]) => {
                      const supplierName = supplierKey.split('-')[1];
                      return (
                        <TableRow key={`${product.productName}-${supplierKey}`}>
                          <TableCell className="font-medium">
                            {product.productName}
                          </TableCell>
                          <TableCell>{supplierName}</TableCell>
                          <TableCell>
                            <span className="font-medium">₹{supplierData.price}</span>
                          </TableCell>
                          <TableCell>
                            {supplierData.change && supplierData.changePercent ? (
                              <div className="flex items-center gap-2">
                                {getChangeBadge(supplierData.change, supplierData.changePercent)}
                                {Math.abs(supplierData.changePercent) > 10 && (
                                  <Badge variant="destructive" className="text-xs">
                                    High Change!
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">No change</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {new Date(supplierData.date).toLocaleDateString('en-IN')}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductComparison;
