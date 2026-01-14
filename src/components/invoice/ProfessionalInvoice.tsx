
import React from "react";
import { Order } from "@/types/pos";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { useCloudData } from "@/context/CloudDataContext";
import { sendInvoiceViaWhatsApp, createPrintableInvoice, prepareWhatsAppInvoice } from "@/services/WhatsAppService";
import { generateInvoiceNumber, getDefaultBillingTemplate } from "@/services/InvoiceService";
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
  const { billingTemplate } = useCloudData();
  const orderDate = new Date(order.order_date || order.created_at);
  const invoiceDate = format(orderDate, "MMM dd, yyyy");
  const invoiceNumber = generateInvoiceNumber(order.id);
  
  const template = billingTemplate || getDefaultBillingTemplate();
  const customerName = order.customer_name && order.customer_name.trim() ? order.customer_name : "";
  
  const handlePrint = () => {
    window.print();
    toast({ title: "Printing", description: "Sending invoice to printer..." });
  };
  
  const handleWhatsAppShare = async () => {
    toast({ title: "Preparing Invoice", description: "Generating and storing invoice for WhatsApp..." });
    
    try {
      // Prepare invoice for WhatsApp (generates PDF, stores in Supabase, creates signed URL)
      const prepareResult = await prepareWhatsAppInvoice(order.id, template);
      
      if (prepareResult.success) {
        console.log("[ProfessionalInvoice] Invoice prepared successfully:", prepareResult);
        toast({
          title: "Invoice Ready",
          description: `Invoice ${prepareResult.invoice_id} prepared for WhatsApp delivery`,
        });
      } else {
        console.warn("[ProfessionalInvoice] Invoice preparation failed:", prepareResult.error);
      }
    } catch (error) {
      console.error("[ProfessionalInvoice] Error preparing invoice:", error);
      // Continue with text-only sharing even if preparation fails
    }
    
    // Open WhatsApp with pre-filled message
    sendInvoiceViaWhatsApp(order, template);
    toast({ title: "WhatsApp Sharing", description: "Opening WhatsApp to share invoice..." });
  };
  
  const handleEmailShare = async () => {
    if (!order.customer_email) {
      toast({ title: "Email Required", description: "Customer email is not available", variant: "destructive" });
      return;
    }
    const subject = `Invoice ${invoiceNumber} - ${template.shopName}`;
    const orderTimeStr = format(orderDate, "MMM dd, yyyy 'at' h:mm a");
    const body = `Hello${customerName ? " " + customerName : ""},\n\nPlease find attached your invoice ${invoiceNumber} for your purchase on ${orderTimeStr}.\n\nThank you for your business!\n\nRegards,\n${template.shopName}`;
    await createPrintableInvoice(order, template);
    setTimeout(() => {
      window.location.href = `mailto:${order.customer_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }, 500);
    toast({ title: "Email Sharing", description: "Opening email client..." });
  };
  
  const handleDownload = async () => {
    const printWindow = await createPrintableInvoice(order, template);
    if (!printWindow) {
      toast({ title: "Download Failed", description: "Could not create download. Please check popup blockers.", variant: "destructive" });
      return;
    }
    toast({ title: "Download Started", description: "Your PDF is being prepared for download" });
  };
  
  return (
    <div className="bg-white p-6 max-w-4xl mx-auto font-sans print:p-0">
      <InvoiceControls onPrint={handlePrint} onDownload={handleDownload} onShare={handleWhatsAppShare} onEmail={handleEmailShare} onClose={onClose} />
      <div className="border border-gray-200 p-8 rounded-lg print:border-0">
        <InvoiceHeader 
          shopName={template.shopName}
          address={template.address}
          phone={template.phone}
          gstNumber={template.gstNumber}
          logoUrl={template.logoUrl}
          invoiceNumber={invoiceNumber} 
          invoiceDate={invoiceDate} 
          paymentStatus={order.payment_status || "Paid"} 
        />
        <CustomerInfo customerName={customerName} customerPhone={order.customer_phone} customerEmail={order.customer_email} shippingAddress={order.shipping_address} />
        <InvoiceItems items={order.items} />
        <InvoiceTotals subtotal={order.subtotal || 0} total={order.total} paid={order.payment_status === "Paid" ? order.total : 0} />
        <InvoiceFooter footerText={template.footerText} />
      </div>
    </div>
  );
};

export default ProfessionalInvoice;
