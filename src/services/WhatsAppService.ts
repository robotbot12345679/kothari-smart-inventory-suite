
import { BillingTemplate } from "@/context/CloudDataContext";

export { createPrintableInvoice } from "./InvoiceService";

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
