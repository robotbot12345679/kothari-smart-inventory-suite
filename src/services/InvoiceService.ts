
import { Order } from "@/types/pos";

// Function to get default billing template
export const getDefaultBillingTemplate = () => {
  return {
    shopName: "Kothari's Dry Fruits & More",
    address: "89, Sukan Mall, Nr. CIMS Hospital, Science City Road, Ahmedabad, Gujarat 380060",
    phone: "+91 75677 00090",
    gstNumber: "",
    logoUrl: "/lovable-uploads/6ab04e40-2860-4562-bace-e35da6383972.png",
    footerText: ["Thank you for shopping with us!", "Visit again soon!"]
  };
};

// Function to get billing template from localStorage or use defaults
export const getBillingTemplate = () => {
  const storedTemplate = localStorage.getItem("billingTemplate");
  return storedTemplate ? JSON.parse(storedTemplate) : getDefaultBillingTemplate();
};

// Function to generate invoice number
export const generateInvoiceNumber = (orderId) => {
  if (!orderId) return "INV-0001";
  // Extract just the numeric part if it follows a pattern like 'ORD12345'
  const match = orderId.match(/[A-Za-z]+(\d+)/);
  return match ? `INV-${match[1]}` : `INV-${orderId.replace('ORD', '')}`;
};

// Function to create a printable window for invoice
export const createPrintableInvoice = (order: Order): Window | null => {
  const billingTemplate = getBillingTemplate();
  const invoiceNumber = generateInvoiceNumber(order.id);
  const orderDate = new Date(order.orderDate);
  const invoiceDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(orderDate);
  
  // Calculate due date (30 days from order date)
  const dueDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(new Date(order.orderDate).setDate(new Date(order.orderDate).getDate() + 30))
  );
  
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  
  if (!printWindow) {
    console.error('Failed to open print window. Check popup blocker settings.');
    return null;
  }
  
  // Ensure we have the correct logo URL from the billing template
  const logoUrl = billingTemplate.logoUrl || "/lovable-uploads/6ab04e40-2860-4562-bace-e35da6383972.png";
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoiceNumber}</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          color: #333;
          line-height: 1.5;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .invoice-container {
          border: 1px solid #e0e0e0;
          padding: 40px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
        }
        .logo {
          max-width: 150px;
          max-height: 80px;
        }
        .invoice-title {
          font-size: 28px;
          color: #333;
          margin-bottom: 5px;
        }
        .invoice-number {
          font-size: 16px;
          color: #666;
        }
        .dates {
          margin-top: 20px;
          font-size: 14px;
          color: #666;
        }
        .status-badge {
          display: inline-block;
          background-color: #e6f7e6;
          color: #2e7d32;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: bold;
          margin-top: 10px;
        }
        .client-info {
          margin: 30px 0;
        }
        .section-title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #555;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 30px;
        }
        th {
          background-color: #f9f9f9;
          text-align: left;
          padding: 12px;
          border-bottom: 2px solid #e0e0e0;
          color: #555;
        }
        td {
          padding: 12px;
          border-bottom: 1px solid #e0e0e0;
        }
        .amount-col {
          text-align: right;
        }
        .item-name {
          font-weight: 500;
        }
        .item-description {
          font-size: 14px;
          color: #777;
        }
        .totals {
          margin-top: 30px;
          display: flex;
          justify-content: flex-end;
        }
        .totals-table {
          width: 350px;
        }
        .totals-table td {
          padding: 8px 12px;
          border: none;
        }
        .total-row {
          font-weight: bold;
          font-size: 18px;
          border-top: 2px solid #e0e0e0;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 14px;
          color: #777;
          border-top: 1px solid #e0e0e0;
          padding-top: 20px;
        }
        @media print {
          body {
            padding: 0;
          }
          .invoice-container {
            border: none;
            box-shadow: none;
            padding: 0;
          }
        }
      </style>
    </head>
    <body onload="setTimeout(function() { window.print(); }, 500);">
      <div class="invoice-container">
        <div class="header">
          <div>
            <img class="logo" src="${logoUrl}" alt="${billingTemplate.shopName}">
            <div style="margin-top: 10px;">
              <div>${billingTemplate.shopName}</div>
              <div style="font-size: 14px; color: #666;">${billingTemplate.address}</div>
              <div style="font-size: 14px; color: #666;">${billingTemplate.phone}</div>
              ${billingTemplate.gstNumber ? `<div style="font-size: 14px; color: #666;">GSTIN: ${billingTemplate.gstNumber}</div>` : ''}
            </div>
          </div>
          <div style="text-align: right;">
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-number">${invoiceNumber}</div>
            <div class="dates">
              <div>Issue Date: ${invoiceDate}</div>
              <div>Due Date: ${dueDate}</div>
            </div>
            <div class="status-badge">PAID</div>
          </div>
        </div>
        
        <div class="client-info">
          <div class="section-title">Bill To:</div>
          <div style="font-weight: 500;">${order.customerName || "Guest Customer"}</div>
          ${order.customerPhone ? `<div>Phone: ${order.customerPhone}</div>` : ''}
          ${order.customerEmail ? `<div>Email: ${order.customerEmail}</div>` : ''}
          ${order.shippingAddress ? `<div>${order.shippingAddress}</div>` : ''}
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
              <th class="amount-col">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>
                  <div class="item-name">${item.name}</div>
                  <div class="item-description">${item.weight}${item.unit}</div>
                </td>
                <td>${item.quantity} ${item.quantity > 1 ? "items" : "item"}</td>
                <td>₹${item.price.toFixed(2)}</td>
                <td class="amount-col">₹${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="totals">
          <table class="totals-table">
            <tr>
              <td>Subtotal</td>
              <td class="amount-col">₹${order.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Discount</td>
              <td class="amount-col">₹0.00</td>
            </tr>
            <tr class="total-row">
              <td>Total</td>
              <td class="amount-col">₹${order.total.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Amount Paid</td>
              <td class="amount-col">₹${order.total.toFixed(2)}</td>
            </tr>
          </table>
        </div>
        
        <div class="footer">
          ${billingTemplate.footerText.map(line => `<p>${line}</p>`).join('')}
        </div>
      </div>
    </body>
    </html>
  `);
  
  printWindow.document.close();
  return printWindow;
};
