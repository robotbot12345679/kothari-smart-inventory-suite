
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  FileDown, 
  FilePlus, 
  Clock, 
  Calendar, 
  BarChart, 
  Printer, 
  Share2, 
  Mail 
} from "lucide-react";
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

const Reports = () => {
  // Report templates
  const reportTemplates = [
    "Daily Sales Report",
    "Stock Consumption Report", 
    "Stock Production Report",
    "Courier/Shipping Report",
    "Weekly Sales Analysis",
    "Monthly Inventory Turnover",
    "Monthly Profit & Loss",
    "Expiring Products Alert",
    "Customer Order History",
    "Tax Summary Report",
    "Employee Performance",
    "Vendor Payment Summary"
  ];

  // Empty reports array (removed demo data)
  const reports = [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <div className="flex items-center gap-2">
          <Button className="gap-1" variant="outline">
            <Calendar className="h-4 w-4" />
            Schedule
          </Button>
          <Button className="gap-1">
            <FilePlus className="h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Available report types</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generated Today</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Daily reports</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Reports</CardTitle>
            <Calendar className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Auto-generated</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custom Reports</CardTitle>
            <BarChart className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">User-defined</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-12">
        <Card className="card-hover md:col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>Report Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reportTemplates.map((template, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-muted-foreground mr-2" />
                    <span>{template}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <FilePlus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover md:col-span-8 lg:col-span-9">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Recent Reports</CardTitle>
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="inventory">Inventory</SelectItem>
                <SelectItem value="shipping">Shipping</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Last Generated</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.length > 0 ? (
                    reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.name}</TableCell>
                        <TableCell>{report.type}</TableCell>
                        <TableCell>{report.lastGenerated}</TableCell>
                        <TableCell>{report.frequency}</TableCell>
                        <TableCell>{report.format}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <FileDown className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Printer className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No reports generated yet. Click "Generate Report" to create one.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
