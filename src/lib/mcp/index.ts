import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listProductsTool from "./tools/list-products";
import updateProductStockTool from "./tools/update-product-stock";
import listOrdersTool from "./tools/list-orders";
import listCustomersTool from "./tools/list-customers";
import salesSummaryTool from "./tools/sales-summary";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "kothari-smart-inventory-suite",
  title: "Kothari-smart-inventory-suite",
  version: "0.1.0",
  instructions:
    "Tools for the Kothari smart inventory suite: inspect products and stock levels, adjust stock, review orders and customers, and summarise sales. All data is scoped to the signed-in user's account.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listProductsTool,
    updateProductStockTool,
    listOrdersTool,
    listCustomersTool,
    salesSummaryTool,
  ],
});
