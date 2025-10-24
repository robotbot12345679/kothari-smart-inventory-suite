
import React from "react";
import { Order } from "@/types/pos";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { sendInvoiceViaWhatsApp } from "@/services/WhatsAppService";
import { getBillingTemplate, createPrintableInvoice, generateInvoiceNumber } from "@/services/InvoiceService";
import InvoiceHeader from "./InvoiceHeader";
import CustomerInfo from "./CustomerInfo";
import InvoiceItems from "./InvoiceItems";
import InvoiceTotals from "./InvoiceTotals";
import InvoiceFooter from "./InvoiceFooter";
import InvoiceControls from "./InvoiceControls";

interface ProfessionalInvoiceProps {
  order: Order;
  onClose?: () => void;
}

const ProfessionalInvoice = ({ order, onClose }: ProfessionalInvoiceProps) => {
  const { toast } = useToast();
  const orderDate = new Date(order.order_date || order.created_at);
  const invoiceDate = format(orderDate, "MMM dd, yyyy");
  const invoiceNumber = generateInvoiceNumber(order.id);
  
  // Get billing template from localStorage or use defaults
  const billingTemplate = getBillingTemplate();
  
  // Use proper customer name handling
  const customerName = order.customer_name && order.customer_name.trim() ? order.customer_name : "";
  
  const handlePrint = () => {
    window.print();
    toast({
      title: "Printing",
      description: "Sending invoice to printer..."
    });
  };
  
  const handleShare = () => {
    sendInvoiceViaWhatsApp(order, order.customer_phone || "+91 75677 00090");
    toast({
      title: "WhatsApp Sharing",
      description: "Opening WhatsApp to share invoice..."
    });
  };
  
  const handleEmailShare = () => {
    if (!order.customer_email) {
      toast({
        title: "Email Required",
        description: "Customer email is not available",
        variant: "destructive"
      });
      return;
    }

    const subject = `Invoice ${invoiceNumber} - ${billingTemplate.shopName}`;
    const orderTimeStr = format(orderDate, "MMM dd, yyyy 'at' h:mm a");
    const body = `Hello${customerName ? " " + customerName : ""},\n\nPlease find attached your invoice ${invoiceNumber} for your purchase on ${orderTimeStr}.\n\nThank you for your business!\n\nRegards,\n${billingTemplate.shopName}`;
    
    // First generate the PDF
    createPrintableInvoice(order);
    
    // Then open email client
    setTimeout(() => {
      window.location.href = `mailto:${order.customer_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }, 500);

    toast({
      title: "Email Sharing",
      description: "Opening email client..."
    });
  };
  
  const handleDownload = () => {
    const printWindow = createPrintableInvoice(order);
    
    if (!printWindow) {
      toast({
        title: "Download Failed",
        description: "Could not create download. Please check popup blockers.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Download Started",
      description: "Your PDF is being prepared for download"
    });
  };
  
  return (
    <div className="bg-white p-6 max-w-4xl mx-auto font-sans print:p-0">
      {/* Print controls - hide when printing */}
      <InvoiceControls 
        onPrint={handlePrint}
        onDownload={handleDownload}
        onShare={handleShare}
        onEmail={handleEmailShare}
        onClose={onClose}
      />
      
      {/* Invoice Template based on Wix template */}
      <div className="border border-gray-200 p-8 rounded-lg print:border-0">
        {/* Header */}
        <InvoiceHeader 
          shopName={billingTemplate.shopName}
          address={billingTemplate.address}
          phone={billingTemplate.phone}
          gstNumber={billingTemplate.gstNumber}
          logoUrl={billingTemplate.logoUrl || ""}
          invoiceNumber={invoiceNumber}
          invoiceDate={invoiceDate}
          paymentStatus={order.payment_status || "Paid"}
        />
        
        {/* Bill To Section */}
        <CustomerInfo 
          customerName={customerName}
          customerPhone={order.customer_phone}
          customerEmail={order.customer_email}
          shippingAddress={order.shipping_address}
        />
        
        {/* Items Table */}
        <InvoiceItems items={order.items} />
        
        {/* Totals */}
        <InvoiceTotals 
          subtotal={order.subtotal || 0}
          total={order.total}
          paid={order.payment_status === "Paid" ? order.total : 0}
        />
        
        {/* Footer Notes */}
        <InvoiceFooter footerText={billingTemplate.footerText} />
      </div>
    </div>
  );
};

export default ProfessionalInvoice;
