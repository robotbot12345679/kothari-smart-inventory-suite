
import React from "react";
import { Order } from "@/types/pos";
import { format } from "date-fns";
import { Share } from "lucide-react";
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
  const invoiceNumber = `00000${order.id.replace('ORD', '')}`.slice(-7);
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleShare = () => {
    sendInvoiceViaWhatsApp(order);
  };
  
  return (
    <div className="bg-white p-8 max-w-4xl mx-auto font-sans">
      {/* Print controls - hide when printing */}
      <div className="print:hidden flex justify-end space-x-2 mb-4">
        <Button variant="outline" onClick={handlePrint}>
          Print Invoice
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
      
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-start">
          <img 
            src="/lovable-uploads/00972147-e824-453d-8b6d-dc558e1cb95e.png" 
            alt="Kothari's Dry Fruits" 
            className="w-24 h-24 mr-4"
          />
          <div>
            <h2 className="text-xl font-bold">Kothari's Dry Fruits & More</h2>
            <p className="text-gray-600">Located on ground floor on the front side</p>
            <p className="text-gray-600">and beside the Poojara showroom</p>
            <p className="text-gray-600">89 Science City Road</p>
            <p className="text-gray-600">Ahmedabad, Gujarat 380060</p>
            <p className="text-gray-600">India</p>
            <p className="text-gray-600">ashokkothari@gmail.com</p>
            <p className="text-gray-600">Phone: +91 75677 00090</p>
          </div>
        </div>
        
        <div className="text-right">
          <h1 className="text-2xl font-bold">Invoice #{invoiceNumber}</h1>
          <p className="text-gray-600">Invoice for order: #{order.id}</p>
          <p className="text-gray-600">Issue Date: {invoiceDate}</p>
          <p className="text-gray-600">Due Date: {dueDate}</p>
          <div className="mt-2">
            <span className="bg-green-500 text-white px-3 py-1 rounded-md font-semibold">PAID</span>
          </div>
        </div>
      </div>
      
      {/* Customer Information */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-gray-500 font-medium mb-2">Bill to:</h3>
          <p className="font-semibold">{order.customerName || "Guest Customer"}</p>
          {order.shippingAddress && (
            <>
              <p>{order.shippingAddress}</p>
            </>
          )}
          {!order.shippingAddress && (
            <>
              <p className="text-gray-600">Jay Tower</p>
              <p className="text-gray-600">Ahmedabad, Gujarat 380052</p>
              <p className="text-gray-600">India</p>
            </>
          )}
        </div>
        <div>
          <h3 className="text-gray-500 font-medium mb-2">Additional Customer Info:</h3>
          {order.customerEmail && <p className="text-gray-600">{order.customerEmail}</p>}
          {order.customerPhone && <p className="text-gray-600">Phone: {order.customerPhone}</p>}
          {!order.customerEmail && <p className="text-gray-600">spu0906@gmail.com</p>}
          {!order.customerPhone && <p className="text-gray-600">Phone: 9429294529</p>}
        </div>
      </div>
      
      {/* Items Table */}
      <div className="mb-8">
        <div className="bg-blue-50 p-4 grid grid-cols-12 font-semibold text-gray-700">
          <div className="col-span-6">Product or Service</div>
          <div className="col-span-2 text-center">Quantity</div>
          <div className="col-span-2 text-right">Price</div>
          <div className="col-span-2 text-right">Line Total</div>
        </div>
        
        {order.items.map((item, index) => (
          <div key={index} className="p-4 grid grid-cols-12 border-b">
            <div className="col-span-6">
              <p className="font-semibold">{item.name}</p>
              <p className="text-gray-500 text-sm">SKU: 36421537{index}135191, weight: {item.weight}{item.unit}</p>
            </div>
            <div className="col-span-2 text-center">
              {item.quantity}
            </div>
            <div className="col-span-2 text-right">
              ₹{item.price.toFixed(2)}
            </div>
            <div className="col-span-2 text-right font-semibold">
              ₹{(item.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
      
      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-1/2">
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold">₹{order.subtotal.toFixed(2)}</span>
          </div>
          
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Tax breakdown</h4>
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Tax (0%)</span>
              <span>₹0.00</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span className="text-gray-600">Tax total</span>
              <span>₹0.00</span>
            </div>
          </div>
          
          <div className="flex justify-between py-2 mt-2">
            <span className="font-semibold">Invoice Total</span>
            <span className="font-semibold">₹{order.total.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Amount Paid</span>
            <span>₹{order.total.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between py-2 bg-blue-50 px-4 rounded-md mt-2">
            <span className="font-bold">Balance Due</span>
            <span className="font-bold">₹0.00</span>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-12 text-center text-gray-500 border-t pt-4">
        <p>Thank you for your business!</p>
        <p className="text-sm">For any inquiries, please contact us at +91 75677 00090 or ashokkothari@gmail.com</p>
      </div>
    </div>
  );
};

export default ProfessionalInvoice;
