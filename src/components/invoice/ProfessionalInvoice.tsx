
import React from "react";
import { Order } from "@/types/pos";
import { format } from "date-fns";
import { Share, Printer, Download, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendInvoiceViaWhatsApp } from "@/services/WhatsAppService";
import { useToast } from "@/components/ui/use-toast";

interface ProfessionalInvoiceProps {
  order: Order;
  onClose?: () => void;
}

const ProfessionalInvoice = ({ order, onClose }: ProfessionalInvoiceProps) => {
  const { toast } = useToast();
  const orderDate = new Date(order.orderDate);
  const invoiceDate = format(orderDate, "MMM dd, yyyy");
  const dueDate = format(new Date(orderDate.setDate(orderDate.getDate() + 30)), "MMM dd, yyyy");
  const invoiceNumber = `INV-${order.id.replace('ORD', '')}`;
  
  // Get billing template from localStorage or use defaults
  const storedTemplate = localStorage.getItem("billingTemplate");
  const billingTemplate = storedTemplate ? JSON.parse(storedTemplate) : {
    shopName: "Kothari's Dry Fruits & More",
    address: "89, Sukan Mall, Nr. CIMS Hospital, Science City Road, Ahmedabad, Gujarat 380060",
    phone: "+91 75677 00090",
    gstNumber: "",
    logoUrl: "/lovable-uploads/6ab04e40-2860-4562-bace-e35da6383972.png",
    footerText: ["Thank you for shopping with us!", "Visit again soon!"]
  };
  
  const handlePrint = () => {
    window.print();
    toast({
      title: "Printing",
      description: "Sending invoice to printer..."
    });
  };
  
  const handleShare = () => {
    sendInvoiceViaWhatsApp(order, order.customerPhone || "+91 75677 00090");
    toast({
      title: "WhatsApp Sharing",
      description: "Opening WhatsApp to share invoice..."
    });
  };
  
  const handleEmailShare = () => {
    if (!order.customerEmail) {
      toast({
        title: "Email Required",
        description: "Customer email is not available",
        variant: "destructive"
      });
      return;
    }

    const subject = `Invoice #${invoiceNumber} - ${billingTemplate.shopName}`;
    const body = `Dear ${order.customerName},\n\nPlease find attached your invoice #${invoiceNumber} for your recent purchase.\n\nThank you for your business!\n\nRegards,\n${billingTemplate.shopName}`;
    
    window.location.href = `mailto:${order.customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    toast({
      title: "Email Sharing",
      description: "Opening email client..."
    });
  };
  
  const handleDownload = () => {
    // Create a printable version for download
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Download Failed",
        description: "Could not create download. Please check popup blockers.",
        variant: "destructive"
      });
      return;
    }
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoiceNumber}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            color: #333;
            line-height: 1.5;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .invoice-container {
            border: 1px solid #e0e0e0;
            padding: 40px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
          }
          .logo {
            max-width: 150px;
            max-height: 80px;
          }
          .invoice-title {
            font-size: 28px;
            color: #333;
            margin-bottom: 5px;
          }
          .invoice-number {
            font-size: 16px;
            color: #666;
          }
          .dates {
            margin-top: 20px;
            font-size: 14px;
            color: #666;
          }
          .status-badge {
            display: inline-block;
            background-color: #e6f7e6;
            color: #2e7d32;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            margin-top: 10px;
          }
          .client-info {
            margin: 30px 0;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #555;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 30px;
          }
          th {
            background-color: #f9f9f9;
            text-align: left;
            padding: 12px;
            border-bottom: 2px solid #e0e0e0;
            color: #555;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #e0e0e0;
          }
          .amount-col {
            text-align: right;
          }
          .item-name {
            font-weight: 500;
          }
          .item-description {
            font-size: 14px;
            color: #777;
          }
          .totals {
            margin-top: 30px;
            display: flex;
            justify-content: flex-end;
          }
          .totals-table {
            width: 350px;
          }
          .totals-table td {
            padding: 8px 12px;
            border: none;
          }
          .total-row {
            font-weight: bold;
            font-size: 18px;
            border-top: 2px solid #e0e0e0;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 14px;
            color: #777;
            border-top: 1px solid #e0e0e0;
            padding-top: 20px;
          }
          @media print {
            body {
              padding: 0;
            }
            .invoice-container {
              border: none;
              box-shadow: none;
              padding: 0;
            }
          }
        </style>
      </head>
      <body onload="setTimeout(function() { window.print(); window.close(); }, 500);">
        <div class="invoice-container">
          <div class="header">
            <div>
              <img class="logo" src="${billingTemplate.logoUrl}" alt="${billingTemplate.shopName}">
              <div style="margin-top: 10px;">
                <div>${billingTemplate.shopName}</div>
                <div style="font-size: 14px; color: #666;">${billingTemplate.address}</div>
                <div style="font-size: 14px; color: #666;">${billingTemplate.phone}</div>
                ${billingTemplate.gstNumber ? `<div style="font-size: 14px; color: #666;">GSTIN: ${billingTemplate.gstNumber}</div>` : ''}
              </div>
            </div>
            <div style="text-align: right;">
              <div class="invoice-title">INVOICE</div>
              <div class="invoice-number"># ${invoiceNumber}</div>
              <div class="dates">
                <div>Issue Date: ${invoiceDate}</div>
                <div>Due Date: ${dueDate}</div>
              </div>
              <div class="status-badge">PAID</div>
            </div>
          </div>
          
          <div class="client-info">
            <div class="section-title">Bill To:</div>
            <div style="font-weight: 500;">${order.customerName || "Guest Customer"}</div>
            ${order.customerPhone ? `<div>Phone: ${order.customerPhone}</div>` : ''}
            ${order.customerEmail ? `<div>Email: ${order.customerEmail}</div>` : ''}
            ${order.shippingAddress ? `<div>${order.shippingAddress}</div>` : ''}
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th class="amount-col">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>
                    <div class="item-name">${item.name}</div>
                    <div class="item-description">${item.weight}${item.unit}</div>
                  </td>
                  <td>${item.quantity} ${item.quantity > 1 ? "items" : "item"}</td>
                  <td>₹${item.price.toFixed(2)}</td>
                  <td class="amount-col">₹${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <table class="totals-table">
              <tr>
                <td>Subtotal</td>
                <td class="amount-col">₹${order.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Discount</td>
                <td class="amount-col">₹0.00</td>
              </tr>
              <tr class="total-row">
                <td>Total</td>
                <td class="amount-col">₹${order.total.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Amount Paid</td>
                <td class="amount-col">₹${order.total.toFixed(2)}</td>
              </tr>
            </table>
          </div>
          
          <div class="footer">
            ${billingTemplate.footerText.map(line => `<p>${line}</p>`).join('')}
          </div>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    
    toast({
      title: "Download Started",
      description: "Your PDF is being prepared for download"
    });
  };
  
  return (
    <div className="bg-white p-6 max-w-4xl mx-auto font-sans print:p-0">
      {/* Print controls - hide when printing */}
      <div className="print:hidden flex justify-end space-x-2 mb-6">
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" /> Print Invoice
        </Button>
        <Button variant="outline" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" /> Download PDF
        </Button>
        <Button onClick={handleShare}>
          <Share className="h-4 w-4 mr-2" /> Share via WhatsApp
        </Button>
        <Button variant="outline" onClick={handleEmailShare}>
          <Mail className="h-4 w-4 mr-2" /> Share via Email
        </Button>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>
      
      {/* Invoice Template based on Wix template */}
      <div className="border border-gray-200 p-8 rounded-lg print:border-0">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex flex-col">
            <img 
              src={billingTemplate.logoUrl} 
              alt={billingTemplate.shopName} 
              className="w-24 h-24 object-contain mb-2"
            />
            <h2 className="text-xl font-bold">{billingTemplate.shopName}</h2>
            <p className="text-gray-600 mt-2">{billingTemplate.address}</p>
            <p className="text-gray-600">{billingTemplate.phone}</p>
            {billingTemplate.gstNumber && <p className="text-gray-600">GSTIN: {billingTemplate.gstNumber}</p>}
          </div>
          
          <div className="text-right">
            <h1 className="text-3xl font-bold text-gray-800">INVOICE</h1>
            <p className="text-gray-600 mt-2"># {invoiceNumber}</p>
            <div className="mt-6 text-gray-600">
              <p>Issue Date: {invoiceDate}</p>
              <p>Due Date: {dueDate}</p>
              <div className="mt-2">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">PAID</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bill To Section */}
        <div className="mb-8">
          <h3 className="text-gray-800 font-semibold mb-2">Bill To:</h3>
          <p className="font-medium text-gray-900">{order.customerName || "Guest Customer"}</p>
          {order.customerPhone && <p className="text-gray-600">Phone: {order.customerPhone}</p>}
          {order.customerEmail && <p className="text-gray-600">Email: {order.customerEmail}</p>}
          {order.shippingAddress && <p className="text-gray-600">{order.shippingAddress}</p>}
        </div>
        
        {/* Items Table */}
        <div className="mb-8 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left text-gray-600 font-medium">Item</th>
                <th className="py-3 px-4 text-center text-gray-600 font-medium">Quantity</th>
                <th className="py-3 px-4 text-right text-gray-600 font-medium">Price</th>
                <th className="py-3 px-4 text-right text-gray-600 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-4 px-4">
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.weight}{item.unit}
                    </p>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {item.quantity} {item.quantity > 1 ? "items" : "item"}
                  </td>
                  <td className="py-4 px-4 text-right">
                    ₹{item.price.toFixed(2)}
                  </td>
                  <td className="py-4 px-4 text-right font-medium">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Totals */}
        <div className="border-t border-gray-200 pt-4 mb-8">
          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Discount</span>
                <span>₹0.00</span>
              </div>
              <div className="flex justify-between py-3 font-bold text-lg">
                <span>Total</span>
                <span>₹{order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 text-green-600">
                <span>Amount Paid</span>
                <span>₹{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Notes */}
        <div className="mt-8 text-center border-t border-gray-200 pt-6">
          {billingTemplate.footerText.map((line, index) => (
            <p key={index} className={index === 0 ? "text-gray-600 font-medium" : "text-gray-500 text-sm mt-1"}>
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalInvoice;
