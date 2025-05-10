
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
  const orderDate = new Date(order.orderDate);
  const invoiceDate = format(orderDate, "MMM dd, yyyy");
  const dueDate = format(new Date(new Date(order.orderDate).setDate(new Date(order.orderDate).getDate() + 30)), "MMM dd, yyyy");
  const invoiceNumber = generateInvoiceNumber(order.id);
  
  // Get billing template from localStorage or use defaults
  const billingTemplate = getBillingTemplate();
  
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

    const subject = `Invoice ${invoiceNumber} - ${billingTemplate.shopName}`;
    const body = `Dear ${order.customerName},\n\nPlease find attached your invoice ${invoiceNumber} for your recent purchase.\n\nThank you for your business!\n\nRegards,\n${billingTemplate.shopName}`;
    
    // First generate the PDF
    createPrintableInvoice(order);
    
    // Then open email client
    setTimeout(() => {
      window.location.href = `mailto:${order.customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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
          dueDate={dueDate}
        />
        
        {/* Bill To Section */}
        <CustomerInfo 
          customerName={order.customerName || ""}
          customerPhone={order.customerPhone}
          customerEmail={order.customerEmail}
          shippingAddress={order.shippingAddress}
        />
        
        {/* Items Table */}
        <InvoiceItems items={order.items} />
        
        {/* Totals */}
        <InvoiceTotals 
          subtotal={order.subtotal}
          total={order.total}
        />
        
        {/* Footer Notes */}
        <InvoiceFooter footerText={billingTemplate.footerText} />
      </div>
    </div>
  );
};

export default ProfessionalInvoice;
