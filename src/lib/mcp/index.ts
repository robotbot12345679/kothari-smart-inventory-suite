import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listProductsTool from "./tools/list-products";
import getProductTool from "./tools/get-product";
import createProductTool from "./tools/create-product";
import updateProductTool from "./tools/update-product";
import deleteProductTool from "./tools/delete-product";
import updateProductStockTool from "./tools/update-product-stock";
import listCategoriesTool from "./tools/list-categories";
import manageCategoryTool from "./tools/manage-category";
import listCustomersTool from "./tools/list-customers";
import createCustomerTool from "./tools/create-customer";
import updateCustomerTool from "./tools/update-customer";
import listOrdersTool from "./tools/list-orders";
import manageOrderTool from "./tools/manage-order";
import getInvoiceTool from "./tools/get-invoice";
import posStartCheckoutTool from "./tools/pos-start-checkout";
import posSubmitPaymentTool from "./tools/pos-submit-payment";
import listSuppliersTool from "./tools/list-suppliers";
import manageSupplierTool from "./tools/manage-supplier";
import recordSupplierEntryTool from "./tools/record-supplier-entry";
import billingSettingsTool from "./tools/billing-settings";
import salesSummaryTool from "./tools/sales-summary";
import reorderRecommendationsTool from "./tools/reorder-recommendations";
import businessOverviewTool from "./tools/business-overview";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "kothari-smart-inventory-suite",
  title: "Kothari-smart-inventory-suite",
  version: "0.2.0",
  instructions:
    "Full control of the Kothari smart inventory suite: products and categories (read/write), stock adjustments, customers, orders, POS checkout and payment with GST invoices, suppliers with bills and payments, billing settings, sales analytics, reorder recommendations and expiry-risk alerts. All data is scoped to the signed-in user's account.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listProductsTool,
    getProductTool,
    createProductTool,
    updateProductTool,
    deleteProductTool,
    updateProductStockTool,
    listCategoriesTool,
    manageCategoryTool,
    listCustomersTool,
    createCustomerTool,
    updateCustomerTool,
    listOrdersTool,
    manageOrderTool,
    getInvoiceTool,
    posStartCheckoutTool,
    posSubmitPaymentTool,
    listSuppliersTool,
    manageSupplierTool,
    recordSupplierEntryTool,
    billingSettingsTool,
    salesSummaryTool,
    reorderRecommendationsTool,
    businessOverviewTool,
  ],
});
