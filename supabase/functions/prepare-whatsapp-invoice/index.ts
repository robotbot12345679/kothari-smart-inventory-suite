import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Generate invoice number from order ID
 */
function generateInvoiceNumber(orderId: string): string {
  const numericPart = orderId.replace(/\D/g, "");
  return `INV${numericPart}`;
}

/**
 * Get storage path for invoice PDF
 * Format: /invoices/YYYY/MM/INV-<invoice_id>.pdf
 */
function getStoragePath(invoiceId: string, orderDate: Date): string {
  const year = orderDate.getFullYear();
  const month = String(orderDate.getMonth() + 1).padStart(2, "0");
  return `${year}/${month}/${invoiceId}.pdf`;
}

/**
 * Generate HTML invoice content
 */
function generateInvoiceHtml(order: any, billingTemplate: any, invoiceNumber: string): string {
  const orderDate = new Date(order.order_date || order.created_at);
  const invoiceDate = orderDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const customerName = order.customer_name?.trim() || "";
  const logoUrl = billingTemplate?.logoUrl || "";

  const itemsHtml = (order.items || [])
    .map(
      (item: any) => `
      <tr>
        <td>
          <div style="font-weight: 600; color: #333;">${escapeHtml(item.name)}</div>
          <div style="font-size: 13px; color: #6c757d; margin-top: 3px;">${escapeHtml(String(item.weight || ""))}${escapeHtml(item.unit || "")}</div>
        </td>
        <td>${item.quantity} ${item.quantity > 1 ? "items" : "item"}</td>
        <td>₹${Number(item.price).toFixed(2)}</td>
        <td style="text-align: right;">₹${(Number(item.price) * Number(item.quantity)).toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  const footerHtml = (billingTemplate?.footerText || ["Thank you for shopping with us!"])
    .map((line: string) => `<p style="margin: 5px 0;">${escapeHtml(line)}</p>`)
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice ${escapeHtml(invoiceNumber)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
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
    .header-left { flex: 1; min-width: 200px; }
    .header-right { text-align: right; min-width: 200px; }
    .logo { max-width: 150px; max-height: 80px; display: block; margin-bottom: 10px; }
    .shop-name { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 5px; }
    .shop-details { font-size: 13px; color: #666; line-height: 1.5; }
    .invoice-title { font-size: 28px; font-weight: bold; color: #333; margin-bottom: 5px; }
    .invoice-number { font-size: 16px; color: #666; margin-bottom: 15px; }
    .dates { font-size: 14px; color: #666; margin-bottom: 10px; }
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
    .unpaid-badge { background-color: #fff3cd; color: #856404; }
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
    .client-name { font-size: 16px; font-weight: 600; color: #333; margin-bottom: 5px; }
    .client-details { font-size: 14px; color: #666; }
    table { width: 100%; border-collapse: collapse; margin-top: 30px; }
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
    td { padding: 14px 12px; border-bottom: 1px solid #e9ecef; font-size: 14px; color: #333; }
    .totals { margin-top: 30px; display: flex; justify-content: flex-end; }
    .totals-table { width: 320px; background-color: #f8f9fa; border-radius: 8px; overflow: hidden; }
    .totals-table td { padding: 12px 16px; border: none; font-size: 14px; }
    .totals-table tr:last-child td { border-top: 2px solid #dee2e6; }
    .total-row { font-weight: bold; font-size: 18px !important; background-color: #e9ecef; }
    .total-row td { padding: 16px !important; }
    .footer {
      margin-top: 50px;
      text-align: center;
      font-size: 14px;
      color: #6c757d;
      border-top: 1px solid #e9ecef;
      padding-top: 20px;
    }
    .payment-section {
      margin-top: 30px;
      padding: 20px;
      background-color: #fff3cd;
      border-radius: 8px;
      border: 1px solid #ffc107;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div class="header-left">
        ${logoUrl ? `<img class="logo" src="${escapeHtml(logoUrl)}" alt="${escapeHtml(billingTemplate?.shopName || "")}">` : ""}
        <div class="shop-name">${escapeHtml(billingTemplate?.shopName || "Store")}</div>
        <div class="shop-details">
          ${escapeHtml(billingTemplate?.address || "")}<br>
          ${escapeHtml(billingTemplate?.phone || "")}
          ${billingTemplate?.gstNumber ? `<br>GSTIN: ${escapeHtml(billingTemplate.gstNumber)}` : ""}
        </div>
      </div>
      <div class="header-right">
        <div class="invoice-title">INVOICE</div>
        <div class="invoice-number">${escapeHtml(invoiceNumber)}</div>
        <div class="dates">Date: ${escapeHtml(invoiceDate)}</div>
        <div class="status-badge ${order.payment_status !== "Paid" ? "unpaid-badge" : ""}">${escapeHtml(order.payment_status || "PAID")}</div>
      </div>
    </div>
    
    <div class="client-info">
      <div class="section-title">Bill To</div>
      ${customerName ? `<div class="client-name">${escapeHtml(customerName)}</div>` : '<div class="client-name">Walk-in Customer</div>'}
      <div class="client-details">
        ${order.customer_phone ? `Phone: ${escapeHtml(order.customer_phone)}<br>` : ""}
        ${order.customer_email ? `Email: ${escapeHtml(order.customer_email)}<br>` : ""}
        ${order.shipping_address ? escapeHtml(order.shipping_address) : ""}
      </div>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Quantity</th>
          <th>Price</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
    
    <div class="totals">
      <table class="totals-table">
        <tr>
          <td>Subtotal</td>
          <td style="text-align: right;">₹${(Number(order.subtotal) || 0).toFixed(2)}</td>
        </tr>
        <tr>
          <td>Discount</td>
          <td style="text-align: right;">₹0.00</td>
        </tr>
        <tr class="total-row">
          <td>Total</td>
          <td style="text-align: right;">₹${Number(order.total).toFixed(2)}</td>
        </tr>
        <tr>
          <td>Amount Paid</td>
          <td style="text-align: right;">${order.payment_status === "Paid" ? "₹" + Number(order.total).toFixed(2) : "₹0.00"}</td>
        </tr>
        ${
          order.payment_status !== "Paid"
            ? `
        <tr>
          <td>Balance Due</td>
          <td style="text-align: right;">₹${Number(order.total).toFixed(2)}</td>
        </tr>
        `
            : ""
        }
      </table>
    </div>
    
    <div class="footer">
      ${footerHtml}
    </div>
  </div>
</body>
</html>`;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Create admin client for storage operations (service role required for private bucket)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get request body
    const { order_id, billing_template } = await req.json();
    
    if (!order_id) {
      return new Response(
        JSON.stringify({ error: "order_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[prepare-whatsapp-invoice] Processing order: ${order_id}`);

    // Fetch the order from database
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      console.error(`[prepare-whatsapp-invoice] Order not found: ${order_id}`, orderError);
      return new Response(
        JSON.stringify({ error: "Order not found", details: orderError?.message }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const invoiceNumber = generateInvoiceNumber(order.id);
    const orderDate = new Date(order.order_date || order.created_at);
    const storagePath = getStoragePath(invoiceNumber, orderDate);

    console.log(`[prepare-whatsapp-invoice] Invoice number: ${invoiceNumber}, Storage path: ${storagePath}`);

    // Check if invoice metadata already exists
    const { data: existingMetadata } = await supabaseAdmin
      .from("invoice_metadata")
      .select("*")
      .eq("order_id", order_id)
      .single();

    // Check if PDF already exists in storage
    const { data: existingFile } = await supabaseAdmin.storage
      .from("invoices")
      .list(storagePath.split("/").slice(0, -1).join("/"), {
        search: storagePath.split("/").pop(),
      });

    const pdfExists = existingFile && existingFile.length > 0 && existingFile.some(f => f.name === storagePath.split("/").pop());

    let pdfPath = storagePath;

    // Generate and upload PDF if it doesn't exist
    if (!pdfExists) {
      console.log(`[prepare-whatsapp-invoice] Generating invoice HTML...`);
      
      // Generate HTML invoice
      const invoiceHtml = generateInvoiceHtml(order, billing_template || {}, invoiceNumber);
      
      // Convert HTML to PDF using HTML content (stored as HTML for now, can be converted to PDF with external service later)
      // For now, we store the HTML which can be rendered as PDF by browsers
      const htmlBlob = new TextEncoder().encode(invoiceHtml);
      
      // Upload to storage with .html extension (will be .pdf when proper PDF generation is added)
      const htmlPath = storagePath.replace(".pdf", ".html");
      const { error: uploadError } = await supabaseAdmin.storage
        .from("invoices")
        .upload(htmlPath, htmlBlob, {
          contentType: "text/html",
          upsert: true,
        });

      if (uploadError) {
        console.error(`[prepare-whatsapp-invoice] Upload failed:`, uploadError);
        return new Response(
          JSON.stringify({ error: "Failed to upload invoice", details: uploadError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      pdfPath = htmlPath;
      console.log(`[prepare-whatsapp-invoice] Invoice uploaded to: ${pdfPath}`);
    } else {
      pdfPath = existingMetadata?.invoice_pdf_path || storagePath.replace(".pdf", ".html");
      console.log(`[prepare-whatsapp-invoice] Invoice already exists at: ${pdfPath}`);
    }

    // Generate signed URL (30 days expiry = 2592000 seconds)
    const expiresIn = 30 * 24 * 60 * 60; // 30 days in seconds
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
      .from("invoices")
      .createSignedUrl(pdfPath, expiresIn);

    if (signedUrlError) {
      console.error(`[prepare-whatsapp-invoice] Signed URL generation failed:`, signedUrlError);
      return new Response(
        JSON.stringify({ error: "Failed to generate signed URL", details: signedUrlError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresIn * 1000);

    // Upsert invoice metadata
    const metadataPayload = {
      user_id: order.user_id,
      order_id: order.id,
      invoice_id: invoiceNumber,
      customer_name: order.customer_name || null,
      customer_phone: order.customer_phone || null,
      invoice_pdf_path: pdfPath,
      invoice_pdf_generated_at: pdfExists ? (existingMetadata?.invoice_pdf_generated_at || now.toISOString()) : now.toISOString(),
      whatsapp_status: "ready",
      signed_url_last_generated_at: now.toISOString(),
      signed_url_expires_at: expiresAt.toISOString(),
      updated_at: now.toISOString(),
    };

    const { error: upsertError } = await supabaseAdmin
      .from("invoice_metadata")
      .upsert(metadataPayload, { onConflict: "order_id" });

    if (upsertError) {
      console.error(`[prepare-whatsapp-invoice] Metadata upsert failed:`, upsertError);
      return new Response(
        JSON.stringify({ error: "Failed to save invoice metadata", details: upsertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[prepare-whatsapp-invoice] Successfully prepared invoice for WhatsApp. Status: ready`);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        invoice_id: invoiceNumber,
        whatsapp_status: "ready",
        signed_url: signedUrlData.signedUrl,
        signed_url_expires_at: expiresAt.toISOString(),
        message: "Invoice prepared successfully for WhatsApp delivery",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(`[prepare-whatsapp-invoice] Unexpected error:`, error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * PLACEHOLDER: Future WhatsApp API Integration Point
 * 
 * This function will be implemented when WhatsApp API access is provided.
 * It will:
 * 1. Use the stored signed URL from invoice_metadata
 * 2. Send the Utility template with Document header via WhatsApp API
 * 3. Update whatsapp_status to 'sent' or 'failed' accordingly
 * 
 * async function sendWhatsAppInvoice(invoice_id: string): Promise<void> {
 *   // TODO: Implement when WhatsApp API is available
 *   // 1. Fetch invoice metadata from database
 *   // 2. Check if signed_url is still valid, regenerate if needed
 *   // 3. Call WhatsApp Business API with document template
 *   // 4. Update whatsapp_status based on API response
 * }
 */
