
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, TruckIcon, Package, AlertCircle, FileDown, Send } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Shipping = () => {
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<any>(null);

  // Sample shipment data
  const shipments = [
    {
      id: "DTDC-1001-4582",
      orderId: "ORD-2023-001",
      customerName: "Rajesh Kumar",
      date: "2023-04-15",
      destination: "Mumbai, Maharashtra",
      status: "Delivered",
      trackingUrl: "https://tracking.dtdc.com/tracking/DTDC-1001-4582",
      statusUpdates: [
        { date: "2023-04-15 09:30", status: "Shipment Created", location: "Bangalore Warehouse" },
        { date: "2023-04-15 14:15", status: "Picked up", location: "Bangalore Warehouse" },
        { date: "2023-04-16 02:30", status: "In Transit", location: "Mumbai Hub" },
        { date: "2023-04-16 10:45", status: "Out for Delivery", location: "Mumbai Local Center" },
        { date: "2023-04-16 16:20", status: "Delivered", location: "Customer Address" },
      ],
      customerContact: "+91 98765 43210",
      weight: "2.5 kg",
      packages: 1
    },
    {
      id: "DTDC-1002-9283",
      orderId: "ORD-2023-002",
      customerName: "Priya Sharma",
      date: "2023-04-16",
      destination: "Delhi, Delhi",
      status: "In Transit",
      trackingUrl: "https://tracking.dtdc.com/tracking/DTDC-1002-9283",
      statusUpdates: [
        { date: "2023-04-16 10:30", status: "Shipment Created", location: "Bangalore Warehouse" },
        { date: "2023-04-16 15:45", status: "Picked up", location: "Bangalore Warehouse" },
        { date: "2023-04-17 03:20", status: "In Transit", location: "Delhi Hub" },
      ],
      customerContact: "+91 98765 12345",
      weight: "1.8 kg",
      packages: 1
    },
    {
      id: "DTDC-1003-8721",
      orderId: "ORD-2023-004",
      customerName: "Sunita Desai",
      date: "2023-04-17",
      destination: "Hyderabad, Telangana",
      status: "Out for Delivery",
      trackingUrl: "https://tracking.dtdc.com/tracking/DTDC-1003-8721",
      statusUpdates: [
        { date: "2023-04-17 11:30", status: "Shipment Created", location: "Bangalore Warehouse" },
        { date: "2023-04-17 16:15", status: "Picked up", location: "Bangalore Warehouse" },
        { date: "2023-04-18 04:30", status: "In Transit", location: "Hyderabad Hub" },
        { date: "2023-04-18 09:45", status: "Out for Delivery", location: "Hyderabad Local Center" },
      ],
      customerContact: "+91 87654 32109",
      weight: "3.2 kg",
      packages: 2
    },
    {
      id: "DTDC-1004-6542",
      orderId: "ORD-2023-007",
      customerName: "Kiran Joshi",
      date: "2023-04-18",
      destination: "Pune, Maharashtra",
      status: "Delivered",
      trackingUrl: "https://tracking.dtdc.com/tracking/DTDC-1004-6542",
      statusUpdates: [
        { date: "2023-04-18 08:30", status: "Shipment Created", location: "Bangalore Warehouse" },
        { date: "2023-04-18 13:15", status: "Picked up", location: "Bangalore Warehouse" },
        { date: "2023-04-18 23:30", status: "In Transit", location: "Pune Hub" },
        { date: "2023-04-19 09:45", status: "Out for Delivery", location: "Pune Local Center" },
        { date: "2023-04-19 14:20", status: "Delivered", location: "Customer Address" },
      ],
      customerContact: "+91 76543 21098",
      weight: "1.5 kg",
      packages: 1
    },
    {
      id: "DTDC-1005-7623",
      orderId: "ORD-2023-008",
      customerName: "Neha Gupta",
      date: "2023-04-18",
      destination: "Chennai, Tamil Nadu",
      status: "Shipment Created",
      trackingUrl: "https://tracking.dtdc.com/tracking/DTDC-1005-7623",
      statusUpdates: [
        { date: "2023-04-18 16:30", status: "Shipment Created", location: "Bangalore Warehouse" },
      ],
      customerContact: "+91 65432 10987",
      weight: "4.0 kg",
      packages: 3
    },
  ];

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

  const handleViewTracking = (shipment: any) => {
    setSelectedShipment(shipment);
    setTrackingDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Shipping</h1>
        <div className="flex items-center gap-2">
          <Button className="gap-1" variant="outline">
            <FileDown className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-1">
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
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <TruckIcon className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">Currently in transit</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124</div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
      </div>

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
                <SelectItem value="other">Other</SelectItem>
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
              {shipments.map((shipment) => (
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
                      onClick={() => handleViewTracking(shipment)}
                    >
                      Track
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="p-4 border-t flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of{" "}
            <span className="font-medium">142</span> shipments
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Shipment Tracking</DialogTitle>
            <DialogDescription>
              {selectedShipment && (
                <div className="mt-1">
                  <span className="font-semibold">{selectedShipment.id}</span> - {selectedShipment.orderId}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedShipment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedShipment.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="font-medium">{selectedShipment.customerContact}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Destination</p>
                  <p className="font-medium">{selectedShipment.destination}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Weight</p>
                  <p className="font-medium">{selectedShipment.weight} ({selectedShipment.packages} {selectedShipment.packages > 1 ? 'packages' : 'package'})</p>
                </div>
              </div>

              <Tabs defaultValue="tracking">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="tracking">Tracking Details</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>
                <TabsContent value="tracking" className="space-y-4">
                  <div className="mt-4 space-y-6 relative">
                    <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-muted-foreground/20"></div>
                    {selectedShipment.statusUpdates.map((update: any, index: number) => (
                      <div key={index} className="flex ml-2 relative">
                        <div 
                          className={`w-5 h-5 rounded-full mt-1 mr-3 flex-shrink-0 z-10 ${
                            index === 0 ? 'bg-green-500' : 'bg-primary'
                          }`}
                        ></div>
                        <div>
                          <p className="font-semibold">{update.status}</p>
                          <p className="text-sm text-muted-foreground">{update.location}</p>
                          <p className="text-xs text-muted-foreground">{update.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => window.open(selectedShipment.trackingUrl, '_blank')}
                      className="w-full gap-2"
                    >
                      <TruckIcon className="h-4 w-4" />
                      Track on DTDC Website
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="notifications" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Send Tracking Updates To:</Label>
                    <Input defaultValue={selectedShipment.customerContact} placeholder="Phone Number" />
                    <div className="text-xs text-muted-foreground">
                      SMS tracking updates will be sent to this number
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input placeholder="Email Address" />
                    <div className="text-xs text-muted-foreground">
                      Email notifications will be sent for major status changes
                    </div>
                  </div>

                  <div>
                    <Button className="gap-2 w-full mt-2">
                      <Send className="h-4 w-4" />
                      Send Tracking Information
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setTrackingDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Shipping;
