
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, TruckIcon, Package, AlertCircle, FileDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCloudData } from "@/context/CloudDataContext";

const Shipping = () => {
  const { orders } = useCloudData();
  const { toast } = useToast();
  const [isCreateShipmentOpen, setIsCreateShipmentOpen] = useState(false);
  const [shipments, setShipments] = useState<any[]>([]);
  const [newShipment, setNewShipment] = useState({
    orderId: "",
    courierService: "DTDC",
    destination: "",
    customerName: "",
    phone: ""
  });

  // Function to determine badge color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "In Transit":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "Shipment Created":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "Out for Delivery":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100";
      case "Failed Delivery":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const handleCreateShipment = () => {
    if (!newShipment.orderId || !newShipment.destination || !newShipment.customerName) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    const shipmentId = `SHIP-${Math.floor(100000 + Math.random() * 900000)}`;
    
    const newShipmentObj = {
      id: shipmentId,
      orderId: newShipment.orderId,
      customerName: newShipment.customerName,
      date: new Date().toISOString(),
      destination: newShipment.destination,
      status: "Shipment Created",
      courier: newShipment.courierService
    };

    setShipments([...shipments, newShipmentObj]);
    setIsCreateShipmentOpen(false);
    setNewShipment({
      orderId: "",
      courierService: "DTDC",
      destination: "",
      customerName: "",
      phone: ""
    });

    toast({
      title: "Shipment Created",
      description: `Shipment ${shipmentId} has been created successfully`
    });
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your shipment data is being exported"
    });
  };

  const handleTrack = (shipmentId: string) => {
    toast({
      title: "Tracking Shipment",
      description: `Tracking information for ${shipmentId} is being retrieved`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Shipping</h1>
        <div className="flex items-center gap-2">
          <Button className="gap-1" variant="outline" onClick={handleExport}>
            <FileDown className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-1" onClick={() => setIsCreateShipmentOpen(true)}>
            <TruckIcon className="h-4 w-4" />
            Create Shipment
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shipments.length}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <TruckIcon className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shipments.filter(s => s.status === "In Transit").length}</div>
            <p className="text-xs text-muted-foreground">Currently in transit</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shipments.filter(s => s.status === "Delivered").length}</div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shipments.filter(s => s.status === "Failed Delivery").length}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isCreateShipmentOpen} onOpenChange={setIsCreateShipmentOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Shipment</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new shipment
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="orderId" className="text-sm font-medium">Order ID*</label>
              <Input 
                id="orderId"
                value={newShipment.orderId}
                onChange={(e) => setNewShipment({...newShipment, orderId: e.target.value})}
                placeholder="Enter order ID"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="customerName" className="text-sm font-medium">Customer Name*</label>
              <Input 
                id="customerName"
                value={newShipment.customerName}
                onChange={(e) => setNewShipment({...newShipment, customerName: e.target.value})}
                placeholder="Enter customer name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
              <Input 
                id="phone"
                value={newShipment.phone}
                onChange={(e) => setNewShipment({...newShipment, phone: e.target.value})}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="destination" className="text-sm font-medium">Destination Address*</label>
              <Input 
                id="destination"
                value={newShipment.destination}
                onChange={(e) => setNewShipment({...newShipment, destination: e.target.value})}
                placeholder="Enter full shipping address"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="courier" className="text-sm font-medium">Courier Service</label>
              <Select 
                value={newShipment.courierService}
                onValueChange={(value) => setNewShipment({...newShipment, courierService: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select courier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DTDC">DTDC</SelectItem>
                  <SelectItem value="BlueDart">BlueDart</SelectItem>
                  <SelectItem value="Delhivery">Delhivery</SelectItem>
                  <SelectItem value="EcomExpress">EcomExpress</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateShipmentOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateShipment}>Create Shipment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="bg-white rounded-lg shadow dark:bg-gray-800">
        <div className="p-4 border-b flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search shipments..."
              className="w-full bg-background pl-8 md:w-96"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="created">Shipment Created</SelectItem>
                <SelectItem value="transit">In Transit</SelectItem>
                <SelectItem value="delivery">Out for Delivery</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="failed">Failed Delivery</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="dtdc">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Courier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dtdc">DTDC</SelectItem>
                <SelectItem value="bluedart">BlueDart</SelectItem>
                <SelectItem value="delhivery">Delhivery</SelectItem>
                <SelectItem value="ecomexpress">EcomExpress</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking ID</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipments.length > 0 ? (
                shipments.map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell className="font-medium">{shipment.id}</TableCell>
                    <TableCell>{shipment.orderId}</TableCell>
                    <TableCell>{shipment.customerName}</TableCell>
                    <TableCell>
                      {new Date(shipment.date).toLocaleDateString('en-IN')}
                    </TableCell>
                    <TableCell>{shipment.destination}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(shipment.status)}>
                        {shipment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleTrack(shipment.id)}
                      >
                        Track
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    No shipments available. Click "Create Shipment" to add one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="p-4 border-t flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">0</span> to <span className="font-medium">{shipments.length}</span> of{" "}
            <span className="font-medium">{shipments.length}</span> shipments
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
