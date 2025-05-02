
import React from "react";
import { Order } from "@/types/pos";
import { format } from "date-fns";
import { Share, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendInvoiceViaWhatsApp } from "@/services/WhatsAppService";

interface ProfessionalInvoiceProps {
  order: Order;
  onClose?: () => void;
}

const ProfessionalInvoice = ({ order, onClose }: ProfessionalInvoiceProps) => {
  const orderDate = new Date(order.orderDate);
  const invoiceDate = format(orderDate, "MMM dd, yyyy");
  const dueDate = format(new Date(orderDate.setDate(orderDate.getDate() + 30)), "MMM dd, yyyy");
  const invoiceNumber = `INV-${order.id.replace('ORD', '')}`;
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleShare = () => {
    sendInvoiceViaWhatsApp(order, "+91 75677 00090");
  };
  
  return (
    <div className="bg-white p-6 max-w-4xl mx-auto font-sans print:p-0">
      {/* Print controls - hide when printing */}
      <div className="print:hidden flex justify-end space-x-2 mb-6">
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" /> Print Invoice
        </Button>
        <Button onClick={handleShare}>
          <Share className="h-4 w-4 mr-2" /> Share via WhatsApp
        </Button>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>
      
      {/* Invoice Template based on provided Wix template */}
      <div className="border border-gray-200 p-8 rounded-lg print:border-0">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex flex-col">
            <img 
              src="/lovable-uploads/ae24266c-004d-443e-8160-8559b829245d.png" 
              alt="Kothari's Dry Fruits" 
              className="w-24 h-24 object-contain mb-2"
            />
            <h2 className="text-xl font-bold">Kothari's Dry Fruits & More</h2>
            <p className="text-gray-600 mt-2">89, Sukan Mall, Nr. CIMS Hospital,</p>
            <p className="text-gray-600">Science City Road, Ahmedabad, Gujarat 380060</p>
            <p className="text-gray-600">+91 75677 00090</p>
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
          <p className="text-gray-600 font-medium">Thank you for your business!</p>
          <p className="text-gray-500 text-sm mt-1">
            For any questions about this invoice, please contact us at +91 75677 00090
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalInvoice;
