
import { createPrintableInvoice } from "./InvoiceService";

export const sendInvoiceViaWhatsApp = (
  order: any,
  phoneNumber: string = "+91 75677 00090"
) => {
  // Get billing template from localStorage or use defaults
  const storedTemplate = localStorage.getItem("billingTemplate");
  const billingTemplate = storedTemplate ? JSON.parse(storedTemplate) : {
    shopName: "Kothari's Dry Fruits & More",
    address: "89, Sukan Mall, Nr. CIMS Hospital, Science City Road, Ahmedabad, Gujarat 380060",
    phone: "+91 75677 00090"
  };

  // Format phone number by removing spaces
  const formattedPhone = phoneNumber.replace(/\s+/g, "");
  
  // Create invoice message
  const message = `Dear ${order.customerName || "Customer"},

Thank you for your order from ${billingTemplate.shopName}!

*Order Summary:*
Order #: ${order.id}
Total: ₹${order.total.toFixed(2)}
Date: ${new Date(order.orderDate).toLocaleDateString()}

*Items:*
${order.items.map(item => `- ${item.name} (${item.quantity}x) - ₹${(item.price * item.quantity).toFixed(2)}`).join('\n')}

For any questions, please contact us at ${billingTemplate.phone}.

Thank you for your business!
${billingTemplate.shopName}

Note: Please see the attached invoice PDF for your records.`;
  
  // Encode the message for WhatsApp
  const encodedMessage = encodeURIComponent(message);
  
  // Create WhatsApp API URL
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`;
  
  // First, generate the PDF invoice in a new window
  createPrintableInvoice(order);
  
  // Open WhatsApp in a new window with the message
  setTimeout(() => {
    window.open(whatsappUrl, "_blank");
  }, 500);
};

// Re-export createPrintableInvoice to fix the import issue in BillsReport.tsx
export { createPrintableInvoice };
