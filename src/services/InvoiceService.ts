import { Order } from "@/types/pos";
import { BillingTemplate } from "@/context/CloudDataContext";
import { escapeHtml, escapeHtmlArray } from "@/lib/htmlUtils";

// Function to get default billing template
export const getDefaultBillingTemplate = (): BillingTemplate => {
  return {
    shopName: "Kothari's Dry Fruits & More",
    address: "89, Sukan Mall, Nr. CIMS Hospital, Science City Road, Ahmedabad, Gujarat 380060",
    phone: "+91 75677 00090",
    gstNumber: "",
    logoUrl: "/lovable-uploads/6ab04e40-2860-4562-bace-e35da6383972.png",
    footerText: ["Thank you for shopping with us!", "Visit again soon!"]
  };
};

// Function to generate simplified invoice number
export const generateInvoiceNumber = (orderId) => {
  // Remove any non-numeric characters and format as simple invoice number
  const numericPart = orderId.replace(/\D/g, '');
  return `INV${numericPart}`;
};

/**
 * Convert an image URL to a base64 data URL
 */
async function imageToBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      try {
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      } catch (e) {
        // If canvas is tainted, return original URL
        resolve(url);
      }
    };
    img.onerror = () => {
      // Return original URL if failed to load
      resolve(url);
    };
    img.src = url;
  });
}

// Function to create a printable window for invoice
export const createPrintableInvoice = async (order: Order, billingTemplate: BillingTemplate): Promise<Window | null> => {
  const invoiceNumber = generateInvoiceNumber(order.id);
  const orderDate = new Date(order.order_date);
  const invoiceDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(orderDate);
  
  // Use proper customer name handling
  const customerName = order.customer_name && order.customer_name.trim() ? order.customer_name : "";
  
  // Ensure we have the correct logo URL from the billing template
  let logoUrl = billingTemplate.logoUrl || "/lovable-uploads/6ab04e40-2860-4562-bace-e35da6383972.png";
  
  // Convert relative URL to absolute URL for base64 conversion
  if (logoUrl.startsWith('/')) {
    logoUrl = window.location.origin + logoUrl;
  }
  
  // Convert logo to base64 so it works in print/PDF
  let logoBase64 = logoUrl;
  try {
    logoBase64 = await imageToBase64(logoUrl);
  } catch (e) {
    console.warn('Failed to convert logo to base64, using original URL');
  }
  
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  
  if (!printWindow) {
    console.error('Failed to open print window. Check popup blocker settings.');
    return null;
  }
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice ${escapeHtml(invoiceNumber)}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
          line-height: 1.6;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #fff;
        }
        .invoice-container {
          border: 1px solid #e0e0e0;
          padding: 40px;
          background-color: #fff;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          flex-wrap: wrap;
          gap: 20px;
        }
        .header-left {
          flex: 1;
          min-width: 200px;
        }
        .header-right {
          text-align: right;
          min-width: 200px;
        }
        .logo {
          max-width: 150px;
          max-height: 80px;
          display: block;
          margin-bottom: 10px;
        }
        .shop-name {
          font-size: 18px;
          font-weight: bold;
          color: #333;
          margin-bottom: 5px;
        }
        .shop-details {
          font-size: 13px;
          color: #666;
          line-height: 1.5;
        }
        .invoice-title {
          font-size: 28px;
          font-weight: bold;
          color: #333;
          margin-bottom: 5px;
        }
        .invoice-number {
          font-size: 16px;
          color: #666;
          margin-bottom: 15px;
        }
        .dates {
          font-size: 14px;
          color: #666;
          margin-bottom: 10px;
        }
        .status-badge {
          display: inline-block;
          background-color: #d4edda;
          color: #155724;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .unpaid-badge {
          background-color: #fff3cd;
          color: #856404;
        }
        .client-info {
          margin: 30px 0;
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 8px;
        }
        .section-title {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #555;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .client-name {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 5px;
        }
        .client-details {
          font-size: 14px;
          color: #666;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 30px;
        }
        th {
          background-color: #f8f9fa;
          text-align: left;
          padding: 14px 12px;
          border-bottom: 2px solid #dee2e6;
          color: #495057;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        td {
          padding: 14px 12px;
          border-bottom: 1px solid #e9ecef;
          font-size: 14px;
          color: #333;
        }
        .amount-col {
          text-align: right;
        }
        .item-name {
          font-weight: 600;
          color: #333;
        }
        .item-description {
          font-size: 13px;
          color: #6c757d;
          margin-top: 3px;
        }
        .totals {
          margin-top: 30px;
          display: flex;
          justify-content: flex-end;
        }
        .totals-table {
          width: 320px;
          background-color: #f8f9fa;
          border-radius: 8px;
          overflow: hidden;
        }
        .totals-table td {
          padding: 12px 16px;
          border: none;
          font-size: 14px;
        }
        .totals-table tr:last-child td {
          border-top: 2px solid #dee2e6;
        }
        .total-row {
          font-weight: bold;
          font-size: 18px !important;
          background-color: #e9ecef;
        }
        .total-row td {
          padding: 16px !important;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 14px;
          color: #6c757d;
          border-top: 1px solid #e9ecef;
          padding-top: 20px;
        }
        .footer p {
          margin: 5px 0;
        }
        .payment-section {
          margin-top: 30px;
          padding: 20px;
          background-color: #fff3cd;
          border-radius: 8px;
          border: 1px solid #ffc107;
        }
        .payment-qr {
          text-align: center;
          margin-top: 15px;
        }
        .payment-qr img {
          max-width: 150px;
          border: 2px solid #dee2e6;
          border-radius: 8px;
          padding: 5px;
          background: white;
        }
        .payment-qr p {
          margin-top: 10px;
          font-weight: 600;
          color: #856404;
        }
        @media print {
          body {
            padding: 0;
            background-color: #fff;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .invoice-container {
            border: none;
            padding: 20px;
          }
          .client-info {
            background-color: #f8f9fa !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .status-badge {
            background-color: #d4edda !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .unpaid-badge {
            background-color: #fff3cd !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          th {
            background-color: #f8f9fa !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .totals-table {
            background-color: #f8f9fa !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .total-row {
            background-color: #e9ecef !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .payment-section {
            background-color: #fff3cd !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      </style>
    </head>
    <body onload="setTimeout(function() { window.print(); }, 500);">
      <div class="invoice-container">
        <div class="header">
          <div class="header-left">
            <img class="logo" src="${escapeHtml(logoBase64)}" alt="${escapeHtml(billingTemplate.shopName)}">
            <div class="shop-name">${escapeHtml(billingTemplate.shopName)}</div>
            <div class="shop-details">
              ${escapeHtml(billingTemplate.address)}<br>
              ${escapeHtml(billingTemplate.phone)}
              ${billingTemplate.gstNumber ? `<br>GSTIN: ${escapeHtml(billingTemplate.gstNumber)}` : ''}
            </div>
          </div>
          <div class="header-right">
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-number">${escapeHtml(invoiceNumber)}</div>
            <div class="dates">Date: ${escapeHtml(invoiceDate)}</div>
            <div class="status-badge ${order.payment_status !== 'Paid' ? 'unpaid-badge' : ''}">${escapeHtml(order.payment_status || 'PAID')}</div>
          </div>
        </div>
        
        <div class="client-info">
          <div class="section-title">Bill To</div>
          ${customerName ? `<div class="client-name">${escapeHtml(customerName)}</div>` : '<div class="client-name">Walk-in Customer</div>'}
          <div class="client-details">
            ${order.customer_phone ? `Phone: ${escapeHtml(order.customer_phone)}<br>` : ''}
            ${order.customer_email ? `Email: ${escapeHtml(order.customer_email)}<br>` : ''}
            ${order.shipping_address ? escapeHtml(order.shipping_address) : ''}
          </div>
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
                  <div class="item-name">${escapeHtml(item.name)}</div>
                  <div class="item-description">${escapeHtml(String(item.weight || ''))}${escapeHtml(item.unit || '')}</div>
                </td>
                <td>${escapeHtml(String(item.quantity))} ${item.quantity > 1 ? "items" : "item"}</td>
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
              <td class="amount-col">₹${(order.subtotal || 0).toFixed(2)}</td>
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
              <td class="amount-col">${order.payment_status === 'Paid' ? '₹' + order.total.toFixed(2) : '₹0.00'}</td>
            </tr>
            ${order.payment_status !== 'Paid' ? `
            <tr>
              <td>Balance Due</td>
              <td class="amount-col">₹${order.total.toFixed(2)}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        ${order.payment_status !== 'Paid' ? `
        <div class="payment-section">
          <div class="section-title">Payment Information</div>
          <p>Please scan the QR code below or use the payment link to complete your payment.</p>
          <div class="payment-qr">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=ashokkothari738@oksbi%26pn=KothariDryFruits%26am=${order.total}%26cu=INR" alt="UPI Payment QR Code">
            <p>UPI ID: ashokkothari738@oksbi</p>
          </div>
        </div>
        ` : ''}
        
        <div class="footer">
          ${escapeHtmlArray(billingTemplate.footerText).map(line => `<p>${line}</p>`).join('')}
        </div>
      </div>
    </body>
    </html>
  `);
  
  printWindow.document.close();
  return printWindow;
};
