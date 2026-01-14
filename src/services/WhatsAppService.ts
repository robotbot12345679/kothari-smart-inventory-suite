import { BillingTemplate } from "@/context/CloudDataContext";
import { supabase } from "@/integrations/supabase/client";

export { createPrintableInvoice } from "./InvoiceService";

/**
 * Prepare invoice for WhatsApp delivery
 * Generates PDF, stores in Supabase Storage, and creates signed URL
 * Returns the prepared invoice data with signed URL
 */
export const prepareWhatsAppInvoice = async (
  orderId: string,
  billingTemplate: BillingTemplate
): Promise<{
  success: boolean;
  invoice_id?: string;
  whatsapp_status?: string;
  signed_url?: string;
  signed_url_expires_at?: string;
  error?: string;
}> => {
  try {
    console.log(`[WhatsAppService] Preparing invoice for order: ${orderId}`);
    
    const { data, error } = await supabase.functions.invoke("prepare-whatsapp-invoice", {
      body: {
        order_id: orderId,
        billing_template: billingTemplate,
      },
    });

    if (error) {
      console.error("[WhatsAppService] Edge function error:", error);
      return {
        success: false,
        error: error.message || "Failed to prepare invoice",
      };
    }

    if (!data?.success) {
      console.error("[WhatsAppService] Preparation failed:", data?.error);
      return {
        success: false,
        error: data?.error || "Failed to prepare invoice",
      };
    }

    console.log("[WhatsAppService] Invoice prepared successfully:", data);
    return {
      success: true,
      invoice_id: data.invoice_id,
      whatsapp_status: data.whatsapp_status,
      signed_url: data.signed_url,
      signed_url_expires_at: data.signed_url_expires_at,
    };
  } catch (error) {
    console.error("[WhatsAppService] Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unexpected error occurred",
    };
  }
};

/**
 * Send invoice via WhatsApp (opens WhatsApp with pre-filled message)
 * This is the existing functionality - opens WhatsApp Web/App
 */
export const sendInvoiceViaWhatsApp = (
  order: any,
  billingTemplate: BillingTemplate,
  phoneNumber: string = "+91 75677 00090"
) => {
  const formattedPhone = phoneNumber.replace(/\s+/g, "");
  const orderDate = new Date(order.orderDate);
  const formattedDate = orderDate.toLocaleDateString();
  const formattedTime = orderDate.toLocaleTimeString();
  
  const paymentStatus = order.paymentStatus || "Paid";
  let paymentInfo = "";
  if (paymentStatus !== "Paid") {
    paymentInfo = `\n\nTo pay for this invoice, please use our payment link: https://pay.example.com/invoice/${order.id}?amount=${order.total.toFixed(2)}`;
  }
  
  const customerName = order.customerName && order.customerName.trim() ? order.customerName : "";
  const greeting = customerName ? `Dear ${customerName},` : "Hello,";
  
  const message = `${greeting}

Thank you for your purchase from ${billingTemplate.shopName} on ${formattedDate} at ${formattedTime}.

*Order Summary:*
Order #: ${order.id.replace("ORD", "")}
Total: ₹${order.total.toFixed(2)}

*Items:*
${order.items.map(item => `- ${item.name} (${item.quantity}x) - ₹${(item.price * item.quantity).toFixed(2)}`).join('\n')}
${paymentInfo}

For any questions, please contact us at ${billingTemplate.phone}.

Thank you for your business!
${billingTemplate.shopName}`;
  
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`;
  
  try {
    window.open(whatsappUrl, "_blank");
  } catch (error) {
    console.error("Error sharing invoice:", error);
  }
};

/**
 * PLACEHOLDER: Future WhatsApp Business API Integration
 * 
 * This function will send the invoice directly via WhatsApp Business API
 * when API access is provided. Currently NOT implemented.
 * 
 * When implemented, it will:
 * 1. Use the stored signed URL from prepareWhatsAppInvoice
 * 2. Send via WhatsApp Business API with Utility template (Document header)
 * 3. Update invoice_metadata.whatsapp_status to 'sent' or 'failed'
 * 
 * @param invoiceId - The invoice ID to send
 * @returns Promise with send status
 */
export const sendWhatsAppInvoiceViaAPI = async (
  _invoiceId: string
): Promise<{ success: boolean; error?: string }> => {
  // TODO: Implement when WhatsApp Business API access is provided
  // This is a placeholder that will be replaced with actual API integration
  console.warn("[WhatsAppService] sendWhatsAppInvoiceViaAPI is not yet implemented. Awaiting WhatsApp API access.");
  return {
    success: false,
    error: "WhatsApp API integration not yet available. Please use the manual sharing option.",
  };
};
