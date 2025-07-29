import { Order } from "@/types/pos";
import { getBillingTemplate, generateInvoiceNumber } from "@/services/InvoiceService";
import { format } from "date-fns";

/**
 * Generate PDF content as a blob and download it directly
 * @param order Order data for the invoice
 * @returns Promise<void>
 */
export function downloadInvoicePDF(order: Order): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const billingTemplate = getBillingTemplate();
      const invoiceNumber = generateInvoiceNumber(order.id);
      const orderDate = new Date(order.orderDate);
      const invoiceDate = format(orderDate, "MMM dd, yyyy");
      
      // Use proper customer name handling
      const customerName = order.customerName && order.customerName.trim() ? order.customerName : "";
      
      // Ensure we have the correct logo URL from the billing template
      const logoUrl = billingTemplate.logoUrl || "/lovable-uploads/6ab04e40-2860-4562-bace-e35da6383972.png";
      
      const htmlContent = `
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
            .unpaid-badge {
              background-color: #fff0c2;
              color: #b7791f;
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
            .payment-section {
              margin-top: 30px;
              padding: 15px;
              background-color: #f5f5f5;
              border-radius: 5px;
            }
            .payment-qr {
              text-align: center;
            }
            .payment-qr img {
              max-width: 150px;
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
        <body>
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
                  <div>Date: ${invoiceDate}</div>
                </div>
                <div class="status-badge ${order.paymentStatus !== 'Paid' ? 'unpaid-badge' : ''}">${order.paymentStatus || 'PAID'}</div>
              </div>
            </div>
            
            <div class="client-info">
              <div class="section-title">Bill To:</div>
              ${customerName ? `<div style="font-weight: 500;">${customerName}</div>` : ''}
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
                  <td class="amount-col">${order.paymentStatus === 'Paid' ? '₹' + order.total.toFixed(2) : '₹0.00'}</td>
                </tr>
                ${order.paymentStatus !== 'Paid' ? `
                <tr>
                  <td>Balance Due</td>
                  <td class="amount-col">₹${order.total.toFixed(2)}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            ${order.paymentStatus !== 'Paid' ? `
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
              ${billingTemplate.footerText.map(line => `<p>${line}</p>`).join('')}
            </div>
          </div>
        </body>
        </html>
      `;

      // Create a blob with the HTML content
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${invoiceNumber}.html`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}