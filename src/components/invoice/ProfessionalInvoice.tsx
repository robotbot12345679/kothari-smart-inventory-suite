
import React from "react";
import { Order } from "@/types/pos";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { useCloudData } from "@/context/CloudDataContext";
import { sendInvoiceViaWhatsApp, createPrintableInvoice } from "@/services/WhatsAppService";
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
  
  const handleWhatsAppShare = () => {
    sendInvoiceViaWhatsApp(order, template);
    toast({ title: "WhatsApp Sharing", description: "Opening WhatsApp to share invoice..." });
  };
  
  const handleEmailShare = () => {
    if (!order.customer_email) {
      toast({ title: "Email Required", description: "Customer email is not available", variant: "destructive" });
      return;
    }
    const subject = `Invoice ${invoiceNumber} - ${template.shopName}`;
    const orderTimeStr = format(orderDate, "MMM dd, yyyy 'at' h:mm a");
    const body = `Hello${customerName ? " " + customerName : ""},\n\nPlease find attached your invoice ${invoiceNumber} for your purchase on ${orderTimeStr}.\n\nThank you for your business!\n\nRegards,\n${template.shopName}`;
    createPrintableInvoice(order, template);
    setTimeout(() => {
      window.location.href = `mailto:${order.customer_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }, 500);
    toast({ title: "Email Sharing", description: "Opening email client..." });
  };
  
  const handleDownload = () => {
    const printWindow = createPrintableInvoice(order, template);
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
        <InvoiceHeader billingTemplate={template} invoiceNumber={invoiceNumber} invoiceDate={invoiceDate} paymentStatus={order.payment_status || "Paid"} />
        <CustomerInfo customerName={customerName} customerPhone={order.customer_phone} customerEmail={order.customer_email} shippingAddress={order.shipping_address} />
        <InvoiceItems items={order.items} />
        <InvoiceTotals subtotal={order.subtotal || 0} total={order.total} paid={order.payment_status === "Paid" ? order.total : 0} />
        <InvoiceFooter billingTemplate={template} />
      </div>
    </div>
  );
};

export default ProfessionalInvoice;
