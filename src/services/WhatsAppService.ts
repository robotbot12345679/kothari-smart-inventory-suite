
export const sendInvoiceViaWhatsApp = (
  order: any,
  phoneNumber: string = "+91 75677 00090"
) => {
  // Format phone number by removing spaces
  const formattedPhone = phoneNumber.replace(/\s+/g, "");
  
  // Create invoice URL based on order ID
  const invoiceUrl = `https://invoice.example.com/view/${order.id}`;
  
  // Create WhatsApp message
  const message = `Dear ${order.customerName || "Customer"},\n\nYour order #${order.id} has been processed. View your invoice here: ${invoiceUrl}\n\nThank you for shopping with Kothari's Dry Fruits!\n\nRegards,\nKothari's Dry Fruits`;
  
  // Encode the message for WhatsApp
  const encodedMessage = encodeURIComponent(message);
  
  // Create WhatsApp API URL
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`;
  
  // Open WhatsApp in a new window
  window.open(whatsappUrl, "_blank");
};
