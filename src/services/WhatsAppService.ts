
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
  
  // Create invoice message with purchase details and no due date
  const orderDate = new Date(order.orderDate);
  const formattedDate = orderDate.toLocaleDateString();
  const formattedTime = orderDate.toLocaleTimeString();
  
  // Create a payment link if the order is not paid yet
  const paymentStatus = order.paymentStatus || "Paid";
  let paymentInfo = "";
  if (paymentStatus !== "Paid") {
    paymentInfo = `\n\nTo pay for this invoice, please use our payment link: https://pay.example.com/invoice/${order.id}?amount=${order.total.toFixed(2)}`;
  }
  
  // Use proper customer name handling
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
  
  // Encode the message for WhatsApp
  const encodedMessage = encodeURIComponent(message);
  
  // Create WhatsApp API URL
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`;
  
  try {
    // Open WhatsApp in a new window
    window.open(whatsappUrl, "_blank");
    
    // Also open the PDF in a new tab for them to download/print
    createPrintableInvoice(order);
  } catch (error) {
    console.error("Error sharing invoice:", error);
  }
};

// Re-export createPrintableInvoice from InvoiceService for compatibility
export { createPrintableInvoice } from "./InvoiceService";
